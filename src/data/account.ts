import type { User, Project, Transaction, SavedEntity, Asset, WorkflowTemplate } from '../types';

export const demoUser: User = {
  id: 'u1',
  name: 'Демо-креатор',
  handle: '@chappy_creator',
  avatar: '/trends/avatar.jpg',
  plan: 'Оптимальный',
  credits: 240,
  storageUsedMb: 1240,
  storageTotalMb: 5120,
  since: 'июнь 2026',
};

export const seedProjects: Project[] = [
  {
    id: 'pr-cyber', name: 'Reels: Киберпанк-город', type: 'video', status: 'active',
    cover: '/trends/cyber.jpg', description: 'Серия коротких видео в неон-стиле для Reels.',
    createdAt: '2026-06-20', updatedAt: '2026-07-09', assetCount: 12, avatars: ['av-max'],
  },
  {
    id: 'pr-avatar', name: 'AI-аватар канала', type: 'image', status: 'active',
    cover: '/trends/avatar.jpg', description: 'Единый аватар и обложки для YouTube-канала.',
    createdAt: '2026-06-28', updatedAt: '2026-07-07', assetCount: 8, avatars: ['av-max'],
  },
  {
    id: 'pr-track', name: 'Обложки для трека', type: 'mixed', status: 'draft',
    cover: '/trends/neon.jpg', description: 'Песня + визуальный клип и обложки.',
    createdAt: '2026-07-01', updatedAt: '2026-07-04', assetCount: 3,
  },
];

export const demoTransactions: Transaction[] = [
  { id: 't1', date: '2026-07-09', label: 'Генерация видео · Kling', amount: -35, kind: 'spend' },
  { id: 't2', date: '2026-07-08', label: 'Ежедневный бонус', amount: 15, kind: 'bonus' },
  { id: 't3', date: '2026-07-07', label: 'Пополнение · пакет 550', amount: 550, kind: 'topup' },
  { id: 't4', date: '2026-07-06', label: 'Генерация изображения · Flux Pro', amount: -6, kind: 'spend' },
  { id: 't5', date: '2026-07-05', label: 'Песня · Suno', amount: -12, kind: 'spend' },
  { id: 't6', date: '2026-07-03', label: 'Ежедневный бонус', amount: 15, kind: 'bonus' },
  { id: 't7', date: '2026-07-01', label: 'Подписка · Оптимальный', amount: 1200, kind: 'topup' },
];

export const savedEntities: SavedEntity[] = [
  {
    id: 'av-max', kind: 'avatar', name: 'Макс', createdAt: '2026-06-21',
    description: 'Главный герой канала — исследователь.', cover: '/trends/star.jpg',
    refs: ['/trends/star.jpg', '/trends/gothic.jpg', '/trends/kino.jpg'],
    meta: { Голос: 'Низкий мужской', Стиль: 'Cinematic dark' }, projects: ['pr-cyber', 'pr-avatar'],
  },
  {
    id: 'av-nova', kind: 'avatar', name: 'Нова', createdAt: '2026-07-02',
    description: 'Виртуальная ведущая для новостного формата.', cover: '/trends/neon.jpg',
    refs: ['/trends/neon.jpg', '/trends/fashion.jpg'], meta: { Голос: 'Женский, тёплый' }, projects: ['pr-track'],
  },
  {
    id: 'vo-deep', kind: 'voice', name: 'Deep Male', createdAt: '2026-06-25',
    description: 'Низкий мужской голос для озвучки роликов.',
    meta: { Язык: 'Русский', Пол: 'Мужской', Темп: 'Средний' }, projects: ['pr-cyber'],
  },
  {
    id: 'st-neon', kind: 'style', name: 'Cinematic Neon', createdAt: '2026-06-22',
    description: 'Тёмная кинематографичная палитра с неоном.', cover: '/trends/cyber.jpg',
    meta: { Палитра: 'Индиго / циан', Свет: 'Контровой' },
  },
  {
    id: 'loc-city', kind: 'location', name: 'Ночной мегаполис', createdAt: '2026-06-30',
    description: 'Локация киберпанк-города для сцен.', cover: '/trends/future.jpg',
    meta: { Освещение: 'Ночь / неон', Окружение: 'Город' }, projects: ['pr-cyber'],
  },
];

export const demoAssets: Asset[] = [
  { id: 'as1', kind: 'image', title: 'Кадр 4 · неон-город', cover: '/trends/cyber.jpg', projectId: 'pr-cyber', favorite: true, createdAt: '2026-07-09' },
  { id: 'as2', kind: 'video', title: 'Оживление сцены', cover: '/trends/future.jpg', projectId: 'pr-cyber', createdAt: '2026-07-08' },
  { id: 'as3', kind: 'image', title: 'Аватар · вариант A', cover: '/trends/avatar.jpg', projectId: 'pr-avatar', createdAt: '2026-07-07' },
  { id: 'as4', kind: 'image', title: 'Обложка трека', cover: '/trends/neon.jpg', projectId: 'pr-track', favorite: true, createdAt: '2026-07-04' },
  { id: 'as5', kind: 'audio', title: 'Демо-трек · Suno', cover: '/trends/neon.jpg', projectId: 'pr-track', createdAt: '2026-07-04' },
  { id: 'as6', kind: 'image', title: 'Fashion-съёмка', cover: '/trends/fashion.jpg', createdAt: '2026-07-02' },
  { id: 'as7', kind: 'image', title: 'Кино-афиша', cover: '/trends/kino.jpg', createdAt: '2026-06-29' },
  { id: 'as8', kind: 'image', title: 'Ретро-портрет', cover: '/trends/retro.jpg', createdAt: '2026-06-27' },
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-shortpipe', name: 'Короткое видео из идеи',
    description: 'Тема → сценарий → аватар → кадр → видео → голос → экспорт.',
    canvas: { nodes: [], edges: [] },
  },
];
