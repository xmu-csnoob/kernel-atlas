/**
 * Kernel Atlas — Design Tokens
 *
 * Single source of truth for the visual system.
 * All components import colors / type / spacing / region mapping from here.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Region semantic — every main-flow node belongs to one execution region.
// Used to color-code nodes, lanes, edges, and detail panels.
// ─────────────────────────────────────────────────────────────────────────────

export type Region =
  | 'user'
  | 'vfs'
  | 'mm'
  | 'net'
  | 'sched'
  | 'process'
  | 'signal'
  | 'driver'
  | 'block'
  | 'fs'
  | 'hardware'
  | 'return';

export const REGION_LABEL: Record<Region, string> = {
  user: 'User Space',
  vfs: 'VFS',
  mm: 'Memory',
  net: 'Network',
  sched: 'Scheduler',
  process: 'Process',
  signal: 'Signal',
  driver: 'Driver',
  block: 'Block I/O',
  fs: 'File System',
  hardware: 'Hardware',
  return: 'Return',
};

export const REGION_LABEL_ZH: Record<Region, string> = {
  user: '用户空间',
  vfs: '虚拟文件系统',
  mm: '内存管理',
  net: '网络',
  sched: '调度器',
  process: '进程管理',
  signal: '信号',
  driver: '驱动',
  block: '块设备',
  fs: '文件系统',
  hardware: '硬件',
  return: '返回',
};

export const REGION_SUBLABEL: Record<Region, string> = {
  user: 'ring 3',
  vfs: 'VFS layer',
  mm: 'page tables',
  net: 'TCP/IP',
  sched: 'CFS',
  process: 'task_struct',
  signal: 'sigaction',
  driver: 'char/block',
  block: 'bio/request',
  fs: 'ext4/xfs',
  hardware: 'devices',
  return: 'back to user',
};

export const REGION_SUBLABEL_ZH: Record<Region, string> = {
  user: '环 3',
  vfs: 'VFS 层',
  mm: '页表',
  net: '网络栈',
  sched: '调度',
  process: '进程',
  signal: '信号',
  driver: '驱动',
  block: '块层',
  fs: '文件系统',
  hardware: '设备',
  return: '返回用户态',
};

/** Maps every main-flow node id (read + fork) to its execution region. */
export const NODE_REGION: Record<string, Region> = {
  // read()
  'read-user-space': 'user',
  'read-kernel-entry': 'vfs',
  'read-vfs': 'vfs',
  'read-storage-stack': 'fs',
  'read-hardware-io': 'hardware',
  'read-return-path': 'return',
  // fork()
  'fork-user-space': 'user',
  'fork-kernel-entry': 'process',
  'fork-process-duplication': 'process',
  'fork-memory-resources': 'mm',
  'fork-scheduler-integration': 'sched',
  'fork-return': 'return',
  // write()
  'write-user-space': 'user',
  'write-kernel-entry': 'vfs',
  'write-vfs': 'vfs',
  'write-page-cache': 'mm',
  'write-block-layer': 'block',
  'write-hardware-io': 'hardware',
  'write-return-path': 'return',
  // open()
  'open-user-space': 'user',
  'open-kernel-entry': 'vfs',
  'open-path-lookup': 'vfs',
  'open-dentry-cache': 'vfs',
  'open-inode-permission': 'vfs',
  'open-fd-allocation': 'process',
  'open-return-path': 'return',
  // mmap()
  'mmap-user-space': 'user',
  'mmap-kernel-entry': 'mm',
  'mmap-vma-allocation': 'mm',
  'mmap-page-fault': 'mm',
  'mmap-mapping': 'mm',
  'mmap-tlb-update': 'mm',
  'mmap-return': 'return',
  // execve()
  'execve-user-space': 'user',
  'execve-kernel-entry': 'process',
  'execve-elf-loader': 'process',
  'execve-mm-replacement': 'mm',
  'execve-arg-copy': 'process',
  'execve-signal-reset': 'signal',
  'execve-entry-jump': 'return',
  // socket()
  'socket-user-space': 'user',
  'socket-kernel-entry': 'net',
  'socket-af-inet': 'net',
  'socket-bind-connect': 'net',
  'socket-sk-buff': 'net',
  'socket-protocol-stack': 'net',
  'socket-return-path': 'return',
  // ioctl()
  'ioctl-user-space': 'user',
  'ioctl-kernel-entry': 'vfs',
  'ioctl-vfs': 'vfs',
  'ioctl-device-handler': 'driver',
  'ioctl-data-copy': 'vfs',
  'ioctl-return-path': 'return',
  // clone()
  'clone-user-space': 'user',
  'clone-kernel-entry': 'process',
  'clone-copy-process': 'process',
  'clone-shared-mm': 'mm',
  'clone-wake': 'sched',
  'clone-return': 'return',
  // epoll_wait()
  'epoll-wait-user-space': 'user',
  'epoll-wait-kernel-entry': 'fs',
  'epoll-wait-instance': 'fs',
  'epoll-wait-ready-list': 'fs',
  'epoll-wait-wait-queue': 'sched',
  'epoll-wait-event-notify': 'fs',
  'epoll-wait-return-path': 'return',
  // exit()
  'exit-user-space': 'user',
  'exit-kernel-entry': 'process',
  'exit-mm-release': 'mm',
  'exit-fd-cleanup': 'process',
  'exit-signal-parent': 'signal',
  'exit-zombie': 'process',
  'exit-reaped': 'return',
  // brk()
  'brk-user-space': 'user',
  'brk-kernel-entry': 'mm',
  'brk-heap-check': 'mm',
  'brk-vma-update': 'mm',
  'brk-page-alloc': 'mm',
  'brk-tlb-update': 'mm',
  'brk-return-path': 'return',
};

