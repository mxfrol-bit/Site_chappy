import { create } from 'zustand';

// Isolated, non-persisted UI store for the guided demo tour.
export interface TourStep {
  title: string;
  body: string;
  to: string; // route the tour navigates to for this step
}

export const TOUR_STEPS: TourStep[] = [
  { title: 'Проекты', to: '/app/projects', body: 'Вся работа живёт в проектах. Флагманский проект «Кира — запуск AI-продукта» уже собран: ассеты, аватары, память, история и чекпоинты в одном месте.' },
  { title: 'Canvas', to: '/app/projects/pr-kira', body: 'Визуальный процесс на бесконечной доске: идея → аватар → команда агентов → результат. Блоки соединяются в один поток.' },
  { title: 'Сохранённый аватар', to: '/app/avatars/av-kira', body: 'Кира — переиспользуемая сущность: референсы, голос, стиль и локация. Её можно подать в любую генерацию.' },
  { title: 'Команда агентов', to: '/app/agents', body: 'Соберите команду ролей (исследователь → сценарист → директор → prompt → QA) и запустите её на проекте.' },
  { title: 'Запуск и одобрение', to: '/app/runs/run-kira', body: 'Таймлайн выполнения с передачей между агентами и человеческим одобрением: одобрить, отправить на доработку или остановить.' },
  { title: 'Результат', to: '/app/assets/as-k3', body: 'Готовый ассет с полным рецептом: модель, промпт, аватар, стиль, локация и стоимость.' },
  { title: 'Происхождение', to: '/app/assets/as-k1', body: 'Каждый результат хранит цепочку происхождения и версии: оригинал → вариация → апскейл.' },
  { title: 'Повторное использование', to: '/app/projects/pr-kira?tab=history', body: 'История событий и контрольные точки: вернитесь к любому состоянию и повторите удачный процесс.' },
];

interface TourState {
  open: boolean;
  step: number;
  start: () => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

export const useTour = create<TourState>((set, get) => ({
  open: false,
  step: 0,
  start: () => set({ open: true, step: 0 }),
  close: () => set({ open: false }),
  next: () => {
    const s = get().step;
    if (s >= TOUR_STEPS.length - 1) set({ open: false });
    else set({ step: s + 1 });
  },
  prev: () => set({ step: Math.max(0, get().step - 1) }),
}));
