import type { AgentRunContext, CanvasNodeData } from '../../types';
import { useStore } from '../../store/useStore';
import { getModel } from '../../data/models';

// --- Typed context assembly for agent runs (no provider coupling) ---

export interface RunContextSummary {
  projectName: string;
  memory: { title: string; content: string }[];
  avatarName?: string;
  styleName?: string;
  locationName?: string;
  modelName?: string;
  assetTitles: string[];
  idea?: string;
}

export function summarizeRunContext(ctx: AgentRunContext): RunContextSummary {
  const s = useStore.getState();
  const project = s.projects.find((p) => p.id === ctx.projectId);
  return {
    projectName: project?.name ?? '—',
    memory: s.getProjectMemory(ctx.projectId).filter((m) => !m.disabled).map((m) => ({ title: m.title, content: m.content })),
    avatarName: ctx.avatarId ? s.getAvatar(ctx.avatarId)?.name : undefined,
    styleName: ctx.styleId ? s.getStyle(ctx.styleId)?.name : undefined,
    locationName: ctx.locationId ? s.getLocation(ctx.locationId)?.name : undefined,
    modelName: ctx.modelId ? getModel(ctx.modelId)?.name : undefined,
    assetTitles: (ctx.assetIds ?? []).map((id) => s.getAsset(id)?.title).filter(Boolean) as string[],
    idea: ctx.ideaText,
  };
}

type NodeLike = { id: string; data: CanvasNodeData };
type EdgeLike = { source: string; target: string };

// Resolve an Agent node's inputs from incoming Canvas edges into a run context.
export function resolveAgentContextFromCanvas(
  agentNodeId: string, nodes: NodeLike[], edges: EdgeLike[], projectId: string, task: string,
): AgentRunContext {
  const incoming = edges
    .filter((e) => e.target === agentNodeId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is NodeLike => Boolean(n));
  const ctx: AgentRunContext = { task, projectId, assetIds: [], canvasBlockIds: incoming.map((n) => n.id) };
  for (const n of incoming) {
    const d = n.data;
    if (d.type === 'idea' && d.text) ctx.ideaText = [ctx.ideaText, d.text].filter(Boolean).join('\n');
    if (d.type === 'avatar' && d.entityId) ctx.avatarId = d.entityId;
    if (d.type === 'style' && d.entityId) ctx.styleId = d.entityId;
    if (d.type === 'location' && d.entityId) ctx.locationId = d.entityId;
    if (d.type === 'model' && d.modelId) ctx.modelId = d.modelId;
    if ((d.type === 'image' || d.type === 'video') && typeof d.assetId === 'string') ctx.assetIds!.push(d.assetId);
  }
  if (!ctx.assetIds!.length) delete ctx.assetIds;
  return ctx;
}
