import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ProjectMemory({ projectId }: { projectId: string }) {
  const memory = useStore((s) => s.memory);
  const addMemory = useStore((s) => s.addMemory);
  const updateMemory = useStore((s) => s.updateMemory);
  const deleteMemory = useStore((s) => s.deleteMemory);
  const toast = useStore((s) => s.toast);
  const entries = memory.filter((m) => m.scope === 'project' && m.projectId === projectId);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eContent, setEContent] = useState('');

  const add = () => {
    if (!title.trim() || !content.trim()) return toast('Заполните заголовок и текст', 'error');
    addMemory({ projectId, title: title.trim(), content: content.trim() });
    setTitle(''); setContent(''); setAdding(false);
    toast('Запись памяти сохранена', 'success');
  };
  const saveEdit = (id: string) => { updateMemory(id, { title: eTitle, content: eContent }); setEditId(null); toast('Обновлено', 'success'); };

  return (
    <div className="card pad-lg">
      <div className="between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div><div className="k">Память проекта</div><div className="sub" style={{ fontSize: 12 }}>Агенты используют эти факты. Изменения сохраняются с вашего подтверждения.</div></div>
        <button className="btn btn-soft btn-sm" onClick={() => setAdding((v) => !v)}>{adding ? 'Отмена' : 'Добавить'}</button>
      </div>

      {adding && (
        <div className="card pad" style={{ marginBottom: 12, background: 'var(--panel-2)' }}>
          <input className="input" placeholder="Заголовок (например: Целевая аудитория)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="textarea" placeholder="Факт для агентов…" value={content} onChange={(e) => setContent(e.target.value)} style={{ marginTop: 8 }} />
          <div className="row" style={{ marginTop: 8, justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={add}>Сохранить</button></div>
        </div>
      )}

      {entries.length ? entries.map((m) => (
        <div key={m.id} className="card pad" style={{ marginBottom: 8, opacity: m.disabled ? 0.5 : 1 }}>
          {editId === m.id ? (
            <>
              <input className="input" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
              <textarea className="textarea" value={eContent} onChange={(e) => setEContent(e.target.value)} style={{ marginTop: 8 }} />
              <div className="wrap-row" style={{ marginTop: 8 }}><button className="btn btn-primary btn-sm" onClick={() => saveEdit(m.id)}>Сохранить</button><button className="btn btn-soft btn-sm" onClick={() => setEditId(null)}>Отмена</button></div>
            </>
          ) : (
            <>
              <div className="between"><b style={{ fontSize: 13.5 }}>{m.title}</b>{m.sourceRunId && <span className="badge badge-gold">из запуска</span>}</div>
              <div className="sub" style={{ fontSize: 13, marginTop: 4 }}>{m.content}</div>
              <div className="wrap-row" style={{ marginTop: 8 }}>
                <button className="btn btn-soft btn-sm" onClick={() => { setEditId(m.id); setETitle(m.title); setEContent(m.content); }}>Изменить</button>
                <button className="btn btn-soft btn-sm" onClick={() => updateMemory(m.id, { disabled: !m.disabled })}>{m.disabled ? 'Включить' : 'Не использовать'}</button>
                <button className="btn btn-soft btn-sm" onClick={() => { if (window.confirm(`Удалить запись памяти «${m.title}»?`)) { deleteMemory(m.id); toast('Удалено'); } }}>Удалить</button>
              </div>
            </>
          )}
        </div>
      )) : <div className="sub" style={{ fontSize: 13 }}>Память пуста. Добавьте факты о проекте, бренде и аудитории.</div>}
    </div>
  );
}
