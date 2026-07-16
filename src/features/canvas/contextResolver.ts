import type { CanvasNodeData, GenerationRecipe } from '../../types';
import { useStore } from '../../store/useStore';

type NodeLike = { id: string; data: CanvasNodeData };
type EdgeLike = { source: string; target: string };

export interface ResolvedContext {
  prompt: string; // combined idea text
  avatarId?: string;
  voiceId?: string;
  styleId?: string;
  locationId?: string;
  referenceAssetIds: string[];
  fragments: string[]; // style/location prompt fragments + hero note
}

// Transparent typed context resolver: walks a model node's incoming edges and
// collects Idea → prompt, Avatar → avatar (+ its voice/style/location + refs),
// Style → style, Location → location. No universal workflow engine — just this.
export function resolveModelContext(modelNodeId: string, nodes: NodeLike[], edges: EdgeLike[]): ResolvedContext {
  const s = useStore.getState();
  const incoming = edges
    .filter((e) => e.target === modelNodeId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is NodeLike => Boolean(n));

  const ideas: string[] = [];
  const fragments: string[] = [];
  const refs: string[] = [];
  const ctx: ResolvedContext = { prompt: '', referenceAssetIds: [], fragments: [] };

  for (const n of incoming) {
    const d = n.data;
    if (d.type === 'idea' && d.text) ideas.push(d.text);
    if (d.type === 'avatar' && d.entityId) {
      const av = s.getAvatar(d.entityId);
      if (av) {
        ctx.avatarId = av.id;
        ctx.voiceId = ctx.voiceId ?? av.voiceId;
        ctx.styleId = ctx.styleId ?? av.defaultStyleId;
        ctx.locationId = ctx.locationId ?? av.defaultLocationId;
        refs.push(...av.referenceAssetIds);
        fragments.push(`герой: ${av.name}`);
      }
    }
    if (d.type === 'style' && d.entityId) ctx.styleId = d.entityId;
    if (d.type === 'location' && d.entityId) ctx.locationId = d.entityId;
  }

  if (ctx.styleId) {
    const st = s.getStyle(ctx.styleId);
    if (st?.promptFragment) fragments.push(st.promptFragment);
  }
  if (ctx.locationId) {
    const loc = s.getLocation(ctx.locationId);
    if (loc?.promptFragment) fragments.push(loc.promptFragment);
  }

  ctx.prompt = ideas.join('\n');
  ctx.referenceAssetIds = Array.from(new Set(refs));
  ctx.fragments = Array.from(new Set(fragments));
  return ctx;
}

export function recipeWithContext(base: GenerationRecipe, ctx: ResolvedContext): GenerationRecipe {
  return {
    ...base,
    avatarId: ctx.avatarId,
    voiceId: ctx.voiceId,
    styleId: ctx.styleId,
    locationId: ctx.locationId,
    referenceAssetIds: ctx.referenceAssetIds.length ? ctx.referenceAssetIds : undefined,
  };
}
