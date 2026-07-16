import { useState } from 'react';
import Modal from './Modal';
import { useStore } from '../store/useStore';

type Kind = 'voice' | 'style' | 'location';

export default function NewEntityModal({ open, onClose, kind }: { open: boolean; onClose: () => void; kind: Kind }) {
  const [name, setName] = useState('');
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const createVoice = useStore((s) => s.createVoice);
  const createStyle = useStore((s) => s.createStyle);
  const createLocation = useStore((s) => s.createLocation);
  const toast = useStore((s) => s.toast);

  const titles: Record<Kind, string> = { voice: 'Новый голос', style: 'Новый стиль', location: 'Новая локация' };

  const submit = () => {
    if (!name.trim()) return toast('Введите название', 'error');
    if (kind === 'voice') createVoice({ name: name.trim(), tone: f1, genderPresentation: f2 });
    if (kind === 'style') createStyle({ name: name.trim(), description: f1, promptFragment: f2 });
    if (kind === 'location') createLocation({ name: name.trim(), description: f1, promptFragment: f2 });
    setName(''); setF1(''); setF2('');
    onClose();
    toast('Сохранено', 'success');
  };

  return (
    <Modal open={open} onClose={onClose} title={titles[kind]}>
      <div className="label">Название</div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div className="label" style={{ marginTop: 14 }}>{kind === 'voice' ? 'Тон' : 'Описание'}</div>
      <input className="input" value={f1} onChange={(e) => setF1(e.target.value)} />
      <div className="label" style={{ marginTop: 14 }}>{kind === 'voice' ? 'Пол / подача' : 'Промпт-фрагмент (стиль / сцена)'}</div>
      <input className="input" value={f2} onChange={(e) => setF2(e.target.value)} />
      <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={submit}>Сохранить</button>
      </div>
    </Modal>
  );
}
