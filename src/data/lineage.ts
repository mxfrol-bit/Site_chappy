import type { Asset, ActivityEvent, ProjectOutput } from '../types';

// A ready-made derivation chain so the library shows real lineage out of the box:
// original → variation → upscale (all in pr-cyber).
export const demoLineageAssets: Asset[] = [
  {
    id: 'as-l1', kind: 'image', title: 'Ключевой кадр · оригинал', cover: '/trends/cyber.jpg',
    projectId: 'pr-cyber', source: 'generation', status: 'ready', modelId: 'flux-pro',
    entityIds: ['av-max', 'st-neon', 'loc-city'], tags: ['hero', 'neon'], createdAt: '2026-07-05', updatedAt: '2026-07-05',
    recipe: { model: 'Flux Pro', modelId: 'flux-pro', prompt: 'Неоновый герой на фоне ночного города, кинематографично', avatarId: 'av-max', styleId: 'st-neon', locationId: 'loc-city', cost: 6, date: '2026-07-05' },
  },
  {
    id: 'as-l2', kind: 'image', title: 'Вариация · тёплый закат', cover: '/trends/future.jpg',
    projectId: 'pr-cyber', source: 'generation', status: 'ready', modelId: 'flux-pro',
    derivedFromAssetId: 'as-l1', derivationType: 'variation', parentAssetIds: ['as-l1'],
    entityIds: ['av-max', 'st-neon', 'loc-city'], tags: ['variation'], createdAt: '2026-07-06', updatedAt: '2026-07-06',
    recipe: { model: 'Flux Pro', modelId: 'flux-pro', prompt: 'Тот же кадр, тёплый закатный свет, мягкие блики', avatarId: 'av-max', styleId: 'st-neon', locationId: 'loc-city', cost: 6, date: '2026-07-06', prevStep: 'as-l1' },
  },
  {
    id: 'as-l3', kind: 'image', title: 'Апскейл 4K', cover: '/trends/neon.jpg',
    projectId: 'pr-cyber', source: 'generation', status: 'ready', modelId: 'recraft-v3',
    derivedFromAssetId: 'as-l2', derivationType: 'upscale', parentAssetIds: ['as-l2'],
    entityIds: ['av-max'], tags: ['final', '4k'], favorite: true, createdAt: '2026-07-06', updatedAt: '2026-07-06',
    recipe: { model: 'Recraft V3', modelId: 'recraft-v3', prompt: 'Апскейл до 4K, повышение детализации', cost: 4, date: '2026-07-06', prevStep: 'as-l2' },
  },
];

export const seedActivity: ActivityEvent[] = [
  { id: 'ac-1', projectId: 'pr-cyber', actorType: 'user', type: 'project.created', title: 'Проект создан', description: 'Reels: Киберпанк-город', createdAt: '2026-06-20T09:00:00.000Z' },
  { id: 'ac-2', projectId: 'pr-cyber', actorType: 'user', type: 'entity.created', title: 'Создан аватар «Макс»', entityType: 'avatar', entityId: 'av-max', createdAt: '2026-06-21T10:15:00.000Z' },
  { id: 'ac-3', projectId: 'pr-cyber', actorType: 'user', type: 'asset.created', title: 'Сгенерирован «Ключевой кадр · оригинал»', assetId: 'as-l1', createdAt: '2026-07-05T12:30:00.000Z' },
  { id: 'ac-4', projectId: 'pr-cyber', actorType: 'user', type: 'asset.derived', title: 'Вариация от «Ключевой кадр»', description: 'variation', assetId: 'as-l2', createdAt: '2026-07-06T08:05:00.000Z' },
  { id: 'ac-5', projectId: 'pr-cyber', actorType: 'user', type: 'asset.derived', title: 'Апскейл «Вариация · тёплый закат»', description: 'upscale', assetId: 'as-l3', createdAt: '2026-07-06T08:20:00.000Z' },
  { id: 'ac-6', projectId: 'pr-cyber', actorType: 'user', type: 'project_output.approved', title: 'Назначен Project Output', description: 'Апскейл 4K', assetId: 'as-l3', createdAt: '2026-07-06T08:25:00.000Z' },
];

export const seedOutputs: ProjectOutput[] = [
  { id: 'out-1', projectId: 'pr-cyber', assetId: 'as-l3', title: 'Ключевой кадр (утверждён)', type: 'image', status: 'approved', createdAt: '2026-07-06', updatedAt: '2026-07-06' },
];
