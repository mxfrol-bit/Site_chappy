# 04. Контракты бэкенда (предлагаемые)

> **Статус: черновик, выведенный из прототипа.** Chappy Web v0.1 — фронтенд-прототип без бэкенда. Все данные — mock/seed в `localStorage` через `zustand/persist` (`src/store/useStore.ts`, ключ `chappy_v01_store`, `version: 4`). Ни одного реального сетевого вызова, ключей провайдеров, платежей и авторизации в коде нет. Ниже — **предложение** REST-контрактов, реконструированных из действий стора и трёх сервисных модулей (`services/generation.ts`, `features/agents/orchestration.ts`, `features/agents/agentContext.ts`) и типов (`src/types/index.ts`). Это отправная точка для продовой команды, а не финальная спецификация: имена полей намеренно совпадают с типами фронтенда, чтобы упростить интеграцию.

Прототип уже спроектирован под замену: сервисы генерации и оркестрации агентов инкапсулированы за интерфейсами (`runGeneration`, `startRun/cancelRun/...`) с явным комментарием «swap this module for a real job/poll backend later; keep the exported API». Контракты ниже — это то, что должно встать за эти интерфейсы.

---

## 0. Общие соглашения

**База.** `https://api.chappy.example/v1`. JSON везде (`Content-Type: application/json`), кроме загрузки медиа (см. §14 Storage).

**Авторизация.** `Authorization: Bearer <access_token>` на всех эндпоинтах, кроме публичных (`/auth/*`, каталог моделей/трендов). Все ресурсы скоупятся текущим пользователем/воркспейсом на сервере.

**RBAC (важно).** В прототипе списание кредитов и оценка стоимости считаются на клиенте (`spend()` в сторе, `costForModality()`). В проде это **обязано** проверяться и пересчитываться на сервере: клиентская `cost` — только подсказка для UI. Проверка владения проектом/ассетом/сущностью — на каждом мутирующем запросе. Роли на будущее: `owner`, `editor`, `viewer` (в прототипе один демо-пользователь `demoUser`, роли отсутствуют).

**Идемпотентность.** Все создающие ресурс или списывающие кредиты запросы (`POST` проектов, ассетов, generation jobs, agent runs, топ-ап, checkpoint) должны принимать заголовок `Idempotency-Key: <uuid>` и возвращать тот же результат при повторе. Особенно критично для §7 (двойное списание кредитов) и §13.

**Формат ответа.** Одиночный ресурс — объект напрямую; коллекции — `{ "items": [...], "nextCursor": "..." | null }`. Ошибки: `{ "error": { "code": "insufficient_credits", "message": "...", "details": {...} } }` + корректный HTTP-статус (`400/401/403/404/409/422/429`).

**Время и id.** `id` — строки (в прототипе префиксные: `pr-`, `as-`, `av-`, `run-`, `cp-`, `out-`, `att-`, `act-`, `mem-`, `team-`). Даты создания часто в формате `YYYY-MM-DD` (`now()`), а логи/таймстемпы шагов — полный ISO (`nowISO()`); в проде рекомендуется везде полный ISO-8601 UTC.

---

## 1. Аутентификация (authentication)

