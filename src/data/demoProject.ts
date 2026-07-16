// ─────────────────────────────────────────────────────────────────────────────
// FLAGSHIP DEMO PROJECT — «Кира — запуск AI-продукта»
// A fully-populated project so a first-time viewer opens a LIVE product, not an
// empty Canvas. It threads the whole story: idea → Кира (avatar/voice/style/location)
// → agent team → human approval → recipe → image → variation → final Output,
// with lineage, history, a checkpoint and project memory already in place.
// Everything is mock/demo data; ids are stable and cross-referenced.
// ─────────────────────────────────────────────────────────────────────────────
import type {
  Avatar, Voice, Style, Location, Asset, Project, CanvasGraph,
  AgentRun, AgentRunStep, AgentMemoryEntry, ActivityEvent, ProjectCheckpoint, ProjectOutput,
  GenerationRecipe,
} from '../types';

export const DEMO_PROJECT_ID = 'pr-kira';

// ── Кира — reference images (Assets, source:'reference') ────────────────────────
export const kiraRefAssets: Asset[] = [
  { id: 'as-ref-kira-1', kind: 'image', title: 'Референс · Кира 1', cover: '/trends/fashion.jpg', source: 'reference', status: 'ready', createdAt: '2026-07-10', updatedAt: '2026-07-10' },
  { id: 'as-ref-kira-2', kind: 'image', title: 'Референс · Кира 2', cover: '/trends/dance.jpg', source: 'reference', status: 'ready', createdAt: '2026-07-10', updatedAt: '2026-07-10' },
  { id: 'as-ref-kira-3', kind: 'image', title: 'Референс · Кира 3', cover: '/trends/anime.jpg', source: 'reference', status: 'ready', createdAt: '2026-07-10', updatedAt: '2026-07-10' },
];

// ── Кира — reusable entities ────────────────────────────────────────────────────
export const kiraVoice: Voice = {
  id: 'vo-kira', name: 'Кира — тёплый женский', language: 'Русский', genderPresentation: 'Женский',
  tone: 'Тёплый, уверенный', createdAt: '2026-07-10', updatedAt: '2026-07-10',
};

export const kiraStyle: Style = {
  id: 'st-kira', name: 'Продуктовый неон', description: 'Чистый техно-минимал с мягким неоном под запуск AI-продукта.',
  previewAssetIds: ['as-ref-kira-1'], promptFragment: 'clean tech minimal, soft neon accent, premium product launch',
  palette: 'Индиго / белый', createdAt: '2026-07-10', updatedAt: '2026-07-10',
};

export const kiraLocation: Location = {
  id: 'loc-kira', name: 'Светлая студия', description: 'Минималистичная студия для презентации продукта.',
  referenceAssetIds: [], lighting: 'Мягкий рассеянный', environment: 'Студия',
  promptFragment: 'bright minimal studio, soft diffused light, product stage', createdAt: '2026-07-10', updatedAt: '2026-07-10',
};

export const kiraAvatar: Avatar = {
  id: 'av-kira', name: 'Кира', description: 'Виртуальная ведущая для запуска AI-продукта.',
  referenceAssetIds: ['as-ref-kira-1', 'as-ref-kira-2', 'as-ref-kira-3'], coverAssetId: 'as-ref-kira-1',
  voiceId: 'vo-kira', defaultStyleId: 'st-kira', defaultLocationId: 'loc-kira',
  tags: ['ведущая', 'запуск'], createdAt: '2026-07-10', updatedAt: '2026-07-11',
  usedInProjectIds: [DEMO_PROJECT_ID], status: 'ready',
};

// ── Recipe shared by the model result + prompt step (single source of truth) ────
const kiraRecipe: GenerationRecipe = {
  model: 'Flux Pro', modelId: 'flux-pro',
  prompt: 'Кира представляет новый AI-продукт, кинематографичный кадр, мягкий неон, премиальный тон',
  avatarId: 'av-kira', voiceId: 'vo-kira', styleId: 'st-kira', locationId: 'loc-kira',
  referenceAssetIds: ['as-ref-kira-1', 'as-ref-kira-2', 'as-ref-kira-3'],
  cost: 6, date: '2026-07-11', params: { negative: 'low quality, text, watermark' },
};

