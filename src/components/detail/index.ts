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
import OpenUserSpace from './OpenUserSpace';
import OpenKernelEntry from './OpenKernelEntry';
import OpenPathLookup from './OpenPathLookup';
import OpenDentryCache from './OpenDentryCache';
import OpenInodePermission from './OpenInodePermission';
import OpenFdAllocation from './OpenFdAllocation';
import OpenReturnPath from './OpenReturnPath';
import WriteUserSpace from './WriteUserSpace';
import WriteKernelEntry from './WriteKernelEntry';
import WriteVfs from './WriteVfs';
import WritePageCache from './WritePageCache';
import WriteBlockLayer from './WriteBlockLayer';
import WriteHardwareIO from './WriteHardwareIO';
import WriteReturnPath from './WriteReturnPath';
import MmapUserSpace from './MmapUserSpace';
import MmapKernelEntry from './MmapKernelEntry';
import MmapVmaAllocation from './MmapVmaAllocation';
import MmapPageFault from './MmapPageFault';
import MmapMapping from './MmapMapping';
import MmapTlbUpdate from './MmapTlbUpdate';
import MmapReturn from './MmapReturn';
import IoctlUserSpace from './IoctlUserSpace';
import IoctlKernelEntry from './IoctlKernelEntry';
import IoctlVfs from './IoctlVfs';
import IoctlDeviceHandler from './IoctlDeviceHandler';
import IoctlDataCopy from './IoctlDataCopy';
import IoctlReturnPath from './IoctlReturnPath';
import ExecveUserSpace from './ExecveUserSpace';
import ExecveKernelEntry from './ExecveKernelEntry';
import ExecveElfLoader from './ExecveElfLoader';
import ExecveMmReplacement from './ExecveMmReplacement';
import ExecveArgCopy from './ExecveArgCopy';
import ExecveSignalReset from './ExecveSignalReset';
import ExecveEntryJump from './ExecveEntryJump';
import SocketUserSpace from './SocketUserSpace';
import SocketKernelEntry from './SocketKernelEntry';
import SocketAfInet from './SocketAfInet';
import SocketBindConnect from './SocketBindConnect';
import SocketSkBuff from './SocketSkBuff';
import SocketProtocolStack from './SocketProtocolStack';
import SocketReturnPath from './SocketReturnPath';
import CloneUserSpace from './CloneUserSpace';
import CloneKernelEntry from './CloneKernelEntry';
import CloneCopyProcess from './CloneCopyProcess';
import CloneSharedMm from './CloneSharedMm';
import CloneWake from './CloneWake';
import CloneReturn from './CloneReturn';
import EpollWaitUserSpace from './EpollWaitUserSpace';
import EpollWaitKernelEntry from './EpollWaitKernelEntry';
import EpollWaitInstance from './EpollWaitInstance';
import EpollWaitReadyList from './EpollWaitReadyList';
import EpollWaitWaitQueue from './EpollWaitWaitQueue';
import EpollWaitEventNotify from './EpollWaitEventNotify';
import EpollWaitReturnPath from './EpollWaitReturnPath';
import ExitUserSpace from './ExitUserSpace';
import ExitKernelEntry from './ExitKernelEntry';
import ExitMmRelease from './ExitMmRelease';
import ExitFdCleanup from './ExitFdCleanup';
import ExitSignalParent from './ExitSignalParent';
import ExitZombie from './ExitZombie';
import ExitReaped from './ExitReaped';
import BrkUserSpace from './BrkUserSpace';
import BrkKernelEntry from './BrkKernelEntry';
import BrkHeapCheck from './BrkHeapCheck';
import BrkVmaUpdate from './BrkVmaUpdate';
import BrkPageAlloc from './BrkPageAlloc';
import BrkTlbUpdate from './BrkTlbUpdate';
import BrkReturnPath from './BrkReturnPath';
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
  // open()
  'open-user-space': OpenUserSpace,
  'open-kernel-entry': OpenKernelEntry,
  'open-path-lookup': OpenPathLookup,
  'open-dentry-cache': OpenDentryCache,
  'open-inode-permission': OpenInodePermission,
  'open-fd-allocation': OpenFdAllocation,
  'open-return-path': OpenReturnPath,
  // write()
  'write-user-space': WriteUserSpace,
  'write-kernel-entry': WriteKernelEntry,
  'write-vfs': WriteVfs,
  'write-page-cache': WritePageCache,
  'write-block-layer': WriteBlockLayer,
  'write-hardware-io': WriteHardwareIO,
  'write-return-path': WriteReturnPath,
  // mmap()
  'mmap-user-space': MmapUserSpace,
  'mmap-kernel-entry': MmapKernelEntry,
  'mmap-vma-allocation': MmapVmaAllocation,
  'mmap-page-fault': MmapPageFault,
  'mmap-mapping': MmapMapping,
  'mmap-tlb-update': MmapTlbUpdate,
  'mmap-return': MmapReturn,
  // ioctl()
  'ioctl-user-space': IoctlUserSpace,
  'ioctl-kernel-entry': IoctlKernelEntry,
  'ioctl-vfs': IoctlVfs,
  'ioctl-device-handler': IoctlDeviceHandler,
  'ioctl-data-copy': IoctlDataCopy,
  'ioctl-return-path': IoctlReturnPath,
  // execve()
  'execve-user-space': ExecveUserSpace,
  'execve-kernel-entry': ExecveKernelEntry,
  'execve-elf-loader': ExecveElfLoader,
  'execve-mm-replacement': ExecveMmReplacement,
  'execve-arg-copy': ExecveArgCopy,
  'execve-signal-reset': ExecveSignalReset,
  'execve-entry-jump': ExecveEntryJump,
  // socket()
  'socket-user-space': SocketUserSpace,
  'socket-kernel-entry': SocketKernelEntry,
  'socket-af-inet': SocketAfInet,
  'socket-bind-connect': SocketBindConnect,
  'socket-sk-buff': SocketSkBuff,
  'socket-protocol-stack': SocketProtocolStack,
  'socket-return-path': SocketReturnPath,
  // clone()
  'clone-user-space': CloneUserSpace,
  'clone-kernel-entry': CloneKernelEntry,
  'clone-copy-process': CloneCopyProcess,
  'clone-shared-mm': CloneSharedMm,
  'clone-wake': CloneWake,
  'clone-return': CloneReturn,
  // epoll_wait()
  'epoll-wait-user-space': EpollWaitUserSpace,
  'epoll-wait-kernel-entry': EpollWaitKernelEntry,
  'epoll-wait-instance': EpollWaitInstance,
  'epoll-wait-ready-list': EpollWaitReadyList,
  'epoll-wait-wait-queue': EpollWaitWaitQueue,
  'epoll-wait-event-notify': EpollWaitEventNotify,
  'epoll-wait-return-path': EpollWaitReturnPath,
  // exit()
  'exit-user-space': ExitUserSpace,
  'exit-kernel-entry': ExitKernelEntry,
  'exit-mm-release': ExitMmRelease,
  'exit-fd-cleanup': ExitFdCleanup,
  'exit-signal-parent': ExitSignalParent,
  'exit-zombie': ExitZombie,
  'exit-reaped': ExitReaped,
  // brk()
  'brk-user-space': BrkUserSpace,
  'brk-kernel-entry': BrkKernelEntry,
  'brk-heap-check': BrkHeapCheck,
  'brk-vma-update': BrkVmaUpdate,
  'brk-page-alloc': BrkPageAlloc,
  'brk-tlb-update': BrkTlbUpdate,
  'brk-return-path': BrkReturnPath,
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
