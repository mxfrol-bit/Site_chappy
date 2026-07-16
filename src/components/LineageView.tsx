import { Link } from 'react-router-dom';
import type { Asset } from '../types';
import { getAssetLineage, derivationLabel, sourceLabel } from '../features/history/lineage';

const KIND_ICON: Record<string, string> = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄', text: '📝' };

function Card({ a, active }: { a: Asset; active: boolean }) {
  return (
    <Link
      to={`/app/assets/${a.id}`}
      className="card"
      style={{ width: 148, flex: '0 0 148px', overflow: 'hidden', outline: active ? '2px solid var(--accent)' : '1px solid var(--line)', borderRadius: 12 }}
    >
      <div className="cover" style={{ aspectRatio: '1/1' }}>{a.cover ? <img src={a.cover} alt="" /> : <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: 28 }}>{KIND_ICON[a.kind]}</div>}</div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
        <div className="sub mono" style={{ fontSize: 10, marginTop: 3 }}>{a.derivationType ? derivationLabel[a.derivationType] : sourceLabel[a.source ?? 'generation']}</div>
      </div>
    </Link>
  );
}

/** Derivation chain: ancestors → current → first-child path. Every arrow is a real parent→child edge.
 *  Other branches (siblings of the chain) are shown separately, without implying a linear path. */
export default function LineageView({ assets, assetId }: { assets: Asset[]; assetId: string }) {
  const self = assets.find((a) => a.id === assetId);
  if (!self) return null;
  const { chain, branches } = getAssetLineage(assets, assetId);

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'min-content' }}>
          {chain.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ color: 'var(--ink-3)', padding: '0 8px', flex: '0 0 auto' }}>→</span>}
              <Card a={a} active={a.id === assetId} />
            </div>
          ))}
        </div>
      </div>
      {branches.length > 0 && (
        <div>
          <div className="sub mono" style={{ fontSize: 10.5, marginBottom: 6 }}>Другие ветви · {branches.length}</div>
          <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
            <div style={{ display: 'flex', gap: 10, minWidth: 'min-content' }}>
              {branches.map((a) => <Card key={a.id} a={a} active={a.id === assetId} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
