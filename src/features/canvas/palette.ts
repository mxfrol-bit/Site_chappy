import type { CanvasBlockType, CanvasNodeData } from '../../types';

export interface BlockDef {
  type: CanvasBlockType;
  label: string;
  ic: string;
  hint: string;
}

// Friendly, minimal block set for the Core Vertical Slice.
export const BLOCKS: BlockDef[] = [
  { type: 'idea', label: 'Идея / текст', ic: '💡', hint: 'Тема, идея или заготовка промпта' },
  { type: 'model', label: 'AI-модель', ic: '⚙️', hint: 'Модель + промпт + запуск' },
  { type: 'image', label: 'Изображение', ic: '🖼️', hint: 'Кадр или результат' },
  { type: 'video', label: 'Видео', ic: '🎬', hint: 'Ролик или сцена' },
  { type: 'avatar', label: 'Аватар', ic: '🎭', hint: 'Сохранённый герой' },
  { type: 'style', label: 'Стиль', ic: '🎨', hint: 'Визуальный стиль' },
  { type: 'location', label: 'Локация', ic: '📍', hint: 'Сцена / окружение' },
  { type: 'agent', label: 'Агент', ic: '🤖', hint: 'AI-агент с ролью' },
  { type: 'export', label: 'Экспорт', ic: '📦', hint: 'Собрать итог из связанных блоков' },
];

export const blockDef = (type: CanvasBlockType) => BLOCKS.find((b) => b.type === type);

export function defaultData(type: CanvasBlockType): CanvasNodeData {
  switch (type) {
    case 'idea': return { type, text: '' };
    case 'model': return { type, modelId: 'flux-pro', prompt: '', status: 'idle' };
    case 'image': return { type, status: 'idle' };
    case 'video': return { type, status: 'idle' };
    case 'avatar': return { type, entityId: 'av-max' };
    case 'style': return { type, entityId: 'st-neon' };
    case 'location': return { type, entityId: 'loc-city' };
    case 'agent': return { type, teamId: 'team-content', task: '' };
    case 'export': return { type };
    default: return { type };
  }
}
