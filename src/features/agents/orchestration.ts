import { useStore } from '../../store/useStore';
import { getModel } from '../../data/models';
import { DEMO_POOL } from '../../services/mockGen';
import type { AgentRun, AgentRunStep, GenerationRecipe } from '../../types';

// --- Mock orchestration service. Owns the timers; UI never drives them. ---
// Swap this module for a real job/poll backend later; keep the exported API.

const timers = new Map<string, ReturnType<typeof setTimeout>[]>();
let forceErrorStep = -1; // step index to fail on next run; -1 = none

export function setForceErrorStep(idx: number) { forceErrorStep = idx; }
export function getForceErrorStep() { return forceErrorStep; }

const pushTimer = (runId: string, id: ReturnType<typeof setTimeout>) => {
  const a = timers.get(runId) ?? []; a.push(id); timers.set(runId, a);
};
const clearRunTimers = (runId: string) => { (timers.get(runId) ?? []).forEach(clearTimeout); timers.delete(runId); };
const iso = () => new Date().toISOString();

function buildStepOutput(step: AgentRunStep, run: AgentRun): { summary: string; data: Record<string, unknown> } {
  const s = useStore.getState();
  const ctx = run.inputContext;
  const avatar = ctx.avatarId ? s.getAvatar(ctx.avatarId)
    : s.avatars.find((a) => a.usedInProjectIds.includes(run.projectId)) ?? s.avatars[0];
  const styleId = ctx.styleId ?? avatar?.defaultStyleId;
  const locationId = ctx.locationId ?? avatar?.defaultLocationId;
  const style = styleId ? s.getStyle(styleId) : undefined;
  const location = locationId ? s.getLocation(locationId) : undefined;
  const model = getModel(ctx.modelId ?? avatar?.defaultStyleId ? (ctx.modelId ?? 'flux-pro') : 'flux-pro') ?? getModel('flux-pro');

  switch (step.agentId) {
    case 'researcher':
      return { summary: 'Бриф готов: тема, аудитория и 3 источника (демо).', data: { brief: `Бриф по задаче: «${run.task}». Аудитория и ключевые тезисы собраны.` } };
    case 'writer':
      return { summary: 'Hook + сценарий (~58 сек).', data: { hook: 'Первые 3 секунды — неожиданный вопрос о будущем ИИ.', script: `Сценарий вертикального ролика по задаче «${run.task}»: 3 сцены, финальный CTA.` } };
    case 'director':
      return { summary: `Концепция: ${avatar?.name ?? 'герой'} · ${style?.name ?? 'стиль по умолчанию'} · ${location?.name ?? 'локация'}.`,
        data: { avatarId: avatar?.id, styleId: style?.id, locationId: location?.id, modelId: model?.id ?? 'flux-pro', format: 'Shorts 9:16' } };
    case 'prompt': {
      const recipe: GenerationRecipe = {
        model: model?.name ?? 'Flux Pro', modelId: model?.id ?? 'flux-pro',
        prompt: `Кинематографичный кадр по сценарию: ${run.task}`,
        avatarId: avatar?.id, voiceId: avatar?.voiceId, styleId: style?.id, locationId: location?.id,
        referenceAssetIds: avatar?.referenceAssetIds, cost: 6, date: iso(),
        params: { negative: 'low quality, text, watermark' },
      };
      return { summary: 'Промпт и Generation Recipe собраны.', data: { recipe } };
    }
    case 'qa':
      return { summary: 'Оценка 9/10 · 1 замечание · рекомендация: принять.', data: { score: 9, notes: ['Усилить контраст в финальном кадре.'], recommendation: 'approve' } };
    default:
      return { summary: 'Этап выполнен.', data: {} };
  }
}

