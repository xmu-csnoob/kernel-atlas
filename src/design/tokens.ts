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

export type Region = 'user' | 'kernel' | 'hardware' | 'return';

export const REGION_LABEL: Record<Region, string> = {
  user: 'User Space',
  kernel: 'Kernel',
  hardware: 'Hardware',
  return: 'Return',
};

/** Maps every main-flow node id (read + fork) to its execution region. */
export const NODE_REGION: Record<string, Region> = {
  // read()
  'read-user-space': 'user',
  'read-kernel-entry': 'kernel',
  'read-vfs': 'kernel',
  'read-storage-stack': 'kernel',
  'read-hardware-io': 'hardware',
  'read-return-path': 'return',
  // fork()
  'fork-user-space': 'user',
  'fork-kernel-entry': 'kernel',
  'fork-process-duplication': 'kernel',
  'fork-memory-resources': 'kernel',
  'fork-scheduler-integration': 'kernel',
  'fork-return': 'return',
};

export function regionOf(nodeId: string): Region {
  return NODE_REGION[nodeId] ?? 'kernel';
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
    kernel: {
      bg: '#161532',
      fg: '#9575cd',
      accent: '#b39ddb',
      glow: 'rgba(149, 117, 205, 0.35)',
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
    kernel: '0 0 14px rgba(149, 117, 205, 0.4)',
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
