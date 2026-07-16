import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { demoUser } from '../../data/account';
import Modal from '../../components/Modal';
import MockBadge from '../../components/MockBadge';

const DEMO_EMAIL = 'demo@chappy.ai';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card pad">
      <div className="k" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      {hint && <div className="sub" style={{ fontSize: 12.5, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function Profile() {
  const credits = useStore((s) => s.credits);
  const projects = useStore((s) => s.projects);
  const assets = useStore((s) => s.assets);
  const runs = useStore((s) => s.runs);
  const resetDemo = useStore((s) => s.resetDemo);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notify, setNotify] = useState(true);

  const activeProjects = projects.filter((p) => p.status !== 'archived').length;
  const activeAssets = assets.filter((a) => a.status !== 'archived').length;
  const storagePct = Math.round((demoUser.storageUsedMb / demoUser.storageTotalMb) * 100);

  const doReset = () => {
    resetDemo();
    setConfirmReset(false);
    toast('Демонстрационные данные восстановлены', 'success');
    nav('/app');
  };

  return (
    <div style={{ maxWidth: 920 }}>
      <div className="k" style={{ marginBottom: 8 }}>Аккаунт</div>
      <div className="row" style={{ gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <img src={demoUser.avatar} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--r-lg)', objectFit: 'cover' }} />
        <div>
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <h1 className="h2" style={{ margin: 0 }}>{demoUser.name}</h1>
            <span className="badge badge-top">{demoUser.plan}</span>
          </div>
          <div className="sub" style={{ fontSize: 13.5, marginTop: 4 }}>{DEMO_EMAIL} · {demoUser.handle} · с {demoUser.since}</div>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <Stat label="Тариф" value={demoUser.plan} hint="демо-подписка" />
        <Stat label="Кредиты" value={`${credits}`} hint="текущий баланс" />
        <Stat label="Проекты" value={`${activeProjects}`} hint={`${activeAssets} ассетов`} />
        <Stat label="Запуски агентов" value={`${runs.length}`} hint="в этом воркспейсе" />
      </div>

      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card pad-lg">
          <div className="k" style={{ marginBottom: 12 }}>Хранилище</div>
          <div className="between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>{(demoUser.storageUsedMb / 1024).toFixed(1)} ГБ из {(demoUser.storageTotalMb / 1024).toFixed(0)} ГБ</span>
            <span className="sub mono" style={{ fontSize: 12 }}>{storagePct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--panel-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${storagePct}%`, background: 'var(--grad)' }} />
          </div>
        </div>
        <div className="card pad-lg">
          <div className="k" style={{ marginBottom: 12 }}>Настройки</div>
          <div className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14 }}>Язык интерфейса</span><span className="sub" style={{ fontSize: 13 }}>Русский</span>
          </div>
          <div className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14 }}>Уведомления</span>
            <button className={`btn btn-sm ${notify ? 'btn-primary' : 'btn-soft'}`} onClick={() => { setNotify((v) => !v); toast('Настройка сохранена (демо)'); }}>{notify ? 'вкл' : 'выкл'}</button>
          </div>
          <div className="between" style={{ padding: '8px 0' }}>
            <span style={{ fontSize: 14 }}>Приватность</span><span className="sub" style={{ fontSize: 13 }}>только вы</span>
          </div>
        </div>
      </div>

      <div className="card pad-lg" style={{ borderColor: 'var(--line-2)' }}>
        <div className="between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div><div className="k">Демонстрационные данные</div><div className="sub" style={{ fontSize: 13, marginTop: 4 }}>Вернуть проект «Кира», кредиты, Canvas, агентов и историю к исходному состоянию.</div></div>
          <MockBadge text="демо" />
        </div>
        <button className="btn btn-soft" onClick={() => setConfirmReset(true)}>Восстановить демонстрационные данные</button>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Восстановить демо-данные?" width={460}>
        <p className="sub" style={{ fontSize: 14, marginBottom: 16 }}>
          Все изменения в этой сессии будут отменены: проекты, ассеты, запуски агентов, история и кредиты вернутся к демонстрационному состоянию. Это действие нельзя отменить.
        </p>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-soft" onClick={() => setConfirmReset(false)}>Отмена</button>
          <button className="btn btn-primary" onClick={doReset}>Восстановить</button>
        </div>
      </Modal>
    </div>
  );
}
