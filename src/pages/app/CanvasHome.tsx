import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import PageHeader from '../../components/PageHeader';
import NewProjectModal from '../../components/NewProjectModal';
import EmptyState from '../../components/EmptyState';

export default function CanvasHome() {
  const projects = useStore((s) => s.projects).filter((p) => p.status !== 'archived');
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Визуальная доска · Alpha"
        title="Canvas"
        subtitle="Откройте Canvas проекта или создайте новый — идея → модель → результат."
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}>✨ Новый проект</button>}
      />
      {projects.length === 0 ? (
        <EmptyState icon="🧩" title="Нет проектов для Canvas" hint="Создайте проект — внутри откроется Canvas."
          action={<button className="btn btn-primary" onClick={() => setOpen(true)}>Создать проект</button>} />
      ) : (
        <div className="grid autogrid">
          {projects.map((p) => (
            <Link key={p.id} to={`/app/projects/${p.id}`} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div className="cover" style={{ aspectRatio: '16/9' }}>{p.cover && <img src={p.cover} alt="" />}</div>
              <div className="pad"><div style={{ fontWeight: 600 }}>{p.name}</div><div className="sub" style={{ fontSize: 13, marginTop: 4 }}>Открыть Canvas →</div></div>
            </Link>
          ))}
        </div>
      )}
      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
