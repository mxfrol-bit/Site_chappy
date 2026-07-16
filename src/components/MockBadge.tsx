import { ru } from '../i18n/ru';

// Honest marker for demo-only functionality (ТЗ §27).
export default function MockBadge({ text = 'демо' }: { text?: string }) {
  return (
    <span className="badge badge-gold" title={ru.mockNote} style={{ cursor: 'help' }}>
      ● {text}
    </span>
  );
}
