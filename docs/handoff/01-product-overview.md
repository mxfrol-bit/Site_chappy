# 01 · Обзор продукта — Chappy Web (Product Prototype v0.1)

> Документ для разработчика, который будет собирать продакшн-версию. Всё описанное ниже — **интерактивный фронтенд-прототип**: бэкенда нет, данные mock/seed и хранятся в `localStorage` (zustand persist, ключ `chappy_v01_store`, `version: 4`). Генерации, оплата и авторизация имитируются и честно помечены в UI (`MockBadge`, `DemoBanner`).

## Что такое Chappy Web

Chappy Web — это **рабочее AI-пространство (workspace) в браузере** для создания контента: изображения, видео, аудио/музыка, чат/LLM и AI-агенты в одном месте. Ключевая идея прототипа — это **не агрегатор моделей и не «сайт про оплату без VPN»**, а среда, где весь творческий процесс живёт в **проектах** и собирается на **бесконечном Canvas**: идея → аватар → команда агентов → результат.

Три несущих столпа продукта (видно и на лендинге `Home.tsx`, и в структуре store):

- **Проекты с памятью и историей** — вся работа (ассеты, сущности, память, история событий, чекпоинты, финальные Outputs) хранится внутри проекта, к ней можно вернуться и повторить удачный процесс.
- **Canvas** (`@xyflow/react` / React Flow) — визуальная доска, где блоки (идея, аватар, стиль, локация, модель, агенты, результат) соединяются в единый процесс.
- **Переиспользуемые сущности и команды агентов** — аватары/голоса/стили/локации сохраняются один раз и подставляются в любой проект; команды агентов проходят процесс по шагам с **человеческим одобрением (human approval)** перед финалом.

Технически: SPA на **React 19 + TypeScript + Vite**, роутинг — **React Router 7**, состояние — **zustand + persist**, дизайн-токены через CSS-переменные и CSS Modules (без Tailwind). Строки вынесены в `src/i18n/ru.ts` (`t()`), интерфейс русскоязычный, слой готов к добавлению английского.

## Чем Chappy Web отличается от «Chappy Bot»

**Chappy Bot** (Telegram-бот) и **Chappy Web** — это два **разных продукта**. В этом репозитории живёт только **Chappy Web** — самостоятельное браузерное рабочее пространство. Отличие для разработчика:

- **Chappy Bot** — генерация «в один запрос» внутри мессенджера: диалоговый интерфейс, короткие команды, результат приходит сообщением. Нет постоянного холста, нет долгоживущих проектов с памятью и историей.
- **Chappy Web** — полноценный **workspace-продукт**: app-shell с сайдбаром и разделами (`/app/*`), бесконечный Canvas, проекты как единица хранения, переиспользуемые сущности, команды агентов, lineage/история/чекпоинты. Telegram здесь — только пункт будущего scope (интеграция), а не текущая платформа.

Проще говоря: Bot — это «спроси и получи картинку», Web — это «собери и веди производственный процесс контента». Позиционирование намеренно строится вокруг **workspace**, а оплата российской картой (ЮKassa) и доступ к разным моделям — это **функции**, а не ядро бренда (см. `README.md`).

## Первая аудитория

Первый рынок — **Россия** (Russia-first). Целевой сегмент — **креаторы и SMM-специалисты 18–34 лет**: ранние адаптеры, которым важны скорость, премиальный визуал и простота. Это зашито прямо в демо-данные проекта «Кира»:

- память проекта `mem-k-2`: «Креаторы и ранние адаптеры 18–34, ценят скорость и премиальный вид»;
- бриф исследователя в agent run: «Аудитория: креаторы 18–34, интерес к AI»;
- тон проекта `mem-k-3`: «Премиальный минимал, без кислотных цветов и мемных VFX».

Для первого рынка предусмотрена оплата российской картой через **ЮKassa** — но в прототипе это mock (`PaymentProvider` → `YooKassaProvider`), без реальных платежей.

## Главный сквозной сценарий (демо-проект «Кира»)

Прототип открывается не на пустом холсте, а на **полностью собранном флагманском проекте** «Кира — запуск AI-продукта» (`DEMO_PROJECT_ID = 'pr-kira'`, весь набор данных — в `src/data/demoProject.ts`, инъекция в store — `src/store/useStore.ts`). Это главная демонстрация ценности: пройти весь путь «идея → готовый результат» за минуту.

Сквозной путь, который нужно суметь воспроизвести в продакшне:

