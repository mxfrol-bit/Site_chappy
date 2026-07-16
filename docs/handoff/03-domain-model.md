# 03 · Доменная модель

> **Frontend data model — прототип продуктового контракта, а не готовая production DB-схема.**
> Все типы ниже описаны в единственном файле `src/types/index.ts`. Это TypeScript-интерфейсы, по которым живут mock/seed-данные в `localStorage` (zustand persist). Здесь **нет** внешних ключей, каскадов, валидации, RLS и серверных ограничений — связи между сущностями держатся только на строковых `id`-полях и на дисциплине кода. При проектировании реальной БД используйте это как черновик контракта: имена и связи менять можно и нужно, ничего в этом файле не является нормативной схемой хранилища.

Единственный источник типов: `/Users/nutls/Downloads/chappy-web-prototype-v0.1/src/types/index.ts`.

---

## Общие соглашения

### Идентификаторы
`type ID = string` (строка 2). Все `id` — строки. Прототип генерирует их как `<префикс> + uid()` (короткий случайный суффикс), seed-данные используют читаемые стабильные id (например `n-k-agent`, `pr-kira`). Наблюдаемые в коде префиксы:

| Префикс | Сущность |
|---|---|
| `pr-` | Project |
| `as-` | Asset |
| `av-` | Avatar |
| `vo-` | Voice |
| `st-` | Style |
| `loc-` | Location |
| `team-` | AgentTeam |
| `run-` | AgentRun |
| `stp-` | AgentRunStep |
| `mem-` | AgentMemoryEntry |
| `act-` | ActivityEvent |
| `cp-` | ProjectCheckpoint |
| `out-` | ProjectOutput |
| `att-` | GenerationAttempt |
| `n-` | CanvasNode (внутри графа), `e-` — CanvasEdge |

Ключевой вывод для бэкенда: **все связи — это «мягкие» ссылки по id внутри одного клиента**. Ничто не гарантирует существование цели ссылки; консистентность в проде придётся обеспечивать на уровне БД.

### Временные метки
Почти везде `createdAt` / `updatedAt` — это строки. В большинстве сущностей это ISO-строки; у `ActivityEvent.createdAt` в комментарии кода прямо указано «full ISO for precise ordering» (строка 285) — событийный лог сортируется по этому полю.

### Модальности и статусы
Сквозной справочник модальностей: `type Modality = 'image' | 'video' | 'audio' | 'chat' | 'agent'` (строка 3). У большинства сущностей — собственные литеральные union-типы статусов (перечислены при каждой сущности ниже), это удобно копировать в enum-ы БД.

---

## Project — корневой контейнер

`Project` (строки 380–392) — верхнеуровневая единица работы. Всё остальное так или иначе привязано к проекту через `projectId`.

Важные поля:
- `type: ProjectType` — `'image' | 'video' | 'audio' | 'mixed' | 'content'`.
- `status: ProjectStatus` — `'active' | 'draft' | 'archived'`.
- `avatars?: ID[]` — список используемых аватаров (ссылки на `Avatar.id`).
- `assetCount: number` — денормализованный счётчик ассетов (в прототипе поддерживается вручную).
- `canvas?: CanvasGraph` — **встроенный** граф-холст проекта (не отдельная таблица, а вложенный объект).

Связи: Project 1→N Asset (`Asset.projectId`), 1→N AgentRun, ActivityEvent, ProjectCheckpoint, ProjectOutput, GenerationAttempt (все по `projectId`), 1→(0..1) CanvasGraph (вложен).

---

## Canvas: граф-холст (React Flow)

Холст сериализуется дословно в localStorage. Комментарий в коде: «Serializable graph shapes (persisted verbatim to localStorage)» (строка 356).

### CanvasGraph (строки 369–376)
- `version: number`, `projectId: ID`, `updatedAt: string`.
- `viewport: CanvasViewport` (`{ x, y, zoom }`, строка 368).
- `nodes: CanvasNode[]`, `edges: CanvasEdge[]`.

### CanvasNode (строки 357–362)
- `id: string`.
- `type: string` — тип узла для React Flow; в прототипе всегда один рендерер `'block'` (см. комментарий строки 359). Тип **блока** лежит не здесь, а в `data.type`.
- `position: { x, y }`.
- `data: CanvasNodeData`.

