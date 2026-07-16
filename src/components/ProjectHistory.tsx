import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import EmptyState from './EmptyState';
import type { ActivityType } from '../types';

const ICON: Record<ActivityType, string> = {
  'project.created': '📁', 'project.updated': '✏️',
  'canvas.node_added': '➕', 'canvas.node_deleted': '➖', 'canvas.connected': '🔗',
  'generation.started': '⏳', 'generation.completed': '✅', 'generation.failed': '⚠️',
  'asset.created': '🖼️', 'asset.derived': '🌱', 'asset.archived': '🗄️',
  'entity.created': '🎭',
  'agent_run.started': '🤖', 'agent_run.approved': '✅', 'agent_run.failed': '⚠️',
  'memory.updated': '🧠',
  'checkpoint.created': '📌', 'checkpoint.restored': '↩️',
  'project_output.approved': '⭐',
};

const CATEGORY: Record<ActivityType, string> = {
  'project.created': 'decisions', 'project.updated': 'decisions',
  'canvas.node_added': 'canvas', 'canvas.node_deleted': 'canvas', 'canvas.connected': 'canvas',
  'generation.started': 'gen', 'generation.completed': 'gen', 'generation.failed': 'errors',
  'asset.created': 'assets', 'asset.derived': 'assets', 'asset.archived': 'assets',
  'entity.created': 'entities',
  'agent_run.started': 'agents', 'agent_run.approved': 'agents', 'agent_run.failed': 'errors',
  'memory.updated': 'decisions',
  'checkpoint.created': 'decisions', 'checkpoint.restored': 'decisions',
  'project_output.approved': 'decisions',
};

const FILTERS: [string, string][] = [
  ['all', 'Всё'], ['gen', 'Генерации'], ['agents', 'Агенты'], ['canvas', 'Canvas'],
  ['assets', 'Ассеты'], ['entities', 'Сущности'], ['errors', 'Ошибки'], ['decisions', 'Решения'],
];

export default function ProjectHistory({ projectId }: { projectId: string }) {
  const activity = useStore((s) => s.activity);
  const [filter, setFilter] = useState('all');
  const events = activity
    .filter((e) => e.projectId === projectId)
    .filter((e) => filter === 'all' || CATEGORY[e.type] === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first, regardless of insertion order

  return (
    <div className="card pad-lg">
      <div className="between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="k">Хронология проекта</div>
        <div className="wrap-row">{FILTERS.map(([id, l]) => <button key={id} className={`chip ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>{l}</button>)}</div>
      </div>
      {events.length ? events.map((e, i) => (
        <div key={e.id} style={{ display: 'flex', gap: 12, paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', fontSize: 13, background: 'var(--panel-2)' }}>{ICON[e.type]}</div>
            {i < events.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: 4, minHeight: 12 }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
            <div className="between" style={{ gap: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{e.title}</span>
              <span className="sub mono" style={{ fontSize: 10.5, flex: '0 0 auto' }}>{e.createdAt.slice(0, 10)} {e.createdAt.slice(11, 16)}</span>
            </div>
            <div className="wrap-row" style={{ marginTop: 4 }}>
              <span className="badge" style={{ fontSize: 10 }}>{e.actorType}</span>
              {e.assetId && <Link to={`/app/assets/${e.assetId}`} className="sub" style={{ fontSize: 12 }}>ассет →</Link>}
              {e.agentRunId && <Link to={`/app/runs/${e.agentRunId}`} className="sub" style={{ fontSize: 12 }}>запуск →</Link>}
              {e.description && <span className="sub mono" style={{ fontSize: 10.5 }}>{e.description}</span>}
            </div>
          </div>
        </div>
      )) : <EmptyState icon="🕘" title="Событий пока нет" hint="Действия в проекте (генерации, агенты, checkpoints) появятся здесь." />}
    </div>
  );
}
