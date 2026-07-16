import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Project, Transaction, CanvasGraph, ProjectType, Asset, Avatar, Voice, Style, Location,
  Agent, AgentTool, AgentTeam, AgentRun, AgentRunStep, AgentMemoryEntry, AgentRunContext,
  ActivityEvent, ActivityType, ActivityActor, ProjectCheckpoint, CheckpointReason,
  ProjectOutput, ProjectOutputType, ProjectOutputStatus, GenerationAttempt, AttemptStatus, DerivationType,
} from '../types';
import { seedProjects, demoTransactions, demoUser, demoAssets } from '../data/account';
import { seedAvatars, seedVoices, seedStyles, seedLocations, entityRefAssets } from '../data/entities';
import { agents as seedAgents, agentTools as seedTools, seedTeams, seedMemory } from '../data/agents';
import { demoLineageAssets, seedActivity, seedOutputs } from '../data/lineage';
import {
  demoProject, kiraAvatar, kiraVoice, kiraStyle, kiraLocation, kiraAssets,
  demoRun, demoMemoryKira, demoActivityKira, demoCheckpointKira, demoOutputKira,
} from '../data/demoProject';

// Flagship demo project «Кира» is composed on top of the base seeds so the workspace
// opens on a live, fully-populated project rather than empty state.
const seedAllProjects: Project[] = [demoProject, ...seedProjects];
const seedAllAvatars: Avatar[] = [kiraAvatar, ...seedAvatars];
const seedAllVoices: Voice[] = [kiraVoice, ...seedVoices];
const seedAllStyles: Style[] = [kiraStyle, ...seedStyles];
const seedAllLocations: Location[] = [kiraLocation, ...seedLocations];
const seedAllRuns: AgentRun[] = [demoRun];
const seedAllMemory: AgentMemoryEntry[] = [...demoMemoryKira, ...seedMemory];
const seedAllActivity: ActivityEvent[] = [...demoActivityKira, ...seedActivity];
const seedAllCheckpoints: ProjectCheckpoint[] = [demoCheckpointKira];
const seedAllOutputs: ProjectOutput[] = [demoOutputKira, ...seedOutputs];

// Seed assets injected on top of persisted state so demo lineage always exists.
const seedExtraAssets: Asset[] = [...entityRefAssets, ...demoLineageAssets, ...kiraAssets];
const initialAssets: Asset[] = [...kiraAssets, ...demoAssets, ...demoLineageAssets, ...entityRefAssets];