В прототипе аутентификации нет: `/login` и `/signup` — заглушки «Продолжить как демо-пользователь» (`App.tsx`), а профиль — статический `demoUser` (`data/account.ts`). Предлагаемый минимум:

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/auth/register` | Регистрация (email + пароль или OAuth) |
| `POST` | `/auth/login` | Логин, выдача пары токенов |
| `POST` | `/auth/refresh` | Обновление `access_token` по `refresh_token` |
| `POST` | `/auth/logout` | Отзыв refresh-токена |
| `GET` | `/me` | Текущий пользователь + баланс/квоты |

**`GET /me` → маппинг на `User`:** `id, name, handle, avatar, plan, credits, storageUsedMb, storageTotalMb, since`. Поле `credits` и `storageUsed/Total` — это агрегаты, считаемые сервером (не хранятся на клиенте как истина).

**Заметки.** Ввод паролей/токенов — вне зоны Claude; регистрация/OAuth — стандартный серверный флоу. Токены — короткоживущий access (JWT) + ротируемый refresh. Rate-limit на `/auth/login`.

---

## 2. Проекты (projects)

Из действий стора: `createProject, updateProject, deleteProject, duplicateProject, archiveProject, getProject`.

| Метод | Путь | Действие стора |
|---|---|---|
| `GET` | `/projects` | список (пагинация, фильтр `status`) |
| `POST` | `/projects` | `createProject` |
| `GET` | `/projects/{id}` | `getProject` |
| `PATCH` | `/projects/{id}` | `updateProject` |
| `POST` | `/projects/{id}/duplicate` | `duplicateProject` |
| `POST` | `/projects/{id}/archive` | `archiveProject` (→ `status: 'archived'`) |
| `DELETE` | `/projects/{id}` | `deleteProject` |

**`POST /projects` — запрос:** `{ name, type?, description?, cover? }` где `type ∈ ProjectType (image|video|audio|mixed|content)`, по умолчанию `mixed`.
**Ответ → `Project`:** `id, name, type, description?, cover?, status ('active'|'draft'|'archived'), createdAt, updatedAt, avatars?: ID[], assetCount, canvas?: CanvasGraph`.

**Заметки.** `assetCount` — производное поле, инкрементируется сервером при добавлении ассета (в прототипе это делает `addAsset`). `createProject` в прототипе побочно пишет `ActivityEvent` `project.created` — сервер должен так же атомарно логировать активность (§10). `DELETE` — это жёсткое удаление в прототипе; в проде предпочтительно soft-delete/архив (жёсткое удаление данных — необратимая операция, требует явного подтверждения владельца).

---

## 3. Canvas — граф проекта (save/load)

`saveCanvas(projectId, canvas)` кладёт `CanvasGraph` в `project.canvas`; загрузка — через `getProject`. Граф сериализуется целиком (React Flow).

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/projects/{id}/canvas` | загрузить граф |
| `PUT` | `/projects/{id}/canvas` | `saveCanvas` (полная замена) |

**Тело `PUT` → `CanvasGraph`:** `{ version, projectId, updatedAt, viewport: {x,y,zoom}, nodes: CanvasNode[], edges: CanvasEdge[] }`.
- `CanvasNode`: `{ id, type ('block'), position:{x,y}, data: CanvasNodeData }`.
- `CanvasNodeData`: `{ type: CanvasBlockType, title?, text?, modelId?, prompt?, status?: GenStatus, result?, assetId?, recipe?, entityId?, agentId?, error?, ... }`. `CanvasBlockType ∈ idea|text|source|model|llm|image|video|audio|avatar|voice|style|location|agent|export`.
- `CanvasEdge`: `{ id, source, target }`.

**Заметки.** Прототип сохраняет граф целиком по каждому изменению. В проде рекомендуется: (а) оптимистическая блокировка по `version`/`updatedAt` (ответ `409` при конфликте на многопользовательском редактировании); (б) опционально — патч-операции по узлам вместо полной замены, если graf станет большим. Активности `canvas.node_added/deleted/connected` (тип `ActivityType`) в прототипе объявлены, но пишутся через общий `recordActivity` — сервер может генерировать их из диффа графа.

---

## 4. Ассеты (assets)

