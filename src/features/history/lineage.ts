import type { Asset } from '../../types';

export interface AssetLineage {
  ancestors: Asset[]; // oldest → immediate parent (a true single upward path)
  descendants: Asset[]; // every downstream asset (flattened, unique)
  siblings: Asset[]; // share the same direct parent
  chain: Asset[]; // ancestors → self → first-child path — every adjacent pair is a real parent→child edge
  branches: Asset[]; // descendants NOT on `chain` (other derivation branches)
}

export const parentIdOf = (a: Asset): string | undefined =>
  a.derivedFromAssetId ?? (a.parentAssetIds && a.parentAssetIds.length ? a.parentAssetIds[0] : undefined);

/** Walk the derivation graph up (ancestors) and down (descendants) from an asset. */
export function getAssetLineage(assets: Asset[], id: string): AssetLineage {
  const byId = new Map(assets.map((a) => [a.id, a]));
  const self = byId.get(id);
  const childrenOf = (pid: string) =>
    assets.filter((a) => parentIdOf(a) === pid || (a.parentAssetIds ?? []).includes(pid));

  // ancestors: follow parent links up, guard against cycles
  const ancestors: Asset[] = [];
  const seenA = new Set<string>([id]);
  let cur = self ? parentIdOf(self) : undefined;
  while (cur && !seenA.has(cur)) {
    const p = byId.get(cur);
    if (!p) break;
    ancestors.unshift(p);
    seenA.add(cur);
    cur = parentIdOf(p);
  }

  // descendants: BFS over children (anyone whose parent link points here)
  const descendants: Asset[] = [];
  const seenD = new Set<string>([id]);
  let frontier = childrenOf(id);
  while (frontier.length) {
    const next: Asset[] = [];
    for (const c of frontier) {
      if (seenD.has(c.id)) continue;
      seenD.add(c.id);
      descendants.push(c);
      next.push(...childrenOf(c.id));
    }
    frontier = next;
  }

  // siblings: same direct parent, excluding self
  const myParent = self ? parentIdOf(self) : undefined;
  const siblings = myParent
    ? assets.filter((a) => a.id !== id && parentIdOf(a) === myParent)
    : [];

  // chain: follow ONE child at each step (preferring a non-leaf so the spine is the deepest path)
  // so every adjacent pair is a genuine parent→child edge; other children become `branches`.
  const fwd: Asset[] = [];
  const seenF = new Set<string>([id]);
  let node: Asset | undefined = self;
  while (node) {
    const kids = childrenOf(node.id).filter((k) => !seenF.has(k.id));
    if (!kids.length) break;
    const kid = kids.find((k) => childrenOf(k.id).length > 0) ?? kids[0];
    fwd.push(kid);
    seenF.add(kid.id);
    node = kid;
  }
  const chain = self ? [...ancestors, self, ...fwd] : ancestors;
  const chainIds = new Set(chain.map((a) => a.id));
  const branches = descendants.filter((d) => !chainIds.has(d.id));

  return { ancestors, descendants, siblings, chain, branches };
}

export const derivationLabel: Record<string, string> = {
  variation: 'вариация', edit: 'правка', upscale: 'апскейл', animate: 'анимация',
  extend: 'расширение', remix: 'ремикс', agent_output: 'вывод агента',
};

export const sourceLabel: Record<string, string> = {
  generation: 'Модель', agent: 'Агент', upload: 'Загрузка', reference: 'Референс', demo: 'Демо',
};