const TITLE_MAP: Record<string, string> = {
  researcher: 'Исследование и бриф', writer: 'Сценарий и hook',
  director: 'Визуальная концепция', prompt: 'Промпт и Generation Recipe', qa: 'Проверка качества',
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();

export interface Toast {
  id: string;
  text: string;
  kind: 'info' | 'success' | 'error';
}

interface StoreState {
  // persisted
  projects: Project[];
  assets: Asset[];
  avatars: Avatar[];
  voices: Voice[];
  styles: Style[];
  locations: Location[];
  agents: Agent[];
  agentTools: AgentTool[];
  teams: AgentTeam[];
  runs: AgentRun[];
  memory: AgentMemoryEntry[];
  activity: ActivityEvent[];
  checkpoints: ProjectCheckpoint[];
  outputs: ProjectOutput[];
  attempts: GenerationAttempt[];
  credits: number;
  transactions: Transaction[];
  // ephemeral
  toasts: Toast[];

  // projects
  createProject: (input: { name: string; type?: ProjectType; description?: string; cover?: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | undefined;
  archiveProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  saveCanvas: (id: string, canvas: CanvasGraph) => void;

  // assets
  addAsset: (input: {
    kind: Asset['kind']; title: string; description?: string; cover?: string; url?: string;
    projectId?: string; recipe?: Asset['recipe']; favorite?: boolean; source?: Asset['source'];
    status?: Asset['status']; modelId?: string; providerId?: string; generationJobId?: string;
    agentRunId?: string; canvasNodeId?: string; parentAssetIds?: string[]; derivedFromAssetId?: string;
    derivationType?: DerivationType; entityIds?: string[]; tags?: string[];
  }) => Asset;
  deriveAsset: (input: {
    fromAssetId: string; derivationType: DerivationType; title?: string; cover?: string;
    kind?: Asset['kind']; recipe?: Asset['recipe']; modelId?: string; projectId?: string;
    canvasNodeId?: string; source?: Asset['source'];
  }) => Asset | undefined;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  archiveAsset: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getProjectAssets: (projectId: string) => Asset[];
  getAsset: (id: string) => Asset | undefined;
  addReferenceAsset: (input: { cover: string; title?: string }) => Asset;

  // provenance: activity / checkpoints / outputs / attempts
  recordActivity: (input: {
    type: ActivityType; title: string; projectId?: string; actorType?: ActivityActor; actorId?: string;
    description?: string; entityType?: string; entityId?: string; assetId?: string; agentRunId?: string;
    canvasNodeId?: string; metadata?: Record<string, unknown>;
  }) => ActivityEvent;
  getProjectActivity: (projectId: string) => ActivityEvent[];
  recordAttempt: (input: {
    projectId: string; modelId: string; prompt: string; params?: Record<string, string>;
    inputAssetIds?: string[]; entityIds?: string[]; cost: number; status?: AttemptStatus;
  }) => GenerationAttempt;
  updateAttempt: (id: string, patch: Partial<GenerationAttempt>) => void;
  getProjectAttempts: (projectId: string) => GenerationAttempt[];
  createCheckpoint: (input: { projectId: string; title: string; description?: string; reason?: CheckpointReason; createdBy?: string }) => ProjectCheckpoint | undefined;
  restoreCheckpoint: (checkpointId: string) => ProjectCheckpoint | undefined;
  forkProjectFromCheckpoint: (checkpointId: string, name?: string) => Project | undefined;
  getProjectCheckpoints: (projectId: string) => ProjectCheckpoint[];
  setProjectOutput: (input: { projectId: string; assetId?: string; textContent?: string; title: string; type: ProjectOutputType; approvedFromAgentRunId?: string; status?: ProjectOutputStatus }) => ProjectOutput;
  updateOutput: (id: string, patch: Partial<ProjectOutput>) => void;
  getProjectOutputs: (projectId: string) => ProjectOutput[];

  // entities (reusable, distinct from assets)
  createAvatar: (input: Partial<Avatar> & { name: string }) => Avatar;
  updateAvatar: (id: string, patch: Partial<Avatar>) => void;
  archiveAvatar: (id: string) => void;
  getAvatar: (id: string) => Avatar | undefined;
  attachAvatarToProject: (avatarId: string, projectId: string) => void;
  createVoice: (input: Partial<Voice> & { name: string }) => Voice;
  createStyle: (input: Partial<Style> & { name: string }) => Style;
  createLocation: (input: Partial<Location> & { name: string }) => Location;
  getVoice: (id: string) => Voice | undefined;
  getStyle: (id: string) => Style | undefined;
  getLocation: (id: string) => Location | undefined;

  // agents / teams / runs / memory
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  getAgent: (id: string) => Agent | undefined;
  createTeam: (input: { name: string; memberIds: string[]; coordinatorId?: string; approvalRequired?: boolean; description?: string }) => AgentTeam;
  updateTeam: (id: string, patch: Partial<AgentTeam>) => void;
  deleteTeam: (id: string) => void;
  getTeam: (id: string) => AgentTeam | undefined;
  createRun: (input: { projectId: string; teamId?: string; agentId?: string; task: string; context: AgentRunContext; canvasNodeId?: string }) => AgentRun;
  updateRun: (id: string, patch: Partial<AgentRun>) => void;
  updateStep: (runId: string, stepId: string, patch: Partial<AgentRunStep>) => void;
  getRun: (id: string) => AgentRun | undefined;
  getProjectRuns: (projectId: string) => AgentRun[];
  addMemory: (input: { projectId: string; title: string; content: string; sourceRunId?: string }) => AgentMemoryEntry;
  updateMemory: (id: string, patch: Partial<AgentMemoryEntry>) => void;
  deleteMemory: (id: string) => void;
  getProjectMemory: (projectId: string) => AgentMemoryEntry[];

  // credits
  spend: (amount: number, label: string) => boolean;
  addCredits: (amount: number, label: string) => void;

  // ui
  toast: (text: string, kind?: Toast['kind']) => void;
  dismissToast: (id: string) => void;

  resetDemo: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      projects: seedAllProjects,
      assets: initialAssets,
      avatars: seedAllAvatars,
      voices: seedAllVoices,
      styles: seedAllStyles,
      locations: seedAllLocations,
      agents: seedAgents,
      agentTools: seedTools,
      teams: seedTeams,
      runs: seedAllRuns,
      memory: seedAllMemory,
      activity: seedAllActivity,
      checkpoints: seedAllCheckpoints,
      outputs: seedAllOutputs,
      attempts: [],
      credits: demoUser.credits,
      transactions: demoTransactions,
      toasts: [],

      createProject: (input) => {
        const p: Project = {
          id: 'pr-' + uid(),
          name: input.name || 'Новый проект',
          type: input.type ?? 'mixed',
          description: input.description,
          cover: input.cover,
          status: 'active',
          createdAt: now(),
          updatedAt: now(),
          assetCount: 0,
        };
        set((s) => ({ projects: [p, ...s.projects] }));
        get().recordActivity({ projectId: p.id, type: 'project.created', title: `Проект создан: ${p.name}` });
        return p;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)),
        })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return undefined;
        const copy: Project = { ...src, id: 'pr-' + uid(), name: src.name + ' (копия)', createdAt: now(), updatedAt: now() };
        set((s) => ({ projects: [copy, ...s.projects] }));
        return copy;
      },
      archiveProject: (id) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)) })),
      getProject: (id) => get().projects.find((p) => p.id === id),
      saveCanvas: (id, canvas) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, canvas, updatedAt: now() } : p)),
        })),

      addAsset: (input) => {
        const a: Asset = {
          id: 'as-' + uid(),
          kind: input.kind,
          title: input.title,
          description: input.description,
          cover: input.cover,
          url: input.url,
          projectId: input.projectId,
          recipe: input.recipe,
          favorite: input.favorite,
          source: input.source ?? 'generation',
          status: input.status ?? 'ready',
          modelId: input.modelId ?? input.recipe?.modelId,
          providerId: input.providerId,
          generationJobId: input.generationJobId,
          agentRunId: input.agentRunId,
          canvasNodeId: input.canvasNodeId,
          parentAssetIds: input.parentAssetIds,
          derivedFromAssetId: input.derivedFromAssetId,
          derivationType: input.derivationType,
          entityIds: input.entityIds,
          tags: input.tags,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({
          assets: [a, ...s.assets],
          projects: input.projectId
            ? s.projects.map((p) => (p.id === input.projectId ? { ...p, assetCount: p.assetCount + 1, updatedAt: now() } : p))
            : s.projects,
        }));
        if (input.projectId) {
          const derived = !!input.derivedFromAssetId;
          get().recordActivity({
            projectId: input.projectId,
            actorType: input.source === 'agent' ? 'agent' : 'user',
            type: derived ? 'asset.derived' : 'asset.created',
            title: derived ? `Создан результат (${input.derivationType ?? 'вариация'})` : `Создан результат «${input.title}»`,
            description: derived ? input.derivationType : input.source,
            assetId: a.id,
            agentRunId: input.agentRunId,
            canvasNodeId: input.canvasNodeId,
          });
        }
        return a;
      },
      deriveAsset: (input) => {
        const src = get().assets.find((a) => a.id === input.fromAssetId);
        if (!src) return undefined;
        return get().addAsset({
          kind: input.kind ?? (input.derivationType === 'animate' ? 'video' : src.kind),
          title: input.title ?? `${src.title} · ${input.derivationType}`,
          cover: input.cover ?? src.cover,
          projectId: input.projectId ?? src.projectId,
          source: input.source ?? 'generation',
          modelId: input.modelId ?? src.modelId,
          recipe: input.recipe ?? src.recipe,
          derivedFromAssetId: src.id,
          parentAssetIds: [src.id],
          derivationType: input.derivationType,
          entityIds: src.entityIds,
          canvasNodeId: input.canvasNodeId,
        });
      },
      updateAsset: (id, patch) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: now() } : a)) })),
      archiveAsset: (id) => {
        const a = get().assets.find((x) => x.id === id);
        set((s) => ({ assets: s.assets.map((x) => (x.id === id ? { ...x, status: 'archived', updatedAt: now() } : x)) }));
        if (a?.projectId) get().recordActivity({ projectId: a.projectId, type: 'asset.archived', title: `Архивирован «${a.title}»`, assetId: id });
      },
      toggleFavorite: (id) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, favorite: !a.favorite, updatedAt: now() } : a)) })),
      getProjectAssets: (projectId) => get().assets.filter((a) => a.projectId === projectId),
      getAsset: (id) => get().assets.find((a) => a.id === id),
      addReferenceAsset: (input) => {
        const a: Asset = { id: 'as-' + uid(), kind: 'image', title: input.title ?? 'Референс', cover: input.cover, source: 'reference', status: 'ready', createdAt: now(), updatedAt: now() };
        set((s) => ({ assets: [a, ...s.assets] }));
        return a;
      },

      recordActivity: (input) => {
        const e: ActivityEvent = {
          id: 'act-' + uid(), projectId: input.projectId, actorType: input.actorType ?? 'user', actorId: input.actorId,
          type: input.type, title: input.title, description: input.description, entityType: input.entityType,
          entityId: input.entityId, assetId: input.assetId, agentRunId: input.agentRunId, canvasNodeId: input.canvasNodeId,
          metadata: input.metadata, createdAt: nowISO(),
        };
        set((s) => ({ activity: [e, ...s.activity] }));
        return e;
      },
      getProjectActivity: (projectId) => get().activity.filter((e) => e.projectId === projectId),
      recordAttempt: (input) => {
        const at: GenerationAttempt = {
          id: 'att-' + uid(), projectId: input.projectId, modelId: input.modelId, prompt: input.prompt, params: input.params,
          inputAssetIds: input.inputAssetIds ?? [], entityIds: input.entityIds ?? [], cost: input.cost,
          status: input.status ?? 'queued', createdAt: nowISO(),
        };
        set((s) => ({ attempts: [at, ...s.attempts] }));
        return at;
      },
      updateAttempt: (id, patch) => set((s) => ({ attempts: s.attempts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      getProjectAttempts: (projectId) => get().attempts.filter((a) => a.projectId === projectId),

      createCheckpoint: (input) => {
        const project = get().projects.find((p) => p.id === input.projectId);
        if (!project) return undefined;
        const projAssets = get().assets.filter((a) => a.projectId === input.projectId);
        const runIds = get().runs.filter((r) => r.projectId === input.projectId).map((r) => r.id);
        const cp: ProjectCheckpoint = {
          id: 'cp-' + uid(), projectId: input.projectId, title: input.title, description: input.description,
          canvasSnapshot: project.canvas ? JSON.parse(JSON.stringify(project.canvas)) : null,
          assetIds: projAssets.map((a) => a.id), entityIds: project.avatars ?? [], agentRunIds: runIds,
          createdBy: input.createdBy ?? 'Демо-креатор', createdAt: nowISO(), reason: input.reason ?? 'manual',
        };
        set((s) => ({ checkpoints: [cp, ...s.checkpoints] }));
        get().recordActivity({ projectId: input.projectId, type: 'checkpoint.created', title: `Контрольная точка: ${input.title}`, description: cp.reason, metadata: { checkpointId: cp.id } });
        return cp;
      },
      restoreCheckpoint: (checkpointId) => {
        const cp = get().checkpoints.find((c) => c.id === checkpointId);
        if (!cp) return undefined;
        // Safety: snapshot current state first so restore is never destructive.
        get().createCheckpoint({ projectId: cp.projectId, title: `Перед восстановлением: ${cp.title}`, reason: 'before_restore' });
        if (cp.canvasSnapshot) {
          const snap: CanvasGraph = { ...cp.canvasSnapshot, projectId: cp.projectId, updatedAt: nowISO() };
          get().saveCanvas(cp.projectId, snap);
        }
        get().recordActivity({ projectId: cp.projectId, type: 'checkpoint.restored', title: `Восстановлено: ${cp.title}`, metadata: { checkpointId: cp.id } });
        return cp;
      },
      forkProjectFromCheckpoint: (checkpointId, name) => {
        const cp = get().checkpoints.find((c) => c.id === checkpointId);
        if (!cp) return undefined;
        const src = get().projects.find((p) => p.id === cp.projectId);
        const forked = get().createProject({
          name: name ?? `${src?.name ?? 'Проект'} · ветка`,
          type: src?.type, description: `Ответвление из контрольной точки «${cp.title}»`, cover: src?.cover,
        });
        if (cp.canvasSnapshot) {
          get().saveCanvas(forked.id, { ...cp.canvasSnapshot, projectId: forked.id, updatedAt: nowISO() });
        }
        get().recordActivity({ projectId: forked.id, type: 'checkpoint.restored', title: `Ветка из контрольной точки «${cp.title}»`, metadata: { fromCheckpointId: cp.id, fromProjectId: cp.projectId } });
        return forked;
      },
      getProjectCheckpoints: (projectId) => get().checkpoints.filter((c) => c.projectId === projectId),

      setProjectOutput: (input) => {
        const o: ProjectOutput = {
          id: 'out-' + uid(), projectId: input.projectId, assetId: input.assetId, textContent: input.textContent,
          title: input.title, type: input.type, status: input.status ?? 'approved',
          approvedFromAgentRunId: input.approvedFromAgentRunId, createdAt: now(), updatedAt: now(),
        };
        set((s) => ({ outputs: [o, ...s.outputs] }));
        get().recordActivity({ projectId: input.projectId, type: 'project_output.approved', title: `Назначен Project Output: ${input.title}`, assetId: input.assetId, agentRunId: input.approvedFromAgentRunId });
        return o;
      },
      updateOutput: (id, patch) => set((s) => ({ outputs: s.outputs.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: now() } : o)) })),
      getProjectOutputs: (projectId) => get().outputs.filter((o) => o.projectId === projectId),

      createAvatar: (input) => {
        const av: Avatar = {
          id: 'av-' + uid(), name: input.name, description: input.description ?? '',
          referenceAssetIds: input.referenceAssetIds ?? [], coverAssetId: input.coverAssetId,
          voiceId: input.voiceId, defaultStyleId: input.defaultStyleId, defaultLocationId: input.defaultLocationId,
          tags: input.tags ?? [], createdAt: now(), updatedAt: now(), usedInProjectIds: input.usedInProjectIds ?? [], status: input.status ?? 'ready',
        };
        set((s) => ({ avatars: [av, ...s.avatars] }));
        get().recordActivity({ type: 'entity.created', title: `Создан аватар «${av.name}»`, entityType: 'avatar', entityId: av.id });
        return av;
      },
      updateAvatar: (id, patch) => set((s) => ({ avatars: s.avatars.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: now() } : a)) })),
      archiveAvatar: (id) => set((s) => ({ avatars: s.avatars.map((a) => (a.id === id ? { ...a, status: 'archived' } : a)) })),
      getAvatar: (id) => get().avatars.find((a) => a.id === id),
      attachAvatarToProject: (avatarId, projectId) => set((s) => ({
        avatars: s.avatars.map((a) => (a.id === avatarId && !a.usedInProjectIds.includes(projectId) ? { ...a, usedInProjectIds: [...a.usedInProjectIds, projectId], updatedAt: now() } : a)),
        projects: s.projects.map((p) => (p.id === projectId && !(p.avatars ?? []).includes(avatarId) ? { ...p, avatars: [...(p.avatars ?? []), avatarId] } : p)),
      })),
      createVoice: (input) => {
        const v: Voice = { id: 'vo-' + uid(), name: input.name, language: input.language ?? 'Русский', genderPresentation: input.genderPresentation, tone: input.tone ?? '', previewUrl: input.previewUrl, providerModelId: input.providerModelId, createdAt: now(), updatedAt: now() };
        set((s) => ({ voices: [v, ...s.voices] }));
        get().recordActivity({ type: 'entity.created', title: `Создан голос «${v.name}»`, entityType: 'voice', entityId: v.id });
        return v;
      },
      createStyle: (input) => {
        const st: Style = { id: 'st-' + uid(), name: input.name, description: input.description ?? '', previewAssetIds: input.previewAssetIds ?? [], promptFragment: input.promptFragment, palette: input.palette, createdAt: now(), updatedAt: now() };
        set((s) => ({ styles: [st, ...s.styles] }));
        get().recordActivity({ type: 'entity.created', title: `Создан стиль «${st.name}»`, entityType: 'style', entityId: st.id });
        return st;
      },
      createLocation: (input) => {
        const l: Location = { id: 'loc-' + uid(), name: input.name, description: input.description ?? '', referenceAssetIds: input.referenceAssetIds ?? [], lighting: input.lighting, environment: input.environment, promptFragment: input.promptFragment, createdAt: now(), updatedAt: now() };
        set((s) => ({ locations: [l, ...s.locations] }));
        get().recordActivity({ type: 'entity.created', title: `Создана локация «${l.name}»`, entityType: 'location', entityId: l.id });
        return l;
      },
      getVoice: (id) => get().voices.find((v) => v.id === id),
      getStyle: (id) => get().styles.find((x) => x.id === id),
      getLocation: (id) => get().locations.find((l) => l.id === id),

      updateAgent: (id, patch) => set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: now() } : a)) })),
      getAgent: (id) => get().agents.find((a) => a.id === id),
      createTeam: (input) => {
        const t: AgentTeam = { id: 'team-' + uid(), name: input.name, description: input.description ?? '', memberIds: input.memberIds, coordinatorId: input.coordinatorId, executionMode: 'sequential', approvalRequired: input.approvalRequired ?? true, createdAt: now(), updatedAt: now() };
        set((s) => ({ teams: [t, ...s.teams] }));
        return t;
      },
      updateTeam: (id, patch) => set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)) })),
      deleteTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id) })),
      getTeam: (id) => get().teams.find((t) => t.id === id),
      createRun: (input) => {
        const s0 = get();
        const memberIds = input.teamId ? (s0.teams.find((t) => t.id === input.teamId)?.memberIds ?? []) : input.agentId ? [input.agentId] : [];
        const steps: AgentRunStep[] = memberIds.map((aid, i) => ({
          id: 'stp-' + uid(), agentId: aid, position: i,
          title: TITLE_MAP[aid] ?? (s0.agents.find((a) => a.id === aid)?.name ?? 'Этап'),
          status: 'pending', inputSummary: i === 0 ? 'Задача и контекст проекта' : 'Результат предыдущего этапа',
          retryCount: 0, handoffToAgentId: memberIds[i + 1],
        }));
        const estimatedCost = steps.length * 6 + 8;
        const run: AgentRun = { id: 'run-' + uid(), projectId: input.projectId, canvasNodeId: input.canvasNodeId, teamId: input.teamId, agentId: input.agentId, task: input.task, inputContext: input.context, status: 'draft', currentStepIndex: 0, steps, estimatedCost, actualMockCost: 0, createdAt: now(), updatedAt: now() };
        set((s) => ({ runs: [run, ...s.runs] }));
        return run;
      },
      updateRun: (id, patch) => set((s) => ({ runs: s.runs.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)) })),
      updateStep: (runId, stepId, patch) => set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? { ...r, updatedAt: now(), steps: r.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)) } : r)) })),
      getRun: (id) => get().runs.find((r) => r.id === id),
      getProjectRuns: (projectId) => get().runs.filter((r) => r.projectId === projectId),
      addMemory: (input) => {
        const m: AgentMemoryEntry = { id: 'mem-' + uid(), scope: 'project', projectId: input.projectId, title: input.title, content: input.content, sourceRunId: input.sourceRunId, editable: true, createdAt: now(), updatedAt: now() };
        set((s) => ({ memory: [m, ...s.memory] }));
        get().recordActivity({ projectId: input.projectId, type: 'memory.updated', title: `Память проекта: «${m.title}»`, metadata: { memoryId: m.id } });
        return m;
      },
      updateMemory: (id, patch) => {
        const m = get().memory.find((x) => x.id === id);
        set((s) => ({ memory: s.memory.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: now() } : x)) }));
        if (m?.projectId && ('title' in patch || 'content' in patch)) get().recordActivity({ projectId: m.projectId, type: 'memory.updated', title: `Изменена память: «${patch.title ?? m.title}»`, metadata: { memoryId: id } });
      },
      deleteMemory: (id) => set((s) => ({ memory: s.memory.filter((m) => m.id !== id) })),
      getProjectMemory: (projectId) => get().memory.filter((m) => m.scope === 'project' && m.projectId === projectId),

      spend: (amount, label) => {
        if (get().credits < amount) {
          get().toast('Недостаточно кредитов — пополните баланс', 'error');
          return false;
        }
        set((s) => ({
          credits: s.credits - amount,
          transactions: [{ id: 't-' + uid(), date: now(), label, amount: -amount, kind: 'spend' }, ...s.transactions],
        }));
        return true;
      },
      addCredits: (amount, label) =>
        set((s) => ({
          credits: s.credits + amount,
          transactions: [{ id: 't-' + uid(), date: now(), label, amount, kind: 'topup' }, ...s.transactions],
        })),

      toast: (text, kind = 'info') => {
        const id = 'toast-' + uid();
        set((s) => ({ toasts: [...s.toasts, { id, text, kind }] }));
        setTimeout(() => get().dismissToast(id), 3200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resetDemo: () =>
        set({ projects: seedAllProjects, assets: initialAssets, avatars: seedAllAvatars, voices: seedAllVoices, styles: seedAllStyles, locations: seedAllLocations, agents: seedAgents, agentTools: seedTools, teams: seedTeams, runs: seedAllRuns, memory: seedAllMemory, activity: seedAllActivity, checkpoints: seedAllCheckpoints, outputs: seedAllOutputs, attempts: [], credits: demoUser.credits, transactions: demoTransactions, toasts: [] }),
    }),
    {
      name: 'chappy_v01_store',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => persistedState as StoreState,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        // persisted wins by id; seed items are injected only when absent (keeps user edits,
        // guarantees the flagship «Кира» demo + demo lineage always exist).
        const byId = <T extends { id: string }>(base: T[] | undefined, seed: T[]): T[] => {
          const list = base ?? [];
          const have = new Set(list.map((x) => x.id));
          return [...list, ...seed.filter((x) => !have.has(x.id))];
        };
        return {
          ...current, ...p,
          assets: byId(p.assets ?? current.assets, seedExtraAssets),
          projects: byId(p.projects && p.projects.length ? p.projects : current.projects, [demoProject]),
          avatars: byId(p.avatars && p.avatars.length ? p.avatars : current.avatars, [kiraAvatar]),
          voices: byId(p.voices && p.voices.length ? p.voices : current.voices, [kiraVoice]),
          styles: byId(p.styles && p.styles.length ? p.styles : current.styles, [kiraStyle]),
          locations: byId(p.locations && p.locations.length ? p.locations : current.locations, [kiraLocation]),
          // agent library/teams: guarantee seed roles, tools and the flagship team always exist
          agents: byId(p.agents && p.agents.length ? p.agents : current.agents, seedAgents),
          agentTools: byId(p.agentTools && p.agentTools.length ? p.agentTools : current.agentTools, seedTools),
          teams: byId(p.teams && p.teams.length ? p.teams : current.teams, seedTeams),
          runs: byId(p.runs ?? current.runs, [demoRun]),
          memory: byId(p.memory ?? current.memory, demoMemoryKira),
          activity: byId(p.activity ?? current.activity, demoActivityKira),
          checkpoints: byId(p.checkpoints ?? current.checkpoints, [demoCheckpointKira]),
          outputs: byId(p.outputs ?? current.outputs, [demoOutputKira]),
          attempts: p.attempts ?? current.attempts,
        };
      },
      partialize: (s) => ({
        projects: s.projects, assets: s.assets, credits: s.credits, transactions: s.transactions,
        avatars: s.avatars, voices: s.voices, styles: s.styles, locations: s.locations,
        agents: s.agents, agentTools: s.agentTools, teams: s.teams, runs: s.runs, memory: s.memory,
        activity: s.activity, checkpoints: s.checkpoints, outputs: s.outputs, attempts: s.attempts,
      }),
    },
  ),
);
