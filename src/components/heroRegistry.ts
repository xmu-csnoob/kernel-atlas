import type React from 'react';

// read
import { ReadUserSpaceHero } from './detail/ReadUserSpace';
import { ReadKernelEntryHero } from './detail/ReadKernelEntry';
import { ReadVfsHero } from './detail/ReadVfs';
import { ReadStorageStackHero } from './detail/ReadStorageStack';
import { ReadHardwareIOHero } from './detail/ReadHardwareIO';
import { ReadReturnPathHero } from './detail/ReadReturnPath';

// fork
import { ForkUserSpaceHero } from './detail/ForkUserSpace';
import { ForkKernelEntryHero } from './detail/ForkKernelEntry';
import { ForkProcessDuplicationHero } from './detail/ForkProcessDuplication';
import { ForkMemoryResourcesHero } from './detail/ForkMemoryResources';
import { ForkSchedulerIntegrationHero } from './detail/ForkSchedulerIntegration';
import { ForkReturnHero } from './detail/ForkReturn';

// write
import { WriteUserSpaceHero } from './detail/WriteUserSpace';
import { WriteKernelEntryHero } from './detail/WriteKernelEntry';
import { WriteVfsHero } from './detail/WriteVfs';
import { WritePageCacheHero } from './detail/WritePageCache';
import { WriteBlockLayerHero } from './detail/WriteBlockLayer';
import { WriteHardwareIOHero } from './detail/WriteHardwareIO';
import { WriteReturnPathHero } from './detail/WriteReturnPath';

// open
import { OpenUserSpaceHero } from './detail/OpenUserSpace';
import { OpenKernelEntryHero } from './detail/OpenKernelEntry';
import { OpenPathLookupHero } from './detail/OpenPathLookup';
import { OpenDentryCacheHero } from './detail/OpenDentryCache';
import { OpenInodePermissionHero } from './detail/OpenInodePermission';
import { OpenFdAllocationHero } from './detail/OpenFdAllocation';
import { OpenReturnPathHero } from './detail/OpenReturnPath';

// mmap
import { MmapUserSpaceHero } from './detail/MmapUserSpace';
import { MmapKernelEntryHero } from './detail/MmapKernelEntry';
import { MmapVmaAllocationHero } from './detail/MmapVmaAllocation';
import { MmapPageFaultHero } from './detail/MmapPageFault';
import { MmapMappingHero } from './detail/MmapMapping';
import { MmapTlbUpdateHero } from './detail/MmapTlbUpdate';
import { MmapReturnHero } from './detail/MmapReturn';

// execve
import { ExecveUserSpaceHero } from './detail/ExecveUserSpace';
import { ExecveKernelEntryHero } from './detail/ExecveKernelEntry';
import { ExecveElfLoaderHero } from './detail/ExecveElfLoader';
import { ExecveMmReplacementHero } from './detail/ExecveMmReplacement';
import { ExecveArgCopyHero } from './detail/ExecveArgCopy';
import { ExecveSignalResetHero } from './detail/ExecveSignalReset';
import { ExecveEntryJumpHero } from './detail/ExecveEntryJump';

// socket
import { SocketUserSpaceHero } from './detail/SocketUserSpace';
import { SocketKernelEntryHero } from './detail/SocketKernelEntry';
import { SocketAfInetHero } from './detail/SocketAfInet';
import { SocketBindConnectHero } from './detail/SocketBindConnect';
import { SocketSkBuffHero } from './detail/SocketSkBuff';
import { SocketProtocolStackHero } from './detail/SocketProtocolStack';
import { SocketReturnPathHero } from './detail/SocketReturnPath';

// ioctl
import { IoctlUserSpaceHero } from './detail/IoctlUserSpace';
import { IoctlKernelEntryHero } from './detail/IoctlKernelEntry';
import { IoctlVfsHero } from './detail/IoctlVfs';
import { IoctlDeviceHandlerHero } from './detail/IoctlDeviceHandler';
import { IoctlDataCopyHero } from './detail/IoctlDataCopy';
import { IoctlReturnPathHero } from './detail/IoctlReturnPath';

// clone
import { CloneUserSpaceHero } from './detail/CloneUserSpace';
import { CloneKernelEntryHero } from './detail/CloneKernelEntry';
import { CloneCopyProcessHero } from './detail/CloneCopyProcess';
import { CloneSharedMmHero } from './detail/CloneSharedMm';
import { CloneWakeHero } from './detail/CloneWake';
import { CloneReturnHero } from './detail/CloneReturn';

// epoll_wait
import { EpollWaitUserSpaceHero } from './detail/EpollWaitUserSpace';
import { EpollWaitKernelEntryHero } from './detail/EpollWaitKernelEntry';
import { EpollWaitInstanceHero } from './detail/EpollWaitInstance';
import { EpollWaitReadyListHero } from './detail/EpollWaitReadyList';
import { EpollWaitWaitQueueHero } from './detail/EpollWaitWaitQueue';
import { EpollWaitEventNotifyHero } from './detail/EpollWaitEventNotify';
import { EpollWaitReturnPathHero } from './detail/EpollWaitReturnPath';

// exit
import { ExitUserSpaceHero } from './detail/ExitUserSpace';
import { ExitKernelEntryHero } from './detail/ExitKernelEntry';
import { ExitMmReleaseHero } from './detail/ExitMmRelease';
import { ExitFdCleanupHero } from './detail/ExitFdCleanup';
import { ExitSignalParentHero } from './detail/ExitSignalParent';
import { ExitZombieHero } from './detail/ExitZombie';
import { ExitReapedHero } from './detail/ExitReaped';

