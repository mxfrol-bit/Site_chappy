import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import { DEMO_POOL } from '../services/mockGen';

export default function NewAvatarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [refs, setRefs] = useState<string[]>([]);
  const [voiceId, setVoiceId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [locationId, setLocationId] = useState('');

  const voices = useStore((s) => s.voices);
  const styles = useStore((s) => s.styles);
  const locations = useStore((s) => s.locations);
  const addReferenceAsset = useStore((s) => s.addReferenceAsset);
  const createAvatar = useStore((s) => s.createAvatar);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  const toggleRef = (url: string) =>
    setRefs((r) => (r.includes(url) ? r.filter((x) => x !== url) : r.length < 6 ? [...r, url] : r));

  const submit = () => {
    if (!name.trim()) return toast('Введите имя аватара', 'error');
    if (refs.length === 0) return toast('Добавьте хотя бы один референс', 'error');
    const refAssets = refs.map((url, i) => addReferenceAsset({ cover: url, title: `Референс · ${name} ${i + 1}` }));
    const av = createAvatar({
      name: name.trim(), description: desc.trim(),
      referenceAssetIds: refAssets.map((a) => a.id), coverAssetId: refAssets[0].id,
      voiceId: voiceId || undefined, defaultStyleId: styleId || undefined, defaultLocationId: locationId || undefined,
      status: 'ready',
    });
    setName(''); setDesc(''); setRefs([]); setVoiceId(''); setStyleId(''); setLocationId('');
    onClose();
    toast('Аватар сохранён', 'success');
    nav(`/app/avatars/${av.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Новый аватар" width={660}>
      <div className="label">1 · Имя</div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Макс" autoFocus />

      <div className="label" style={{ marginTop: 16 }}>2 · Референсы (выберите из библиотеки, до 6)</div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(68px,1fr))', gap: 8 }}>
        {DEMO_POOL.map((url, i) => (
          <button key={url} onClick={() => toggleRef(url)} aria-label={`Референс ${i + 1}`} aria-pressed={refs.includes(url)} className="cover" style={{ aspectRatio: '1/1', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: refs.includes(url) ? '2px solid var(--accent)' : '1px solid var(--line)' }}>
            <img src={url} alt="" />
          </button>
        ))}
      </div>
      <div className="sub" style={{ fontSize: 11, marginTop: 6 }}>Выбрано: {refs.length} · загрузка своих файлов — демо (используйте библиотеку)</div>

      <div className="label" style={{ marginTop: 16 }}>3 · Описание внешности</div>
      <textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Характер, внешность, детали…" />

      <div className="grid g3" style={{ marginTop: 16 }}>
        <div><div className="label">4 · Голос</div><select className="input" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}><option value="">— нет —</option>{voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
        <div><div className="label">5 · Стиль</div><select className="input" value={styleId} onChange={(e) => setStyleId(e.target.value)}><option value="">— нет —</option>{styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><div className="label">6 · Локация</div><select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">— нет —</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
      </div>

      {refs.length > 0 && (
        <div className="card pad" style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src={refs[0]} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
          <div><div style={{ fontWeight: 600 }}>{name || 'Без имени'}</div><div className="sub" style={{ fontSize: 12 }}>7 · Preview — {refs.length} референсов{voiceId ? ' · голос' : ''}{styleId ? ' · стиль' : ''}{locationId ? ' · локация' : ''}</div></div>
        </div>
      )}

      <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={submit}>Сохранить аватара</button>
      </div>
    </Modal>
  );
}