### CanvasNodeData (строки 340–354) — важное правило
`data` хранит **только идентификаторы и параметры генерации, а не сами объекты**. Ключевые поля: `type: CanvasBlockType`, `title`, `text`, `modelId`, `prompt`, `status: GenStatus`, `result`, `assetId`, `recipe`, `entityId`, `agentId`, `error`. Индексная сигнатура `[key: string]: unknown` разрешает произвольные доп. поля.

> **Правило проектирования:** узел не «содержит» ассет/аватар/агента — он ссылается на них через `assetId` / `entityId` / `agentId` / `modelId`. Сами сущности живут в отдельных коллекциях store. Это осознанный контракт: холст остаётся лёгким и сериализуемым, а разрешение ссылок происходит в UI.

- `CanvasBlockType` (строки 335–337): `'idea' | 'text' | 'source' | 'model' | 'llm' | 'image' | 'video' | 'audio' | 'avatar' | 'voice' | 'style' | 'location' | 'agent' | 'export'`.
- `GenStatus` (строка 339): `'idle' | 'queued' | 'generating' | 'success' | 'error'`.

### CanvasEdge (строки 363–367)
Максимально плоский: `{ id, source, target }` — только id узлов, без данных на рёбрах.

---

## Asset — центральная сущность контента и происхождения

`Asset` (строки 228–257) — любой сгенерированный/загруженный/референсный артефакт. Это ядро модели provenance (происхождения).

Базовые поля: `kind: AssetKind` (`'image' | 'video' | 'audio' | 'document' | 'text'`, строка 209), `title`, `description?`, `cover?`, `url?`, `projectId?`, метаданные файла (`mimeType`, `width`, `height`, `duration`, `sizeBytes`).

### Происхождение / деривация — читать внимательно
- `source?: AssetSource` — откуда ассет появился: `'generation' | 'agent' | 'upload' | 'reference' | 'demo'` (строка 224).
- `derivationType?: DerivationType` — как получен из родителя: `'variation' | 'edit' | 'upscale' | 'animate' | 'extend' | 'remix' | 'agent_output'` (строки 226–227).
- `parentAssetIds?: string[]` — **множественные** входные ассеты (например, ремикс из нескольких кадров). Граф происхождения, N→1.
- `derivedFromAssetId?: string` — **основной** родитель (единичная ссылка). Пара `derivedFromAssetId` + `parentAssetIds` даёт и «главную линию», и полный набор источников.
- `recipe?: GenerationRecipe` — снимок параметров генерации (см. ниже).
- `entityIds?: string[]` — какие переиспользуемые сущности (Avatar/Voice/Style/Location) участвовали в создании ассета.
- `agentRunId?: string` — если ассет произведён прогоном агента, ссылка на `AgentRun.id`.
- `canvasNodeId?: string` — узел холста, из которого ассет сгенерирован (обратная связь ассет→узел).
- `modelId?`, `providerId?`, `generationJobId?` — привязка к модели/провайдеру/задаче генерации.

Прочее: `tags?`, `favorite?`, `status?: AssetStatus` (`'processing' | 'ready' | 'failed' | 'archived'`, строка 225).

Связи Asset: N→1 Project; самоссылки для дерева деривации (`derivedFromAssetId`, `parentAssetIds`); N→N с переиспользуемыми сущностями (`entityIds`); ссылки на AgentRun и CanvasNode.

### GenerationRecipe (строки 210–223)
Встраиваемый (не отдельная сущность) снимок «как это было сгенерировано». Используется и в `Asset.recipe`, и в `CanvasNodeData.recipe`. Поля: `model: string`, `prompt: string`, `params?`, ссылки на сущности `avatarId` / `voiceId` / `styleId` / `locationId` / `modelId`, `referenceAssetIds?`, `cost: number`, `date: string`, `prevStep?` (текстовое описание предыдущего шага цепочки).

---

## Переиспользуемые сущности (Avatar / Voice / Style / Location)

Это персистентные, переиспользуемые между проектами сущности — принципиально отличаются от Asset. Комментарий в коде: «Persistent, reusable entities (distinct from Assets)» (строка 155). Общий статус: `EntityStatus = 'draft' | 'ready' | 'archived'` (строка 156).

> Историческое примечание: есть также обобщённый тип `SavedEntity` (строки 142–153) с `kind: 'avatar' | 'voice' | 'style' | 'location'`. Он выглядит как более ранняя/облегчённая версия того же понятия; актуальная модель — четыре отдельных интерфейса ниже. При переносе в прод уточните, какой из вариантов канонический.

