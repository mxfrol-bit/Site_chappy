import type { ReactNode } from 'react';

interface Props {
  icon?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = '✨', title, hint, action }: Props) {
  return (
    <div
      className="card"
      style={{ display: 'grid', placeItems: 'center', gap: 10, padding: '48px 24px', textAlign: 'center', borderStyle: 'dashed' }}
    >
      <div style={{ fontSize: 30 }}>{icon}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {hint && <div className="sub" style={{ fontSize: 14, maxWidth: 380 }}>{hint}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}