// ── Result & lineage assets (as-k1 → as-k2 → as-k3) + agent output ──────────────
export const kiraAssets: Asset[] = [
  ...kiraRefAssets,
  {
    id: 'as-k-agent', kind: 'image', title: 'Кадр от контент-команды', cover: '/trends/neon.jpg',
    projectId: DEMO_PROJECT_ID, source: 'agent', status: 'ready', modelId: 'flux-pro',
    agentRunId: 'run-kira', canvasNodeId: 'n-k-result-agent', derivationType: 'agent_output',
    entityIds: ['av-kira', 'st-kira', 'loc-kira'], tags: ['agent', 'concept'],
    createdAt: '2026-07-11', updatedAt: '2026-07-11', recipe: kiraRecipe,
  },
  {
    id: 'as-k1', kind: 'image', title: 'Ключевой кадр · оригинал', cover: '/trends/future.jpg',
    projectId: DEMO_PROJECT_ID, source: 'generation', status: 'ready', modelId: 'flux-pro',
    canvasNodeId: 'n-k-result-model', entityIds: ['av-kira', 'st-kira', 'loc-kira'], tags: ['hero'],
    createdAt: '2026-07-11', updatedAt: '2026-07-11', recipe: kiraRecipe,
  },
  {
    id: 'as-k2', kind: 'image', title: 'Вариация · тёплый свет', cover: '/trends/cyber.jpg',
    projectId: DEMO_PROJECT_ID, source: 'generation', status: 'ready', modelId: 'flux-pro',
    derivedFromAssetId: 'as-k1', derivationType: 'variation', parentAssetIds: ['as-k1'],
    entityIds: ['av-kira', 'st-kira', 'loc-kira'], tags: ['variation'],
    createdAt: '2026-07-11', updatedAt: '2026-07-11',
    recipe: { ...kiraRecipe, prompt: 'Тот же кадр, тёплый свет, мягкие блики', prevStep: 'as-k1' },
  },
  {
    id: 'as-k3', kind: 'image', title: 'Финальный кадр · 4K', cover: '/trends/star.jpg',
    projectId: DEMO_PROJECT_ID, source: 'generation', status: 'ready', modelId: 'recraft-v3',
    derivedFromAssetId: 'as-k2', derivationType: 'upscale', parentAssetIds: ['as-k2'],
    entityIds: ['av-kira'], tags: ['final', '4k'], favorite: true,
    createdAt: '2026-07-11', updatedAt: '2026-07-11',
    recipe: { model: 'Recraft V3', modelId: 'recraft-v3', prompt: 'Апскейл до 4K, детализация', cost: 4, date: '2026-07-11', prevStep: 'as-k2' },
  },
];

// ── Completed agent run (Контент-команда) anchored to the Canvas agent node ─────
const step = (agentId: string, position: number, title: string, inputSummary: string, outputSummary: string, outputData: Record<string, unknown>, handoffToAgentId?: string): AgentRunStep => ({
  id: `stp-k-${agentId}`, agentId, position, title, status: 'completed', inputSummary, outputSummary, outputData,
  startedAt: '2026-07-11T09:00:00.000Z', completedAt: '2026-07-11T09:00:03.000Z', retryCount: 0, handoffToAgentId,
});

export const demoRun: AgentRun = {
  id: 'run-kira', projectId: DEMO_PROJECT_ID, canvasNodeId: 'n-k-agent', teamId: 'team-content',
  task: 'Сделай концепцию короткого вертикального ролика с Кирой для запуска AI-продукта.',
  inputContext: { task: 'Сделай концепцию короткого вертикального ролика с Кирой для запуска AI-продукта.', projectId: DEMO_PROJECT_ID, avatarId: 'av-kira', styleId: 'st-kira', locationId: 'loc-kira', modelId: 'flux-pro' },
  status: 'completed', currentStepIndex: 4,
  steps: [
    step('researcher', 0, 'Исследование и бриф', 'Задача и контекст проекта', 'Бриф готов: тема, аудитория и 3 источника (демо).', { brief: 'Аудитория: креаторы 18–34, интерес к AI. Ключевые тезисы: скорость, качество, простота.' }, 'writer'),
    step('writer', 1, 'Сценарий и hook', 'Результат предыдущего этапа', 'Hook + сценарий (~55 сек).', { hook: 'Первые 3 секунды — вопрос «а что если ролик снимет команда AI?».', script: 'Кира открывает продукт, 3 сцены, финальный CTA.' }, 'director'),
    step('director', 2, 'Визуальная концепция', 'Результат предыдущего этапа', 'Концепция: Кира · Продуктовый неон · Светлая студия.', { avatarId: 'av-kira', styleId: 'st-kira', locationId: 'loc-kira', modelId: 'flux-pro', format: 'Shorts 9:16' }, 'prompt'),
    step('prompt', 3, 'Промпт и Generation Recipe', 'Результат предыдущего этапа', 'Промпт и Generation Recipe собраны.', { recipe: kiraRecipe }, 'qa'),
    step('qa', 4, 'Проверка качества', 'Результат предыдущего этапа', 'Оценка 9/10 · 1 замечание · рекомендация: принять.', { score: 9, notes: ['Усилить контраст в финальном кадре.'], recommendation: 'approve' }),
  ],
  estimatedCost: 38, actualMockCost: 30, finalOutputId: 'as-k-agent',
  createdAt: '2026-07-11', updatedAt: '2026-07-11', completedAt: '2026-07-11T09:00:15.000Z',
};

