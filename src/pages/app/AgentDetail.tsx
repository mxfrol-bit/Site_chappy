import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import EmptyState from '../../components/EmptyState';
import { getTool } from '../../data/agents';
import { getModel } from '../../data/models';

export default function AgentDetail() {
  const { id = '' } = useParams();
  const agents = useStore((s) => s.agents);
  const runs = useStore((s) => s.runs);
  const projects = useStore((s) => s.projects);
  const updateAgent = useStore((s) => s.updateAgent);
  const toast = useStore((s) => s.toast);
  const agent = agents.find((a) => a.id === id);
  const [editing, setEditing] = useState(false);
  const [instr, setInstr] = useState('');

  if (!agent) return <EmptyState icon="🔍" title="Агент не найден" action={<Link to="/app/agents" className="btn btn-primary">К агентам</Link>} />;

  const agentRuns = runs.filter((r) => r.agentId === agent.id || r.steps.some((st) => st.agentId === agent.id));
  const usedProjects = projects.filter((p) => agentRuns.some((r) => r.projectId === p.id));
  const save = () => { updateAgent(agent.id, { systemInstructions: instr }); setEditing(false); toast('Инструкция обновлена', 'success'); };

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="k" style={{ marginBottom: 8 }}><Link to="/app/agents" style={{ color: 'var(--ink-3)' }}>Агенты</Link> / {agent.role}</div>
      <div className="row" style={{ gap: 14, marginBottom: 20 }}><span style={{ fontSize: 34 }}>{agent.emoji}</span><div><h1 className="h2" style={{ margin: 0 }}>{agent.name}</h1><p className="sub" style={{ marginTop: 4 }}>{agent.description}</p></div></div>

      <div className="split">
        <div className="stack" style={{ gap: 12 }}>
          <div className="card pad">
            <div className="between" style={{ marginBottom: 10 }}><div className="k">Инструкция (демо)</div>{!editing && <button className="btn btn-soft btn-sm" onClick={() => { setInstr(agent.systemInstructions); setEditing(true); }}>Редактировать</button>}</div>
            {editing
              ? <><textarea className="textarea" value={instr} onChange={(e) => setInstr(e.target.value)} style={{ minHeight: 110 }} /><div className="wrap-row" style={{ marginTop: 10 }}><button className="btn btn-primary btn-sm" onClick={save}>Сохранить</button><button className="btn btn-soft btn-sm" onClick={() => setEditing(false)}>Отмена</button></div></>
              : <div className="sub" style={{ fontSize: 14 }}>{agent.systemInstructions}</div>}
          </div>
          <div className="card pad"><div className="k" style={{ marginBottom: 10 }}>Возможности</div><div className="wrap-row">{agent.capabilities.map((c) => <span key={c} className="badge">{c}</span>)}</div></div>
          <div className="card pad">
            <div className="k" style={{ marginBottom: 10 }}>Последние действия</div>
            {agentRuns.length ? agentRuns.slice(0, 5).map((r) => (
              <Link key={r.id} to={`/app/runs/${r.id}`} className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 13 }}>{r.task.slice(0, 40)}…</span><span className="sub mono" style={{ fontSize: 11 }}>{r.status}</span></Link>
            )) : <div className="sub" style={{ fontSize: 13 }}>Пока нет запусков.</div>}
          </div>
        </div>
        <div className="stack" style={{ gap: 12 }}>
          <div className="card pad"><div className="k" style={{ marginBottom: 10 }}>Инструменты</div>{agent.toolIds.map((tid) => { const t = getTool(tid); return <div key={tid} className="between" style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 13 }}>{t?.name}</span><span className="badge badge-gold">mock</span></div>; })}</div>
          <div className="card pad"><div className="k" style={{ marginBottom: 8 }}>Модель</div><div style={{ fontSize: 14 }}>{agent.defaultModelId ? getModel(agent.defaultModelId)?.name : '—'}</div></div>
          <div className="card pad"><div className="k" style={{ marginBottom: 8 }}>Память</div><div className="sub" style={{ fontSize: 13 }}>Политика: {agent.memoryPolicy}</div></div>
          <div className="card pad"><div className="k" style={{ marginBottom: 8 }}>Проекты · {usedProjects.length}</div>{usedProjects.length ? usedProjects.map((p) => <Link key={p.id} to={`/app/projects/${p.id}`} style={{ display: 'block', fontSize: 13, padding: '6px 0' }}>{p.name}</Link>) : <div className="sub" style={{ fontSize: 13 }}>—</div>}</div>
        </div>
      </div>
    </div>
  );
}
