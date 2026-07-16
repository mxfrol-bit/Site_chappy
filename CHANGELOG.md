# Changelog — Chappy Web Prototype v0.1

Фронтенд-прототип (React 19 + TypeScript + Vite + zustand + React Router + React Flow). Все данные — mock/seed в localStorage; бэкенда, реальных платежей и ключей нет. Каждый блок сохранён как отдельный commit-checkpoint.

## v0.1 — 2026-07 · заморожен (tag `chappy-web-prototype-v0.1`)

Финальное состояние: **`12b2f66`** (patch к `5ce2367`).

### Checkpoints

- **`ca200bc` — Foundation.** Каркас: Vite/React/TS, роутинг, публичный лендинг и app-shell, дизайн-токены (CSS-переменные + CSS Modules), zustand-store с persist, i18n-слой (`ru.ts`), базовые компоненты и mock-сервисы.
- **`d42a573` — Core Vertical Slice.** Проекты и Canvas (React Flow): типизированный граф, блоки (идея/модель/результат), mock-генерация со сменой статусов, результат → Asset, восстановление Canvas после reload.
- **`eeef894` — Persistent Entities.** Переиспользуемые сущности Avatar / Voice / Style / Location: библиотека, создание, привязка к проекту, резолв контекста генерации (avatarId/voiceId/styleId/locationId/referenceAssetIds в рецепте), подключение сущностей к модели на Canvas.
- **`05793e4` — Agents & Agent Teams.** Библиотека агентов и командный конструктор, mock-оркестрация (таймеры), таймлайн запуска с передачей между агентами, **human approval** (одобрить/доработка/остановить), retry этапа, симуляция сбоя, память проекта, agent-нода на Canvas, вкладка «Агенты / Запуски», виджеты на главной. Output ссылается на projectId/agentRunId/сущности/рецепт.
- **`fb19762` — Asset Lineage & Project History.** Происхождение и версии результатов (original → variation → upscale), библиотека Assets с фильтрами и Asset Detail (recipe + lineage + связи), вкладка «История» проекта (хронологическая лента), контрольные точки (create / restore со снапшотом текущего состояния / fork), Project Outputs, GenerationAttempt. Отдельные типизированные слайсы; связи по стабильным id.
- **`5ce2367` — Demo Readiness & Production Handoff.** Флагманский демо-проект «Кира — запуск AI-продукта» (предсобранный Canvas, завершённый agent run, lineage, история, чекпоинт, Output). Гид-тур (8 шагов), индикатор демо-режима, one-click Demo Reset. Честные FuturePage вместо заглушек, очистка навигации, реальные Профиль и Баланс (mock-ЮKassa). Route-level code-splitting (React Flow вынесен с публичного лендинга; initial bundle 597→326 kB / gzip 167→98.6). Пасы по a11y, консистентности и адаптиву (desktop + 390). Пакет handoff-документов, DEPLOY.md, vercel.json.
- **`12b2f66` — Patch: review fixes.** Исправлены 5 подтверждённых находок adversarial-ревью: DemoTour re-navigation trap (нестабильный `useNavigate` в deps), Modal focus-эффект на каждый ре-рендер (нестабильный `onClose`), merge/partialize для agents/agentTools/teams (флагманская команда гарантированно существует), Suspense внутри layout’ов (шелл не мигает при lazy-загрузке), первый шаг тура ведёт на отдельный экран.

### Что реально / что mock

- **Реально:** продуктовая модель и связи (проекты, Canvas-граф, сущности, команды с human approval, происхождение, история, чекпоинты), персист в localStorage, восстановление после reload.
- **Mock:** генерация и работа агентов (таймеры + демо-пул картинок), кредиты (клиентское число), оплата ЮKassa, отсутствие auth/бэкенда.

### v0.1 состав (frozen scope)

Workspace · Projects · Canvas · Assets · Avatar/Voice/Style/Location · Agents · Agent Teams · Human Approval · Project Memory · Asset Lineage · Project History · Checkpoints · базовые Profile/Credits · публичный лендинг.

**Не входит в v0.1** (честные future-страницы): каталог моделей, страницы моделей, Music & Clip Studio, Telegram, реальные платежи, teams/collaboration, международная локализация, сложная мобильная Canvas-редактура.

Подробности и контракты для продакшна — в [`docs/handoff/`](docs/handoff/). Деплой — [`DEPLOY.md`](DEPLOY.md).
