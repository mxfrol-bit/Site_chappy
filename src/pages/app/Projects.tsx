import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import PageHeader from '../../components/PageHeader';
import NewProjectModal from '../../components/NewProjectModal';
import EmptyState from '../../components/EmptyState';

export default function Projects() {
  const projects = useStore((s) => s.projects);
  const dup = useStore((s) => s.duplicateProject);
  const arch = useStore((s) => s.archiveProject);
  const [open, setOpen] = useState(false);
  const active = projects.filter((p) => p.status !== 'archived');

  return (
    <div>
      <PageHeader
        eyebrow="Моё"
        title="Проекты"
        subtitle="Каждый проект — это Canvas, ассеты и история работы."
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}>✨ Новый проект</button>}
      />
      {active.length === 0 ? (
        <EmptyState icon="📁" title="Пока нет проектов" hint="Создайте первый проект, чтобы начать работу на Canvas."
          action={<button className="btn btn-primary" onClick={() => setOpen(true)}>Создать проект</button>} />
      ) : (
        <div className="grid autogrid">
          {active.map((p) => (
            <div key={p.id} className="card card-hover" style={{ overflow: 'hidden' }}>
              <Link to={`/app/projects/${p.id}`}>
                <div className="cover" style={{ aspectRatio: '16/10' }}>
                  {p.cover ? <img src={p.cover} alt="" /> : <div className="ph" style={{ width: '100%', height: '100%' }} />}
                </div>
              </Link>
              <div className="pad">
                <div className="between">
                  <Link to={`/app/projects/${p.id}`} style={{ fontWeight: 600 }}>{p.name}</Link>
                  <span className="badge">{p.status === 'draft' ? 'черновик' : 'активен'}</span>
                </div>
                <div className="sub" style={{ fontSize: 13, marginTop: 4 }}>{p.assetCount} ассетов · {p.updatedAt}</div>
                <div className="wrap-row" style={{ marginTop: 12 }}>
                  <Link to={`/app/projects/${p.id}`} className="btn btn-soft btn-sm">Открыть</Link>
                  <button className="btn btn-soft btn-sm" onClick={() => dup(p.id)}>Дублировать</button>
                  <button className="btn btn-soft btn-sm" onClick={() => arch(p.id)}>В архив</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
