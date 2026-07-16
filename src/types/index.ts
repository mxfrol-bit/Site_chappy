// ---- Core domain types for Chappy Web prototype v0.1 ----
export type ID = string;
export type Modality = 'image' | 'video' | 'audio' | 'chat' | 'agent';
export type ModelSpeed = 'fast' | 'balanced' | 'quality';
export type ModelStatus = 'active' | 'new' | 'beta' | 'soon';

export interface Model {
  id: ID;
  name: string;
  company: string;
  version?: string;
  modality: Modality;
  categories: string[]; // new | popular | fast | quality | budget
  capabilities: string[];
  limits: string[];
  speed: ModelSpeed;
  priceHint: string; // "~5 кр / кадр"
  status: ModelStatus;
  badge?: string;
  description: string;
  examples?: string[];
}

export interface Trend {
  id: ID;
  title: string;
  category: string;
  modality: Modality;
  image: string;
  steps: number;
  priceFrom: number;
  tags: string[];
}

export type AgentStatus = 'available' | 'busy' | 'paused' | 'archived';
export type AgentMemoryPolicy = 'project' | 'agent' | 'none';
export interface Agent {
  id: ID;
  name: string;
  emoji: string; // avatar
  role: string;
  description: string;
  systemInstructions: string;
  capabilities: string[];
  toolIds: string[];
  defaultModelId?: string;
  memoryPolicy: AgentMemoryPolicy;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export type AgentToolType =
  | 'llm' | 'project_context' | 'asset_library' | 'model_generation' | 'mock_search' | 'quality_check';
export interface AgentTool {
  id: ID;
  name: string;
  type: AgentToolType;
  description: string;
  enabled: boolean;
  config?: Record<string, string>;
  isMock: boolean;
}

export type ExecutionMode = 'sequential' | 'parallel';
export interface AgentTeam {
  id: ID;
  name: string;
  description: string;
  memberIds: string[];
  coordinatorId?: string;
  executionMode: ExecutionMode;
  approvalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRunContext {
  task: string;
  projectId: string;
  ideaText?: string;
  avatarId?: string;
  styleId?: string;
  locationId?: string;
  assetIds?: string[];
  modelId?: string;
  canvasBlockIds?: string[];
}

export type StepStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'skipped';
export interface AgentRunStep {
  id: ID;
  agentId: string;
  position: number;
  title: string;
  status: StepStatus;
  inputSummary: string;
  outputSummary?: string;
  outputData?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
  handoffToAgentId?: string;
}

export type RunStatus = 'draft' | 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
export interface AgentRun {
  id: ID;
  projectId: string;
  canvasNodeId?: string;
  teamId?: string;
  agentId?: string;
  task: string;
  inputContext: AgentRunContext;
  status: RunStatus;
  currentStepIndex: number;
  steps: AgentRunStep[];
  estimatedCost: number;
  actualMockCost: number;
  finalOutputId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type MemoryScope = 'agent' | 'project';
export interface AgentMemoryEntry {
  id: ID;
  scope: MemoryScope;
  agentId?: string;
  projectId?: string;
  title: string;
  content: string;
  sourceRunId?: string;
  editable: boolean;
  disabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SavedEntityKind = 'avatar' | 'voice' | 'style' | 'location';
export interface SavedEntity {
  id: ID;
  kind: SavedEntityKind;
  name: string;
  description?: string;
  cover?: string;
  meta?: Record<string, string>;
  refs?: string[];
  projects?: ID[];
  createdAt: string;
}

// ---- Persistent, reusable entities (distinct from Assets) ----
export type EntityStatus = 'draft' | 'ready' | 'archived';

export interface Avatar {
  id: ID;
  name: string;
  description: string;
  referenceAssetIds: string[];
  coverAssetId?: string;
  voiceId?: string;
  defaultStyleId?: string;
  defaultLocationId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usedInProjectIds: string[];
  status: EntityStatus;
}

export interface Voice {
  id: ID;
  name: string;
  language: string;
  genderPresentation?: string;
  tone: string;
  previewUrl?: string;
  providerModelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Style {
  id: ID;
  name: string;
  description: string;
  previewAssetIds: string[];
  promptFragment?: string;
  palette?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: ID;
  name: string;
  description: string;
  referenceAssetIds: string[];
  lighting?: string;
  environment?: string;
  promptFragment?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetKind = 'image' | 'video' | 'audio' | 'document' | 'text';
export interface GenerationRecipe {
  model: string;
  prompt: string;
  params?: Record<string, string>;
  avatarId?: string;
  voiceId?: string;
  styleId?: string;
  locationId?: string;
  modelId?: string;
  referenceAssetIds?: string[];
  cost: number;
  date: string;
  prevStep?: string;
}
export type AssetSource = 'generation' | 'agent' | 'upload' | 'reference' | 'demo';
export type AssetStatus = 'processing' | 'ready' | 'failed' | 'archived';
export type DerivationType =
  | 'variation' | 'edit' | 'upscale' | 'animate' | 'extend' | 'remix' | 'agent_output';
export interface Asset {
  id: ID;
  kind: AssetKind;
  title: string;
  description?: string;
  cover?: string;
  url?: string;
  projectId?: ID;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  sizeBytes?: number;
  modelId?: string;
  providerId?: string;
  generationJobId?: string;
  agentRunId?: string;
  canvasNodeId?: string;
  parentAssetIds?: string[];
  derivedFromAssetId?: string;
  derivationType?: DerivationType;
  entityIds?: string[];
  recipe?: GenerationRecipe;
  tags?: string[];
  favorite?: boolean;
  source?: AssetSource;
  status?: AssetStatus;
  createdAt: string;
  updatedAt?: string;
}

// ---- Provenance: activity log, checkpoints, outputs, generation attempts ----
export type ActivityActor = 'user' | 'agent' | 'system';
export type ActivityType =
  | 'project.created' | 'project.updated'
  | 'canvas.node_added' | 'canvas.node_deleted' | 'canvas.connected'
  | 'generation.started' | 'generation.completed' | 'generation.failed'
  | 'asset.created' | 'asset.derived' | 'asset.archived'
  | 'entity.created'
  | 'agent_run.started' | 'agent_run.approved' | 'agent_run.failed'
  | 'memory.updated'
  | 'checkpoint.created' | 'checkpoint.restored'
  | 'project_output.approved';
export interface ActivityEvent {
  id: ID;
  projectId?: ID;
  actorType: ActivityActor;
  actorId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  assetId?: string;
  agentRunId?: string;
  canvasNodeId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string; // full ISO for precise ordering
}

export type CheckpointReason = 'automatic' | 'manual' | 'before_restore' | 'approved_output';
export interface ProjectCheckpoint {
  id: ID;
  projectId: ID;
  title: string;
  description?: string;
  canvasSnapshot: CanvasGraph | null;
  assetIds: string[];
  entityIds: string[];
  agentRunIds: string[];
  createdBy: string;
  createdAt: string;
  reason: CheckpointReason;
}

export type ProjectOutputType = 'image' | 'video' | 'audio' | 'script' | 'document' | 'other';
export type ProjectOutputStatus = 'draft' | 'approved' | 'final' | 'archived';
export interface ProjectOutput {
  id: ID;
  projectId: ID;
  assetId?: string;
  textContent?: string;
  title: string;
  type: ProjectOutputType;
  status: ProjectOutputStatus;
  approvedFromAgentRunId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttemptStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export interface GenerationAttempt {
  id: ID;
  projectId: ID;
  modelId: string;
  assetId?: string;
  inputAssetIds: string[];
  entityIds: string[];
  prompt: string;
  params?: Record<string, string>;
  status: AttemptStatus;
  cost: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type CanvasBlockType =
  | 'idea' | 'text' | 'source' | 'model' | 'llm' | 'image' | 'video'
  | 'audio' | 'avatar' | 'voice' | 'style' | 'location' | 'agent' | 'export';

export type GenStatus = 'idle' | 'queued' | 'generating' | 'success' | 'error';
export interface CanvasNodeData {
  type: CanvasBlockType;
  title?: string;
  text?: string;
  modelId?: string;
  prompt?: string;
  status?: GenStatus;
  result?: string;
  assetId?: string;
  recipe?: GenerationRecipe;
  entityId?: string;
  agentId?: string;
  error?: string;
  [key: string]: unknown;
}

// Serializable graph shapes (persisted verbatim to localStorage).
export interface CanvasNode {
  id: string;
  type: string; // react-flow node type — we use a single 'block' renderer
  position: { x: number; y: number };
  data: CanvasNodeData;
}
export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
}
export interface CanvasViewport { x: number; y: number; zoom: number }
export interface CanvasGraph {
  version: number;
  projectId: ID;
  updatedAt: string;
  viewport: CanvasViewport;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export type ProjectType = 'image' | 'video' | 'audio' | 'mixed' | 'content';
export type ProjectStatus = 'active' | 'draft' | 'archived';
export interface Project {
  id: ID;
  name: string;
  description?: string;
  type: ProjectType;
  cover?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  avatars?: ID[];
  assetCount: number;
  canvas?: CanvasGraph;
}

export interface Plan {
  id: ID;
  name: string;
  priceRub: number;
  period: 'mo';
  credits: number;
  features: string[];
  highlighted?: boolean;
}
export interface CreditPackage {
  id: ID;
  priceRub: number;
  credits: number;
  bonus?: string;
}
export type TxKind = 'topup' | 'spend' | 'bonus';
export interface Transaction {
  id: ID;
  date: string;
  label: string;
  amount: number; // credits, +/-
  kind: TxKind;
}

export interface User {
  id: ID;
  name: string;
  handle: string;
  avatar: string;
  plan: string;
  credits: number;
  storageUsedMb: number;
  storageTotalMb: number;
  since: string;
}

export type WorkflowTemplate = {
  id: ID;
  name: string;
  description: string;
  canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] };
};