1. **Открыть демо-проект** — с лендинга `/` кнопка «Открыть демо-проект» → `/app/projects/pr-kira` (`ProjectDetail.tsx`, вкладки: `canvas` / `assets` / `agents` / `history`).
2. **Canvas** — предсобранный граф (`demoCanvas`): нода идеи (`n-k-idea`) и блоки сущностей Киры (avatar/style/location) слева соединены рёбрами с нодой команды агентов (`n-k-agent`) и нодой модели (`n-k-model`), которые ведут к нодам-результатам (`n-k-result-agent`, `n-k-result-model`).
3. **Аватар** — «Кира» (`av-kira`, `Avatar`) с привязанными сущностями: голос `vo-kira` (`Voice`), стиль по умолчанию `st-kira` (`Style`), локация `loc-kira` (`Location`) и 3 референс-ассета (`source: 'reference'`).
4. **Команда агентов** — «Контент-команда» (`team-content`, координатор — Креативный директор, `approvalRequired`) проходит пайплайн по шагам: **Исследователь → Сценарист → Креативный директор → Prompt Engineer → QA** (`demoRun`, `AgentRun` со статусом `completed`, шаги с `handoffToAgentId` — передача результата дальше). Финальный шаг QA даёт оценку и рекомендацию `approve`.
5. **Human approval** — прогон требует подтверждения человеком (в живом запуске статус `waiting_approval`, действие «Одобрить» → `approveRun`, `AgentRunDetail.tsx`). В демо это отражено событием `agent_run.approved` в истории.
6. **Результат** — из одобренного прогона рождается ассет-результат `as-k-agent` (`source: 'agent'`, `derivationType: 'agent_output'`), привязанный к ноде Canvas и к `GenerationRecipe` (модель `Flux Pro`, промпт, ссылки на avatar/voice/style/location).
7. **Lineage (происхождение ассетов)** — цепочка производных: оригинал `as-k1` → вариация `as-k2` (`variation`) → апскейл до 4K `as-k3` (`upscale`, `favorite: true`). Каждый ассет несёт свой `recipe`, `derivedFromAssetId`, `parentAssetIds` (визуализация — `LineageView.tsx`).
8. **История проекта** — хронологическая лента `demoActivityKira` (`ActivityEvent[]`): создание проекта → создание аватара → сохранение памяти → запуск команды → одобрение → создание ассетов → деривации → чекпоинт → назначение Output.
9. **Чекпоинт и финальный Output** — ручная контрольная точка `cp-kira-1` (`ProjectCheckpoint` со снапшотом Canvas) и утверждённый **Project Output** `out-kira-1` (`ProjectOutput`, `status: 'approved'`, указывает на `as-k3`).

Все id стабильны и перекрёстно связаны (asset ↔ canvasNode ↔ agentRun ↔ activity ↔ checkpoint ↔ output) — это и есть модель данных, которую предстоит воспроизвести на реальном бэкенде.

## Что входит в v0.1 (реализовано)

Реальные, работающие на mock-данных части (маршруты в `src/App.tsx`, разделы сайдбара — `AppLayout.tsx`):

