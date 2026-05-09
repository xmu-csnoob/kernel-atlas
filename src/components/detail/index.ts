import type { DetailViewProps } from './DetailLayout';
import ReadUserSpace from './ReadUserSpace';
import ReadKernelEntry from './ReadKernelEntry';
import ReadVfs from './ReadVfs';
import ReadStorageStack from './ReadStorageStack';
import ReadHardwareIO from './ReadHardwareIO';
import ReadReturnPath from './ReadReturnPath';
import ForkUserSpace from './ForkUserSpace';
import ForkKernelEntry from './ForkKernelEntry';
import ForkProcessDuplication from './ForkProcessDuplication';
import ForkMemoryResources from './ForkMemoryResources';
import ForkSchedulerIntegration from './ForkSchedulerIntegration';
import ForkReturn from './ForkReturn';
import GenericDetail from './GenericDetail';

// Generic pattern components
import GenericUserSpace from './generic/GenericUserSpace';
import GenericKernelEntry from './generic/GenericKernelEntry';
import GenericVfsLayer from './generic/GenericVfsLayer';
import GenericScheduler from './generic/GenericScheduler';
import GenericReturnPath from './generic/GenericReturnPath';

import type React from 'react';

// ---------------------------------------------------------------------------
// Exact-match registry (highest priority)
// ---------------------------------------------------------------------------
export const DETAIL_REGISTRY: Record<string, React.FC<DetailViewProps>> = {
  // read()
  'read-user-space': ReadUserSpace,
  'read-kernel-entry': ReadKernelEntry,
  'read-vfs': ReadVfs,
  'read-storage-stack': ReadStorageStack,
  'read-hardware-io': ReadHardwareIO,
  'read-return-path': ReadReturnPath,
  // fork()
  'fork-user-space': ForkUserSpace,
  'fork-kernel-entry': ForkKernelEntry,
  'fork-process-duplication': ForkProcessDuplication,
  'fork-memory-resources': ForkMemoryResources,
  'fork-scheduler-integration': ForkSchedulerIntegration,
  'fork-return': ForkReturn,
};

// ---------------------------------------------------------------------------
// Pattern-match registry (fallback by node title keyword)
// ---------------------------------------------------------------------------
const PATTERN_PATTERNS: { keyword: string; component: React.FC<DetailViewProps> }[] = [
  { keyword: 'user space', component: GenericUserSpace },
  { keyword: 'kernel entry', component: GenericKernelEntry },
  { keyword: 'vfs', component: GenericVfsLayer },
  { keyword: 'scheduler', component: GenericScheduler },
  { keyword: 'return', component: GenericReturnPath },
];

/**
 * Resolve the best matching detail component for a node.
 * Priority: exact ID match → title keyword pattern → generic fallback.
 */
export function resolveDetailView(
  nodeId: string,
  nodeTitle: string
): React.FC<DetailViewProps> {
  // 1. Exact match
  const exact = DETAIL_REGISTRY[nodeId];
  if (exact) return exact;

  // 2. Pattern match (case-insensitive title contains keyword)
  const titleLower = nodeTitle.toLowerCase();
  for (const pattern of PATTERN_PATTERNS) {
    if (titleLower.includes(pattern.keyword)) {
      return pattern.component;
    }
  }

  // 3. Generic fallback
  return GenericDetail;
}

export { GenericDetail };
export type { DetailViewProps };
