import { Link } from 'react-router-dom';
import { trends } from '../../data/trends';
import { models } from '../../data/models';
import { plans } from '../../data/plans';

const directions = [
  { to: '/images', k: '01', title: 'Изображения', d: 'Кадры, обложки, персонажи, аватары и стили.', img: '/trends/fashion.jpg' },
  { to: '/video', k: '02', title: 'Видео', d: 'Text/Image-to-video, движение камеры, оживление.', img: '/trends/cyber.jpg' },
  { to: '/audio', k: '03', title: 'Аудио и музыка', d: 'Озвучка, клон голоса, песни и звук.', img: '/trends/neon.jpg' },
  { to: '/chat', k: '04', title: 'Чат и LLM', d: 'Сценарии, тексты, анализ и документы.', img: '/trends/gothic.jpg' },
  { to: '/agents', k: '05', title: 'AI-агенты', d: 'Роли, память и команды для процессов.', img: '/trends/star.jpg' },
];
const entities = [
  { t: 'Аватары', d: 'Единый герой в каждом кадре.', img: '/trends/avatar.jpg' },
  { t: 'Голоса', d: 'Закреплённый голос для озвучки.', img: '/trends/star.jpg' },
  { t: 'Стили', d: 'Своя палитра и визуальный язык.', img: '/trends/neon.jpg' },
  { t: 'Локации', d: 'Сцены и окружение проекта.', img: '/trends/future.jpg' },
];
const canvasFlow = [
  { ic: '💡', t: 'Идея' }, { ic: '🎭', t: 'Аватар Кира' }, { ic: '🤖', t: 'Команда агентов' },
  { ic: '🖼️', t: 'Кадр' }, { ic: '⭐', t: 'Готовый Output' },
];
const teamPipeline = ['Исследователь', 'Сценарист', 'Креативный директор', 'Prompt Engineer', 'QA'];
const projectPreviews = [
  { to: '/app/projects/pr-kira', name: 'Кира — запуск AI-продукта', img: '/trends/fashion.jpg', meta: '4 ассета · аватар Кира · память · чекпоинт' },
  { to: '/app/projects/pr-cyber', name: 'Reels: Киберпанк-город', img: '/trends/cyber.jpg', meta: '12 ассетов · lineage · история' },
];