Действия: `addAsset, deriveAsset, updateAsset, archiveAsset, toggleFavorite, getAsset, getProjectAssets, addReferenceAsset`. Ассет — единица результата/медиа с богатой lineage-моделью.

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/assets?projectId=&kind=&status=&favorite=` | `getProjectAssets` / библиотека |
| `POST` | `/assets` | `addAsset` (ручное/загрузка/референс) |
| `GET` | `/assets/{id}` | `getAsset` |
| `PATCH` | `/assets/{id}` | `updateAsset` / `toggleFavorite` (`favorite`) |
| `POST` | `/assets/{id}/derive` | `deriveAsset` |
| `POST` | `/assets/{id}/archive` | `archiveAsset` (→ `status:'archived'`) |

**`POST /assets` — ключевые поля (из `addAsset`):** `kind: AssetKind (image|video|audio|document|text)`, `title`, `description?`, `cover?`, `url?`, `projectId?`, `recipe?: GenerationRecipe`, `source?: AssetSource (generation|agent|upload|reference|demo)` (по умолч. `generation`), `status?: AssetStatus (processing|ready|failed|archived)` (по умолч. `ready`), `modelId?`, `providerId?`, `generationJobId?`, `agentRunId?`, `canvasNodeId?`, `parentAssetIds?`, `derivedFromAssetId?`, `derivationType?: DerivationType`, `entityIds?`, `tags?`.
Медиа-метаданные из типа `Asset` (сервер заполняет при обработке): `mimeType, width, height, duration, sizeBytes`.

**`POST /assets/{id}/derive` — из `deriveAsset`:** `{ derivationType: DerivationType (variation|edit|upscale|animate|extend|remix|agent_output), title?, cover?, kind?, recipe?, modelId?, projectId?, canvasNodeId? }`. Сервер копирует lineage: `derivedFromAssetId = {id}`, `parentAssetIds=[{id}]`, наследует `entityIds` и (для `animate`) выставляет `kind:'video'`.

**`GenerationRecipe` (воспроизводимость генерации):** `{ model, prompt, params?, avatarId?, voiceId?, styleId?, locationId?, modelId?, referenceAssetIds?, cost, date, prevStep? }`.

**Заметки.** `addAsset` c `projectId` побочно инкрементирует `project.assetCount` и пишет `asset.created`/`asset.derived` в активность — сервер делает это атомарно. `providerId` в прототипе не заполнен, но по данным моделей соответствует `Model.company` (Black Forest Labs, Kuaishou, Suno, …). Реальные бинарники — не в этих полях, а в object storage (§14); `url`/`cover` — ссылки на них.

---

## 5. Сущности: avatar / voice / style / location (entities)

Переиспользуемые сущности, отдельные от ассетов. Действия: `createAvatar/updateAvatar/archiveAvatar/attachAvatarToProject`, `createVoice/createStyle/createLocation`, геттеры.

| Метод | Путь | Действие |
|---|---|---|
| `GET/POST` | `/avatars` | список / `createAvatar` |
| `GET/PATCH` | `/avatars/{id}` | `getAvatar` / `updateAvatar` |
| `POST` | `/avatars/{id}/archive` | `archiveAvatar` |
| `POST` | `/avatars/{id}/attach` | `attachAvatarToProject` `{ projectId }` |
| `GET/POST` | `/voices`, `/voices/{id}` | `createVoice` / `getVoice` |
| `GET/POST` | `/styles`, `/styles/{id}` | `createStyle` / `getStyle` |
| `GET/POST` | `/locations`, `/locations/{id}` | `createLocation` / `getLocation` |

**`Avatar`:** `{ id, name, description, referenceAssetIds: string[], coverAssetId?, voiceId?, defaultStyleId?, defaultLocationId?, tags: string[], usedInProjectIds: string[], status: EntityStatus (draft|ready|archived), createdAt, updatedAt }`.
**`Voice`:** `{ id, name, language, genderPresentation?, tone, previewUrl?, providerModelId?, ... }`.
**`Style`:** `{ id, name, description, previewAssetIds: string[], promptFragment?, palette?, ... }`.
**`Location`:** `{ id, name, description, referenceAssetIds: string[], lighting?, environment?, promptFragment?, ... }`.

**Заметки.** Создание любой сущности пишет активность `entity.created` (`entityType ∈ avatar|voice|style|location`). `attachAvatarToProject` двусторонне: добавляет `projectId` в `avatar.usedInProjectIds` **и** `avatarId` в `project.avatars` (сервер — в одной транзакции, идемпотентно: повторный attach не дублирует). Эти сущности собираются в контекст запусков агентов (§8, `agentContext.ts`).

---

## 6. Задания генерации (generation jobs — async: create → poll/stream → result)

Ядро продукта. В прототипе — `services/generation.ts`: `runGeneration(input, handlers)` эмулирует `queued → generating → success|error` таймерами и возвращает `{ cancel }`. Персистентный след — `GenerationAttempt` (`recordAttempt/updateAttempt`), это, по сути, лог заданий. Стоимость — `costForModality`: `video=35, audio=12, chat=2, image/др.=6`.

| Метод | Путь | Действие |
|---|---|---|
| `POST` | `/generations` | создать задание (списать/захолдить кредиты) |
| `GET` | `/generations/{id}` | polling статуса |
| `GET` | `/generations/{id}/events` | стрим (SSE) статуса/прогресса |
| `POST` | `/generations/{id}/cancel` | отмена (job `cancel()`) |
| `GET` | `/generations?projectId=` | `getProjectAttempts` (лог) |

**`POST /generations` — запрос (из `GenerationInput` + `recordAttempt`):** `{ projectId, modelId, prompt, modality, params?: Record<string,string>, inputAssetIds?: string[], entityIds?: string[], context?: string, cost }`. Поле `cost` — клиентская подсказка; **сервер пересчитывает** по модели/модальности и проверяет баланс.
**Ответ → `GenerationAttempt`:** `{ id, projectId, modelId, prompt, params?, inputAssetIds, entityIds, cost, status: AttemptStatus (queued|running|success|failed|cancelled), assetId?, error?, createdAt, completedAt? }`.

**Стрим/поллинг → статусы `GenStatus` (idle|queued|generating|success|error):** событие `{ status, progress?, message? }`. По завершении `success` — `{ status:'success', asset: Asset, recipe: GenerationRecipe }` (в прототипе результат `{ url, recipe }`, где `url` из демо-пула; в проде — готовый `Asset` с ссылкой на storage).

**Кредиты и возврат (credits/refund).** Прототип списывает кредиты клиентски **до** запуска (`spend()`), возврата при ошибке нет. Предлагаемый серверный флоу:
1. `POST /generations` — атомарно: пересчёт стоимости → проверка баланса (`insufficient_credits` → `402/400`) → **hold** кредитов → запись `spend` в леджер (§13) → постановка в очередь. Требует `Idempotency-Key`.
2. Терминальный `success` → финализировать списание, создать `Asset` (`source:'generation'`, `generationJobId={id}`), активности `generation.completed` + `asset.created`.
3. Терминальный `failed`/`cancelled` → **вернуть** захолженные кредиты (`kind:'topup'`/`refund` в леджер) + активность `generation.failed`.

**Заметки.** Ошибочная ветка прототипа даёт ~8% случайных ошибок и ошибку на пустом промпте — на проде эквивалент: валидация входа (`422` на пустой prompt) + проброс ошибки провайдера в `attempt.error`. Идемпотентность обязательна, чтобы ретрай сети не списал кредиты дважды.

---

## 7. Запуски агентов (agent runs)

Из `orchestration.ts` + `agentContext.ts` + стор (`createRun, updateRun, updateStep, getRun, getProjectRuns`). Команда агентов выполняет пошаговый (sequential) пайплайн `researcher → writer → director → prompt → qa` с ручным утверждением в конце.

| Метод | Путь | Действие |
|---|---|---|
| `POST` | `/agent-runs` | `createRun` (status `draft`) |
| `POST` | `/agent-runs/{id}/start` | `startRun` (`draft`→`queued`→`running`) |
| `GET` | `/agent-runs/{id}` | `getRun` |
| `GET` | `/agent-runs/{id}/events` | SSE-стрим шагов |
| `POST` | `/agent-runs/{id}/cancel` | `cancelRun` (→ `cancelled`) |
| `POST` | `/agent-runs/{id}/steps/{stepId}/retry` | `retryStep` |
| `POST` | `/agent-runs/{id}/revise` | `requestRevision` (откат к шагу writer) |
| `POST` | `/agent-runs/{id}/approve` | `approveRun` (→ создаёт Asset + checkpoint) |
| `GET` | `/agent-runs?projectId=` | `getProjectRuns` |

**`POST /agent-runs` — запрос (из `createRun`):** `{ projectId, teamId?, agentId?, task, context: AgentRunContext, canvasNodeId? }`.
**`AgentRunContext`:** `{ task, projectId, ideaText?, avatarId?, styleId?, locationId?, assetIds?, modelId?, canvasBlockIds? }` — на канвасе собирается из входящих рёбер (`resolveAgentContextFromCanvas`), плюс подмешивается память проекта (`summarizeRunContext`).
**Ответ → `AgentRun`:** `{ id, projectId, canvasNodeId?, teamId?, agentId?, task, inputContext, status: RunStatus (draft|queued|running|waiting_approval|completed|failed|cancelled), currentStepIndex, steps: AgentRunStep[], estimatedCost, actualMockCost, finalOutputId?, createdAt, updatedAt, completedAt? }`. Шаги строятся из состава команды; `estimatedCost = steps*6 + 8` (на проде — реальная смета).

**`AgentRunStep` (стрим по шагам):** `{ id, agentId, position, title, status: StepStatus (pending|running|waiting_approval|completed|failed|skipped), inputSummary, outputSummary?, outputData?: Record<string,unknown>, startedAt?, completedAt?, error?, retryCount, handoffToAgentId? }`. SSE-событие — обновлённый шаг (аналог `updateStep`); UI никогда сам не гонит таймеры («UI never drives them»).

**`POST /approve` (из `approveRun`).** Разрешён только при `status:'waiting_approval'`. Сервер: берёт `recipe` из шага `prompt` (`outputData.recipe`), создаёт финальный `Asset` (`source:'agent'`, `derivationType:'agent_output'`, `agentRunId`, `entityIds` из recipe), выставляет `run.finalOutputId` и `status:'completed'`, пишет активность `agent_run.approved` и **автоматически создаёт checkpoint** (`reason:'approved_output'`). Всё — одной транзакцией.

**Заметки.** `retryStep(stepIndex)` сбрасывает все шаги начиная с указанного (инкремент `retryCount` на целевом) и перезапускает пайплайн. `requestRevision` = retry с шага writer (`index = min(1, steps-1)`). Отмена/ошибка шага (`agent_run.failed`) должны учитываться в кредитах так же, как §6. `estimatedCost/actualMockCost` в проде заменяются реальным списанием за LLM/генерации внутри run.

Справочные (в основном read-only на первом этапе, seed в `data/agents.ts`): `GET /agents`, `PATCH /agents/{id}` (`updateAgent`); `GET /agent-tools`; teams: `GET/POST /teams`, `PATCH/DELETE /teams/{id}` (`createTeam/updateTeam/deleteTeam`). **`Agent`:** `{ id, name, emoji, role, description, systemInstructions, capabilities, toolIds, defaultModelId?, memoryPolicy: AgentMemoryPolicy (project|agent|none), status: AgentStatus }`. **`AgentTeam`:** `{ id, name, description, memberIds, coordinatorId?, executionMode (sequential|parallel), approvalRequired, ... }`.

---

## 8. Память (memory)

`addMemory, updateMemory, deleteMemory, getProjectMemory`. Влияет на контекст агентов (`summarizeRunContext` берёт незаблокированные записи).

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/memory?projectId=&scope=` | `getProjectMemory` |
| `POST` | `/memory` | `addMemory` |
| `PATCH` | `/memory/{id}` | `updateMemory` (в т.ч. `disabled` toggle) |
| `DELETE` | `/memory/{id}` | `deleteMemory` |

