import { useStore } from '../store/useStore';

export default function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div role="status" aria-live="polite" aria-atomic="false" style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          aria-label={`${t.kind === 'error' ? 'Ошибка: ' : ''}${t.text}. Нажмите, чтобы закрыть`}
          className="card"
          style={{
            padding: '12px 16px', fontSize: 13.5, maxWidth: 340, textAlign: 'left',
            borderColor:
              t.kind === 'success' ? 'rgba(92,230,176,.4)' : t.kind === 'error' ? 'rgba(255,92,122,.4)' : 'var(--line-2)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {t.kind === 'success' ? '✅ ' : t.kind === 'error' ? '⚠️ ' : ''}
          {t.text}
        </button>
      ))}
    </div>
  );
}
