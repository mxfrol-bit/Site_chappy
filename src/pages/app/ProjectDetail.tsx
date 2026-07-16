import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import CanvasEditor from '../../features/canvas/CanvasEditor';
import EmptyState from '../../components/EmptyState';
import RunTeamModal from '../../components/RunTeamModal';
import ProjectMemory from '../../components/ProjectMemory';
import ProjectHistory from '../../components/ProjectHistory';
import ProjectCheckpoints from '../../components/ProjectCheckpoints';
import { RUN_LABEL, runStatusColor } from '../../features/agents/runStatus';

type Tab = 'canvas' | 'assets' | 'agents' | 'history';

export default function ProjectDetail() {
  const params = useParams();
  const pid = params.id || params.projectId || '';
  const [sp] = useSearchParams();
  const projects = useStore((s) => s.projects);
  const assets = useStore((s) => s.assets);
  const runs = useStore((s) => s.runs);
  const teams = useStore((s) => s.teams);
  const outputs = useStore((s) => s.outputs);
  const project = projects.find((p) => p.id === pid);
  const initialTab = (sp.get('tab') as Tab) || 'canvas';
  const [tab, setTab] = useState<Tab>(['canvas', 'assets', 'agents', 'history'].includes(initialTab) ? initialTab : 'canvas');
  const [runModal, setRunModal] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // bump to remount Canvas after a checkpoint restore

  if (!project) {
    return (
      <div>
        <EmptyState icon="🔍" title="Проект не найден" hint="Возможно, он был удалён или архивирован."
          action={<Link to="/app/projects" className="btn btn-primary">К проектам</Link>} />
      </div>
    );
  }

  const projAssets = assets.filter((a) => a.projectId === pid && a.status !== 'archived');
  const projRuns = runs.filter((r) => r.projectId === pid).slice().reverse();
  const projOutputs = outputs.filter((o) => o.projectId === pid);
  const outputAssetIds = new Set(projOutputs.map((o) => o.assetId));

  return (
    <div>
      <div className="between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="k" style={{ marginBottom: 6 }}>
            <Link to="/app/projects" style={{ color: 'var(--ink-3)' }}>Проекты</Link> / {project.type}
          </div>
          <h1 className="h2" style={{ margin: 0 }}>{project.name}</h1>
          {project.description && <p className="sub" style={{ marginTop: 6 }}>{project.description}</p>}
        </div>
        <div className="wrap-row">
          <span className="badge">{projAssets.length} ассетов</span>
          <button className="btn btn-primary btn-sm" onClick={() => setRunModal(true)}>Запустить команду</button>
        </div>
      </div>

      <div className="wrap-row" style={{ marginBottom: 16 }}>
        {(['canvas', 'assets', 'agents', 'history'] as Tab[]).map((t) => (
          <button key={t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'canvas' ? 'Canvas' : t === 'assets' ? `Ассеты${projAssets.length ? ` · ${projAssets.length}` : ''}` : t === 'agents' ? `Агенты / Запуски${projRuns.length ? ` · ${projRuns.length}` : ''}` : 'История'}
          </button>
        ))}
      </div>

      {tab === 'canvas' && (
        <div style={{ height: '72vh', minHeight: 460 }}>
          <CanvasEditor key={`${project.id}-${canvasKey}`} projectId={project.id} />
        </div>
      )}

      {tab === 'assets' && (
        <>
          {projOutputs.length > 0 && (
            <div className="card pad" style={{ marginBottom: 14 }}>
              <div className="k" style={{ marginBottom: 8 }}>Project Outputs · {projOutputs.length}</div>
              <div className="wrap-row">{projOutputs.map((o) => <Link key={o.id} to={o.assetId ? `/app/assets/${o.assetId}` : '#'} className="badge badge-gold">⭐ {o.title} · {o.status}</Link>)}</div>
            </div>
          )}
          {projAssets.length ? (
            <div className="grid autogrid">
              {projAssets.map((a) => (
                <Link key={a.id} to={`/app/assets/${a.id}`} className="card card-hover" style={{ overflow: 'hidden' }}>
                  <div className="cover" style={{ aspectRatio: '1/1' }}>{a.cover && <img src={a.cover} alt={a.title} />}</div>
                  <div style={{ padding: 10, fontSize: 12.5 }}>
                    {a.title}
                    {outputAssetIds.has(a.id) && <span className="badge badge-gold" style={{ marginLeft: 6 }}>⭐</span>}
                    {a.derivationType && <span className="badge badge-gold" style={{ marginLeft: 6 }}>{a.derivationType}</span>}
                    {a.source === 'agent' && <span className="badge badge-new" style={{ marginLeft: 6 }}>агент</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="🖼️" title="Пока нет ассетов" hint="Запустите генерацию на Canvas — результат появится здесь."
              action={<button className="btn btn-soft" onClick={() => setTab('canvas')}>Открыть Canvas</button>} />
          )}
        </>
      )}

      {tab === 'agents' && (
        <div className="split">
          <div className="stack" style={{ gap: 12 }}>
            <div className="card pad-lg">
              <div className="between" style={{ marginBottom: 12 }}><div className="k">Запуски команд</div><button className="btn btn-soft btn-sm" onClick={() => setRunModal(true)}>Новый запуск</button></div>
              {projRuns.length ? projRuns.map((r) => {
                const team = teams.find((t) => t.id === r.teamId);
                return (
                  <Link key={r.id} to={`/app/runs/${r.id}`} className="card pad between" style={{ marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{team?.name ?? 'Команда'}</div>
                      <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>{r.task.slice(0, 64)}{r.task.length > 64 ? '…' : ''}</div>
                      <div className="sub mono" style={{ fontSize: 11, marginTop: 4 }}>{r.steps.length} этапов · ~{r.actualMockCost} кр · {r.createdAt}</div>
                    </div>
                    <span className="badge" style={{ color: runStatusColor(r.status) }}>{RUN_LABEL[r.status]}</span>
                  </Link>
                );
              }) : <EmptyState icon="🤖" title="Ещё не запускали агентов" hint="Соберите команду и запустите её на этом проекте." action={<button className="btn btn-primary" onClick={() => setRunModal(true)}>Запустить команду</button>} />}
            </div>
          </div>
          <ProjectMemory projectId={pid} />
        </div>
      )}

      {tab === 'history' && (
        <div className="split">
          <ProjectHistory projectId={pid} />
          <ProjectCheckpoints projectId={pid} onRestored={() => { setCanvasKey((k) => k + 1); setTab('canvas'); }} />
        </div>
      )}

      <RunTeamModal open={runModal} onClose={() => setRunModal(false)} projectId={pid} />
    </div>
  );
}