function driveFrom(runId: string, idx: number) {
  const get = useStore.getState;
  const cur = get().getRun(runId);
  if (!cur || cur.status === 'cancelled') return;
  if (idx >= cur.steps.length) { get().updateRun(runId, { status: 'waiting_approval' }); return; }
  const step = cur.steps[idx];
  get().updateRun(runId, { status: 'running', currentStepIndex: idx });
  get().updateStep(runId, step.id, { status: 'running', startedAt: iso() });
  pushTimer(runId, setTimeout(() => {
    const c2 = get().getRun(runId);
    if (!c2 || c2.status === 'cancelled') return;
    if (forceErrorStep === idx) {
      get().updateStep(runId, step.id, { status: 'failed', error: 'Сымитированная ошибка этапа', completedAt: iso() });
      get().updateRun(runId, { status: 'failed' });
      get().recordActivity({ projectId: c2.projectId, actorType: 'agent', type: 'agent_run.failed', title: `Ошибка на этапе: ${step.title}`, agentRunId: runId, canvasNodeId: c2.canvasNodeId });
      forceErrorStep = -1;
      return;
    }
    const out = buildStepOutput(step, c2);
    get().updateStep(runId, step.id, { status: 'completed', outputSummary: out.summary, outputData: out.data, completedAt: iso() });
    get().updateRun(runId, { actualMockCost: (get().getRun(runId)?.actualMockCost ?? 0) + 6 });
    pushTimer(runId, setTimeout(() => driveFrom(runId, idx + 1), 500));
  }, 1500 + idx * 250));
}

export function startRun(runId: string) {
  clearRunTimers(runId);
  const run = useStore.getState().getRun(runId);
  useStore.getState().updateRun(runId, { status: 'queued', currentStepIndex: 0 });
  if (run) useStore.getState().recordActivity({ projectId: run.projectId, actorType: 'agent', type: 'agent_run.started', title: `Запущена команда: ${run.task.slice(0, 40)}`, agentRunId: runId, canvasNodeId: run.canvasNodeId });
  pushTimer(runId, setTimeout(() => driveFrom(runId, 0), 700));
}

export function cancelRun(runId: string) {
  clearRunTimers(runId);
  useStore.getState().updateRun(runId, { status: 'cancelled' });
}

export function retryStep(runId: string, stepIndex: number) {
  const run = useStore.getState().getRun(runId);
  if (!run || !run.steps[stepIndex]) return;
  clearRunTimers(runId);
  run.steps.forEach((st, i) => {
    if (i >= stepIndex) {
      useStore.getState().updateStep(runId, st.id, {
        status: 'pending', error: undefined, outputSummary: undefined, outputData: undefined,
        ...(i === stepIndex ? { retryCount: st.retryCount + 1 } : {}),
      });
    }
  });
  driveFrom(runId, stepIndex);
}

export function requestRevision(runId: string) {
  const run = useStore.getState().getRun(runId);
  if (!run) return;
  retryStep(runId, Math.min(1, run.steps.length - 1)); // back to the writer step
}

export function approveRun(runId: string) {
  const s = useStore.getState();
  const run = s.getRun(runId);
  if (!run || run.status !== 'waiting_approval') return undefined;
  const promptStep = run.steps.find((st) => st.agentId === 'prompt');
  const recipe = promptStep?.outputData?.recipe as GenerationRecipe | undefined;
  const url = DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)];
  const entityIds = [recipe?.avatarId, recipe?.styleId, recipe?.locationId, recipe?.voiceId].filter(Boolean) as string[];
  const asset = s.addAsset({
    kind: 'image', title: `Output · ${run.task.slice(0, 28)}`, cover: url,
    projectId: run.projectId, recipe, source: 'agent', derivationType: 'agent_output',
    agentRunId: run.id, canvasNodeId: run.canvasNodeId, modelId: recipe?.modelId, entityIds,
  });
  s.updateRun(runId, { status: 'completed', finalOutputId: asset.id, completedAt: iso() });
  s.recordActivity({ projectId: run.projectId, actorType: 'user', type: 'agent_run.approved', title: `Одобрен вывод команды: ${run.task.slice(0, 36)}`, agentRunId: run.id, assetId: asset.id });
  s.createCheckpoint({ projectId: run.projectId, title: `После утверждения: ${run.task.slice(0, 28)}`, reason: 'approved_output' });
  return asset;
}
