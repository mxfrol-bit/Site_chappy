import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import LineageView from '../../components/LineageView';
import VariationModal from '../../components/VariationModal';
import { sourceLabel, derivationLabel } from '../../features/history/lineage';
import type { Asset } from '../../types';

const KIND_ICON: Record<string, string> = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄', text: '📝' };
const typeChips: [string, string][] = [['all', 'Все'], ['image', 'Изображения'], ['video', 'Видео'], ['audio', 'Аудио'], ['text', 'Тексты']];
const srcChips: [string, string][] = [['all', 'Любой источник'], ['generation', 'Модель'], ['agent', 'Агент'], ['upload', 'Загрузка'], ['favorite', 'Избранное']];

function SourceBadge({ a }: { a: Asset }) {
  if (a.derivationType) return <span className="badge badge-gold">{derivationLabel[a.derivationType]}</span>;
  const s = a.source ?? 'generation';
  const cls = s === 'agent' ? 'badge-new' : 'badge';
  return <span className={`badge ${cls}`}>{sourceLabel[s]}</span>;
}

export default function Assets() {
  const assets = useStore((s) => s.assets);
  const projects = useStore((s) => s.projects);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const archiveAsset = useStore((s) => s.archiveAsset);
  const getProject = useStore((s) => s.getProject);

  const [view, setView] = useState<'grid' | 'list' | 'lineage'>('grid');
  const [type, setType] = useState('all');
  const [src, setSrc] = useState('all');
  const [proj, setProj] = useState('all');
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [variationAsset, setVariationAsset] = useState<Asset | null>(null);

  const filtered = useMemo(() => assets.filter((a) => {
    if (!showArchived && a.status === 'archived') return false;
    if (type !== 'all' && a.kind !== type) return false;
    if (src === 'favorite') { if (!a.favorite) return false; }
    else if (src !== 'all' && (a.source ?? 'generation') !== src) return false;
    if (proj !== 'all' && a.projectId !== proj) return false;
    if (q && !a.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [assets, type, src, proj, q, showArchived]);

  // lineage families: structural roots computed over the FULL asset set (not the display filter),
  // so archiving/filtering a root never hides its still-live descendants. Project filter still applies.
  const roots = useMemo(() => {
    const parentIds = new Set<string>();
    for (const a of assets) {
      if (a.derivedFromAssetId) parentIds.add(a.derivedFromAssetId);
      for (const p of a.parentAssetIds ?? []) parentIds.add(p);
    }
    const hasParent = (a: Asset) => !!a.derivedFromAssetId || (a.parentAssetIds?.length ?? 0) > 0;
    return assets.filter((a) => parentIds.has(a.id) && !hasParent(a) && (proj === 'all' || a.projectId === proj));
  }, [assets, proj]);

  const projOptions = projects.filter((p) => p.status !== 'archived');

  return (
    <div>
      <PageHeader
        eyebrow="Библиотека"
        title="Ассеты"
        subtitle="Все результаты с происхождением: модель, промпт, входы, сущности, запуск агента, версии."
        actions={
          <div className="wrap-row">
            {(['grid', 'list', 'lineage'] as const).map((v) => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-soft'}`} onClick={() => setView(v)}>{v === 'grid' ? 'Сетка' : v === 'list' ? 'Список' : 'Происхождение'}</button>
            ))}
          </div>
        }
      />

      <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
        <div className="wrap-row">{typeChips.map(([id, l]) => <button key={id} className={`chip ${type === id ? 'active' : ''}`} onClick={() => setType(id)}>{l}</button>)}</div>
        <div className="between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="wrap-row">{srcChips.map(([id, l]) => <button key={id} className={`chip ${src === id ? 'active' : ''}`} onClick={() => setSrc(id)}>{l}</button>)}</div>
          <div className="wrap-row">
            <select className="input" style={{ width: 200 }} value={proj} onChange={(e) => setProj(e.target.value)}>
              <option value="all">Все проекты</option>
              {projOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input" style={{ maxWidth: 220 }} placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className={`btn btn-sm ${showArchived ? 'btn-primary' : 'btn-soft'}`} onClick={() => setShowArchived((v) => !v)}>Архив</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🗂️" title="Ничего не найдено" hint="Измените фильтры или создайте результат на Canvas." />
      ) : view === 'grid' ? (
        <div className="grid autogrid">
          {filtered.map((a) => (
            <div key={a.id} className="card card-hover" style={{ overflow: 'hidden', opacity: a.status === 'archived' ? 0.55 : 1 }}>
              <Link to={`/app/assets/${a.id}`}><div className="cover" style={{ aspectRatio: '1/1' }}>{a.cover ? <img src={a.cover} alt={a.title} loading="lazy" /> : <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: 34 }}>{KIND_ICON[a.kind]}</div>}</div></Link>
              <div style={{ padding: 10 }}>
                <div className="between" style={{ gap: 6 }}><Link to={`/app/assets/${a.id}`} style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</Link><SourceBadge a={a} /></div>
                <div className="sub mono" style={{ fontSize: 10.5, marginTop: 4 }}>{KIND_ICON[a.kind]} {a.projectId ? getProject(a.projectId)?.name ?? '—' : 'без проекта'}</div>
                <div className="wrap-row" style={{ marginTop: 10 }}>
                  <Link to={`/app/assets/${a.id}`} className="btn btn-soft btn-sm">Открыть</Link>
                  <button className="btn btn-soft btn-sm" onClick={() => setVariationAsset(a)}>Вариация</button>
                  <button className="btn btn-soft btn-sm" onClick={() => toggleFavorite(a.id)}>{a.favorite ? '★' : '☆'}</button>
                  <button className="btn btn-soft btn-sm" onClick={() => archiveAsset(a.id)}>Архив</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'list' ? (
        <div style={{ overflowX: 'auto' }}>
          <div className="card" style={{ minWidth: 640 }}>
            {filtered.map((a, i) => (
              <div key={a.id} className="between" style={{ padding: '10px 14px', borderTop: i ? '1px solid var(--line)' : 'none', gap: 12, opacity: a.status === 'archived' ? 0.55 : 1 }}>
                <div className="row" style={{ gap: 12, minWidth: 0 }}>
                  <div className="cover" style={{ width: 42, height: 42, borderRadius: 8, overflow: 'hidden', flex: '0 0 42px' }}>{a.cover && <img src={a.cover} alt="" />}</div>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/app/assets/${a.id}`} style={{ fontSize: 13.5, fontWeight: 600 }}>{a.title}</Link>
                    <div className="sub mono" style={{ fontSize: 10.5, marginTop: 2 }}>{KIND_ICON[a.kind]} · {a.recipe?.model ?? a.modelId ?? '—'} · {a.projectId ? getProject(a.projectId)?.name ?? '—' : 'без проекта'} · {a.createdAt}</div>
                  </div>
                </div>
                <div className="wrap-row"><SourceBadge a={a} /><Link to={`/app/assets/${a.id}`} className="btn btn-soft btn-sm">Открыть</Link></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {roots.length ? roots.map((r) => (
            <div key={r.id} className="card pad-lg">
              <div className="k" style={{ marginBottom: 12 }}>Цепочка · {r.title}</div>
              <LineageView assets={assets} assetId={r.id} />
            </div>
          )) : <EmptyState icon="🔗" title="Пока нет цепочек" hint="Создайте вариацию из любого ассета — здесь появится дерево происхождения." />}
        </div>
      )}

      <VariationModal open={!!variationAsset} onClose={() => setVariationAsset(null)} asset={variationAsset} />
    </div>
  );
}
