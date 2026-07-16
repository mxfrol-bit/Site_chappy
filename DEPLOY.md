# Chappy Web v0.1 — деплой

Прототип — статичное SPA (Vite + React). Бэкенда, ключей и переменных окружения нет — данные mock и живут в `localStorage`. Публиковать можно на любой статик-хостинг; ниже — путь через Vercel.

## Локальная проверка перед деплоем

```bash
npm install          # установка зависимостей
npm run build        # tsc -b && vite build → dist/
npm run preview      # локальный предпросмотр продакшн-сборки (http://localhost:4173)
```

`npm run build` должен завершаться без ошибок TypeScript. Проверьте `dist/` и предпросмотр: главная `/`, рабочее пространство `/app`, демо-проект `/app/projects/pr-kira`, и обновление страницы на вложенном маршруте (например `/app/assets/as-k1`) — должно открываться без 404.

## Vercel

SPA-роутинг уже настроен в [`vercel.json`](vercel.json): все пути переписываются на `/index.html`, поэтому deep-links и refresh на вложенных маршрутах работают.

```bash
# один раз
npm i -g vercel
vercel login

# из корня проекта
vercel            # preview-деплой (даст временный URL)
vercel --prod     # продакшн-деплой (даст постоянный URL)
```

При первом запуске Vercel спросит проект/скоуп; framework определится как **Vite** автоматически (build command `npm run build`, output `dist`). Ничего в env выставлять не нужно.

> Примечание: в текущей рабочей среде агента авторизация Vercel недоступна, поэтому финальный публичный URL создаёт владелец проекта локально командами выше. Сборка проверена локально и проходит.

## Railway (рекомендуется — работает с приватным репозиторием)

Railway собирает и запускает приложение из **приватного** GitHub-репозитория и выдаёт публичный URL без изменения приватности. Приложение раздаётся с **корневого пути** `/` (никакого base-path).

Конфигурация в репозитории:
- [`server.js`](server.js) — минимальный zero-dependency Node-сервер для `dist/` с SPA-fallback (любой неизвестный маршрут → `index.html`), слушает `$PORT`.
- `package.json` → `"start": "node server.js"`, `"build": "tsc -b && vite build"`.
- [`railway.json`](railway.json) — `build: npm ci && npm run build`, `start: npm run start`, `healthcheckPath: /`, restart on failure.

Подключение (владельцем, один раз): **[railway.app](https://railway.app) → New Project → Deploy from GitHub repo → выбрать `24derzkiy-commits/chappy-web-prototype-v0-1`** (при первом подключении GitHub попросит авторизовать Railway для этого репозитория). Railway прочитает `railway.json`, соберёт и задеплоит; затем **Service → Settings → Networking → Generate Domain** даёт публичный `https://<service>.up.railway.app`. Auto-deploy from `main` включён по умолчанию.

Локальная проверка production-раздачи:
```bash
npm ci && npm run build
PORT=4173 npm run start   # http://localhost:4173  (root path, SPA fallback)
```

## GitHub Pages (устарело — оставлено как ручной вариант)

> Деплой ведётся через Railway (выше). Workflow оставлен только для ручного запуска (`workflow_dispatch`) и требует публичного репозитория или GitHub Pro.


Настроен workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml): на каждый push в `main` он собирает проект и публикует `dist/` через официальные GitHub Pages Actions.

Особенности проектного сайта (`https://<account>.github.io/<repo>/`):
- **Base path** — сборка на Pages идёт с `BASE_PATH=/<repo>/` (Vite `base`), из него берётся и `basename` роутера ([src/main.tsx](src/main.tsx)), и префикс для абсолютных asset-путей ([src/basePath.ts](src/basePath.ts)). Локально и на Vercel `base='/'` (шим — no-op).
- **SPA deep-links** — GitHub Pages не умеет server-rewrites, поэтому добавлен fallback [`public/404.html`](public/404.html) (кодирует путь) + восстановление в `index.html`. Refresh на вложенном маршруте и прямые ссылки работают.

Включение (один раз, владельцем в UI): **Repository → Settings → Pages → Build and deployment → Source: GitHub Actions**. После этого каждый push в `main` деплоит автоматически; URL — в разделе Actions/Environments.

> ⚠️ На бесплатном плане GitHub Pages доступен **только для публичных репозиториев**. Для приватного репозитория нужен GitHub Pro/Team, иначе Pages не запустится.

## Любой другой статик-хостинг

Соберите `npm run build` и раздавайте `dist/` с SPA-fallback на `index.html`:

- **Netlify** — `_redirects` с `/*  /index.html  200`.
- **GitHub Pages / nginx** — настроить `try_files ... /index.html`.
- **Cloudflare Pages** — framework preset Vite, output `dist`.

## Демо после деплоя

- Главная → «Открыть демо-проект» ведёт в проект «Кира» (`/app/projects/pr-kira`).
- Кнопка «Посмотреть, как работает Chappy» (или бейдж «Демонстрационный режим») запускает тур.
- Профиль → «Восстановить демонстрационные данные» сбрасывает состояние для повторного показа.
