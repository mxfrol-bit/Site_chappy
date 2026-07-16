import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { startRun, cancelRun, retryStep, approveRun, requestRevision } from '../../features/agents/orchestration';
import { summarizeRunContext } from '../../features/agents/agentContext';
import EmptyState from '../../components/EmptyState';
import MockBadge from '../../components/MockBadge';
import { RUN_LABEL, runStatusColor } from '../../features/agents/runStatus';
import type { GenerationRecipe, StepStatus } from '../../types';

const stepColor: Record<StepStatus, string> = { pending: 'var(--ink-3)', running: 'var(--gold)', waiting_approval: 'var(--accent)', completed: 'var(--green)', failed: 'var(--hot)', skipped: 'var(--ink-3)' };
const stepLabel: Record<StepStatus, string> = { pending: 'ожидает', running: 'работает', waiting_approval: 'ждёт', completed: 'готово', failed: 'ошибка', skipped: 'пропущен' };

function RowKV({ k, v }: { k: string; v: string }) {
  return <div className="between" style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}><span className="sub mono" style={{ fontSize: 11 }}>{k}</span><span style={{ fontSize: 13, textAlign: 'right' }}>{v}</span></div>;
}

export default function AgentRunDetail() {
  const { id = '' } = useParams();
  const runs = useStore((s) => s.runs);
  const getAgent = useStore((s) => s.getAgent);
  const getAvatar = useStore((s) => s.getAvatar);
  const getStyle = useStore((s) => s.getStyle);
  const getLocation = useStore((s) => s.getLocation);
  const getAsset = useStore((s) => s.getAsset);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const run = runs.find((r) => r.id === id);

  if (!run) return <EmptyState icon="🔍" title="Запуск не найден" action={<Link to="/app/agents" className="btn btn-primary">К агентам</Link>} />;

  const summary = summarizeRunContext(run.inputContext);
  const promptStep = run.steps.find((s) => s.agentId === 'prompt');
  const recipe = promptStep?.outputData?.recipe as GenerationRecipe | undefined;
  const qaStep = run.steps.find((s) => s.agentId === 'qa');
  const writerStep = run.steps.find((s) => s.agentId === 'writer');
  const output = run.finalOutputId ? getAsset(run.finalOutputId) : undefined;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="k" style={{ marginBottom: 8 }}><Link to="/app/agents" style={{ color: 'var(--ink-3)' }}>Агенты</Link> / Запуск</div>
      <div className="between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div><h1 className="h2" style={{ margin: 0 }}>Запуск команды</h1><p className="sub" style={{ marginTop: 6, maxWidth: 640 }}>{run.task}</p></div>
        <div className="wrap-row">
          <span className="badge" style={{ color: runStatusColor(run.status) }}>{RUN_LABEL[run.status]}</span>
          {(run.status === 'running' || run.status === 'queued') && <button className="btn btn-soft btn-sm" onClick={() => cancelRun(run.id)}>Остановить</button>}
          {run.status === 'failed' && <button className="btn btn-primary btn-sm" onClick={() => startRun(run.id)}>Перезапустить</button>}
        </div>
      </div>

      <div className="split">
        <div>
          <div className="card pad-lg">
            <div className="k" style={{ marginBottom: 14 }}>Timeline · {run.steps.length} этапов · ~{run.actualMockCost} кр</div>
            {run.steps.map((st, i) => {
              const ag = getAgent(st.agentId);
              return (
                <div key={st.id} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `2px solid ${stepColor[st.status]}`, fontSize: 14 }}>{ag?.emoji}</div>
                    {i < run.steps.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: 4, minHeight: 20 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: 16 }}>
                    <div className="between"><b style={{ fontSize: 14 }}>{ag?.name}</b><span className="badge" style={{ color: stepColor[st.status], borderColor: 'var(--line)' }}>{st.status === 'running' && '● '}{stepLabel[st.status]}</span></div>
                    <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>{st.title}</div>
                    {st.outputSummary && <div style={{ fontSize: 13, marginTop: 6 }}>{st.outputSummary}</div>}
                    {st.error && <div style={{ color: 'var(--hot)', fontSize: 12.5, marginTop: 6 }}>⚠️ {st.error}</div>}
                    {st.handoffToAgentId && st.status === 'completed' && <div className="sub mono" style={{ fontSize: 10.5, marginTop: 6 }}>→ передано: {getAgent(st.handoffToAgentId)?.name}</div>}
                    {(st.status === 'completed' || st.status === 'failed') && <button className="btn btn-soft btn-sm" style={{ marginTop: 8 }} onClick={() => retryStep(run.id, i)}>Повторить этап</button>}
                  </div>
                </div>
              );
            })}
          </div>

          {run.status === 'waiting_approval' && (
            <div className="card pad-lg" style={{ marginTop: 16, borderColor: 'var(--accent)' }}>
              <div className="between" style={{ marginBottom: 12 }}><h3 className="h3">Требуется подтверждение</h3><MockBadge text="approval" /></div>
              <div className="sub" style={{ fontSize: 13, marginBottom: 6 }}><b>Сценарий:</b> {(writerStep?.outputData?.script as string) ?? '—'}</div>
              <div className="sub" style={{ fontSize: 13, marginBottom: 6 }}><b>Аватар:</b> {recipe?.avatarId ? getAvatar(recipe.avatarId)?.name : '—'} · <b>Стиль:</b> {recipe?.styleId ? getStyle(recipe.styleId)?.name : '—'} · <b>Локация:</b> {recipe?.locationId ? getLocation(recipe.locationId)?.name : '—'}</div>
              <div className="sub" style={{ fontSize: 13, marginBottom: 6 }}><b>Модель:</b> {recipe?.model ?? '—'} · <b>Стоимость:</b> ~{recipe?.cost ?? 0} кр</div>
              <div className="sub" style={{ fontSize: 13, marginBottom: 12 }}><b>Замечания QA:</b> {((qaStep?.outputData?.notes as string[]) ?? []).join('; ') || '—'}</div>
              <div className="wrap-row">
                <button className="btn btn-primary" onClick={() => { approveRun(run.id); toast('Одобрено — создан результат', 'success'); }}>Одобрить</button>
                <button className="btn btn-soft" onClick={() => { requestRevision(run.id); toast('Отправлено на доработку'); }}>На доработку</button>
                <button className="btn btn-soft" onClick={() => toast('Редактирование — демо: измените задачу и перезапустите')}>Изменить</button>
                <button className="btn btn-soft" onClick={() => cancelRun(run.id)}>Остановить</button>
              </div>
            </div>
          )}

          {run.status === 'completed' && output && (
            <div className="card pad-lg" style={{ marginTop: 16, borderColor: 'var(--green)' }}>
              <div className="between" style={{ marginBottom: 12 }}><h3 className="h3">Финальный результат</h3><span className="badge badge-green">готово</span></div>
              <div className="row" style={{ gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="cover" style={{ width: 180, aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>{output.cover && <img src={output.cover} alt="" />}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{output.title}</div>
                  <div className="sub mono" style={{ fontSize: 11, marginTop: 6 }}>agentRunId: {run.id}</div>
                  <div className="wrap-row" style={{ marginTop: 12 }}>
                    <Link to={`/app/projects/${run.projectId}?tab=assets`} className="btn btn-soft btn-sm">Открыть в проекте</Link>
                    <button className="btn btn-primary btn-sm" onClick={() => nav(run.canvasNodeId ? `/app/projects/${run.projectId}` : `/app/projects/${run.projectId}?addOutput=${run.id}`)}>Добавить на Canvas</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Контекст запуска</div>
            <RowKV k="Проект" v={summary.projectName} />
            <RowKV k="Аватар" v={summary.avatarName || 'по проекту'} />
            <RowKV k="Стиль" v={summary.styleName || 'по проекту'} />
            <RowKV k="Локация" v={summary.locationName || 'по проекту'} />
            <RowKV k="Оценка" v={`~${run.estimatedCost} кр`} />
          </div>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Память проекта · {summary.memory.length}</div>
            {summary.memory.length ? summary.memory.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.title}</div><div className="sub" style={{ fontSize: 12 }}>{m.content}</div></div>
            )) : <div className="sub" style={{ fontSize: 13 }}>Память пуста.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
