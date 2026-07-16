import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import type { ProjectType } from '../types';

const types: { id: ProjectType; label: string }[] = [
  { id: 'video', label: 'Видео' },
  { id: 'image', label: 'Изображения' },
  { id: 'audio', label: 'Аудио' },
  { id: 'mixed', label: 'Смешанный' },
  { id: 'content', label: 'Контент' },
];

export default function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('mixed');
  const create = useStore((s) => s.createProject);
  const nav = useNavigate();

  const submit = () => {
    const p = create({ name: name.trim() || 'Новый проект', type });
    setName('');
    onClose();
    nav(`/app/projects/${p.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Новый проект">
      <label className="label">Название</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Reels для канала" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <label className="label" style={{ marginTop: 16 }}>Тип</label>
      <div className="wrap-row">
        {types.map((t) => (
          <button key={t.id} className={`chip ${type === t.id ? 'active' : ''}`} onClick={() => setType(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 22, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={submit}>Создать проект</button>
      </div>
    </Modal>
  );
}
