import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import EmptyState from '../../components/EmptyState';
import LineageView from '../../components/LineageView';
import VariationModal from '../../components/VariationModal';
import MockBadge from '../../components/MockBadge';
import { getAssetLineage, sourceLabel, derivationLabel } from '../../features/history/lineage';
import { runGeneration } from '../../services/generation';
import { getModel } from '../../data/models';
import type { ProjectOutputType } from '../../types';

const KIND_ICON: Record<string, string> = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄', text: '📝' };
const STATUS_LABEL: Record<string, string> = { processing: 'обработка', ready: 'готово', failed: 'ошибка', archived: 'в архиве' };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="between" style={{ padding: '7px 0', borderBottom: '1px solid var(--line)', gap: 12 }}><span className="sub mono" style={{ fontSize: 11 }}>{k}</span><span style={{ fontSize: 13, textAlign: 'right', minWidth: 0 }}>{v}</span></div>;
}

export default function AssetDetail() {
  const { id = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const assets = useStore((s) => s.assets);
  const getAvatar = useStore((s) => s.getAvatar);
  const getStyle = useStore((s) => s.getStyle);
  const getLocation = useStore((s) => s.getLocation);
  const getVoice = useStore((s) => s.getVoice);
  const getProject = useStore((s) => s.getProject);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const archiveAsset = useStore((s) => s.archiveAsset);
  const setProjectOutput = useStore((s) => s.setProjectOutput);
  const deriveAsset = useStore((s) => s.deriveAsset);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const updateAttempt = useStore((s) => s.updateAttempt);
  const spend = useStore((s) => s.spend);
  const toast = useStore((s) => s.toast);

  const [variation, setVariation] = useState(false);
  useEffect(() => { if (sp.get('variation')) { setVariation(true); sp.delete('variation'); setSp(sp, { replace: true }); } }, [sp, setSp]);

  const asset = assets.find((a) => a.id === id);
  if (!asset) return <EmptyState icon="🔍" title="Ассет не найден" action={<Link to="/app/assets" className="btn btn-primary">К библиотеке</Link>} />;

  const { descendants, siblings } = getAssetLineage(assets, id);
  const parents = (asset.parentAssetIds ?? (asset.derivedFromAssetId ? [asset.derivedFromAssetId] : [])).map((pid) => assets.find((a) => a.id === pid)).filter(Boolean);
  const recipe = asset.recipe;
  const project = asset.projectId ? getProject(asset.projectId) : undefined;
  const entityName = (eid: string) => getAvatar(eid)?.name ?? getStyle(eid)?.name ?? getLocation(eid)?.name ?? getVoice(eid)?.name ?? eid;

  const repeat = () => {
    const modelId = asset.modelId ?? recipe?.modelId ?? 'flux-pro';
    const model = getModel(modelId);
    const cost = recipe?.cost ?? 6;
    if (!spend(cost, `Повтор · ${model?.name ?? 'модель'}`)) return;
    const prompt = recipe?.prompt ?? asset.title;
    const attempt = recordAttempt({ projectId: asset.projectId ?? '', modelId, prompt, inputAssetIds: [asset.id], entityIds: asset.entityIds ?? [], cost, status: 'running' });
    toast('Повтор запущен…');
    runGeneration(
      { modelId, modelName: model?.name ?? 'Модель', modality: asset.kind === 'video' ? 'video' : 'image', prompt, cost },
      {
        onError: (m) => { updateAttempt(attempt.id, { status: 'failed', error: m, completedAt: new Date().toISOString() }); toast(m, 'error'); },
        onDone: (res) => {
          const na = deriveAsset({ fromAssetId: asset.id, derivationType: 'variation', title: `${asset.title} · повтор`, cover: res.url, modelId, recipe: { ...(recipe ?? res.recipe), cost, date: new Date().toISOString(), prevStep: asset.id } });
          if (na) updateAttempt(attempt.id, { status: 'success', assetId: na.id, completedAt: new Date().toISOString() });
          toast('Повтор готов', 'success');
          if (na) nav(`/app/assets/${na.id}`);
        },
      },
    );
  };

  const makeOutput = () => {
    if (!asset.projectId) return toast('У ассета нет проекта', 'error');
    const type: ProjectOutputType = asset.kind === 'video' ? 'video' : asset.kind === 'audio' ? 'audio' : asset.kind === 'text' ? 'script' : 'image';
    setProjectOutput({ projectId: asset.projectId, assetId: asset.id, title: asset.title, type, approvedFromAgentRunId: asset.agentRunId, status: 'approved' });
    toast('Назначен Project Output', 'success');
  };

  return (
    <div style={{ maxWidth: 1040 }}>
      <div className="k" style={{ marginBottom: 8 }}><Link to="/app/assets" style={{ color: 'var(--ink-3)' }}>Ассеты</Link> / {KIND_ICON[asset.kind]} {asset.kind}</div>
      <div className="between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div><h1 className="h2" style={{ margin: 0 }}>{asset.title}</h1><p className="sub" style={{ marginTop: 6 }}>{sourceLabel[asset.source ?? 'generation']}{asset.derivationType ? ` · ${derivationLabel[asset.derivationType]}` : ''} · {STATUS_LABEL[asset.status ?? 'ready']} · {asset.createdAt}</p></div>
        <div className="wrap-row">
          <button className="btn btn-soft btn-sm" onClick={() => toggleFavorite(asset.id)}>{asset.favorite ? '★ В избранном' : '☆ В избранное'}</button>
          <button className="btn btn-soft btn-sm" onClick={() => archiveAsset(asset.id)}>Архивировать</button>
        </div>
      </div>

      <div className="split">
        <div className="stack" style={{ gap: 16 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="cover" style={{ aspectRatio: asset.kind === 'video' ? '16/9' : '1/1', maxHeight: 460 }}>{asset.cover ? <img src={asset.cover} alt={asset.title} style={{ objectFit: 'contain', background: 'var(--panel-2)' }} /> : <div style={{ display: 'grid', placeItems: 'center', height: 260, fontSize: 60 }}>{KIND_ICON[asset.kind]}</div>}</div>
          </div>

          <div className="card pad-lg">
            <div className="between" style={{ marginBottom: 12 }}><div className="k">Происхождение</div><MockBadge text="lineage" /></div>
            <LineageView assets={assets} assetId={asset.id} />
          </div>

          {recipe && (
            <div className="card pad-lg">
              <div className="k" style={{ marginBottom: 10 }}>Generation Recipe</div>
              <Row k="Промпт" v={<span style={{ display: 'inline-block', maxWidth: 380 }}>{recipe.prompt}</span>} />
              <Row k="Модель" v={`${recipe.model}${recipe.modelId ? ` · ${recipe.modelId}` : ''}`} />
              {recipe.avatarId && <Row k="Аватар" v={getAvatar(recipe.avatarId)?.name ?? recipe.avatarId} />}
              {recipe.voiceId && <Row k="Голос" v={getVoice(recipe.voiceId)?.name ?? recipe.voiceId} />}
              {recipe.styleId && <Row k="Стиль" v={getStyle(recipe.styleId)?.name ?? recipe.styleId} />}
              {recipe.locationId && <Row k="Локация" v={getLocation(recipe.locationId)?.name ?? recipe.locationId} />}
              {recipe.referenceAssetIds?.length ? <Row k="Входы" v={recipe.referenceAssetIds.join(', ')} /> : null}
              {asset.agentRunId && <Row k="Agent Run" v={<Link to={`/app/runs/${asset.agentRunId}`}>{asset.agentRunId}</Link>} />}
              <Row k="Стоимость" v={`~${recipe.cost} кр`} />
              {recipe.params && Object.entries(recipe.params).map(([k, v]) => <Row key={k} k={k} v={String(v).slice(0, 80)} />)}
            </div>
          )}
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Действия</div>
            <div className="wrap-row">
              <button className="btn btn-primary btn-sm" onClick={repeat}>Повторить</button>
              <button className="btn btn-soft btn-sm" onClick={() => setVariation(true)}>Создать вариацию</button>
              {asset.projectId && <button className="btn btn-soft btn-sm" onClick={() => nav(`/app/projects/${asset.projectId}?addAssetNode=${asset.id}`)}>На Canvas</button>}
              {asset.agentRunId && <Link className="btn btn-soft btn-sm" to={`/app/runs/${asset.agentRunId}`}>Открыть запуск</Link>}
              <button className="btn btn-soft btn-sm" onClick={makeOutput}>Назначить Output</button>
            </div>
          </div>

          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Основное</div>
            <Row k="Тип" v={`${KIND_ICON[asset.kind]} ${asset.kind}`} />
            <Row k="Статус" v={STATUS_LABEL[asset.status ?? 'ready']} />
            <Row k="Проект" v={project ? <Link to={`/app/projects/${project.id}`}>{project.name}</Link> : '—'} />
            {asset.canvasNodeId && <Row k="Canvas node" v={<span className="mono" style={{ fontSize: 11 }}>{asset.canvasNodeId}</span>} />}
            <Row k="Создан" v={asset.createdAt} />
            {asset.tags?.length ? <Row k="Теги" v={asset.tags.join(', ')} /> : null}
          </div>

          {asset.entityIds?.length ? (
            <div className="card pad"><div className="k" style={{ marginBottom: 10 }}>Сущности</div><div className="wrap-row">{asset.entityIds.map((eid) => <span key={eid} className="badge">{entityName(eid)}</span>)}</div></div>
          ) : null}

          {(parents.length > 0 || descendants.length > 0 || siblings.length > 0) && (
            <div className="card pad">
              <div className="k" style={{ marginBottom: 10 }}>Связанные версии</div>
              {parents.length > 0 && <div style={{ marginBottom: 8 }}><div className="sub mono" style={{ fontSize: 10.5, marginBottom: 4 }}>Родители</div>{parents.map((p) => p && <Link key={p.id} to={`/app/assets/${p.id}`} style={{ display: 'block', fontSize: 13, padding: '3px 0' }}>↑ {p.title}</Link>)}</div>}
              {descendants.length > 0 && <div style={{ marginBottom: 8 }}><div className="sub mono" style={{ fontSize: 10.5, marginBottom: 4 }}>Производные</div>{descendants.map((d) => <Link key={d.id} to={`/app/assets/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '3px 0' }}>↓ {d.title}</Link>)}</div>}
              {siblings.length > 0 && <div><div className="sub mono" style={{ fontSize: 10.5, marginBottom: 4 }}>Другие версии</div>{siblings.map((sb) => <Link key={sb.id} to={`/app/assets/${sb.id}`} style={{ display: 'block', fontSize: 13, padding: '3px 0' }}>≈ {sb.title}</Link>)}</div>}
            </div>
          )}
        </div>
      </div>

      <VariationModal open={variation} onClose={() => setVariation(false)} asset={asset} />
    </div>
  );
}