### Avatar (строки 158–172)
- `referenceAssetIds: string[]` — референс-изображения (ссылки на Asset).
- `coverAssetId?` — обложка.
- `voiceId?`, `defaultStyleId?`, `defaultLocationId?` — предпочтительные связки с другими сущностями.
- `usedInProjectIds: string[]` — обратная связь: в каких проектах использован.
- `tags`, `status: EntityStatus`.

### Voice (строки 174–184)
`language`, `genderPresentation?`, `tone`, `previewUrl?`, `providerModelId?` (ссылка на модель TTS-провайдера).

### Style (строки 186–195)
`previewAssetIds: string[]`, `promptFragment?` (кусок промпта, подмешиваемый при генерации), `palette?`.

### Location (строки 197–207)
`referenceAssetIds: string[]`, `lighting?`, `environment?`, `promptFragment?`.

Связи: Avatar ссылается на Voice/Style/Location и на Asset-референсы; все четыре сущности переиспользуются во многих проектах и «всплывают» в `Asset.entityIds` и в `GenerationRecipe`.

---

## Агентная подсистема

### Agent (строки 37–51)
Определение ИИ-агента.
- `emoji` — используется как аватарка (комментарий строки 39).
- `systemInstructions`, `capabilities: string[]`.
- `toolIds: string[]` — ссылки на `AgentTool.id`.
- `defaultModelId?`.
- `memoryPolicy: AgentMemoryPolicy` — `'project' | 'agent' | 'none'` (строка 36): в какой области писать память.
- `status: AgentStatus` — `'available' | 'busy' | 'paused' | 'archived'` (строка 35).

### AgentTool (строки 55–63)
- `type: AgentToolType` — `'llm' | 'project_context' | 'asset_library' | 'model_generation' | 'mock_search' | 'quality_check'` (строки 53–54).
- `enabled: boolean`, `config?: Record<string, string>`.
- `isMock: boolean` — явный флаг, что инструмент замокан (в прототипе — все).

### AgentTeam (строки 66–76)
- `memberIds: string[]` (ссылки на Agent), `coordinatorId?`.
- `executionMode: ExecutionMode` — `'sequential' | 'parallel'` (строка 65).
- `approvalRequired: boolean`.

### AgentRun (строки 108–125) — один прогон
Экземпляр выполнения агента/команды в рамках проекта.
- `projectId`, опционально `canvasNodeId` (из какого узла запущен), `teamId?`, `agentId?` (командой или одиночным агентом).
- `task: string`, `inputContext: AgentRunContext`.
- `status: RunStatus` — `'draft' | 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'` (строка 107).
- `currentStepIndex: number`, `steps: AgentRunStep[]` — **шаги встроены в прогон** (не отдельная таблица).
- `estimatedCost`, `actualMockCost` — стоимость в кредитах (мок).
- `finalOutputId?` — ссылка на итоговый ProjectOutput/Asset.

### AgentRunContext (строки 78–88)
Входной контекст прогона: `task`, `projectId`, опц. `ideaText`, `avatarId`, `styleId`, `locationId`, `assetIds?`, `modelId`, `canvasBlockIds?` (какие блоки холста поданы на вход).

### AgentRunStep (строки 91–105)
Отдельный шаг прогона.
- `agentId`, `position: number`, `title`.
- `status: StepStatus` — `'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'skipped'` (строка 90).
- `inputSummary`, `outputSummary?`, `outputData?: Record<string, unknown>`.
- `retryCount`, `error?`, `handoffToAgentId?` — передача управления следующему агенту (реализация multi-agent-handoff).

### AgentMemoryEntry (строки 128–140)
Запись памяти агента.
- `scope: MemoryScope` — `'agent' | 'project'` (строка 127); в зависимости от scope заполнен `agentId?` **или** `projectId?`.
- `title`, `content`.
- `sourceRunId?` — из какого прогона извлечена память.
- `editable: boolean`, `disabled?: boolean` — пользователь может редактировать/отключать записи.

Связи агентной подсистемы: Agent N→N AgentTool (`toolIds`); AgentTeam N→N Agent (`memberIds`, `coordinatorId`); AgentRun N→1 Project/Team/Agent, содержит массив AgentRunStep; AgentMemoryEntry привязана к Agent или Project и опционально к породившему AgentRun.

---

