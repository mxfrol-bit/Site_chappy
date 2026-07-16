import type { RunStatus } from '../../types';

// Single source of truth for run-status label + color, used by AppHome,
// AgentRunDetail and ProjectDetail so the badge never diverges.
export const RUN_LABEL: Record<RunStatus, string> = {
  draft: 'черновик', queued: 'в очереди', running: 'выполняется', waiting_approval: 'ждёт одобрения',
  completed: 'завершено', failed: 'ошибка', cancelled: 'отменено',
};

export const runStatusColor = (s: RunStatus): string =>
  s === 'completed' ? 'var(--green)'
    : s === 'failed' ? 'var(--hot)'
    : s === 'waiting_approval' ? 'var(--accent)'
    : 'var(--ink)';
