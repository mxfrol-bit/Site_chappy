import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import { runGeneration } from '../services/generation';
import { getModel } from '../data/models';
import type { Asset, DerivationType } from '../types';

const DTYPES: { id: DerivationType; label: string; toVideo?: boolean }[] = [
  { id: 'variation', label: 'Вариация' },
  { id: 'edit', label: 'Правка' },
  { id: 'upscale', label: 'Улучшить' },
  { id: 'animate', label: 'Оживить (видео)', toVideo: true },
];

export default function VariationModal({ open, onClose, asset }: { open: boolean; onClose: () => void; asset: Asset | null }) {
  const deriveAsset = useStore((s) => s.deriveAsset);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const updateAttempt = useStore((s) => s.updateAttempt);
  const spend = useStore((s) => s.spend);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [dtype, setDtype] = useState<DerivationType>('variation');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  if (!asset) return null;
  const basePrompt = asset.recipe?.prompt ?? asset.title;

  const run = () => {
    const modelId = asset.modelId ?? asset.recipe?.modelId ?? 'flux-pro';
    const model = getModel(modelId);
    const cost = dtype === 'animate' ? 35 : dtype === 'upscale' ? 4 : 6;
    if (!spend(cost, `${dtype} · ${model?.name ?? 'модель'}`)) return;
    const suffix = dtype === 'upscale' ? ' · upscale 4K' : dtype === 'animate' ? ' · оживление кадра' : '';
    const finalPrompt = (prompt.trim() || basePrompt) + suffix;
    setBusy(true);
    const attempt = recordAttempt({ projectId: asset.projectId ?? '', modelId, prompt: finalPrompt, inputAssetIds: [asset.id], entityIds: asset.entityIds ?? [], cost, status: 'running' });
    runGeneration(
      { modelId, modelName: model?.name ?? 'Модель', modality: dtype === 'animate' ? 'video' : 'image', prompt: finalPrompt, cost },
      {
        onError: (msg) => { updateAttempt(attempt.id, { status: 'failed', error: msg, completedAt: new Date().toISOString() }); setBusy(false); toast(msg, 'error'); },
        onDone: (res) => {
          const kind: Asset['kind'] = dtype === 'animate' ? 'video' : asset.kind;
          const label = DTYPES.find((d) => d.id === dtype)?.label ?? dtype;
          const newAsset = deriveAsset({
            fromAssetId: asset.id, derivationType: dtype, kind,
            title: `${asset.title} · ${label}`, cover: res.url, modelId,
            recipe: {
              ...res.recipe, model: model?.name ?? 'Модель', modelId, prompt: finalPrompt, cost,
              avatarId: asset.recipe?.avatarId, voiceId: asset.recipe?.voiceId, styleId: asset.recipe?.styleId,
              locationId: asset.recipe?.locationId, referenceAssetIds: [asset.id], prevStep: asset.id,
            },
          });
          if (newAsset) updateAttempt(attempt.id, { status: 'success', assetId: newAsset.id, completedAt: new Date().toISOString() });
          setBusy(false);
          setPrompt('');
          onClose();
          toast('Производный результат создан', 'success');
          if (newAsset) nav(`/app/assets/${newAsset.id}`);
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Создать производную (демо)" width={560}>
      <div className="row" style={{ gap: 12, marginBottom: 14 }}>
        <div className="cover" style={{ width: 90, height: 90, borderRadius: 10, overflow: 'hidden', flex: '0 0 90px' }}>{asset.cover && <img src={asset.cover} alt="" />}</div>
        <div><div style={{ fontWeight: 600 }}>{asset.title}</div><div className="sub mono" style={{ fontSize: 11, marginTop: 4 }}>исходный ассет · {asset.id}</div></div>
      </div>
      <div className="label">Действие</div>
      <div className="wrap-row">{DTYPES.map((d) => <button key={d.id} className={`chip ${dtype === d.id ? 'active' : ''}`} onClick={() => setDtype(d.id)}>{d.label}</button>)}</div>
      <div className="label" style={{ marginTop: 14 }}>Промпт (по умолчанию — исходный)</div>
      <textarea className="textarea" placeholder={basePrompt} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary" onClick={run} disabled={busy}>{busy ? 'Генерация…' : 'Запустить'}</button>
      </div>
    </Modal>
  );
}
