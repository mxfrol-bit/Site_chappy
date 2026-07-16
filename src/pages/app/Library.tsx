import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import NewAvatarModal from '../../components/NewAvatarModal';
import NewEntityModal from '../../components/NewEntityModal';

type Tab = 'avatars' | 'voices' | 'styles' | 'locations';

export default function Library() {
  const [tab, setTab] = useState<Tab>('avatars');
  const [q, setQ] = useState('');
  const [openAvatar, setOpenAvatar] = useState(false);
  const [entityModal, setEntityModal] = useState<null | 'voice' | 'style' | 'location'>(null);

  const avatars = useStore((s) => s.avatars);
  const voices = useStore((s) => s.voices);
  const styles = useStore((s) => s.styles);
  const locations = useStore((s) => s.locations);
  const getAsset = useStore((s) => s.getAsset);
  const archiveAvatar = useStore((s) => s.archiveAvatar);
  const nav = useNavigate();
  const match = (t: string) => t.toLowerCase().includes(q.toLowerCase());

  const toCanvas = (avatarId: string) => {
    const pid = useStore.getState().projects.find((p) => p.status !== 'archived')?.id;
    if (pid) nav(`/app/projects/${pid}?addAvatar=${avatarId}`);
  };

  const tabs: [Tab, string][] = [['avatars', 'Аватары'], ['voices', 'Голоса'], ['styles', 'Стили'], ['locations', 'Локации']];

  return (
    <div>
      <PageHeader
        eyebrow="Сохранённые сущности"
        title="Библиотека"
        subtitle="Аватары, голоса, стили и локации — повторно используемые в любом проекте."
        actions={tab === 'avatars'
          ? <button className="btn btn-primary" onClick={() => setOpenAvatar(true)}>✨ Новый аватар</button>
          : <button className="btn btn-primary" onClick={() => setEntityModal(tab === 'voices' ? 'voice' : tab === 'styles' ? 'style' : 'location')}>✨ Создать</button>}
      />

      <div className="between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="wrap-row">
          {tabs.map(([t, l]) => <button key={t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{l}</button>)}
        </div>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {tab === 'avatars' && (() => {
        const list = avatars.filter((a) => a.status !== 'archived' && match(a.name));
        if (!list.length) return <EmptyState icon="🎭" title="Нет аватаров" hint="Создайте первого аватара с референсами, голосом и стилем." action={<button className="btn btn-primary" onClick={() => setOpenAvatar(true)}>Новый аватар</button>} />;
        return (
          <div className="grid autogrid">
            {list.map((a) => {
              const cover = a.coverAssetId ? getAsset(a.coverAssetId)?.cover : undefined;
              return (
                <div key={a.id} className="card card-hover" style={{ overflow: 'hidden' }}>
                  <Link to={`/app/avatars/${a.id}`}><div className="cover" style={{ aspectRatio: '4/3' }}>{cover && <img src={cover} alt="" />}</div></Link>
                  <div className="pad">
                    <div className="between"><Link to={`/app/avatars/${a.id}`} style={{ fontWeight: 600 }}>{a.name}</Link><span className="badge badge-green">{a.status}</span></div>
                    <div className="sub" style={{ fontSize: 12.5, marginTop: 4 }}>{a.referenceAssetIds.length} референсов · {a.usedInProjectIds.length} проектов</div>
                    <div className="wrap-row" style={{ marginTop: 12 }}>
                      <Link to={`/app/avatars/${a.id}`} className="btn btn-soft btn-sm">Открыть</Link>
                      <button className="btn btn-soft btn-sm" onClick={() => toCanvas(a.id)}>На Canvas</button>
                      <button className="btn btn-soft btn-sm" onClick={() => archiveAvatar(a.id)}>Архив</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {tab === 'voices' && (
        <div className="grid autogrid">
          {voices.filter((v) => match(v.name)).map((v) => (
            <div key={v.id} className="card pad">
              <div className="between"><b>{v.name}</b><span className="badge">🔊 voice</span></div>
              <div className="sub" style={{ fontSize: 13, marginTop: 8 }}>{v.language} · {v.genderPresentation || '—'}</div>
              <div className="sub" style={{ fontSize: 12, marginTop: 4 }}>{v.tone}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'styles' && (
        <div className="grid autogrid">
          {styles.filter((s) => match(s.name)).map((s) => (
            <div key={s.id} className="card pad">
              <div className="between"><b>{s.name}</b><span className="badge badge-gold">🎨 style</span></div>
              <div className="sub" style={{ fontSize: 13, marginTop: 8 }}>{s.description}</div>
              {s.palette && <div className="sub mono" style={{ fontSize: 11, marginTop: 4 }}>{s.palette}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'locations' && (
        <div className="grid autogrid">
          {locations.filter((l) => match(l.name)).map((l) => {
            const cov = l.referenceAssetIds[0] ? getAsset(l.referenceAssetIds[0])?.cover : undefined;
            return (
              <div key={l.id} className="card card-hover" style={{ overflow: 'hidden' }}>
                {cov && <div className="cover" style={{ aspectRatio: '16/9' }}><img src={cov} alt="" /></div>}
                <div className="pad">
                  <div className="between"><b>{l.name}</b><span className="badge badge-green">📍 location</span></div>
                  <div className="sub" style={{ fontSize: 13, marginTop: 8 }}>{l.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewAvatarModal open={openAvatar} onClose={() => setOpenAvatar(false)} />
      <NewEntityModal open={!!entityModal} onClose={() => setEntityModal(null)} kind={entityModal || 'voice'} />
    </div>
  );
}
