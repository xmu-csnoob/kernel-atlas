import { useState, useCallback } from 'react';
import type { MainFlowNode } from '../data/types';

export interface UseSelectedNodeReturn {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectFirstNode: (nodes: MainFlowNode[]) => void;
}

/**
 * useSelectedNode — manages a single selected node ID for the left-right layout.
 *
 * Replaces useExpand (which tracked a Set of expanded node IDs) with a
 * single selected node. On syscall switch the first main-flow node is
 * auto-selected so the right-hand detail panel is never empty.
 */
export function useSelectedNode(): UseSelectedNodeReturn {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectFirstNode = useCallback((nodes: MainFlowNode[]) => {
    if (nodes.length > 0) {
      const first = [...nodes].sort((a, b) => a.position - b.position)[0];
      setSelectedNodeId(first.id);
    }
  }, []);

  return { selectedNodeId, setSelectedNodeId, selectFirstNode };
}
