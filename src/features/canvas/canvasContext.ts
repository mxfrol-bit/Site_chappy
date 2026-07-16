import { createContext, useContext } from 'react';
import type { CanvasNodeData } from '../../types';

// Node action handlers live in context (not in serializable node data),
// so the graph stays plain JSON for persistence.
export interface CanvasActions {
  updateNodeData: (id: string, patch: Partial<CanvasNodeData>) => void;
  runNode: (id: string) => void;
  cancelNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  deleteNode: (id: string) => void;
  useAsInput: (id: string) => void;
  connectToModel: (id: string) => void;
  runAgent: (id: string) => void;
  openRun: (runId: string) => void;
  openAssetDetail: (assetId: string) => void;
  createAssetVariation: (assetId: string) => void;
  markProjectOutput: (assetId: string) => void;
  openResult: (url: string) => void;
  notify: (msg: string) => void;
}

export const CanvasCtx = createContext<CanvasActions | null>(null);

export function useCanvasActions(): CanvasActions {
  const c = useContext(CanvasCtx);
  if (!c) throw new Error('CanvasCtx is missing');
  return c;
}
