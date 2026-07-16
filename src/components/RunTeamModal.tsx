import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import { startRun, setForceErrorStep } from '../features/agents/orchestration';
import { getAgent } from '../data/agents';
import type { AgentRunContext } from '../types';

export default function RunTeamModal({ open, onClose, projectId: fixedProject, teamId: fixedTeam }: { open: boolean; onClose: () => void; projectId?: string; teamId?: string }) {
  const projects = useStore((s) => s.projects);
  const teams = useStore((s) => s.teams);
  const avatars = useStore((s) => s.avatars);
  const styles = useStore((s) => s.styles);
  const locations = useStore((s) => s.locations);
  const createRun = useStore((s) => s.createRun);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  const [projectId, setProjectId] = useState(fixedProject || projects.find((p) => p.status !== 'archived')?.id || '');
  const [teamId, setTeamId] = useState(fixedTeam || teams[0]?.id || '');
  const [task, setTask] = useState('Создай концепцию короткого вертикального ролика с аватаром о запуске нового AI-продукта.');
  const [avatarId, setAvatarId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [errorStep, setErrorStep] = useState(-1);

  const team = teams.find((t) => t.id === teamId);
  const estCost = (team?.memberIds.length ?? 0) * 6 + 8;

  const launch = () => {
    if (!projectId) return toast('Выберите проект', 'error');
    if (!teamId) return toast('Выберите команду', 'error');
    if (!task.trim()) return toast('Опишите задачу', 'error');
    const context: AgentRunContext = { task: task.trim(), projectId, avatarId: avatarId || undefined, styleId: styleId || undefined, locationId: locationId || undefined };
    const run = createRun({ projectId, teamId, task: task.trim(), context });
    setForceErrorStep(errorStep);
    startRun(run.id);
    onClose();
    nav(`/app/runs/${run.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Запуск команды" width={640}>
      {!fixedProject && (
        <>
          <div className="label">Проект</div>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.filter((p) => p.status !== 'archived').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>
      )}
      <div className="label" style={{ marginTop: 14 }}>Команда</div>
      <select className="input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.memberIds.length} агентов</option>)}
      </select>
      <div className="label" style={{ marginTop: 14 }}>Задача</div>
      <textarea className="textarea" value={task} onChange={(e) => setTask(e.target.value)} />
      <div className="grid g3" style={{ marginTop: 14 }}>
        <div><div className="label">Аватар</div><select className="input" value={avatarId} onChange={(e) => setAvatarId(e.target.value)}><option value="">по проекту</option>{avatars.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><div className="label">Стиль</div><select className="input" value={styleId} onChange={(e) => setStyleId(e.target.value)}><option value="">по проекту</option>{styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><div className="label">Локация</div><select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">по проекту</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
      </div>
      <div className="label" style={{ marginTop: 14 }}>Симуляция сбоя (демо)</div>
      <select className="input" value={errorStep} onChange={(e) => setErrorStep(Number(e.target.value))}>
        <option value={-1}>Без сбоя</option>
        {(team?.memberIds ?? []).map((mid, i) => <option key={mid} value={i}>Ошибка на этапе {i + 1}: {getAgent(mid)?.name ?? mid}</option>)}
      </select>
      <div className="card pad" style={{ marginTop: 16, background: 'var(--panel-2)' }}>
        <div className="k" style={{ marginBottom: 6 }}>Оценка (демо)</div>
        <div className="sub" style={{ fontSize: 13 }}>{team?.memberIds.length ?? 0} этапов · ~{(team?.memberIds.length ?? 0) * 2} сек · ~{estCost} кр · human approval: {team?.approvalRequired ? 'да' : 'нет'}</div>
      </div>
      <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={launch}>Запустить</button>
      </div>
    </Modal>
  );
}
