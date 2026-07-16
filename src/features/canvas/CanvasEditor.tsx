import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './canvas.css';
import BlockNode from './BlockNode';
import { CanvasCtx } from './canvasContext';
import type { CanvasActions } from './canvasContext';
import { BLOCKS, defaultData } from './palette';
import type { CanvasBlockType, CanvasNodeData, CanvasGraph } from '../../types';
import { useStore } from '../../store/useStore';
import { getModel } from '../../data/models';
import { runGeneration, costForModality } from '../../services/generation';
import type { GenerationJob } from '../../services/generation';
import Modal from '../../components/Modal';
import { resolveModelContext, recipeWithContext } from './contextResolver';
import { resolveAgentContextFromCanvas } from '../agents/agentContext';
import { startRun } from '../agents/orchestration';
import { useSearchParams, useNavigate } from 'react-router-dom';

const uid = () => Math.random().toString(36).slice(2, 9);
type FlowNode = Node<CanvasNodeData>;

function CanvasInner({ projectId }: { projectId: string }) {
  const saveCanvas = useStore((s) => s.saveCanvas);
  const addAsset = useStore((s) => s.addAsset);
  const recordActivity = useStore((s) => s.recordActivity);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const updateAttempt = useStore((s) => s.updateAttempt);
  const setProjectOutput = useStore((s) => s.setProjectOutput);
  const toast = useStore((s) => s.toast);
  const project = useMemo(() => useStore.getState().projects.find((p) => p.id === projectId), [projectId]);
  const rf = useReactFlow();
  const nav = useNavigate();
  const storeRuns = useStore((s) => s.runs);
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(() => {
    const g = project?.canvas;
    const nodes: FlowNode[] = (g?.nodes ?? []).map((n) => ({ id: n.id, type: 'block', position: n.position, data: n.data }));
    const edges: Edge[] = (g?.edges ?? []).map((e) => ({ id: e.id, source: e.source, target: e.target }));
    return { nodes, edges, viewport: g?.viewport };
  }, [project]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const nodesRef = useRef(nodes); nodesRef.current = nodes;
  const edgesRef = useRef(edges); edgesRef.current = edges;
  const jobs = useRef<Record<string, GenerationJob>>({});
  const materializedRuns = useRef(new Set<string>()); // agent runs already dropped onto this canvas

  const nodeTypes = useMemo<NodeTypes>(() => ({ block: BlockNode }), []);

  const updateNodeData = useCallback((id: string, patch: Partial<CanvasNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  }, [setNodes]);

  const deleteNode = useCallback((id: string) => {
    jobs.current[id]?.cancel(); delete jobs.current[id];
    const gone = nodesRef.current.find((n) => n.id === id);
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    recordActivity({ projectId, type: 'canvas.node_deleted', title: `Удалён блок «${gone?.data.type ?? 'блок'}»`, canvasNodeId: id });
  }, [setNodes, setEdges, recordActivity, projectId]);

  const duplicateNode = useCallback((id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    const nid = 'n-' + uid();
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: { x: src.position.x + 40, y: src.position.y + 40 }, data: { ...src.data } }));
  }, [setNodes]);

  const addBlock = useCallback((type: CanvasBlockType) => {
    const nid = 'n-' + uid();
    const c = rf.screenToFlowPosition({ x: 340, y: 210 });
    const n = nodesRef.current.length;
    const pos = { x: c.x + (n % 3) * 300, y: c.y + Math.floor(n / 3) * 240 };
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: pos, data: defaultData(type) }));
    recordActivity({ projectId, type: 'canvas.node_added', title: `Добавлен блок «${type}»`, canvasNodeId: nid });
  }, [rf, setNodes, recordActivity, projectId]);

  const cancelNode = useCallback((id: string) => {
    jobs.current[id]?.cancel(); delete jobs.current[id];
    updateNodeData(id, { status: 'idle' });
  }, [updateNodeData]);

  const runNode = useCallback((id: string) => {
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node) return;
    const d = node.data;
    const model = getModel(d.modelId || 'flux-pro');
    const cost = costForModality(model?.modality || 'image');
    if (useStore.getState().credits < cost) {
      updateNodeData(id, { status: 'error', error: 'Недостаточно кредитов — пополните баланс.' });
      return;
    }
    const ctx = resolveModelContext(id, nodesRef.current, edgesRef.current);
    const promptText = d.prompt || ctx.prompt || '';
    const genContext = ctx.fragments.join('\n');
    const entityIds = [ctx.avatarId, ctx.styleId, ctx.locationId, ctx.voiceId].filter(Boolean) as string[];
    const modelId = d.modelId || 'flux-pro';
    const attempt = recordAttempt({ projectId, modelId, prompt: promptText, inputAssetIds: ctx.referenceAssetIds, entityIds, cost, status: 'running' });
    recordActivity({ projectId, type: 'generation.started', title: `Генерация · ${model?.name ?? 'модель'}`, canvasNodeId: id, metadata: { attemptId: attempt.id } });
    updateNodeData(id, { status: 'queued', error: undefined });
    jobs.current[id] = runGeneration(
      { modelId: d.modelId || '', modelName: model?.name || 'Модель', modality: model?.modality || 'image', prompt: promptText, cost, context: genContext || undefined },
      {
        onStatus: (st) => updateNodeData(id, { status: st }),
        onError: (msg) => {
          updateNodeData(id, { status: 'error', error: msg }); delete jobs.current[id];
          updateAttempt(attempt.id, { status: 'failed', error: msg, completedAt: new Date().toISOString() });
          recordActivity({ projectId, type: 'generation.failed', title: `Ошибка генерации · ${model?.name ?? 'модель'}`, description: msg, canvasNodeId: id });
        },
        onDone: (res) => {
          if (!useStore.getState().spend(cost, `Генерация · ${model?.name ?? 'модель'}`)) {
            updateNodeData(id, { status: 'error', error: 'Недостаточно кредитов — пополните баланс.' });
            delete jobs.current[id];
            updateAttempt(attempt.id, { status: 'failed', error: 'Недостаточно кредитов', completedAt: new Date().toISOString() });
            recordActivity({ projectId, type: 'generation.failed', title: `Недостаточно кредитов · ${model?.name ?? 'модель'}`, canvasNodeId: id });
            return;
          }
          const recipe = { ...recipeWithContext(res.recipe, ctx), modelId };
          if (ctx.avatarId) useStore.getState().attachAvatarToProject(ctx.avatarId, projectId);
          const kind = model?.modality === 'video' ? 'video' : 'image';
          const src = nodesRef.current.find((n) => n.id === id);
          const pos = src ? { x: src.position.x + 300, y: src.position.y + 20 } : { x: 200, y: 200 };
          const resId = 'n-' + uid();
          const asset = addAsset({ kind, title: `Результат · ${model?.name ?? 'модель'}`, cover: res.url, projectId, recipe, source: 'generation', modelId, entityIds, canvasNodeId: resId });
          setNodes((nds) => nds.concat({ id: resId, type: 'block', position: pos, data: { type: kind, result: res.url, assetId: asset.id, recipe, status: 'success' } }));
          setEdges((eds) => eds.concat({ id: `e-${id}-${resId}`, source: id, target: resId }));
          delete jobs.current[id];
          updateAttempt(attempt.id, { status: 'success', assetId: asset.id, completedAt: new Date().toISOString() });
          recordActivity({ projectId, type: 'generation.completed', title: `Готово · ${model?.name ?? 'модель'}`, assetId: asset.id, canvasNodeId: resId });
          toast('Готово — результат сохранён в проект', 'success');
        },
      },
    );
  }, [addAsset, projectId, setEdges, setNodes, toast, updateNodeData, recordAttempt, updateAttempt, recordActivity]);

  const useAsInput = useCallback((id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    const nid = 'n-' + uid();
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: { x: src.position.x + 300, y: src.position.y }, data: defaultData('model') }));
    setEdges((eds) => eds.concat({ id: `e-${id}-${nid}`, source: id, target: nid }));
    toast('Добавлен блок модели — результат подан как вход');
  }, [setEdges, setNodes, toast]);

  const connectToModel = useCallback((id: string) => {
    const model = nodesRef.current.find((n) => (n.data as CanvasNodeData).type === 'model');
    if (!model) { toast('Сначала добавьте блок AI-модель', 'error'); return; }
    if (edgesRef.current.some((e) => e.source === id && e.target === model.id)) { toast('Уже подключено к модели'); return; }
    setEdges((eds) => eds.concat({ id: `e-${id}-${model.id}-${uid()}`, source: id, target: model.id }));
    recordActivity({ projectId, type: 'canvas.connected', title: 'Блок подключён к модели', canvasNodeId: id });
    toast('Подключено к модели', 'success');
  }, [setEdges, toast, recordActivity, projectId]);

  const openAssetDetail = useCallback((assetId: string) => nav(`/app/assets/${assetId}`), [nav]);
  const createAssetVariation = useCallback((assetId: string) => nav(`/app/assets/${assetId}?variation=1`), [nav]);
  const markProjectOutput = useCallback((assetId: string) => {
    const asset = useStore.getState().getAsset(assetId);
    if (!asset) return;
    const type = asset.kind === 'video' ? 'video' : asset.kind === 'audio' ? 'audio' : asset.kind === 'text' ? 'script' : 'image';
    setProjectOutput({ projectId, assetId, title: asset.title, type, approvedFromAgentRunId: asset.agentRunId, status: 'approved' });
    toast('Отмечено как Project Output', 'success');
  }, [projectId, setProjectOutput, toast]);

  const runAgent = useCallback((id: string) => {
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node) return;
    const d = node.data;
    const teamId = (d.teamId as string) || useStore.getState().teams[0]?.id;
    if (!teamId) { toast('Нет доступных команд', 'error'); return; }
    const task = ((d.task as string) || '').trim() || 'Создай контент по контексту проекта.';
    const context = resolveAgentContextFromCanvas(id, nodesRef.current, edgesRef.current, projectId, task);
    const run = useStore.getState().createRun({ projectId, teamId, task, context, canvasNodeId: id });
    startRun(run.id);
    updateNodeData(id, { runId: run.id, task });
    toast('Команда запущена — следите за статусом на блоке', 'success');
  }, [projectId, toast, updateNodeData]);

  const openRun = useCallback((runId: string) => nav(`/app/runs/${runId}`), [nav]);

  const openResult = useCallback((url: string) => setResultUrl(url), []);
  const notify = useCallback((msg: string) => toast(msg), [toast]);

  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({ ...c, id: `e-${c.source}-${c.target}-${uid()}` }, eds));
    recordActivity({ projectId, type: 'canvas.connected', title: 'Блоки соединены', canvasNodeId: c.target ?? undefined });
  }, [setEdges, recordActivity, projectId]);

  const actions = useMemo<CanvasActions>(
    () => ({ updateNodeData, runNode, cancelNode, duplicateNode, deleteNode, useAsInput, connectToModel, runAgent, openRun, openAssetDetail, createAssetVariation, markProjectOutput, openResult, notify }),
    [updateNodeData, runNode, cancelNode, duplicateNode, deleteNode, useAsInput, connectToModel, runAgent, openRun, openAssetDetail, createAssetVariation, markProjectOutput, openResult, notify],
  );

  const serialize = useCallback((): CanvasGraph => ({
    version: 1,
    projectId,
    updatedAt: new Date().toISOString(),
    viewport: rf.getViewport(),
    nodes: nodesRef.current.map((n) => ({ id: n.id, type: 'block', position: n.position, data: n.data })),
    edges: edgesRef.current.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  }), [projectId, rf]);

  const doSave = useCallback((announce: boolean) => {
    saveCanvas(projectId, serialize());
    if (announce) toast('Canvas сохранён', 'success');
  }, [projectId, saveCanvas, serialize, toast]);

  // auto-save (debounced) on any graph change → survives reload
  useEffect(() => {
    const t = setTimeout(() => doSave(false), 700);
    return () => clearTimeout(t);
  }, [nodes, edges, doSave]);

  // cancel running jobs on unmount
  useEffect(() => () => { Object.values(jobs.current).forEach((j) => j.cancel()); }, []);

  // "Добавить на Canvas" from the entity library: ?addAvatar=<id>
  const addedFromParam = useRef(false);
  useEffect(() => {
    if (addedFromParam.current) return;
    const avId = searchParams.get('addAvatar');
    if (!avId) return;
    addedFromParam.current = true;
    const name = useStore.getState().getAvatar(avId)?.name;
    const nid = 'n-' + uid();
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: { x: 60, y: 60 + nds.length * 22 }, data: { type: 'avatar', entityId: avId, snapshot: { name } } }));
    searchParams.delete('addAvatar');
    setSearchParams(searchParams, { replace: true });
    toast(`Аватар «${name ?? ''}» добавлен на Canvas`);
  }, [searchParams, setSearchParams, setNodes, toast]);

  // Explicit "Добавить на Canvas" for runs launched OUTSIDE the canvas (no anchor node):
  // ?addOutput=<runId> drops the run's final output as a free result node.
  const addedOutput = useRef(false);
  useEffect(() => {
    if (addedOutput.current) return;
    const runId = searchParams.get('addOutput');
    if (!runId) return;
    addedOutput.current = true;
    const run = useStore.getState().runs.find((r) => r.id === runId);
    const asset = run?.finalOutputId ? useStore.getState().getAsset(run.finalOutputId) : undefined;
    searchParams.delete('addOutput');
    setSearchParams(searchParams, { replace: true });
    if (!asset) { toast('Результат запуска не найден', 'error'); return; }
    if (nodesRef.current.some((n) => (n.data as CanvasNodeData).assetId === asset.id)) { toast('Результат уже на Canvas'); return; }
    const nid = 'n-' + uid();
    const kind: CanvasBlockType = asset.kind === 'video' ? 'video' : 'image';
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: { x: 120, y: 120 + nds.length * 22 }, data: { type: kind, result: asset.cover, assetId: asset.id, recipe: asset.recipe, status: 'success' } }));
    toast('Результат агента добавлен на Canvas', 'success');
  }, [searchParams, setSearchParams, setNodes, toast]);

  // "На Canvas" from an Asset detail page: ?addAssetNode=<assetId> drops that asset as a node.
  const addedAssetNode = useRef(false);
  useEffect(() => {
    if (addedAssetNode.current) return;
    const assetId = searchParams.get('addAssetNode');
    if (!assetId) return;
    addedAssetNode.current = true;
    const asset = useStore.getState().getAsset(assetId);
    searchParams.delete('addAssetNode');
    setSearchParams(searchParams, { replace: true });
    if (!asset) { toast('Ассет не найден', 'error'); return; }
    if (nodesRef.current.some((n) => (n.data as CanvasNodeData).assetId === asset.id)) { toast('Ассет уже на Canvas'); return; }
    const nid = 'n-' + uid();
    const kind: CanvasBlockType = asset.kind === 'video' ? 'video' : 'image';
    setNodes((nds) => nds.concat({ id: nid, type: 'block', position: { x: 100, y: 100 + nds.length * 22 }, data: { type: kind, result: asset.cover, assetId: asset.id, recipe: asset.recipe, status: 'success' } }));
    toast(`«${asset.title}» добавлен на Canvas`);
  }, [searchParams, setSearchParams, setNodes, toast]);

  // When an agent run launched from a Canvas node completes (after approval),
  // the agent block materializes its output as a connected result node.
  useEffect(() => {
    storeRuns.forEach((run) => {
      if (run.status !== 'completed' || !run.canvasNodeId || !run.finalOutputId) return;
      if (materializedRuns.current.has(run.id)) return; // guards StrictMode double-invoke + re-renders
      const anchor = nodesRef.current.find((n) => n.id === run.canvasNodeId);
      if (!anchor) return;
      const asset = useStore.getState().getAsset(run.finalOutputId);
      if (!asset) return;
      materializedRuns.current.add(run.id);
      if (nodesRef.current.some((n) => (n.data as CanvasNodeData).assetId === asset.id)) return;
      const nid = 'n-' + uid();
      const kind: CanvasBlockType = asset.kind === 'video' ? 'video' : 'image';
      // atomic dedup inside the updater as a second safety net
      setNodes((nds) => (nds.some((n) => (n.data as CanvasNodeData).assetId === asset.id) ? nds
        : nds.concat({ id: nid, type: 'block', position: { x: anchor.position.x + 320, y: anchor.position.y + 20 }, data: { type: kind, result: asset.cover, assetId: asset.id, recipe: asset.recipe, status: 'success' } })));
      setEdges((eds) => (eds.some((e) => e.source === anchor.id && e.target === nid) ? eds : eds.concat({ id: `e-${anchor.id}-${nid}`, source: anchor.id, target: nid })));
    });
  }, [storeRuns, setNodes, setEdges]);

  const restored = useRef(false);
  const onInit = useCallback(() => {
    if (restored.current) return;
    restored.current = true;
    if (initial.viewport) rf.setViewport(initial.viewport);
    else rf.fitView({ padding: 0.25 });
  }, [initial.viewport, rf]);

  const onReset = () => {
    if (!window.confirm('Очистить Canvas? Все блоки будут удалены.')) return;
    setNodes([]); setEdges([]);
    setTimeout(() => doSave(true), 50);
  };

  return (
    <CanvasCtx.Provider value={actions}>
      <div className="cn-wrap">
        <div className="cn-toolbar">
          <div className="cn-palette">
            {BLOCKS.map((b) => (
              <button key={b.type} className="cn-pbtn" title={b.hint} onClick={() => addBlock(b.type)}>{b.ic} {b.label}</button>
            ))}
          </div>
          <div className="cn-tools">
            <button className="cn-tbtn" onClick={() => rf.fitView({ padding: 0.25, duration: 300 })}>Fit</button>
            <button className="cn-tbtn" onClick={onReset}>Очистить</button>
            <button className="cn-tbtn save" onClick={() => doSave(true)}>Сохранить</button>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          minZoom={0.3}
          maxZoom={1.8}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={22} color="rgba(255,255,255,.05)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeColor={() => 'rgba(138,138,255,.55)'} maskColor="rgba(5,6,12,.6)" />
        </ReactFlow>
      </div>

      <Modal open={!!resultUrl} onClose={() => setResultUrl(null)} title="Результат">
        {resultUrl && <img src={resultUrl} alt="Результат" style={{ width: '100%', borderRadius: 12 }} />}
      </Modal>
    </CanvasCtx.Provider>
  );
}

export default function CanvasEditor({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} />
    </ReactFlowProvider>
  );
}
