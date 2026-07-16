import type { Avatar, Voice, Style, Location, Asset } from '../types';

// Reference images live as Assets (source:'reference') referenced by id.
export const entityRefAssets: Asset[] = [
  { id: 'as-ref-max-1', kind: 'image', title: 'Референс · Макс 1', cover: '/trends/star.jpg', source: 'reference', createdAt: '2026-06-21' },
  { id: 'as-ref-max-2', kind: 'image', title: 'Референс · Макс 2', cover: '/trends/gothic.jpg', source: 'reference', createdAt: '2026-06-21' },
  { id: 'as-ref-max-3', kind: 'image', title: 'Референс · Макс 3', cover: '/trends/kino.jpg', source: 'reference', createdAt: '2026-06-21' },
  { id: 'as-ref-nova-1', kind: 'image', title: 'Референс · Нова 1', cover: '/trends/neon.jpg', source: 'reference', createdAt: '2026-07-02' },
  { id: 'as-ref-nova-2', kind: 'image', title: 'Референс · Нова 2', cover: '/trends/fashion.jpg', source: 'reference', createdAt: '2026-07-02' },
];

export const seedVoices: Voice[] = [
  { id: 'vo-deep', name: 'Deep Male', language: 'Русский', genderPresentation: 'Мужской', tone: 'Низкий, спокойный', createdAt: '2026-06-25', updatedAt: '2026-06-25' },
  { id: 'vo-warm', name: 'Warm Female', language: 'Русский', genderPresentation: 'Женский', tone: 'Тёплый, дружелюбный', createdAt: '2026-07-02', updatedAt: '2026-07-02' },
];

export const seedStyles: Style[] = [
  { id: 'st-neon', name: 'Cinematic Neon', description: 'Тёмная кинематографичная палитра с неоном.', previewAssetIds: ['as-ref-max-1'], promptFragment: 'cinematic dark, neon rim light, indigo and cyan', palette: 'Индиго / циан', createdAt: '2026-06-22', updatedAt: '2026-06-22' },
  { id: 'st-retro', name: 'Ретро-плёнка', description: 'Тёплая аналоговая плёнка 90-х.', previewAssetIds: [], promptFragment: 'retro film grain, warm tones, 90s', palette: 'Тёплый беж', createdAt: '2026-06-24', updatedAt: '2026-06-24' },
];

export const seedLocations: Location[] = [
  { id: 'loc-city', name: 'Ночной мегаполис', description: 'Киберпанк-город для сцен.', referenceAssetIds: ['as-ref-nova-1'], lighting: 'Ночь / неон', environment: 'Город', promptFragment: 'neon megacity at night, rain, reflections', createdAt: '2026-06-30', updatedAt: '2026-06-30' },
  { id: 'loc-studio', name: 'Тёмная студия', description: 'Студийный фон с контровым светом.', referenceAssetIds: [], lighting: 'Контровой', environment: 'Студия', promptFragment: 'dark studio backdrop, rim light', createdAt: '2026-07-01', updatedAt: '2026-07-01' },
];

export const seedAvatars: Avatar[] = [
  {
    id: 'av-max', name: 'Макс', description: 'Главный герой канала — исследователь.',
    referenceAssetIds: ['as-ref-max-1', 'as-ref-max-2', 'as-ref-max-3'], coverAssetId: 'as-ref-max-1',
    voiceId: 'vo-deep', defaultStyleId: 'st-neon', defaultLocationId: 'loc-city',
    tags: ['герой', 'канал'], createdAt: '2026-06-21', updatedAt: '2026-07-09',
    usedInProjectIds: ['pr-cyber', 'pr-avatar'], status: 'ready',
  },
  {
    id: 'av-nova', name: 'Нова', description: 'Виртуальная ведущая для новостного формата.',
    referenceAssetIds: ['as-ref-nova-1', 'as-ref-nova-2'], coverAssetId: 'as-ref-nova-1',
    voiceId: 'vo-warm', defaultStyleId: 'st-retro',
    tags: ['ведущая'], createdAt: '2026-07-02', updatedAt: '2026-07-05',
    usedInProjectIds: ['pr-track'], status: 'ready',
  },
];
