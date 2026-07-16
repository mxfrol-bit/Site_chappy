import type { Agent, AgentTool, AgentTeam, AgentMemoryEntry } from '../types';

export const agentTools: AgentTool[] = [
  { id: 't-llm', name: 'LLM', type: 'llm', description: 'Текстовая модель для рассуждений и генерации.', enabled: true, isMock: true },
  { id: 't-ctx', name: 'Контекст проекта', type: 'project_context', description: 'Читает описание, память, аватары, стиль и локацию проекта.', enabled: true, isMock: true },
  { id: 't-lib', name: 'Библиотека ассетов', type: 'asset_library', description: 'Доступ к ассетам и результатам проекта.', enabled: true, isMock: true },
  { id: 't-gen', name: 'Генерация модели', type: 'model_generation', description: 'Готовит и запускает генерацию (демо).', enabled: true, isMock: true },
  { id: 't-search', name: 'Поиск (демо)', type: 'mock_search', description: 'Демонстрационный поиск по теме — без реального веба.', enabled: true, isMock: true },
  { id: 't-qa', name: 'Проверка качества', type: 'quality_check', description: 'Проверяет соответствие задаче и находит противоречия.', enabled: true, isMock: true },
];

const D = '2026-06-20';
export const agents: Agent[] = [
  { id: 'researcher', name: 'Исследователь', emoji: '🔎', role: 'Research', description: 'Собирает тему, тренды и референсы, готовит бриф.', systemInstructions: 'Ты — исследователь. Собери и структурируй информацию по задаче, сделай краткую выжимку и зафиксируй источники (демо).', capabilities: ['Сбор информации', 'Структурирование', 'Краткая выжимка'], toolIds: ['t-llm', 't-ctx', 't-search'], defaultModelId: 'reasoner-x', memoryPolicy: 'project', status: 'available', createdAt: D, updatedAt: D },
  { id: 'writer', name: 'Сценарист', emoji: '✍️', role: 'Script', description: 'Пишет структуру, hook и сценарий, адаптирует формат.', systemInstructions: 'Ты — сценарист. Создай структуру, сильный hook и сценарий в тоне проекта, адаптируй длину под формат.', capabilities: ['Структура', 'Hook', 'Сценарий', 'Формат'], toolIds: ['t-llm', 't-ctx'], defaultModelId: 'chappy-chat', memoryPolicy: 'project', status: 'available', createdAt: D, updatedAt: D },
  { id: 'director', name: 'Креативный директор', emoji: '🎬', role: 'Creative', description: 'Определяет визуальную концепцию: аватар, стиль, локация, модель.', systemInstructions: 'Ты — креативный директор. Определи визуальную концепцию: подбери аватара, стиль, локацию, формат и рекомендуемую модель.', capabilities: ['Концепция', 'Подбор аватара/стиля/локации', 'Выбор модели'], toolIds: ['t-llm', 't-ctx', 't-lib'], defaultModelId: 'chappy-chat', memoryPolicy: 'project', status: 'available', createdAt: D, updatedAt: D },
  { id: 'prompt', name: 'Prompt Engineer', emoji: '🧩', role: 'Prompt', description: 'Собирает структурированный промпт и Generation Recipe.', systemInstructions: 'Ты — prompt engineer. Преобразуй концепцию в структурированный промпт, добавь параметры и negative prompt, подготовь вход модели.', capabilities: ['Промпт', 'Параметры', 'Negative prompt', 'Generation Recipe'], toolIds: ['t-llm', 't-gen'], defaultModelId: 'flux-pro', memoryPolicy: 'project', status: 'available', createdAt: D, updatedAt: D },
  { id: 'qa', name: 'Проверяющий качества', emoji: '✅', role: 'QA', description: 'Проверяет соответствие задаче, ставит замечания и рекомендацию.', systemInstructions: 'Ты — контроль качества. Проверь соответствие задаче, найди противоречия, поставь замечания и рекомендуй принять или отправить на доработку.', capabilities: ['Проверка соответствия', 'Замечания', 'Рекомендация'], toolIds: ['t-llm', 't-qa', 't-ctx'], defaultModelId: 'reasoner-x', memoryPolicy: 'project', status: 'available', createdAt: D, updatedAt: D },
];

export const seedTeams: AgentTeam[] = [
  { id: 'team-content', name: 'Контент-команда', description: 'Полный цикл: от брифа до готового рецепта под генерацию.', memberIds: ['researcher', 'writer', 'director', 'prompt', 'qa'], coordinatorId: 'director', executionMode: 'sequential', approvalRequired: true, createdAt: D, updatedAt: D },
];

export const seedMemory: AgentMemoryEntry[] = [
  { id: 'mem-goal', scope: 'project', projectId: 'pr-cyber', title: 'Цель проекта', content: 'Короткие вертикальные видео в неон-стиле для Reels, продвижение AI-продукта.', editable: true, createdAt: D, updatedAt: D },
  { id: 'mem-aud', scope: 'project', projectId: 'pr-cyber', title: 'Аудитория', content: 'Креаторы и ранние адаптеры 18–34, интерес к AI и технологиям.', editable: true, createdAt: D, updatedAt: D },
  { id: 'mem-avatar', scope: 'project', projectId: 'pr-cyber', title: 'Утверждённый аватар', content: 'Основной герой — Макс (cinematic dark, глубокий мужской голос).', editable: true, createdAt: D, updatedAt: D },
  { id: 'mem-avoid', scope: 'project', projectId: 'pr-cyber', title: 'Запрещённые подходы', content: 'Без кислотных цветов и мемных VFX; держим премиальный тон.', editable: true, createdAt: D, updatedAt: D },
];

export const getAgent = (id: string) => agents.find((a) => a.id === id);
export const getTool = (id: string) => agentTools.find((t) => t.id === id);