// ── Pre-built Canvas: idea + Кира entities → agent team → result, and a model path
const node = (id: string, type: string, position: { x: number; y: number }, data: Record<string, unknown>) => ({ id, type, position, data: { type, ...data } } as CanvasGraph['nodes'][number]);

export const demoCanvas: CanvasGraph = {
  version: 1, projectId: DEMO_PROJECT_ID, updatedAt: '2026-07-11T09:05:00.000Z',
  viewport: { x: 40, y: 30, zoom: 0.75 },
  nodes: [
    node('n-k-idea', 'idea', { x: 40, y: 40 }, { text: 'Запуск AI-продукта: короткий вертикальный ролик с ведущей Кирой.' }),
    node('n-k-avatar', 'avatar', { x: 40, y: 240 }, { entityId: 'av-kira', snapshot: { name: 'Кира' } }),
    node('n-k-style', 'style', { x: 40, y: 430 }, { entityId: 'st-kira' }),
    node('n-k-location', 'location', { x: 40, y: 600 }, { entityId: 'loc-kira' }),
    node('n-k-agent', 'agent', { x: 380, y: 150 }, { teamId: 'team-content', task: demoRun.task, runId: 'run-kira' }),
    node('n-k-model', 'model', { x: 380, y: 470 }, { modelId: 'flux-pro', prompt: kiraRecipe.prompt, status: 'success' }),
    node('n-k-result-agent', 'image', { x: 740, y: 150 }, { result: '/trends/neon.jpg', assetId: 'as-k-agent', recipe: kiraRecipe, status: 'success' }),
    node('n-k-result-model', 'image', { x: 740, y: 470 }, { result: '/trends/future.jpg', assetId: 'as-k1', recipe: kiraRecipe, status: 'success' }),
  ],
  edges: [
    { id: 'e-k-1', source: 'n-k-idea', target: 'n-k-agent' },
    { id: 'e-k-2', source: 'n-k-avatar', target: 'n-k-agent' },
    { id: 'e-k-3', source: 'n-k-style', target: 'n-k-agent' },
    { id: 'e-k-4', source: 'n-k-location', target: 'n-k-agent' },
    { id: 'e-k-5', source: 'n-k-agent', target: 'n-k-result-agent' },
    { id: 'e-k-6', source: 'n-k-avatar', target: 'n-k-model' },
    { id: 'e-k-7', source: 'n-k-style', target: 'n-k-model' },
    { id: 'e-k-8', source: 'n-k-model', target: 'n-k-result-model' },
  ],
};

// ── Project (canvas embedded so it opens live) ──────────────────────────────────
export const demoProject: Project = {
  id: DEMO_PROJECT_ID, name: 'Кира — запуск AI-продукта', type: 'video', status: 'active',
  cover: '/trends/fashion.jpg', description: 'Демо-проект: полный путь от идеи до утверждённого кадра с ведущей Кирой.',
  createdAt: '2026-07-10', updatedAt: '2026-07-11', assetCount: kiraAssets.filter((a) => a.source !== 'reference').length,
  avatars: ['av-kira'], canvas: demoCanvas,
};

