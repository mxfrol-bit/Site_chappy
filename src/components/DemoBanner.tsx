import { useTour } from '../features/demo/tourStore';

// Persistent, unobtrusive "you are in a demo" indicator. Clicking starts the tour.
export default function DemoBanner() {
  const start = useTour((s) => s.start);
  return (
    <button
      onClick={start}
      title="Демонстрационный режим — нажмите, чтобы пройти тур"
      aria-label="Демонстрационный режим — запустить тур"
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 250,
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
        borderRadius: 'var(--r-pill)', border: '1px solid var(--line-2)',
        background: 'var(--grad-soft)', backdropFilter: 'blur(8px)',
        color: 'var(--ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
      Демонстрационный режим
    </button>
  );
}
