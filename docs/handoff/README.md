# Chappy Web v0.1 — Developer Handoff

Пакет документов для разработчика, который будет строить продакшн-версию из этого фронтенд-прототипа.

> **Важно:** это интерактивный фронтенд-прототип. Бэкенда, реальных платежей и API-ключей нет; все данные mock и живут в `localStorage` (zustand persist, ключ `chappy_v01_store`, version 4). Фронтенд-модель данных — прототип продуктового контракта, а не готовая production DB-схема.

## Документы

1. [01 · Обзор продукта](01-product-overview.md) — что такое Chappy Web, отличие от Chappy Bot, аудитория, главный сценарий, состав v0.1, будущий scope.
2. [02 · Информационная архитектура](02-information-architecture.md) — публичный сайт, workspace, таблица маршрутов, сущности и связи.
3. [03 · Доменная модель](03-domain-model.md) — все типы (`src/types/index.ts`), поля, связи, id-конвенции, персист.
4. [04 · Бэкенд-контракты](04-backend-contracts.md) — предлагаемые REST-контракты по областям (auth, projects, assets, entities, canvas, generation jobs, agent runs, memory, history, checkpoints, outputs, billing, storage).
5. [05 · Приоритеты продакшна](05-production-priorities.md) — P0 / P1 / P2 с обоснованием и порядком.
6. [06 · Прототип vs продакшн](06-prototype-vs-production.md) — таблица: что работает, что mock, что переписать, что переиспользовать, риски.
7. [07 · Дизайн-хендофф](07-design-handoff.md) — токены, типографика, цвета, компоненты, layouts, брейкпоинты, UX-правила, visual debt.
8. [08 · Demo Script](08-demo-script.md) — сценарий живой демонстрации на 5–7 минут (13 шагов: куда нажать / что показать / что сказать / ценность / что mock).
9. [09 · Developer Start Brief](09-developer-start-brief.md) — первая production-цель, P0 scope, последовательность, что переиспользовать из Chappy Bot и прототипа, задачи на неделю, критерии готовности первой цепочки.

## Быстрый старт

```bash
npm install
npm run dev      # http://localhost:5210
```

Деплой — см. [../../DEPLOY.md](../../DEPLOY.md).

## Ключевые точки в коде

- Модель данных: `src/types/index.ts`
- Store (все действия + persist): `src/store/useStore.ts`
- Флагманский демо-проект «Кира»: `src/data/demoProject.ts`
- Canvas (React Flow): `src/features/canvas/`
- Мок-оркестрация агентов: `src/features/agents/orchestration.ts`
- Мок-генерация: `src/services/generation.ts`
- Происхождение ассетов: `src/features/history/lineage.ts`
- Дизайн-токены: `src/styles/tokens.css`, компоненты: `src/styles/components.css`
