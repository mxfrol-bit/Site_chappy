import { useState } from 'react';
import Modal from './Modal';
import { useStore } from '../store/useStore';

export default function TeamBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const agents = useStore((s) => s.agents);
  const createTeam = useStore((s) => s.createTeam);
  const toast = useStore((s) => s.toast);
  const [name, setName] = useState('');
  const [order, setOrder] = useState<string[]>([]);
  const [coordinatorId, setCoordinatorId] = useState('');
  const [approval, setApproval] = useState(true);

  const toggle = (id: string) => setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const move = (i: number, dir: number) => setOrder((o) => {
    const n = [...o]; const j = i + dir; if (j < 0 || j >= n.length) return n;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  const save = () => {
    if (!name.trim()) return toast('Введите название команды', 'error');
    if (order.length < 2) return toast('Выберите минимум 2 агентов', 'error');
    createTeam({ name: name.trim(), memberIds: order, coordinatorId: coordinatorId || order[0], approvalRequired: approval });
    setName(''); setOrder([]); setCoordinatorId(''); setApproval(true);
    onClose();
    toast('Команда сохранена', 'success');
  };

  return (
    <Modal open={open} onClose={onClose} title="Конструктор команды" width={620}>
      <div className="label">Название</div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Моя контент-команда" autoFocus />

      <div className="label" style={{ marginTop: 16 }}>Агенты (нажмите, чтобы добавить)</div>
      <div className="wrap-row">
        {agents.filter((a) => a.status !== 'archived').map((a) => (
          <button key={a.id} className={`chip ${order.includes(a.id) ? 'active' : ''}`} onClick={() => toggle(a.id)}>{a.emoji} {a.name}</button>
        ))}
      </div>

      {order.length > 0 && (
        <>
          <div className="label" style={{ marginTop: 16 }}>Последовательность</div>
          <div className="grid" style={{ gap: 8 }}>
            {order.map((id, i) => {
              const a = agents.find((x) => x.id === id);
              return (
                <div key={id} className="card between" style={{ padding: '10px 12px' }}>
                  <div className="row"><span className="k" style={{ width: 22 }}>{i + 1}</span><span>{a?.emoji} {a?.name}</span></div>
                  <div className="wrap-row">
                    <button className="btn btn-soft btn-sm" aria-label={`Переместить ${a?.name ?? 'агента'} вверх`} onClick={() => move(i, -1)}>↑</button>
                    <button className="btn btn-soft btn-sm" aria-label={`Переместить ${a?.name ?? 'агента'} вниз`} onClick={() => move(i, 1)}>↓</button>
                    <button className="btn btn-soft btn-sm" aria-label={`Убрать ${a?.name ?? 'агента'}`} onClick={() => toggle(id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid g2" style={{ marginTop: 14 }}>
            <div><div className="label">Координатор</div><select className="input" value={coordinatorId} onChange={(e) => setCoordinatorId(e.target.value)}><option value="">— первый —</option>{order.map((id) => { const a = agents.find((x) => x.id === id); return <option key={id} value={id}>{a?.name}</option>; })}</select></div>
            <div><div className="label">Human approval</div><button className={`btn btn-sm ${approval ? 'btn-primary' : 'btn-soft'}`} onClick={() => setApproval((v) => !v)} style={{ marginTop: 2 }}>{approval ? 'включено' : 'выключено'}</button></div>
          </div>
        </>
      )}

      <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={save}>Сохранить команду</button>
      </div>
    </Modal>
  );
}
