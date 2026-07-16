import { Suspense } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import s from './PublicLayout.module.css';

const navLinks = [
  { to: '/models', label: 'Модели' },
  { to: '/video', label: 'Видео' },
  { to: '/audio', label: 'Аудио' },
  { to: '/agents', label: 'Агенты' },
  { to: '/canvas', label: 'Canvas' },
  { to: '/pricing', label: 'Тарифы' },
];

export default function PublicLayout() {
  return (
    <div>
      <header className={s.header}>
        <div className={`wrap ${s.inner}`}>
          <Link to="/" className={s.logo}>✦ chappy<b>.</b></Link>
          <nav className={s.nav}>
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? s.active : '')}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className={s.right}>
            <Link to="/login" className={s.login}>Войти</Link>
            <Link to="/app" className="btn btn-primary btn-sm">Начать бесплатно</Link>
          </div>
        </div>
      </header>

      <main>
        <Suspense fallback={<div className="wrap" style={{ padding: '80px 0' }}><Loading text="Загрузка…" /></div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className={s.footer}>
        <div className="wrap">
          <div className={s.fgrid}>
            <div>
              <div className={s.logo} style={{ marginBottom: 10 }}>✦ chappy<b>.</b></div>
              <p className="sub" style={{ fontSize: 14, maxWidth: 300 }}>
                Рабочее AI-пространство для изображений, видео, музыки и контента — с проектами, памятью и агентами.
              </p>
            </div>
            <div>
              <h4>Продукт</h4>
              <Link to="/models">Модели</Link>
              <Link to="/canvas">Canvas</Link>
              <Link to="/agents">Агенты</Link>
              <Link to="/pricing">Тарифы</Link>
            </div>
            <div>
              <h4>Направления</h4>
              <Link to="/images">Изображения</Link>
              <Link to="/video">Видео</Link>
              <Link to="/audio">Аудио</Link>
              <Link to="/chat">Чат</Link>
            </div>
            <div>
              <h4>Аккаунт</h4>
              <Link to="/login">Войти</Link>
              <Link to="/signup">Регистрация</Link>
              <Link to="/app">Открыть приложение</Link>
            </div>
          </div>
          <div className={s.fbottom}>
            <span>© 2026 Chappy · внутренний прототип v0.1</span>
            <span>Оплата российской картой через ЮKassa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