## Provenance: лог, чекпоинты, выходы, попытки

Блок «Provenance: activity log, checkpoints, outputs, generation attempts» (строка 259).

### ActivityEvent (строки 271–286)
Единый событийный лог проекта.
- `actorType: ActivityActor` — `'user' | 'agent' | 'system'` (строка 260), `actorId?`.
- `type: ActivityType` — большой union из ~20 событий (строки 261–270): `project.*`, `canvas.*`, `generation.*`, `asset.*`, `entity.created`, `agent_run.*`, `memory.updated`, `checkpoint.*`, `project_output.approved`.
- Полиморфные ссылки на затронутый объект: `entityType?` + `entityId?`, `assetId?`, `agentRunId?`, `canvasNodeId?`, `metadata?`.
- `createdAt` — полный ISO для точной сортировки.

### ProjectCheckpoint (строки 289–301)
Снимок состояния проекта для отката.
- `canvasSnapshot: CanvasGraph | null` — **полная копия графа холста** на момент чекпоинта (не ссылка).
- `assetIds`, `entityIds`, `agentRunIds` — списки id, входящих в снимок.
- `reason: CheckpointReason` — `'automatic' | 'manual' | 'before_restore' | 'approved_output'` (строка 288).

### ProjectOutput (строки 305–316)
Утверждённый/финальный результат проекта.
- `assetId?` **или** `textContent?` — выход может быть ассетом или текстом.
- `type: ProjectOutputType` — `'image' | 'video' | 'audio' | 'script' | 'document' | 'other'` (строка 303).
- `status: ProjectOutputStatus` — `'draft' | 'approved' | 'final' | 'archived'` (строка 304).
- `approvedFromAgentRunId?` — из какого прогона утверждён.

### GenerationAttempt (строки 319–333)
Лог попытки генерации (мок-очередь).
- `modelId`, `assetId?` (результирующий ассет при успехе), `inputAssetIds: string[]`, `entityIds: string[]`, `prompt`, `params?`.
- `status: AttemptStatus` — `'queued' | 'running' | 'success' | 'failed' | 'cancelled'` (строка 318).
- `cost: number`, `error?`, `completedAt?`.

---

## Второстепенные типы (для полноты)

Не входят в запрошенное ядро, но объявлены в том же файле: `Model` (строки 7–22, каталог моделей), `Trend` (24–33), `Plan` / `CreditPackage` / `Transaction` (394–416, биллинг-мок), `User` (418–428), `WorkflowTemplate` (430–435, шаблоны холста).

---

## Персистентность (zustand persist → localStorage)

Конфигурация в `/Users/nutls/Downloads/chappy-web-prototype-v0.1/src/store/useStore.ts` (строки 489–525):

- **Хранилище:** `createJSONStorage(() => localStorage)`. Ключ localStorage — **`chappy_v01_store`** (строка 490).
- **`version: 4`** (строка 491). `migrate` тривиальна — просто приводит тип (строка 493), реального версионирования схемы нет.
- **`partialize`** (строки 519–524) — что сохраняется: `projects`, `assets`, `credits`, `transactions`, `avatars`, `voices`, `styles`, `locations`, `agents`, `teams`, `runs`, `memory`, `activity`, `checkpoints`, `outputs`, `attempts`. (Заметьте: `agentTools` в persist не попадает — инструменты живут только в seed.)
- **`merge` — инъекция seed по id** (строки 494–518): при гидратации персиста для каждой коллекции выполняется `byId(base, seed)` — берётся сохранённое состояние, и seed-элементы добавляются **только если их id ещё нет**. Комментарий кода: «persisted wins by id; seed items are injected only when absent» (строки 496–497). Практический смысл: правки пользователя сохраняются, но флагманское демо (аватар «Кира» и вся её линия происхождения: `demoProject`, `kiraAvatar/Voice/Style/Location`, `demoRun`, `demoMemoryKira`, `demoActivityKira`, `demoCheckpointKira`, `demoOutputKira`, `seedExtraAssets`) гарантированно всегда присутствует.
- **`resetDemo`** (строка 487) — полный сброс всех коллекций обратно к seed.

> Для прода: механика «seed-инъекции по id» — это способ прототипа держать демо-данные живыми поверх пользовательских правок. В реальной системе это заменяется на нормальные фикстуры/сиды БД и миграции; текущий `version: 4` + пустой `migrate` не является стратегией миграции данных.