// brk
import { BrkUserSpaceHero } from './detail/BrkUserSpace';
import { BrkKernelEntryHero } from './detail/BrkKernelEntry';
import { BrkHeapCheckHero } from './detail/BrkHeapCheck';
import { BrkVmaUpdateHero } from './detail/BrkVmaUpdate';
import { BrkPageAllocHero } from './detail/BrkPageAlloc';
import { BrkTlbUpdateHero } from './detail/BrkTlbUpdate';
import { BrkReturnPathHero } from './detail/BrkReturnPath';

export const HERO_REGISTRY: Record<string, React.FC> = {
  // read
  'read-user-space': ReadUserSpaceHero,
  'read-kernel-entry': ReadKernelEntryHero,
  'read-vfs': ReadVfsHero,
  'read-storage-stack': ReadStorageStackHero,
  'read-hardware-io': ReadHardwareIOHero,
  'read-return-path': ReadReturnPathHero,

  // fork
  'fork-user-space': ForkUserSpaceHero,
  'fork-kernel-entry': ForkKernelEntryHero,
  'fork-process-duplication': ForkProcessDuplicationHero,
  'fork-memory-resources': ForkMemoryResourcesHero,
  'fork-scheduler-integration': ForkSchedulerIntegrationHero,
  'fork-return': ForkReturnHero,

  // write
  'write-user-space': WriteUserSpaceHero,
  'write-kernel-entry': WriteKernelEntryHero,
  'write-vfs': WriteVfsHero,
  'write-page-cache': WritePageCacheHero,
  'write-block-layer': WriteBlockLayerHero,
  'write-hardware-io': WriteHardwareIOHero,
  'write-return-path': WriteReturnPathHero,

  // open
  'open-user-space': OpenUserSpaceHero,
  'open-kernel-entry': OpenKernelEntryHero,
  'open-path-lookup': OpenPathLookupHero,
  'open-dentry-cache': OpenDentryCacheHero,
  'open-inode-permission': OpenInodePermissionHero,
  'open-fd-allocation': OpenFdAllocationHero,
  'open-return-path': OpenReturnPathHero,

  // mmap
  'mmap-user-space': MmapUserSpaceHero,
  'mmap-kernel-entry': MmapKernelEntryHero,
  'mmap-vma-allocation': MmapVmaAllocationHero,
  'mmap-page-fault': MmapPageFaultHero,
  'mmap-mapping': MmapMappingHero,
  'mmap-tlb-update': MmapTlbUpdateHero,
  'mmap-return': MmapReturnHero,

  // execve
  'execve-user-space': ExecveUserSpaceHero,
  'execve-kernel-entry': ExecveKernelEntryHero,
  'execve-elf-loader': ExecveElfLoaderHero,
  'execve-mm-replacement': ExecveMmReplacementHero,
  'execve-arg-copy': ExecveArgCopyHero,
  'execve-signal-reset': ExecveSignalResetHero,
  'execve-entry-jump': ExecveEntryJumpHero,

  // socket
  'socket-user-space': SocketUserSpaceHero,
  'socket-kernel-entry': SocketKernelEntryHero,
  'socket-af-inet': SocketAfInetHero,
  'socket-bind-connect': SocketBindConnectHero,
  'socket-sk-buff': SocketSkBuffHero,
  'socket-protocol-stack': SocketProtocolStackHero,
  'socket-return-path': SocketReturnPathHero,

  // ioctl
  'ioctl-user-space': IoctlUserSpaceHero,
  'ioctl-kernel-entry': IoctlKernelEntryHero,
  'ioctl-vfs': IoctlVfsHero,
  'ioctl-device-handler': IoctlDeviceHandlerHero,
  'ioctl-data-copy': IoctlDataCopyHero,
  'ioctl-return-path': IoctlReturnPathHero,

  // clone
  'clone-user-space': CloneUserSpaceHero,
  'clone-kernel-entry': CloneKernelEntryHero,
  'clone-copy-process': CloneCopyProcessHero,
  'clone-shared-mm': CloneSharedMmHero,
  'clone-wake': CloneWakeHero,
  'clone-return': CloneReturnHero,

  // epoll_wait
  'epoll-wait-user-space': EpollWaitUserSpaceHero,
  'epoll-wait-kernel-entry': EpollWaitKernelEntryHero,
  'epoll-wait-instance': EpollWaitInstanceHero,
  'epoll-wait-ready-list': EpollWaitReadyListHero,
  'epoll-wait-wait-queue': EpollWaitWaitQueueHero,
  'epoll-wait-event-notify': EpollWaitEventNotifyHero,
  'epoll-wait-return-path': EpollWaitReturnPathHero,

  // exit
  'exit-user-space': ExitUserSpaceHero,
  'exit-kernel-entry': ExitKernelEntryHero,
  'exit-mm-release': ExitMmReleaseHero,
  'exit-fd-cleanup': ExitFdCleanupHero,
  'exit-signal-parent': ExitSignalParentHero,
  'exit-zombie': ExitZombieHero,
  'exit-reaped': ExitReapedHero,

  // brk
  'brk-user-space': BrkUserSpaceHero,
  'brk-kernel-entry': BrkKernelEntryHero,
  'brk-heap-check': BrkHeapCheckHero,
  'brk-vma-update': BrkVmaUpdateHero,
  'brk-page-alloc': BrkPageAllocHero,
  'brk-tlb-update': BrkTlbUpdateHero,
  'brk-return-path': BrkReturnPathHero,
};
