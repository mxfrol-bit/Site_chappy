import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData, GenStatus } from '../../types';
import { useCanvasActions } from './canvasContext';
import { blockDef } from './palette';
import { models } from '../../data/models';
import { useStore } from '../../store/useStore';
import { derivationLabel, sourceLabel } from '../history/lineage';

const RUN_LABEL: Record<string, string> = { draft: 'черновик', queued: 'в очереди', running: 'выполняется', waiting_approval: 'ждёт одобрения', completed: 'завершено', failed: 'ошибка', cancelled: 'отменено' };

function StatusPill({ status }: { status?: GenStatus }) {
  if (!status || status === 'idle') return null;
  const labels: Record<GenStatus, string> = { idle: '', queued: 'queued', generating: 'generating', success: 'success', error: 'error' };
  return <span className={`cn-st ${status}`}>{labels[status]}</span>;
}

export default function BlockNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CanvasNodeData;
  const a = useCanvasActions();
  const def = blockDef(d.type);
  const running = d.status === 'queued' || d.status === 'generating';

  const avatars = useStore((s) => s.avatars);
  const styles = useStore((s) => s.styles);
  const locations = useStore((s) => s.locations);
  const teams = useStore((s) => s.teams);
  const runs = useStore((s) => s.runs);
  const getAsset = useStore((s) => s.getAsset);
  const agentRun = d.type === 'agent' && d.runId ? runs.find((r) => r.id === (d.runId as string)) : undefined;

  const av = d.type === 'avatar' ? (avatars.find((x) => x.id === d.entityId) ?? avatars[0]) : undefined;
  const avCover = av?.coverAssetId ? getAsset(av.coverAssetId)?.cover : undefined;
  const nodeAsset = (d.type === 'image' || d.type === 'video') && d.assetId ? getAsset(d.assetId as string) : undefined;
  const nodeAssetBadge = nodeAsset ? (nodeAsset.derivationType ? derivationLabel[nodeAsset.derivationType] : sourceLabel[nodeAsset.source ?? 'generation']) : undefined;

  return (
    <div className={`cn-node cn-${d.type} ${selected ? 'cn-sel' : ''}`}>
      {d.type !== 'idea' && <Handle type="target" position={Position.Left} />}

      <div className="cn-head">
        <span className="cn-ic">{def?.ic}</span>
        <span className="cn-title">{def?.label}</span>
        <StatusPill status={d.status} />
        <span className="cn-acts nodrag">
          <button title="Дублировать" onClick={() => a.duplicateNode(id)}>⧉</button>
          <button title="Удалить" onClick={() => a.deleteNode(id)}>✕</button>
        </span>
      </div>

      <div className="cn-body nodrag">
        {d.type === 'idea' && (
          <textarea className="textarea" placeholder="Опишите идею, тему или заготовку промпта…" value={d.text ?? ''} onChange={(e) => a.updateNodeData(id, { text: e.target.value })} />
        )}

        {d.type === 'model' && (
          <>
            <label className="label">Модель</label>
            <select className="input" value={d.modelId} onChange={(e) => a.updateNodeData(id, { modelId: e.target.value })}>
              {models.filter((m) => m.status !== 'soon').map((m) => (<option key={m.id} value={m.id}>{m.name} · {m.modality}</option>))}
            </select>
            <label className="label" style={{ marginTop: 8 }}>Промпт</label>
            <textarea className="textarea" placeholder="Что сгенерировать…" value={d.prompt ?? ''} onChange={(e) => a.updateNodeData(id, { prompt: e.target.value })} />
            {d.status === 'generating' && <div className="cn-genrow"><span className="cn-dot" /> Генерация…</div>}
            {d.status === 'queued' && <div className="cn-genrow" style={{ color: 'var(--ink-2)' }}>В очереди…</div>}
            {d.status === 'error' && <div className="cn-err">⚠️ {d.error ?? 'Ошибка генерации'}</div>}
            {running ? (
              <button className="cn-run cancel" onClick={() => a.cancelNode(id)}>Отменить</button>
            ) : (
              <button className="cn-run" onClick={() => a.runNode(id)}>{d.status === 'success' ? 'Запустить снова' : d.status === 'error' ? 'Повторить' : 'Запустить'}</button>
            )}
          </>
        )}

        {(d.type === 'image' || d.type === 'video') && (
          d.result ? (
            <>
              {nodeAssetBadge && <div style={{ display: 'inline-block', fontSize: 9, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', marginBottom: 6 }}>{nodeAssetBadge}</div>}
              <div className="cn-imgbox"><img src={d.result} alt="Результат" /></div>
              <div className="cn-resbar">
                <button onClick={() => a.openResult(d.result!)}>Открыть</button>
                {d.assetId && <button onClick={() => a.openAssetDetail(d.assetId as string)}>Asset</button>}
                <button onClick={() => a.useAsInput(id)}>Дальше →</button>
              </div>
              {d.assetId && (
                <div className="cn-resbar">
                  <button onClick={() => a.createAssetVariation(d.assetId as string)}>Вариация</button>
                  <button onClick={() => a.openAssetDetail(d.assetId as string)}>Lineage</button>
                  <button onClick={() => a.markProjectOutput(d.assetId as string)}>★ Output</button>
                </div>
              )}
            </>
          ) : (
            <div className="cn-imgph">{d.type === 'video' ? 'Видео-результат' : 'Результат'} появится здесь<br />после генерации</div>
          )
        )}

        {d.type === 'avatar' && (
          <>
            <label className="label">Аватар</label>
            <select className="input" value={d.entityId} onChange={(e) => a.updateNodeData(id, { entityId: e.target.value, snapshot: { name: avatars.find((x) => x.id === e.target.value)?.name } })}>
              {avatars.filter((x) => x.status !== 'archived').map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
            </select>
            {av && (
              <div className="cn-avrow">
                {avCover && <img src={avCover} alt="" />}
                <div className="cn-avmeta">{av.referenceAssetIds.length} референсов{av.voiceId ? ' · голос' : ''}{av.defaultStyleId ? ' · стиль' : ''}</div>
              </div>
            )}
          </>
        )}

        {d.type === 'style' && (
          <>
            <label className="label">Стиль</label>
            <select className="input" value={d.entityId} onChange={(e) => a.updateNodeData(id, { entityId: e.target.value })}>
              {styles.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
            </select>
          </>
        )}

        {d.type === 'location' && (
          <>
            <label className="label">Локация</label>
            <select className="input" value={d.entityId} onChange={(e) => a.updateNodeData(id, { entityId: e.target.value })}>
              {locations.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
            </select>
          </>
        )}

        {d.type === 'agent' && (
          <>
            <label className="label">Команда</label>
            <select className="input" value={(d.teamId as string) ?? ''} onChange={(e) => a.updateNodeData(id, { teamId: e.target.value })}>
              {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
            <label className="label" style={{ marginTop: 8 }}>Задача</label>
            <textarea className="textarea" placeholder="Что должна сделать команда…" value={(d.task as string) ?? ''} onChange={(e) => a.updateNodeData(id, { task: e.target.value })} />
            {agentRun ? (
              <>
                <div className="cn-genrow" style={{ marginTop: 6, color: agentRun.status === 'completed' ? 'var(--green)' : agentRun.status === 'waiting_approval' ? 'var(--accent)' : 'var(--ink-2)' }}>
                  {agentRun.status === 'running' && <span className="cn-dot" />} {RUN_LABEL[agentRun.status]} · {agentRun.steps.filter((s) => s.status === 'completed').length}/{agentRun.steps.length}
                </div>
                <div className="cn-resbar" style={{ marginTop: 6 }}>
                  <button onClick={() => a.openRun(agentRun.id)}>{agentRun.status === 'waiting_approval' ? 'Подтвердить' : 'Открыть запуск'}</button>
                  <button onClick={() => a.runAgent(id)}>Заново</button>
                </div>
              </>
            ) : (
              <button className="cn-run" onClick={() => a.runAgent(id)}>Запустить команду</button>
            )}
          </>
        )}

        {d.type === 'export' && (
          <>
            <div className="cn-hint" style={{ marginBottom: 8 }}>Соберёт итог из связанных блоков.</div>
            <button className="cn-run" onClick={() => a.notify('Экспорт — демо: итоговый ролик собирается из связанных блоков.')}>Собрать (демо)</button>
          </>
        )}

        {(d.type === 'avatar' || d.type === 'style' || d.type === 'location') && (
          <button className="cn-link" onClick={() => a.connectToModel(id)}>→ подключить к модели</button>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