export function regionOf(nodeId: string): Region {
  return NODE_REGION[nodeId] ?? 'process';
}

// ─────────────────────────────────────────────────────────────────────────────
// Color palette
// ─────────────────────────────────────────────────────────────────────────────

export const color = {
  // Surfaces
  bg: {
    canvas: '#080b14',     // page background, deepest
    surface: '#0f1322',    // primary card background
    elevated: '#171c30',   // raised cards, popovers
    inset: '#060911',      // code blocks, sunken areas
  },
  // Borders
  border: {
    subtle: '#1c2238',
    default: '#252e4a',
    strong: '#374365',
  },
  // Text
  text: {
    primary: '#e8edf7',    // body / titles
    secondary: '#a4afc9',  // captions, secondary
    muted: '#6c7799',      // labels, supporting
    dim: '#48527a',        // dimmed/inactive
  },
  // Region colors — each region has bg (lane fill), fg (primary), accent (highlight)
  region: {
    user: {
      bg: '#2a1d09',
      fg: '#ffb74d',
      accent: '#ffd180',
      glow: 'rgba(255, 183, 77, 0.35)',
    },
    vfs: {
      bg: '#0d1f2d',
      fg: '#4fc3f7',
      accent: '#81d4fa',
      glow: 'rgba(79, 195, 247, 0.35)',
    },
    mm: {
      bg: '#1a1025',
      fg: '#ce93d8',
      accent: '#e1bee7',
      glow: 'rgba(206, 147, 216, 0.35)',
    },
    net: {
      bg: '#0d1b1a',
      fg: '#69f0ae',
      accent: '#b9f6ca',
      glow: 'rgba(105, 240, 174, 0.35)',
    },
    sched: {
      bg: '#1a1a0d',
      fg: '#fff176',
      accent: '#fff59d',
      glow: 'rgba(255, 241, 118, 0.35)',
    },
    process: {
      bg: '#1d1520',
      fg: '#ff8a65',
      accent: '#ffab91',
      glow: 'rgba(255, 138, 101, 0.35)',
    },
    signal: {
      bg: '#251010',
      fg: '#ff5252',
      accent: '#ff8a80',
      glow: 'rgba(255, 82, 82, 0.35)',
    },
    driver: {
      bg: '#151520',
      fg: '#7986cb',
      accent: '#9fa8da',
      glow: 'rgba(121, 134, 203, 0.35)',
    },
    block: {
      bg: '#1a1010',
      fg: '#e57373',
      accent: '#ffcdd2',
      glow: 'rgba(229, 115, 115, 0.35)',
    },
    fs: {
      bg: '#0f1d2a',
      fg: '#4dd0e1',
      accent: '#80deea',
      glow: 'rgba(77, 208, 225, 0.35)',
    },
    hardware: {
      bg: '#2a1212',
      fg: '#ef5350',
      accent: '#ef9a9a',
      glow: 'rgba(239, 83, 80, 0.35)',
    },
    return: {
      bg: '#0a2520',
      fg: '#4dd0a3',
      accent: '#80e8c2',
      glow: 'rgba(77, 208, 163, 0.35)',
    },
  } as const,
  // Semantic accents
  accent: {
    primary: '#4dd0e1',    // interactive cyan
    primaryGlow: 'rgba(77, 208, 225, 0.4)',
    success: '#66bb6a',
    warning: '#ffa726',
    danger: '#ef5350',
  },
  // Special
  pulse: '#ffeb3b',        // syscall pulse — bright yellow
  pulseGlow: 'rgba(255, 235, 59, 0.6)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

export const font = {
  family: {
    sans: '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", "Menlo", monospace',
  },
  size: {
    xs: '10px',
    sm: '11px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '28px',
    '4xl': '34px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.04em',
    wider: '0.08em',
    label: '0.12em',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing scale (4px base)
// ─────────────────────────────────────────────────────────────────────────────

export const space = {
  '0': '0',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Radii
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadows / glows
// ─────────────────────────────────────────────────────────────────────────────

export const shadow = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.4)',
  md: '0 4px 12px rgba(0, 0, 0, 0.5)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
  glow: {
    cyan: '0 0 14px rgba(77, 208, 225, 0.45)',
    pulse: '0 0 16px rgba(255, 235, 59, 0.7), 0 0 32px rgba(255, 235, 59, 0.4)',
    user: '0 0 14px rgba(255, 183, 77, 0.4)',
    vfs: '0 0 14px rgba(79, 195, 247, 0.4)',
    mm: '0 0 14px rgba(206, 147, 216, 0.4)',
    net: '0 0 14px rgba(105, 240, 174, 0.4)',
    sched: '0 0 14px rgba(255, 241, 118, 0.4)',
    process: '0 0 14px rgba(255, 138, 101, 0.4)',
    signal: '0 0 14px rgba(255, 82, 82, 0.4)',
    driver: '0 0 14px rgba(121, 134, 203, 0.4)',
    block: '0 0 14px rgba(229, 115, 115, 0.4)',
    fs: '0 0 14px rgba(77, 208, 225, 0.4)',
    hardware: '0 0 14px rgba(239, 83, 80, 0.4)',
    return: '0 0 14px rgba(77, 208, 163, 0.4)',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Motion
// ─────────────────────────────────────────────────────────────────────────────

export const motion = {
  duration: {
    fast: 150,
    medium: 300,
    slow: 500,
    pulse: 800,    // pulse hop between two adjacent main-flow nodes
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    snap: 'cubic-bezier(0.5, 0, 0, 1)',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Region helpers for components
// ─────────────────────────────────────────────────────────────────────────────

export function regionPalette(region: Region) {
  return color.region[region];
}

export function regionGlow(region: Region) {
  return shadow.glow[region];
}