- **Публичный лендинг** (`/`, `Home.tsx`) — hero, блок Canvas, проекты, команды агентов, сохраняемые сущности, направления, модели, тренды/шаблоны, тизер тарифов.
- **Workspace / app-shell** (`/app`, `AppLayout.tsx`) — сайдбар (группы «Рабочее пространство» и «Моё»), топбар с виджетом кредитов, мобильный drawer, `AppHome`.
- **Projects** — список (`/app/projects`) и детальная страница проекта (`/app/projects/:id`, `ProjectDetail.tsx`) с вкладками Canvas / Ассеты / Агенты-Запуски / История; CRUD, дубликат, архив, сохранение Canvas (store).
- **Canvas** (`/app/canvas`, `CanvasEditor.tsx`, `src/features/canvas/*`) — React Flow: типы нод `idea/avatar/style/location/model/agent/image`, соединения, палитра блоков.
- **Assets** — галерея (`/app/assets`) и детальная (`/app/assets/:id`) с `recipe`, тегами, favorite, происхождением; типы источников `reference / generation / agent`; деривации `variation / upscale / animate / agent_output`.
- **Переиспользуемые сущности: Avatar / Voice / Style / Location** — библиотека (`/app/avatars`, `Library.tsx`), детальная аватара (`/app/avatars/:id`), модалки создания (`NewAvatarModal`, `NewEntityModal`).
- **Agents** (`/app/agents`, `AgentDetail`) и **Agent Teams** — роли-агенты с инструментами, командный конструктор (`TeamBuilderModal`), запуск команды (`RunTeamModal`), оркестрация (`src/features/agents/orchestration.ts`).
- **Agent Runs + Human Approval** (`/app/runs/:id`, `AgentRunDetail.tsx`) — пошаговый прогон с `handoff` между агентами, статусами шагов (`waiting_approval` и др.) и подтверждением человеком (`approveRun` / `requestRevision`).
- **Project Memory** (`ProjectMemory.tsx`) — редактируемые записи памяти проекта (`AgentMemoryEntry`, scope `project`).
- **Asset Lineage** (`LineageView.tsx`, `src/features/history/lineage.ts`) — дерево происхождения ассетов.
- **Project History / Activity** (`ProjectHistory.tsx`) — лента событий `ActivityEvent` с типами `project.created`, `entity.created`, `agent_run.*`, `asset.created/derived`, `checkpoint.*`, `project_output.approved` и др.
- **Checkpoints** (`ProjectCheckpoints.tsx`) — создание/восстановление/форк из контрольной точки (`createCheckpoint` / `restoreCheckpoint` / `forkProjectFromCheckpoint`; восстановление недеструктивно — сначала снапшот текущего состояния).
- **Project Outputs** — назначение финального утверждённого результата проекта (`setProjectOutput`, `ProjectOutput`).
- **Basic Profile / Credits** — профиль (`/app/profile`), баланс и mock-тарифы (`/app/balance`, `Balance.tsx`); кредиты (`spend` / `addCredits`, seed `demoUser.credits = 240`), транзакции, оплата — mock через `PaymentProvider`/`YooKassaProvider`.
- **Тосты, демо-баннер, демо-тур** (`Toaster`, `DemoBanner`, `DemoTour`, `resetDemo`).

Заглушки, реализованные честно (не битые ссылки): нереализованные разделы отдают компонент `FuturePage` с описанием и ведут в рабочую часть демо. Сюда входят публичные `/models`, `/models/:id`, `/pricing`, `/login`, `/signup`, `/canvas`, `/agents`, направления `/images|/video|/audio|/chat`, а также app-маршруты `/app/create`, `/app/music`, `/app/models`, `/app/history`, `/app/settings`.

## Будущий scope (за пределами v0.1)

Заявлено, но пока в виде `FuturePage`/будущих задач (см. `CHANGELOG.md` и заглушки в `App.tsx`):

- **Каталог моделей** (`/models`, `/app/models`) и **страницы моделей** с Playground и сравнением (`/models/:id`). В демо модели доступны только как ноды на Canvas.
- **Music & Clip Studio** (`/app/music`) — пошаговый визард «тема → жанр → текст → трек → клип» с экспортом в проект.
- **Универсальный экран создания** (`/app/create`) — единый «модель → промпт → референс → формат → результат»; сейчас генерация запускается прямо на Canvas.
- **Глобальная история** по всем проектам (`/app/history`) — сейчас история и lineage работают внутри проекта.
- **Реальные платежи** через ЮKassa (и другие провайдеры без переделки UI — абстракция `PaymentProvider` уже заложена); реальная **авторизация/регистрация** (`/login`, `/signup`).
- **Интеграция с Telegram**.
- **Команды и совместная работа** (collaboration, роли пользователей — не путать с агентами).
- **Мобильное редактирование Canvas** (сейчас Canvas в первую очередь для десктопа).

## Ключевые файлы для старта

- `src/data/demoProject.ts` — эталонный сквозной набор данных «Кира» (истина о модели данных).
- `src/store/useStore.ts` — весь zustand store: seed-данные, все действия (проекты, ассеты, сущности, агенты/прогоны, память, чекпоинты, outputs, кредиты), persist/merge-логика.
- `src/types/index.ts` — доменные типы (`Project`, `Asset`, `Avatar`, `Voice`, `Style`, `Location`, `Agent`, `AgentTeam`, `AgentRun`, `AgentRunStep`, `GenerationRecipe`, `ActivityEvent`, `ProjectCheckpoint`, `ProjectOutput`, `GenerationAttempt` и др.).
- `src/App.tsx` — карта маршрутов (публичный сайт + `/app/*`), граница «реально / FuturePage».
- `src/pages/public/Home.tsx` — лендинг и продуктовое позиционирование.
- `src/features/canvas/*`, `src/features/agents/*`, `src/features/history/lineage.ts` — Canvas, оркестрация агентов, происхождение ассетов.
- `README.md`, `CHANGELOG.md` — стек, структура, статус v0.1.
