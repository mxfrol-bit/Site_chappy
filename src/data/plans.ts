import type { Plan, CreditPackage } from '../types';

// Предварительные тарифы прототипа (ТЗ §22.2) — не финальные.
export const plans: Plan[] = [
  {
    id: 'free', name: 'Free', priceRub: 0, period: 'mo', credits: 100,
    features: ['100 кредитов на старте', 'Базовые модели', '1 проект', 'Тренды с ограничением'],
  },
  {
    id: 'start', name: 'Старт', priceRub: 500, period: 'mo', credits: 600,
    features: ['600 кредитов / мес', 'Фото и текст', '3 проекта с памятью', 'Тренды без ограничений'],
  },
  {
    id: 'optimal', name: 'Оптимальный', priceRub: 900, period: 'mo', credits: 1200, highlighted: true,
    features: ['1200 кредитов / мес', 'Видео и озвучка', 'Все студии и агенты', '10 проектов + Canvas'],
  },
  {
    id: 'pro', name: 'Про', priceRub: 2500, period: 'mo', credits: 3800,
    features: ['3800 кредитов / мес', 'Приоритетная очередь', 'Команды агентов', 'Расширенное хранилище'],
  },
  {
    id: 'studio', name: 'Студия', priceRub: 10500, period: 'mo', credits: 18000,
    features: ['18000 кредитов / мес', 'Максимальный приоритет', 'Бренд-память', 'Поддержка и API (позже)'],
  },
];

export const creditPackages: CreditPackage[] = [
  { id: 'p1', priceRub: 199, credits: 200 },
  { id: 'p2', priceRub: 490, credits: 550, bonus: '+12%' },
  { id: 'p3', priceRub: 990, credits: 1200, bonus: '+21%' },
  { id: 'p4', priceRub: 2490, credits: 3200, bonus: '+28%' },
  { id: 'p5', priceRub: 5000, credits: 7000, bonus: '+40%' },
];

export const getPlan = (id: string) => plans.find((p) => p.id === id);