export default function Home() {
  const popular = models.filter((m) => m.categories.includes('popular')).slice(0, 4);
  return (
    <div>
      {/* HERO */}
      <section className="wrap" style={{ padding: '72px 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 40, alignItems: 'center' }} className="heroGrid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>AI-рабочее пространство для креатива</div>
            <h1 className="h1" style={{ maxWidth: 640 }}>
              Рабочее пространство для AI-контента: <span className="grad-text">проекты, Canvas, аватары</span> и команды агентов.
            </h1>
            <p className="sub" style={{ marginTop: 18, maxWidth: 560 }}>
              Не просто список моделей. Собирайте процесс на бесконечной доске, сохраняйте аватаров, стили и память проекта,
              подключайте команды агентов и возвращайтесь к работе в любое время — с ведущими AI-моделями.
            </p>
            <div className="wrap-row" style={{ marginTop: 26 }}>
              <Link to="/app/projects/pr-kira" className="btn btn-primary btn-lg">Открыть демо-проект</Link>
              <Link to="/app/canvas" className="btn btn-ghost btn-lg">Смотреть Canvas</Link>
            </div>
            <div className="wrap-row mono" style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-2)' }}>
              <span>✦ 100 кредитов на старте</span>
              <span>· проекты · Canvas · агенты</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['kino', 'cyber', 'fashion', 'neon', 'future', 'gothic'].map((id, i) => (
              <div key={id} className="cover card" style={{ aspectRatio: i % 3 === 0 ? '3/4' : '1/1', borderRadius: 'var(--r-lg)' }}>
                <img src={`/trends/${id}.jpg`} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CANVAS — the differentiator, right under the hero */}
      <section className="wrap section">
        <div className="card pad-lg" style={{ background: 'var(--grad-soft)' }}>
          <div className="eyebrow">Главное отличие Chappy</div>
          <h2 className="h2" style={{ margin: '10px 0 12px', maxWidth: 640 }}>Бесконечный Canvas — весь процесс на одной доске</h2>
          <p className="sub" style={{ maxWidth: 640, marginBottom: 22 }}>
            Идея → аватар → команда агентов → результат. Соединяйте блоки в единый процесс, а удачный поток
            сохраняйте как шаблон и повторяйте в один клик.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
            {canvasFlow.map((n, i) => (
              <span key={n.t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="card" style={{ padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                  <span aria-hidden="true">{n.ic}</span>{n.t}
                </span>
                {i < canvasFlow.length - 1 && <span style={{ color: 'var(--accent)' }}>→</span>}
              </span>
            ))}
          </div>
          <Link to="/app/canvas" className="btn btn-primary">Открыть Canvas</Link>
        </div>
      </section>

      {/* PROJECTS — core workspace pillar */}
      <section className="wrap section">
        <div className="eyebrow">Проекты</div>
        <h2 className="h2" style={{ margin: '10px 0 12px' }}>Вся работа живёт в проектах — с памятью и историей</h2>
        <p className="sub" style={{ maxWidth: 640, marginBottom: 24 }}>
          Ассеты, аватары, стили, память проекта, история событий и контрольные точки хранятся в проекте, поэтому
          можно вернуться к работе в любой момент и повторить удачный процесс.
        </p>
        <div className="grid g2">
          {projectPreviews.map((p) => (
            <Link key={p.to} to={p.to} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div className="cover" style={{ aspectRatio: '16/9' }}><img src={p.img} alt="" loading="lazy" /></div>
              <div className="pad"><div style={{ fontWeight: 600 }}>{p.name}</div><div className="sub" style={{ fontSize: 13, marginTop: 4 }}>{p.meta}</div></div>
            </Link>
          ))}
        </div>
      </section>

      {/* AGENT TEAMS — shown as a pipeline, not just a roster */}
      <section className="wrap section">
        <div className="between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="eyebrow">Команды агентов</div>
            <h2 className="h2" style={{ marginTop: 10 }}>Команда проходит весь процесс за вас</h2>
          </div>
          <Link to="/app/agents" className="btn btn-ghost btn-sm">Открыть агентов</Link>
        </div>
        <div className="card pad-lg">
          <div className="between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Контент-команда</div>
            <span className="sub mono" style={{ fontSize: 12 }}>координатор: Креативный директор · нужно одобрение</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {teamPipeline.map((role, i) => (
              <span key={role} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="chip" style={{ cursor: 'default' }}>{i + 1}. {role}</span>
                {i < teamPipeline.length - 1 && <span style={{ color: 'var(--accent)' }}>→</span>}
              </span>
            ))}
          </div>
          <p className="sub" style={{ fontSize: 13.5, marginTop: 14 }}>
            Пошаговый запуск с передачей результата между агентами и человеческим одобрением перед финальным кадром.
          </p>
        </div>
      </section>

      {/* SAVED ENTITIES */}
      <section className="wrap section">
        <div className="eyebrow">Память проекта</div>
        <h2 className="h2" style={{ margin: '10px 0 28px' }}>Аватары, голоса, стили и локации — сохраняются</h2>
        <div className="grid g4">
          {entities.map((e) => (
            <div key={e.t} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div className="cover" style={{ aspectRatio: '4/3' }}><img src={e.img} alt="" loading="lazy" /></div>
              <div className="pad"><div className="h3" style={{ fontSize: 17, marginBottom: 4 }}>{e.t}</div><div className="sub" style={{ fontSize: 13.5 }}>{e.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECTIONS — every modality, secondary to the workspace story */}
      <section className="wrap section">
        <div className="eyebrow">И любая модальность</div>
        <h2 className="h2" style={{ margin: '10px 0 28px' }}>Изображения, видео, аудио, чат и агенты — в одном месте</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
          {directions.map((d) => (
            <Link key={d.to} to={d.to} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div className="cover" style={{ aspectRatio: '16/10' }}><img src={d.img} alt="" loading="lazy" /></div>
              <div className="pad">
                <div className="k" style={{ marginBottom: 6 }}>{d.k}</div>
                <div className="h3" style={{ marginBottom: 6 }}>{d.title}</div>
                <div className="sub" style={{ fontSize: 14 }}>{d.d}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MODELS */}
      <section className="wrap section">
        <div className="between" style={{ marginBottom: 22 }}>
          <div><div className="eyebrow">Модели</div><h2 className="h2" style={{ marginTop: 10 }}>Ведущие и новые модели</h2></div>
          <Link to="/models" className="btn btn-ghost btn-sm">Каталог моделей</Link>
        </div>
        <div className="grid g4">
          {popular.map((m) => (
            <Link key={m.id} to={`/models/${m.id}`} className="card pad card-hover">
              <div className="between"><span className="k">{m.modality}</span>{m.badge && <span className="badge badge-top">{m.badge}</span>}</div>
              <div className="h3" style={{ margin: '10px 0 2px', fontSize: 17 }}>{m.name}</div>
              <div className="sub" style={{ fontSize: 13 }}>{m.company}</div>
              <div className="price muted" style={{ fontSize: 12, marginTop: 10 }}>{m.priceHint}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDS */}
      <section className="wrap section">
        <div className="between" style={{ marginBottom: 22 }}>
          <div><div className="eyebrow">Шаблоны процессов</div><h2 className="h2" style={{ marginTop: 10 }}>Готовые сценарии в один клик</h2></div>
          <Link to="/app" className="btn btn-ghost btn-sm">Повторить процесс</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
          {trends.slice(0, 6).map((t) => (
            <div key={t.id} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div className="cover" style={{ aspectRatio: '3/4' }}><img src={t.image} alt={t.title} loading="lazy" /></div>
              <div className="pad" style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                <div className="price muted" style={{ fontSize: 11, marginTop: 4 }}>от {t.priceFrom} кр · {t.steps} шага</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING teaser — the single, first-market payment mention */}
      <section className="wrap section">
        <div className="eyebrow">Тарифы</div>
        <h2 className="h2" style={{ margin: '10px 0 8px' }}>Один баланс — все модели</h2>
        <p className="sub" style={{ marginBottom: 24 }}>Предварительные тарифы прототипа. Для первого рынка — удобная оплата российской картой через ЮKassa.</p>
        <div className="grid g4">
          {plans.slice(0, 4).map((p) => (
            <div key={p.id} className="card pad" style={{ borderColor: p.highlighted ? 'var(--accent)' : 'var(--line)' }}>
              <div className="k">{p.name}</div>
              <div className="h3" style={{ margin: '6px 0 2px' }}>{p.priceRub === 0 ? '0 ₽' : `${p.priceRub} ₽`}<span className="muted" style={{ fontSize: 13 }}> / мес</span></div>
              <div className="price muted" style={{ fontSize: 12, marginBottom: 12 }}>{p.credits} кредитов</div>
              <Link to="/pricing" className={`btn btn-sm btn-block ${p.highlighted ? 'btn-primary' : 'btn-soft'}`}>Выбрать</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="wrap" style={{ padding: '40px 24px 90px' }}>
        <div className="card pad-lg" style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--grad-soft)' }}>
          <h2 className="h2" style={{ maxWidth: 640, margin: '0 auto 12px' }}>Откройте готовый проект и пройдите весь путь за минуту</h2>
          <p className="sub" style={{ marginBottom: 24 }}>Демо-проект «Кира» уже собран: идея, аватар, команда агентов, одобрение, результат и история.</p>
          <div className="wrap-row" style={{ justifyContent: 'center' }}>
            <Link to="/app/projects/pr-kira" className="btn btn-primary btn-lg">Открыть демо-проект</Link>
            <Link to="/app" className="btn btn-soft btn-lg">В рабочее пространство</Link>
          </div>
        </div>
      </section>

      <style>{'@media(max-width:860px){.heroGrid{grid-template-columns:1fr!important}}'}</style>
    </div>
  );
}
