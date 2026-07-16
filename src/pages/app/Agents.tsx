import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import PageHeader from '../../components/PageHeader';
import TeamBuilderModal from '../../components/TeamBuilderModal';
import RunTeamModal from '../../components/RunTeamModal';
import { getTool } from '../../data/agents';

const filters: [string, string][] = [['all', 'Все'], ['Content', 'Контент'], ['Research', 'Исследования'], ['Creative', 'Визуал'], ['QA', 'Проверка'], ['available', 'Доступные']];
const roleToCat: Record<string, string> = { Research: 'Research', Script: 'Content', Creative: 'Creative', Prompt: 'Creative', QA: 'QA' };

export default function Agents() {
  const agents = useStore((s) => s.agents);
  const teams = useStore((s) => s.teams);
  const runs = useStore((s) => s.runs);
  const [filter, setFilter] = useState('all');
  const [builder, setBuilder] = useState(false);
  const [runModal, setRunModal] = useState<string | null>(null);

  const runsForAgent = (aid: string) => runs.filter((r) => r.agentId === aid || r.steps.some((st) => st.agentId === aid)).length;
  const list = agents.filter((a) => a.status !== 'archived').filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'available') return a.status === 'available';
    return roleToCat[a.role] === filter;
  });

  return (
    <div>
      <PageHeader eyebrow="Командный центр" title="Агенты" subtitle="Готовые роли и команды. Собери команду и запусти её на проекте."
        actions={<>
          <button className="btn btn-soft" onClick={() => setBuilder(true)}>Создать команду</button>
          <button className="btn btn-primary" onClick={() => setRunModal(teams[0]?.id ?? '')}>Запустить команду</button>
        </>} />

      <div className="k" style={{ marginBottom: 12 }}>Команды</div>
      <div className="grid autogrid" style={{ marginBottom: 28 }}>
        {teams.map((t) => (
          <div key={t.id} className="card pad">
            <div className="between"><b>{t.name}</b><span className="badge badge-top">{t.executionMode}</span></div>
            <div className="sub" style={{ fontSize: 13, marginTop: 6 }}>{t.description}</div>
            <div className="wrap-row" style={{ marginTop: 10 }}>{t.memberIds.map((mid) => { const a = agents.find((x) => x.id === mid); return <span key={mid} title={a?.name} style={{ fontSize: 16 }}>{a?.emoji}</span>; })}</div>
            <div className="wrap-row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setRunModal(t.id)}>Запустить</button>
              <span className="sub mono" style={{ fontSize: 11, alignSelf: 'center' }}>approval: {t.approvalRequired ? 'да' : 'нет'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div className="k">Агенты</div>
        <div className="wrap-row">{filters.map(([fid, l]) => <button key={fid} className={`chip ${filter === fid ? 'active' : ''}`} onClick={() => setFilter(fid)}>{l}</button>)}</div>
      </div>
      <div className="grid autogrid">
        {list.map((a) => (
          <div key={a.id} className="card pad card-hover">
            <div className="between"><div className="row"><span style={{ fontSize: 24 }}>{a.emoji}</span><div><div style={{ fontWeight: 600 }}>{a.name}</div><div className="sub mono" style={{ fontSize: 11 }}>{a.role}</div></div></div><span className="badge badge-green">{a.status}</span></div>
            <div className="sub" style={{ fontSize: 13, margin: '10px 0' }}>{a.description}</div>
            <div className="wrap-row" style={{ marginBottom: 10 }}>{a.toolIds.map((tid) => <span key={tid} className="badge">{getTool(tid)?.name}</span>)}</div>
            <div className="sub mono" style={{ fontSize: 11, marginBottom: 10 }}>{runsForAgent(a.id)} запусков</div>
            <div className="wrap-row"><Link to={`/app/agents/${a.id}`} className="btn btn-soft btn-sm">Открыть</Link><button className="btn btn-soft btn-sm" onClick={() => setBuilder(true)}>В команду</button></div>
          </div>
        ))}
      </div>

      <TeamBuilderModal open={builder} onClose={() => setBuilder(false)} />
      <RunTeamModal open={runModal !== null} onClose={() => setRunModal(null)} teamId={runModal ?? undefined} />
    </div>
  );
}