**`POST /memory`:** `{ projectId, title, content, sourceRunId? }` → **`AgentMemoryEntry`** `{ id, scope: MemoryScope (agent|project), agentId?, projectId?, title, content, sourceRunId?, editable, disabled?, createdAt, updatedAt }`. По умолчанию `scope:'project'`, `editable:true`.

**Заметки.** Создание/редактирование пишет активность `memory.updated`. Поле `disabled` — «выключить из контекста, не удаляя». `scope:'agent'` (глобальная память агента) в прототипе присутствует в типах и seed, но UI-действия создают только `project`-память.

---

## 9. История активности (history / activity)

`recordActivity, getProjectActivity`. Иммутабельный лог — источник ленты активности и провенанса.

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/projects/{id}/activity` | `getProjectActivity` (сортировка по `createdAt` desc) |

**`ActivityEvent`:** `{ id, projectId?, actorType: ActivityActor (user|agent|system), actorId?, type: ActivityType, title, description?, entityType?, entityId?, assetId?, agentRunId?, canvasNodeId?, metadata?: Record<string,unknown>, createdAt (полный ISO) }`.
**`ActivityType`:** `project.created|project.updated | canvas.node_added|canvas.node_deleted|canvas.connected | generation.started|generation.completed|generation.failed | asset.created|asset.derived|asset.archived | entity.created | agent_run.started|agent_run.approved|agent_run.failed | memory.updated | checkpoint.created|checkpoint.restored | project_output.approved`.

**Заметки.** Клиент активность **не пишет напрямую** — она порождается как побочный эффект доменных операций (создание проекта/ассета/сущности, approve, checkpoint, memory). На сервере это должно быть частью тех же транзакций (append-only), а не отдельным публичным `POST`. Записи иммутабельны (нет update/delete).

---

## 10. Контрольные точки (checkpoints — create/restore/fork)

`createCheckpoint, restoreCheckpoint, forkProjectFromCheckpoint, getProjectCheckpoints`. Снимок состояния проекта (canvas + ссылки на ассеты/сущности/runs).

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/projects/{id}/checkpoints` | `getProjectCheckpoints` |
| `POST` | `/projects/{id}/checkpoints` | `createCheckpoint` |
| `POST` | `/checkpoints/{id}/restore` | `restoreCheckpoint` |
| `POST` | `/checkpoints/{id}/fork` | `forkProjectFromCheckpoint` `{ name? }` |

