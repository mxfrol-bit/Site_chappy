import { DEMO_POOL } from './mockGen';
import type { GenerationRecipe, GenStatus } from '../types';

// --- Swappable generation service ---------------------------------------
// Canvas/UI depend only on this interface. To use a real backend later,
// replace runGeneration's body with a job-create + poll — keep the signature.
// Not coupled to any provider; no API keys; no production backend.

export interface GenerationInput {
  modelId: string;
  modelName: string;
  modality: string;
  prompt: string;
  cost: number;
  context?: string; // combined upstream text (connected idea blocks)
}
export interface GenerationResult {
  url: string;
  recipe: GenerationRecipe;
}
export interface GenerationHandlers {
  onStatus?: (status: GenStatus) => void;
  onDone?: (result: GenerationResult) => void;
  onError?: (message: string) => void;
}
export interface GenerationJob {
  cancel: () => void;
}

export function runGeneration(input: GenerationInput, h: GenerationHandlers): GenerationJob {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const at = (ms: number, fn: () => void) => {
    timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
  };

  h.onStatus?.('queued');
  at(650, () => h.onStatus?.('generating'));
  at(1300 + Math.floor(Math.random() * 1500), () => {
    if (!input.prompt.trim()) {
      h.onStatus?.('error');
      h.onError?.('Пустой промпт — добавьте описание перед запуском.');
      return;
    }
    if (Math.random() < 0.08) {
      h.onStatus?.('error');
      h.onError?.('Модель вернула ошибку (демо). Попробуйте ещё раз.');
      return;
    }
    const url = DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)];
    h.onStatus?.('success');
    h.onDone?.({
      url,
      recipe: {
        model: input.modelName,
        prompt: input.prompt,
        params: input.context ? { context: input.context } : undefined,
        cost: input.cost,
        date: new Date().toISOString(),
      },
    });
  });

  return { cancel: () => { cancelled = true; timers.forEach(clearTimeout); } };
}

export function costForModality(modality: string): number {
  switch (modality) {
    case 'video': return 35;
    case 'audio': return 12;
    case 'chat': return 2;
    default: return 6;
  }
}
