import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { CheckpointReason } from '../types';

const REASON_LABEL: Record<CheckpointReason, string> = {
  automatic: 'авто', manual: 'вручную', before_restore: 'перед восстановлением', approved_output: 'после утверждения',
};

export default function ProjectCheckpoints({ projectId, onRestored }: { projectId: string; onRestored: () => void }) {
  const checkpoints = useStore((s) => s.checkpoints);
  const getProject = useStore((s) => s.getProject);
  const createCheckpoint = useStore((s) => s.createCheckpoint);
  const restoreCheckpoint = useStore((s) => s.restoreCheckpoint);
  const forkProjectFromCheckpoint = useStore((s) => s.forkProjectFromCheckpoint);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [title, setTitle] = useState('');

  const list = checkpoints.filter((c) => c.projectId === projectId);
  const currentNodes = getProject(projectId)?.canvas?.nodes?.length ?? 0;

  const create = () => {
    createCheckpoint({ projectId, title: title.trim() || 'Контрольная точка', reason: 'manual' });
    setTitle('');
    toast('Контрольная точка создана', 'success');
  };
  const restore = (id: string, cpTitle: string) => {
    if (!window.confirm(`Восстановить Canvas из «${cpTitle}»?\n\nТекущее состояние сначала будет сохранено в новую контрольную точку — ничего не потеряется.`)) return;
    restoreCheckpoint(id);
    onRestored();
    toast('Canvas восстановлен из контрольной точки', 'success');
  };
  const fork = (id: string) => {
    const p = forkProjectFromCheckpoint(id);
    if (p) { toast('Создана ветка проекта', 'success'); nav(`/app/projects/${p.id}`); }
  };

  return (
    <div className="card pad-lg">
      <div className="k" style={{ marginBottom: 12 }}>Контрольные точки</div>
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <input className="input" placeholder="Название точки…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={create} style={{ flex: '0 0 auto' }}>Создать</button>
      </div>
      {list.length ? list.map((c) => {
        const cpNodes = c.canvasSnapshot?.nodes?.length ?? 0;
        const diff = cpNodes - currentNodes;
        return (
          <div key={c.id} className="card pad" style={{ marginBottom: 8 }}>
            <div className="between" style={{ gap: 8 }}><b style={{ fontSize: 13.5 }}>{c.title}</b><span className="badge">{REASON_LABEL[c.reason]}</span></div>
            <div className="sub mono" style={{ fontSize: 10.5, marginTop: 4 }}>{c.createdAt.slice(0, 10)} {c.createdAt.slice(11, 16)} · {cpNodes} узлов · {c.assetIds.length} ассетов</div>
            <div className="sub" style={{ fontSize: 12, marginTop: 4 }}>сейчас на Canvas: {currentNodes} узлов ({diff >= 0 ? '+' : ''}{diff} к точке)</div>
            <div className="wrap-row" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => restore(c.id, c.title)}>Восстановить</button>
              <button className="btn btn-soft btn-sm" onClick={() => fork(c.id)}>Ответвить проект</button>
            </div>
          </div>
        );
      }) : <div className="sub" style={{ fontSize: 13 }}>Пока нет точек. Создайте перед крупными изменениями Canvas.</div>}
    </div>
  );
}