**`POST checkpoints` — запрос:** `{ title, description?, reason?: CheckpointReason, createdBy? }`.
**Ответ → `ProjectCheckpoint`:** `{ id, projectId, title, description?, canvasSnapshot: CanvasGraph|null, assetIds: string[], entityIds: string[], agentRunIds: string[], createdBy, createdAt, reason: CheckpointReason (automatic|manual|before_restore|approved_output) }`. Снимок канваса — глубокая копия `project.canvas`; `assetIds` — все ассеты проекта на момент снимка; `entityIds` = `project.avatars`.

**`restore` (важная безопасная семантика).** Прототип **перед** восстановлением автоматически создаёт checkpoint текущего состояния (`reason:'before_restore'`) — restore недеструктивен — затем накатывает `canvasSnapshot` в проект и пишет `checkpoint.restored`. Сервер должен воспроизвести это: снимок-до → применение снимка → лог.
**`fork`.** Создаёт новый проект-ветку из снимка (копирует canvas в новый проект), логирует как ответвление. Возвращает новый `Project`.

**Заметки.** В прототипе restore накатывает только `canvasSnapshot` (не «отматывает» ассеты) — в проде решите политику: снимок должен быть достаточным для полного отката (версионирование ассетов/сущностей по ссылкам в `assetIds/entityIds/agentRunIds`).

