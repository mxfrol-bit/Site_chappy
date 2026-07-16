import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <div className="between" style={{ alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="h2" style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p className="sub" style={{ marginTop: 8, maxWidth: 620 }}>{subtitle}</p>}
      </div>
      {actions && <div className="wrap-row">{actions}</div>}
    </div>
  );
}
