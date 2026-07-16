import { lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import Home from './pages/public/Home';
import FuturePage from './components/FuturePage';

// Workspace pages are lazy so the heavy canvas stack (React Flow) and the rest of
// the app stay out of the public landing chunk.
const AppHome = lazy(() => import('./pages/app/AppHome'));
const Projects = lazy(() => import('./pages/app/Projects'));
const ProjectDetail = lazy(() => import('./pages/app/ProjectDetail'));
const CanvasHome = lazy(() => import('./pages/app/CanvasHome'));
const Library = lazy(() => import('./pages/app/Library'));
const AvatarDetail = lazy(() => import('./pages/app/AvatarDetail'));
const Agents = lazy(() => import('./pages/app/Agents'));
const AgentDetail = lazy(() => import('./pages/app/AgentDetail'));
const AgentRunDetail = lazy(() => import('./pages/app/AgentRunDetail'));
const Assets = lazy(() => import('./pages/app/Assets'));
const AssetDetail = lazy(() => import('./pages/app/AssetDetail'));
const Profile = lazy(() => import('./pages/app/Profile'));
const Balance = lazy(() => import('./pages/app/Balance'));

function NotFound() {
  return (
    <div className="wrap" style={{ padding: '80px 0', maxWidth: 620 }}>
      <div className="k" style={{ marginBottom: 8 }}>404</div>
      <h1 className="h2" style={{ margin: '0 0 10px' }}>Страница не найдена</h1>
      <p className="sub" style={{ marginBottom: 20 }}>Такой страницы нет. Вернитесь на главную или откройте рабочее пространство.</p>
      <div className="wrap-row">
        <Link to="/" className="btn btn-primary">На главную</Link>
        <Link to="/app" className="btn btn-soft">Открыть приложение</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
      <Routes>
        {/* ---- Public site ---- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/canvas" element={<FuturePage eyebrow="Продукт" title="Canvas" description="Бесконечная визуальная доска: идея → аватар → модель → агенты → результат в одном процессе. Уже работает в рабочем пространстве." bullets={['Блоки идей, моделей, аватаров, агентов и результатов', 'Соединение блоков в один процесс', 'Повтор удачных процессов как шаблонов']} primaryTo="/app/canvas" primaryLabel="Открыть Canvas" backTo="/" backLabel="На главную" />} />
          <Route path="/agents" element={<FuturePage eyebrow="Продукт" title="Агенты и команды" description="Роли, память и команды агентов, которые проходят весь процесс за вас — с человеческим одобрением. Уже работает в рабочем пространстве." bullets={['Готовые роли и командный конструктор', 'Пошаговый запуск с передачей между агентами', 'Human approval перед результатом']} primaryTo="/app/agents" primaryLabel="Открыть агентов" backTo="/" backLabel="На главную" />} />
          <Route path="/images" element={<FuturePage eyebrow="Направление" title="Фото-студия" description="Отдельная витрина для изображений: text-to-image, редактирование, аватары, стили и product-фото." primaryTo="/app" primaryLabel="Открыть приложение" backTo="/" backLabel="На главную" />} />
          <Route path="/video" element={<FuturePage eyebrow="Направление" title="Видео-студия" description="Text/Image-to-video, движение камеры, оживление кадра и storyboard." primaryTo="/app" primaryLabel="Открыть приложение" backTo="/" backLabel="На главную" />} />
          <Route path="/audio" element={<FuturePage eyebrow="Направление" title="Аудио-студия" description="Озвучка, клон голоса, музыка, песни и звуковые эффекты." primaryTo="/app" primaryLabel="Открыть приложение" backTo="/" backLabel="На главную" />} />
          <Route path="/chat" element={<FuturePage eyebrow="Направление" title="Чат и текст" description="Выбор LLM, работа с документами, режимы ответа и сравнение моделей." primaryTo="/app" primaryLabel="Открыть приложение" backTo="/" backLabel="На главную" />} />
          <Route path="/models" element={<FuturePage eyebrow="Модели" title="Каталог моделей" description="Единый каталог моделей для изображений, видео, аудио и чата с фильтрами и страницами моделей. В демо модели доступны прямо на Canvas." primaryTo="/app/canvas" primaryLabel="Открыть Canvas" backTo="/" backLabel="На главную" />} />
          <Route path="/models/:id" element={<FuturePage eyebrow="Модель" title="Страница модели" description="Возможности модели, Playground и сравнение. В демо модели используются на Canvas." primaryTo="/app/canvas" primaryLabel="Открыть Canvas" backTo="/" backLabel="На главную" />} />
          <Route path="/pricing" element={<FuturePage eyebrow="Тарифы" title="Тарифы и кредиты" description="Подписки и пакеты кредитов. В демо баланс и пополнение показаны как имитация — без реальной оплаты." primaryTo="/app/balance" primaryLabel="Открыть баланс" backTo="/" backLabel="На главную" />} />
          <Route path="/login" element={<FuturePage eyebrow="Аккаунт" title="Вход" description="Регистрация и авторизация имитируются в прототипе. Продолжите как демо-пользователь." primaryTo="/app" primaryLabel="Продолжить как демо-пользователь" backTo="/" backLabel="На главную" />} />
          <Route path="/signup" element={<FuturePage eyebrow="Аккаунт" title="Регистрация" description="Реальные аккаунты в прототипе не создаются. Продолжите как демо-пользователь." primaryTo="/app" primaryLabel="Продолжить как демо-пользователь" backTo="/" backLabel="На главную" />} />
        </Route>

        {/* ---- Workspace app ---- */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppHome />} />
          <Route path="canvas" element={<CanvasHome />} />
          <Route path="canvas/:projectId" element={<ProjectDetail />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/:id" element={<AgentDetail />} />
          <Route path="runs/:id" element={<AgentRunDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="avatars" element={<Library />} />
          <Route path="avatars/:id" element={<AvatarDetail />} />
          <Route path="balance" element={<Balance />} />
          <Route path="profile" element={<Profile />} />
          {/* Deferred workspace scope — reachable by deep link, honest future pages */}
          <Route path="create" element={<FuturePage eyebrow="Генерация" title="Универсальный экран создания" description="Единый экран «модель → промпт → референс → формат → результат». В демо генерация запускается прямо на Canvas проекта." primaryTo="/app/projects/pr-kira" primaryLabel="Открыть демо-проект" />} />
          <Route path="music" element={<FuturePage eyebrow="Мастер" title="Music & Clip Studio" description="Пошаговый визард: тема → жанр → текст → трек → клип." bullets={['Генерация трека и текста', 'Сборка клипа из кадров', 'Экспорт в проект']} />} />
          <Route path="models" element={<FuturePage eyebrow="Каталог" title="Каталог моделей" description="Фильтры и карточки моделей с отдельными страницами. В демо модели доступны на Canvas." primaryTo="/app/canvas" primaryLabel="Открыть Canvas" />} />
          <Route path="history" element={<FuturePage eyebrow="Моё" title="Глобальная история" description="Сквозная история по всем проектам. В демо история и происхождение работают внутри каждого проекта." primaryTo="/app/projects/pr-kira?tab=history" primaryLabel="История проекта" />} />
          <Route path="settings" element={<FuturePage eyebrow="Аккаунт" title="Настройки" description="Язык, уведомления и приватность. Базовые настройки уже доступны в профиле." primaryTo="/app/profile" primaryLabel="Открыть профиль" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}