---

## 11. Итоговые результаты проекта (outputs)

`setProjectOutput, updateOutput, getProjectOutputs`. «Назначенный результат» проекта (утверждённый ассет или текст).

| Метод | Путь | Действие |
|---|---|---|
| `GET` | `/projects/{id}/outputs` | `getProjectOutputs` |
| `POST` | `/projects/{id}/outputs` | `setProjectOutput` |
| `PATCH` | `/outputs/{id}` | `updateOutput` (напр. смена `status`) |

**`POST outputs`:** `{ title, type: ProjectOutputType (image|video|audio|script|document|other), assetId?, textContent?, approvedFromAgentRunId?, status?: ProjectOutputStatus (draft|approved|final|archived) }` (по умолч. `approved`).
**Ответ → `ProjectOutput`:** `{ id, projectId, assetId?, textContent?, title, type, status, approvedFromAgentRunId?, createdAt, updatedAt }`. Создание пишет активность `project_output.approved`.

---

## 12. Биллинг: ЮKassa + леджер кредитов (billing)

Прототип: экран `Balance.tsx` — демо-оплата через ЮKassa (модалка «данные карты не запрашиваются, списание не выполняется»). Леджер — `transactions: Transaction[]`, действия `spend(amount,label)` (проверка баланса) и `addCredits(amount,label)`. Тарифы/пакеты — `data/plans.ts` (помечены «предварительные, не финальные»).

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/billing/plans` | тарифы (`Plan[]`) |
| `GET` | `/billing/packages` | пакеты кредитов (`CreditPackage[]`) |
| `GET` | `/billing/balance` | текущий баланс кредитов |
| `GET` | `/billing/transactions` | леджер (`Transaction[]`) |
| `POST` | `/billing/checkout` | создать платёж в ЮKassa (топ-ап пакета/подписка) |
| `POST` | `/billing/webhook/yookassa` | вебхук ЮKassa (`payment.succeeded/canceled`) |
| `POST` | `/billing/subscription` | оформить/сменить подписку (план) |

**`Plan`:** `{ id, name, priceRub, period:'mo', credits, features: string[], highlighted? }` (Free/Старт/Оптимальный/Про/Студия). **`CreditPackage`:** `{ id, priceRub, credits, bonus? }`.
**`Transaction` (леджер):** `{ id, date, label, amount (кредиты, +/-), kind: TxKind (topup|spend|bonus) }`. `spend` — отрицательный `amount` с проверкой `credits >= amount`; `addCredits`/`topup`/`bonus` — положительный.

**Флоу оплаты (проектируемый).**
1. `POST /billing/checkout { packageId | planId }` (с `Idempotency-Key`) → сервер создаёт платёж в ЮKassa, возвращает `{ confirmationUrl }`. **Кредиты не начисляются на этом шаге.**
2. Редирект пользователя на ЮKassa (реальные платёжные данные — только на стороне ЮKassa; сервер и клиент карту не видят).
3. `POST /billing/webhook/yookassa` (`payment.succeeded`, проверка подписи вебхука) → идемпотентно (по `payment.id`) начисляет кредиты (`kind:'topup'`, запись в леджер) или активирует подписку.

**Заметки RBAC/безопасность.** Баланс и списания — **только серверная истина**; клиентский `spend()` из прототипа переносится на сервер (§6/§7 списывают через тот же леджер). Начисление кредитов происходит **исключительно по вебхуку**, не по возврату пользователя на success-URL. Реальные платёжные операции (списание/перевод средств) выполняет ЮKassa — их нельзя инициировать от имени пользователя без его явного согласия в интерфейсе ЮKassa.

---

## 13. Хранилище медиа (storage — object storage)

Прототип медиа не хранит: `Asset.url/cover` указывают на статические демо-картинки (`DEMO_POOL`, `/trends/*`), загрузок нет. Для прода нужен object storage (S3-совместимый) с загрузкой по presigned URL.

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/uploads` | получить presigned URL для загрузки |
| `PUT` | `<presignedUrl>` | прямая загрузка бинарника в бакет |
| `POST` | `/assets` | зафиксировать загруженный файл как `Asset` (`source:'upload'`) |
| `GET` | `/assets/{id}/download` | выдать (presigned) ссылку на скачивание |

**`POST /uploads` — запрос:** `{ filename, mimeType, sizeBytes, purpose: 'asset'|'reference'|'avatar_ref'|'voice_preview' }` → `{ uploadUrl, storageKey, expiresAt }`.
**После загрузки** клиент вызывает `POST /assets` со `storageKey`; сервер заполняет медиа-метаданные `Asset`: `mimeType, width, height, duration, sizeBytes`, а `url/cover` — на CDN/бакет.

**Заметки.** Референсы аватара/локации (`referenceAssetIds`, `previewAssetIds`) и превью голоса (`Voice.previewUrl`) хранятся так же. Квоты — из `User.storageUsedMb/storageTotalMb` (сервер считает по бакету пользователя, `429/402` при превышении). Результаты генераций (§6) провайдер отдаёт по временным ссылкам — сервер должен копировать их в собственный storage, а не проксировать чужие URL. Загрузка исполняемых/недоверенных файлов — запрещать по `mimeType`.

---

## Сводка: имена типов ↔ ресурсы

| Тип фронтенда (`src/types/index.ts`) | Ресурс |
|---|---|
| `Project`, `CanvasGraph` | §2 projects, §3 canvas |
| `Asset`, `GenerationRecipe`, `DerivationType` | §4 assets, §13 storage |
| `Avatar`, `Voice`, `Style`, `Location` | §5 entities |
| `GenerationAttempt`, `GenStatus`, `AttemptStatus` | §6 generation jobs |
| `AgentRun`, `AgentRunStep`, `AgentRunContext`, `Agent`, `AgentTeam`, `RunStatus`, `StepStatus` | §7 agent runs |
| `AgentMemoryEntry` | §8 memory |
| `ActivityEvent`, `ActivityType` | §9 activity |
| `ProjectCheckpoint`, `CheckpointReason` | §10 checkpoints |
| `ProjectOutput` | §11 outputs |
| `Plan`, `CreditPackage`, `Transaction`, `User` | §12 billing, §1 auth |

**Источники (прочитаны в прототипе):** `src/store/useStore.ts`, `src/services/generation.ts`, `src/features/agents/orchestration.ts`, `src/features/agents/agentContext.ts`, `src/types/index.ts`, `src/data/plans.ts`, `src/pages/app/Balance.tsx`, `src/data/account.ts`.
