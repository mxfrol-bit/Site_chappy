import { Suspense, useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { demoUser } from '../data/account';
import Toaster from '../components/Toaster';
import DemoBanner from '../components/DemoBanner';
import DemoTour from '../components/DemoTour';
import Loading from '../components/Loading';
import s from './AppLayout.module.css';

const groups: { title: string; items: { to: string; label: string; ic: string; end?: boolean; badge?: string }[] }[] = [
  {
    title: 'Рабочее пространство',
    items: [
      { to: '/app', label: 'Главная', ic: '🏠', end: true },
      { to: '/app/canvas', label: 'Canvas', ic: '🧩' },
      { to: '/app/agents', label: 'Агенты', ic: '🤖' },
    ],
  },
  {
    title: 'Моё',
    items: [
      { to: '/app/projects', label: 'Проекты', ic: '📁' },
      { to: '/app/assets', label: 'Ассеты', ic: '🖼️' },
      { to: '/app/avatars', label: 'Аватары', ic: '🎭' },
      { to: '/app/balance', label: 'Баланс', ic: '💳' },
      { to: '/app/profile', label: 'Профиль', ic: '👤' },
    ],
  },
];

const titles: Record<string, string> = {
  '/app': 'Главная', '/app/canvas': 'Canvas', '/app/agents': 'Агенты',
  '/app/projects': 'Проекты', '/app/assets': 'Ассеты', '/app/avatars': 'Аватары',
  '/app/balance': 'Баланс и тарифы', '/app/profile': 'Профиль',
};

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const credits = useStore((x) => x.credits);
  const loc = useLocation();
  const pageTitle = titles[loc.pathname] ?? (loc.pathname.startsWith('/app/projects') ? 'Проект' : 'Рабочее пространство');
  const pct = Math.min(100, Math.round((credits / 1200) * 100));

  // close the mobile drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={s.shell}>
      <aside className={`${s.sidebar} ${open ? s.open : ''}`}>
        <Link to="/" className={s.brand}>✦ chappy<b>.</b></Link>
        <nav className={s.navwrap} onClick={() => setOpen(false)} aria-label="Основная навигация">
          {groups.map((g) => (
            <div key={g.title}>
              <div className={s.group}>{g.title}</div>
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `${s.item} ${isActive ? s.active : ''}`}>
                  <span className={s.ic} aria-hidden="true">{it.ic}</span>
                  <span>{it.label}</span>
                  {it.badge && <span className={s.badge2}>{it.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className={s.creditw}>
          <div className={s.top}><span className="muted">Баланс</span><span className="mono">⚡ {credits} кр</span></div>
          <div className={s.bar}><i style={{ width: `${pct}%` }} /></div>
          <Link to="/app/balance" className="btn btn-primary btn-sm btn-block">Пополнить</Link>
        </div>
        <div className={s.userrow}>
          <img src={demoUser.avatar} alt="" />
          <div style={{ minWidth: 0 }}>
            <div className={s.nm}>{demoUser.name}</div>
            <div className={s.pl}>{demoUser.plan}</div>
          </div>
          <Link to="/" className="spacer" aria-label="Выход" title="Выход" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>⎋</Link>
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.burger} onClick={() => setOpen((v) => !v)} aria-label="Меню" aria-expanded={open}>☰</button>
          <div className={s.ptitle}>{pageTitle}</div>
          <input className={`input ${s.tsearch}`} aria-label="Поиск по проектам и ассетам" placeholder="Поиск по проектам и ассетам…" />
          <Link to="/app/balance" className={s.credpill} aria-label={`Баланс ${credits} кредитов`}>⚡ {credits} кр</Link>
          <Link to="/app/profile"><img className={s.tavatar} src={demoUser.avatar} alt="Профиль" /></Link>
        </header>
        <div className={s.content}>
          <Suspense fallback={<Loading text="Загрузка…" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      {open && <div className={s.overlay} onClick={() => setOpen(false)} />}
      <Toaster />
      <DemoBanner />
      <DemoTour />
    </div>
  );
}