// ── Project memory ──────────────────────────────────────────────────────────────
export const demoMemoryKira: AgentMemoryEntry[] = [
  { id: 'mem-k-1', scope: 'project', projectId: DEMO_PROJECT_ID, title: 'Цель проекта', content: 'Короткий вертикальный ролик под запуск AI-продукта, ведущая — Кира.', editable: true, createdAt: '2026-07-10', updatedAt: '2026-07-10' },
  { id: 'mem-k-2', scope: 'project', projectId: DEMO_PROJECT_ID, title: 'Аудитория', content: 'Креаторы и ранние адаптеры 18–34, ценят скорость и премиальный вид.', editable: true, createdAt: '2026-07-10', updatedAt: '2026-07-10' },
  { id: 'mem-k-3', scope: 'project', projectId: DEMO_PROJECT_ID, title: 'Тон и ограничения', content: 'Премиальный минимал, без кислотных цветов и мемных VFX.', editable: true, createdAt: '2026-07-10', updatedAt: '2026-07-10' },
];

// ── Activity timeline (chronological story) ─────────────────────────────────────
export const demoActivityKira: ActivityEvent[] = [
  { id: 'ac-k-1', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'project.created', title: 'Проект создан', description: 'Кира — запуск AI-продукта', createdAt: '2026-07-10T10:00:00.000Z' },
  { id: 'ac-k-2', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'entity.created', title: 'Создан аватар «Кира»', entityType: 'avatar', entityId: 'av-kira', createdAt: '2026-07-10T10:20:00.000Z' },
  { id: 'ac-k-3', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'memory.updated', title: 'Сохранена память проекта', description: 'Цель, аудитория, тон', createdAt: '2026-07-10T10:35:00.000Z' },
  { id: 'ac-k-4', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'agent_run.started', title: 'Запущена контент-команда', agentRunId: 'run-kira', canvasNodeId: 'n-k-agent', createdAt: '2026-07-11T09:00:00.000Z' },
  { id: 'ac-k-5', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'agent_run.approved', title: 'Концепция одобрена', description: 'Human approval', agentRunId: 'run-kira', createdAt: '2026-07-11T09:03:00.000Z' },
  { id: 'ac-k-6', projectId: DEMO_PROJECT_ID, actorType: 'agent', type: 'asset.created', title: 'Кадр от контент-команды', assetId: 'as-k-agent', agentRunId: 'run-kira', createdAt: '2026-07-11T09:03:05.000Z' },
  { id: 'ac-k-7', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'generation.completed', title: 'Сгенерирован «Ключевой кадр · оригинал»', assetId: 'as-k1', canvasNodeId: 'n-k-model', createdAt: '2026-07-11T09:10:00.000Z' },
  { id: 'ac-k-8', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'asset.derived', title: 'Вариация от «Ключевой кадр»', description: 'variation', assetId: 'as-k2', createdAt: '2026-07-11T09:18:00.000Z' },
  { id: 'ac-k-9', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'asset.derived', title: 'Апскейл «Вариация · тёплый свет»', description: 'upscale', assetId: 'as-k3', createdAt: '2026-07-11T09:24:00.000Z' },
  { id: 'ac-k-10', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'checkpoint.created', title: 'Контрольная точка', description: 'После утверждения концепции', createdAt: '2026-07-11T09:26:00.000Z' },
  { id: 'ac-k-11', projectId: DEMO_PROJECT_ID, actorType: 'user', type: 'project_output.approved', title: 'Назначен Project Output', description: 'Финальный кадр · 4K', assetId: 'as-k3', createdAt: '2026-07-11T09:28:00.000Z' },
];

// ── Checkpoint (manual, snapshots the built Canvas) ─────────────────────────────
export const demoCheckpointKira: ProjectCheckpoint = {
  id: 'cp-kira-1', projectId: DEMO_PROJECT_ID, title: 'После утверждения концепции',
  description: 'Canvas с одобренной концепцией и результатами.', canvasSnapshot: demoCanvas,
  assetIds: ['as-k-agent', 'as-k1', 'as-k2', 'as-k3'], entityIds: ['av-kira', 'st-kira', 'loc-kira'], agentRunIds: ['run-kira'],
  createdBy: 'user', createdAt: '2026-07-11T09:26:00.000Z', reason: 'manual',
};

// ── Final Project Output ────────────────────────────────────────────────────────
export const demoOutputKira: ProjectOutput = {
  id: 'out-kira-1', projectId: DEMO_PROJECT_ID, assetId: 'as-k3', title: 'Финальный кадр (утверждён)',
  type: 'image', status: 'approved', approvedFromAgentRunId: 'run-kira', createdAt: '2026-07-11', updatedAt: '2026-07-11',
};
