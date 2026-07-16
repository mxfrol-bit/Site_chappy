import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { demoAssets, demoUser } from '../../data/account';
import { agents } from '../../data/agents';
import { models } from '../../data/models';
import { RUN_LABEL, runStatusColor } from '../../features/agents/runStatus';
import { useTour } from '../../features/demo/tourStore';

const quick = [
  { ic: '🧩', label: 'Открыть демо-проект', to: '/app/projects/pr-kira' },
  { ic: '🎭', label: 'Аватары и сущности', to: '/app/avatars' },
  { ic: '🤖', label: 'Команды агентов', to: '/app/agents' },
  { ic: '🖼️', label: 'Библиотека ассетов', to: '/app/assets' },
  { ic: '📁', label: 'Все проекты', to: '/app/projects' },
];

export default function AppHome() {
  const allProjects = useStore((s) => s.projects);
  const projects = allProjects.filter((p) => p.status !== 'archived');
  const nav = useNavigate();
  const last = projects[0];
  const newModels = models.filter((m) => m.status === 'new' || m.badge === 'NEW').concat(models.slice(0, 2)).slice(0, 4);
  const avatars = useStore((s) => s.avatars);
  const runs = useStore((s) => s.runs);
  const assets = useStore((s) => s.assets);
  const outputs = useStore((s) => s.outputs);
  const activity = useStore((s) => s.activity);
  const checkpoints = useStore((s) => s.checkpoints);
  const getAsset = useStore((s) => s.getAsset);
  const getVoice = useStore((s) => s.getVoice);

  const recentAssets = assets.filter((a) => a.status !== 'archived' && a.cover).slice(0, 6);
  const lastResult = recentAssets[0];
  const recentActivity = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div style={{ maxWidth: 1140 }}>
      <div className="between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Привет, {demoUser.name.split('-')[0]} 👋</h1>
          <p className="sub" style={{ marginTop: 6 }}>Продолжите работу или начните новый проект.</p>
        </div>
        <div className="wrap-row">
          <button className="btn btn-ghost" onClick={() => useTour.getState().start()}>▶ Посмотреть, как работает Chappy</button>
          {lastResult && <button className="btn btn-soft" onClick={() => nav(`/app/assets/${lastResult.id}`)}>↻ Продолжить с последнего результата</button>}
          <Link to="/app/projects/pr-kira" className="btn btn-primary">Открыть демо-проект</Link>
        </div>
      </div>

      {/* quick actions */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', marginBottom: 28 }}>
        {quick.map((q) => (
          <Link key={q.label} to={q.to} className="card pad card-hover" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{q.ic}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{q.label}</span>
          </Link>
        ))}
      </div>

      {/* continue + projects */}
      <div className="between" style={{ marginBottom: 14 }}>
        <h3 className="h3">Ваши проекты</h3>
        <Link to="/app/projects" className="btn btn-ghost btn-sm">Все проекты</Link>
      </div>
      <div className="grid g3" style={{ marginBottom: 28 }}>
        {last && (
          <Link to={`/app/projects/${last.id}`} className="card card-hover" style={{ overflow: 'hidden', gridColumn: 'span 1' }}>
            <div className="cover" style={{ aspectRatio: '16/9', position: 'relative' }}>
              <img src={last.cover} alt="" />
              <span className="badge badge-top" style={{ position: 'absolute', top: 10, left: 10, background: 'var(--scrim)' }}>Продолжить</span>
            </div>
            <div className="pad"><div style={{ fontWeight: 600 }}>{last.name}</div><div className="sub" style={{ fontSize: 13, marginTop: 4 }}>{last.assetCount} ассетов · обновлён {last.updatedAt}</div></div>
          </Link>
        )}
        {projects.slice(1, 3).map((p) => (
          <Link key={p.id} to={`/app/projects/${p.id}`} className="card card-hover" style={{ overflow: 'hidden' }}>
            <div className="cover" style={{ aspectRatio: '16/9' }}><img src={p.cover} alt="" /></div>
            <div className="pad"><div style={{ fontWeight: 600 }}>{p.name}</div><div className="sub" style={{ fontSize: 13, marginTop: 4 }}>{p.assetCount} ассетов</div></div>
          </Link>
        ))}
      </div>

      {/* recent generations */}
      <div className="between" style={{ marginBottom: 14 }}>
        <h3 className="h3">Последние генерации</h3>
        <Link to="/app/projects/pr-kira?tab=history" className="btn btn-ghost btn-sm">История проекта</Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', marginBottom: 28 }}>
        {demoAssets.slice(0, 6).map((a) => (
          <div key={a.id} className="card card-hover" style={{ overflow: 'hidden' }}>
            <div className="cover" style={{ aspectRatio: '1/1' }}><img src={a.cover} alt={a.title} loading="lazy" /></div>
            <div style={{ padding: 10, fontSize: 12.5 }}>{a.title}</div>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ marginBottom: 28 }}>
        {/* avatars */}
        <div>
          <div className="between" style={{ marginBottom: 14 }}>
            <h3 className="h3">Сохранённые аватары</h3>
            <Link to="/app/avatars" className="btn btn-ghost btn-sm">Все</Link>
          </div>
          <div className="wrap-row">
            {avatars.filter((a) => a.status !== 'archived').map((a) => (
              <Link key={a.id} to={`/app/avatars/${a.id}`} className="card pad card-hover" style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 200px' }}>
                <img src={(a.coverAssetId ? getAsset(a.coverAssetId)?.cover : '') || ''} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', background: 'var(--panel-2)' }} />
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div><div className="sub" style={{ fontSize: 12 }}>{a.voiceId ? getVoice(a.voiceId)?.name : '—'}</div></div>
              </Link>
            ))}
          </div>
        </div>
        {/* agents */}
        <div>
          <div className="between" style={{ marginBottom: 14 }}>
            <h3 className="h3">Агенты</h3>
            <Link to="/app/agents" className="btn btn-ghost btn-sm">Командный центр</Link>
          </div>
          <div className="wrap-row">
            {agents.slice(0, 3).map((a) => (
              <Link key={a.id} to="/app/agents" className="card pad card-hover" style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 200px' }}>
                <span style={{ fontSize: 20 }}>{a.emoji}</span>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div><div className="sub" style={{ fontSize: 12 }}>{a.role}</div></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* agent activity */}
      {runs.length > 0 && (
        <>
          <div className="between" style={{ marginBottom: 14 }}>
            <h3 className="h3">Активность агентов</h3>
            <Link to="/app/agents" className="btn btn-ghost btn-sm">Все запуски</Link>
          </div>
          <div className="grid g4" style={{ marginBottom: 12 }}>
            <div className="card pad"><div className="k">Активные</div><div style={{ fontSize: 26, fontWeight: 700 }}>{runs.filter((r) => r.status === 'running' || r.status === 'queued').length}</div></div>
            <div className="card pad"><div className="k">Ждут одобрения</div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{runs.filter((r) => r.status === 'waiting_approval').length}</div></div>
            <div className="card pad"><div className="k">Завершено</div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green)' }}>{runs.filter((r) => r.status === 'completed').length}</div></div>
            <div className="card pad"><div className="k">Результатов</div><div style={{ fontSize: 26, fontWeight: 700 }}>{runs.filter((r) => r.finalOutputId).length}</div></div>
          </div>
          <div className="grid" style={{ gap: 8, marginBottom: 28 }}>
            {runs.slice(0, 4).map((r) => (
              <Link key={r.id} to={`/app/runs/${r.id}`} className="card pad between">
                <div className="row"><span style={{ fontSize: 16 }}>🤖</span><div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.task.slice(0, 48)}{r.task.length > 48 ? '…' : ''}</div><div className="sub mono" style={{ fontSize: 11 }}>{r.steps.length} этапов · ~{r.actualMockCost} кр</div></div></div>
                <span className="badge" style={{ color: runStatusColor(r.status) }}>{RUN_LABEL[r.status]}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* library & history */}
      <div className="between" style={{ marginBottom: 14 }}>
        <h3 className="h3">Библиотека и история</h3>
        <Link to="/app/assets" className="btn btn-ghost btn-sm">Все ассеты</Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', marginBottom: 12 }}>
        {recentAssets.map((a) => (
          <Link key={a.id} to={`/app/assets/${a.id}`} className="card card-hover" style={{ overflow: 'hidden' }}>
            <div className="cover" style={{ aspectRatio: '1/1' }}><img src={a.cover} alt={a.title} loading="lazy" /></div>
            <div style={{ padding: 8, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
          </Link>
        ))}
      </div>
      <div className="grid g3" style={{ marginBottom: 28 }}>
        <div className="card pad">
          <div className="k" style={{ marginBottom: 10 }}>Project Outputs · {outputs.length}</div>
          {outputs.slice(0, 4).map((o) => <Link key={o.id} to={o.assetId ? `/app/assets/${o.assetId}` : '#'} className="between" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 12.5 }}>⭐ {o.title}</span><span className="sub mono" style={{ fontSize: 10 }}>{o.status}</span></Link>)}
          {!outputs.length && <div className="sub" style={{ fontSize: 12.5 }}>Пока нет утверждённых результатов.</div>}
        </div>
        <div className="card pad">
          <div className="k" style={{ marginBottom: 10 }}>Недавняя активность</div>
          {recentActivity.map((e) => <div key={e.id} style={{ padding: '5px 0', borderBottom: '1px solid var(--line)' }}><div style={{ fontSize: 12.5 }}>{e.title}</div><div className="sub mono" style={{ fontSize: 10 }}>{e.createdAt.slice(0, 10)} · {e.actorType}</div></div>)}
          {!recentActivity.length && <div className="sub" style={{ fontSize: 12.5 }}>Событий пока нет.</div>}
        </div>
        <div className="card pad">
          <div className="k" style={{ marginBottom: 10 }}>Контрольные точки · {checkpoints.length}</div>
          {checkpoints.slice(0, 4).map((c) => <Link key={c.id} to={`/app/projects/${c.projectId}?tab=history`} className="between" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 12.5 }}>📌 {c.title.slice(0, 26)}</span><span className="sub mono" style={{ fontSize: 10 }}>{c.reason}</span></Link>)}
          {!checkpoints.length && <div className="sub" style={{ fontSize: 12.5 }}>Точек пока нет — создайте в проекте.</div>}
        </div>
      </div>

      {/* new models */}
      <div className="between" style={{ marginBottom: 14 }}>
        <h3 className="h3">Новые и рекомендуемые модели</h3>
        <Link to="/app/projects/pr-kira" className="btn btn-ghost btn-sm">Открыть на Canvas</Link>
      </div>
      <div className="grid g4">
        {newModels.map((m) => (
          <button key={m.id} onClick={() => nav('/app/projects/pr-kira')} className="card pad card-hover" style={{ textAlign: 'left' }}>
            <div className="between"><span className="k">{m.modality}</span>{m.badge && <span className={`badge ${m.badge === 'NEW' ? 'badge-new' : 'badge-top'}`}>{m.badge}</span>}</div>
            <div style={{ fontWeight: 600, marginTop: 10 }}>{m.name}</div>
            <div className="sub" style={{ fontSize: 12 }}>{m.company}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
