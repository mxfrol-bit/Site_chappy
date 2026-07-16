import { Link } from 'react-router-dom';

interface Props {
  title: string;
  eyebrow?: string;
  description: string;
  bullets?: string[];
  primaryTo?: string;
  primaryLabel?: string;
  backTo?: string;
  backLabel?: string;
}

// Honest placeholder for scope that is intentionally NOT in v0.1.
// Says what the feature will do, marks it clearly as future, and always
// gives a real way forward into a working area — never a dead end.
export default function FuturePage({
  title, eyebrow = 'Дорожная карта', description, bullets,
  primaryTo = '/app/projects', primaryLabel = 'Открыть проекты',
  backTo = '/app', backLabel = 'На главную',
}: Props) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="k" style={{ marginBottom: 8 }}>{eyebrow}</div>
      <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <h1 className="h2" style={{ margin: 0 }}>{title}</h1>
        <span className="badge badge-top">В следующих версиях</span>
      </div>
      <p className="sub" style={{ maxWidth: 620, marginBottom: 20 }}>{description}</p>

      {bullets && bullets.length > 0 && (
        <div className="card pad-lg" style={{ marginBottom: 20 }}>
          <div className="k" style={{ marginBottom: 12 }}>Что появится здесь</div>
          <div className="stack" style={{ gap: 10 }}>
            {bullets.map((b) => (
              <div key={b} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>◆</span>
                <span style={{ fontSize: 14 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card pad" style={{ background: 'var(--panel-2)', marginBottom: 20 }}>
        <div className="sub" style={{ fontSize: 13.5 }}>
          Не входит в демо v0.1. Ядро прототипа — проекты, Canvas, ассеты, сущности, агенты и история — уже работает.
        </div>
      </div>

      <div className="wrap-row">
        <Link to={primaryTo} className="btn btn-primary">{primaryLabel}</Link>
        <Link to={backTo} className="btn btn-soft">{backLabel}</Link>
      </div>
    </div>
  );
}
