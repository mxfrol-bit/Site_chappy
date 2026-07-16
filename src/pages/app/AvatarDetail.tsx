import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import EmptyState from '../../components/EmptyState';

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="sub mono" style={{ fontSize: 11 }}>{l}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

export default function AvatarDetail() {
  const { id = '' } = useParams();
  const avatars = useStore((s) => s.avatars);
  const projects = useStore((s) => s.projects);
  const assets = useStore((s) => s.assets);
  const getAsset = useStore((s) => s.getAsset);
  const getVoice = useStore((s) => s.getVoice);
  const getStyle = useStore((s) => s.getStyle);
  const getLocation = useStore((s) => s.getLocation);
  const nav = useNavigate();

  const av = avatars.find((a) => a.id === id);
  if (!av) {
    return <EmptyState icon="🔍" title="Аватар не найден" hint="Возможно, он был архивирован." action={<Link to="/app/avatars" className="btn btn-primary">К библиотеке</Link>} />;
  }

  const refs = av.referenceAssetIds.map((rid) => getAsset(rid)?.cover).filter(Boolean) as string[];
  const usedProjects = projects.filter((p) => av.usedInProjectIds.includes(p.id));
  const results = assets.filter((a) => a.recipe?.avatarId === av.id);
  const voice = av.voiceId ? getVoice(av.voiceId) : undefined;
  const style = av.defaultStyleId ? getStyle(av.defaultStyleId) : undefined;
  const location = av.defaultLocationId ? getLocation(av.defaultLocationId) : undefined;

  const openCanvas = () => {
    const pid = usedProjects[0]?.id || projects.find((p) => p.status !== 'archived')?.id;
    if (pid) nav(`/app/projects/${pid}?addAvatar=${av.id}`);
  };

  return (
    <div style={{ maxWidth: 1040 }}>
      <div className="k" style={{ marginBottom: 8 }}><Link to="/app/avatars" style={{ color: 'var(--ink-3)' }}>Библиотека</Link> / Аватар</div>
      <div className="between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 16 }}>
        <div className="row" style={{ gap: 16 }}>
          {refs[0] && <img src={refs[0]} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }} />}
          <div><h1 className="h2" style={{ margin: 0 }}>{av.name}</h1><p className="sub" style={{ marginTop: 6, maxWidth: 520 }}>{av.description || 'Без описания'}</p></div>
        </div>
        <div className="wrap-row">
          <button className="btn btn-ghost" onClick={openCanvas}>Открыть в Canvas</button>
          <button className="btn btn-primary" onClick={openCanvas}>Создать контент</button>
        </div>
      </div>

      <div className="split">
        <div>
          <h3 className="h3" style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Референсы</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))' }}>
            {refs.map((u, i) => <div key={i} className="cover card" style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}><img src={u} alt="" /></div>)}
          </div>

          <h3 className="h3" style={{ fontFamily: 'var(--font-display)', margin: '22px 0 12px' }}>Последние результаты</h3>
          {results.length
            ? <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))' }}>{results.slice(0, 8).map((r) => <div key={r.id} className="cover card" style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>{r.cover && <img src={r.cover} alt="" />}</div>)}</div>
            : <div className="sub" style={{ fontSize: 14 }}>Пока нет — сгенерируйте контент с этим аватаром на Canvas.</div>}
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 6 }}>Связанные сущности</div>
            <Row l="Голос" v={voice?.name || '—'} />
            <Row l="Стиль" v={style?.name || '—'} />
            <Row l="Локация" v={location?.name || '—'} />
          </div>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Проекты · {usedProjects.length}</div>
            {usedProjects.length
              ? usedProjects.map((p) => (
                <Link key={p.id} to={`/app/projects/${p.id}`} className="between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 14 }}>{p.name}</span><span className="sub" style={{ fontSize: 12 }}>→</span>
                </Link>
              ))
              : <div className="sub" style={{ fontSize: 13 }}>Ещё не используется в проектах.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
