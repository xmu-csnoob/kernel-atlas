import { useState, useCallback } from 'react';

export interface UseExpandReturn {
  expanded: Set<string>;
  toggle: (id: string) => void;
}

/**
 * useExpand — manages the Set of expanded node IDs.
 *
 * State shape: `expanded` is a Set<string> of node IDs that are currently
 * expanded. Multiple nodes can be expanded simultaneously (Set-based, not
 * single-open). Calling toggle(id) adds the id if absent, removes it if
 * present — so two nodes can be open at the same time.
 */
export function useExpand(): UseExpandReturn {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return { expanded, toggle };
}
