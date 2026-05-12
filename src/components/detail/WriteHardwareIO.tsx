import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { color, font, space, radius } from '../../design/tokens';

// Animated hardware diagram — memory → DMA → disk + interrupt → CPU
const HardwareDiagram: React.FC = () => {
  const W = 760;
  const H = 280;

  return (
    <div style={{ overflow: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: '600px', maxWidth: '100%' }}>
        <defs>
          {/* Pulsing packet marker */}
          <radialGradient id="packet-grad-write" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color.accent.warning} stopOpacity="1" />
            <stop offset="60%" stopColor={color.accent.warning} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color.accent.warning} stopOpacity="0" />
          </radialGradient>
          {/* IRQ pulse */}
          <linearGradient id="irq-grad-write" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color.region.hardware.fg} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color.region.hardware.fg} stopOpacity="1" />
          </linearGradient>
          <marker id="irq-arrow-write" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color.region.hardware.fg} />
          </marker>
          <marker id="dma-arrow-write" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color.accent.warning} />
          </marker>
        </defs>

        {/* CPU at top */}
        <g transform="translate(540, 10)">
          <rect width="160" height="50" rx="6" fill={color.region.hardware.bg} stroke={color.region.hardware.fg} strokeWidth="1.5" />
          <text x="80" y="22" textAnchor="middle" fontFamily={font.family.mono} fontSize="11" fontWeight="700" fill={color.region.hardware.fg}>
            CPU
          </text>
          <text x="80" y="38" textAnchor="middle" fontFamily={font.family.mono} fontSize="9" fill={color.region.hardware.accent}>
            running other tasks
          </text>
        </g>

        {/* Memory (page cache) on left */}
        <g transform="translate(20, 130)">
          <rect width="150" height="120" rx="6" fill={color.region.hardware.bg} stroke={color.region.hardware.fg} strokeWidth="1.5" />
          <text x="75" y="22" textAnchor="middle" fontFamily={font.family.mono} fontSize="11" fontWeight="700" fill={color.region.hardware.fg}>
            SYSTEM MEMORY
          </text>
          <text x="75" y="38" textAnchor="middle" fontFamily={font.family.mono} fontSize="9" fill={color.region.hardware.accent} opacity="0.8">
            page cache (dirty)
          </text>
          {/* Page cells */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const x = 12 + (i % 4) * 36;
            const y = 52 + Math.floor(i / 4) * 28;
            const isTarget = i === 5;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="32"
                  height="22"
                  rx="2"
                  fill={isTarget ? color.accent.warning : color.bg.surface}
                  stroke={isTarget ? color.accent.warning : color.region.hardware.fg + '33'}
                  strokeWidth={isTarget ? '1.5' : '1'}
                  opacity={isTarget ? '0.9' : '0.4'}
                >
                  {isTarget && (
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                  )}
                </rect>
                <text
                  x={x + 16}
                  y={y + 14}
                  textAnchor="middle"
                  fontFamily={font.family.mono}
                  fontSize="8"
                  fill={isTarget ? color.bg.canvas : color.text.dim}
                  fontWeight={isTarget ? '700' : '400'}
                >
                  {isTarget ? 'DIRTY' : '4K'}
                </text>
              </g>
            );
          })}
          <text x="75" y="115" textAnchor="middle" fontFamily={font.family.mono} fontSize="8.5" fill={color.region.hardware.fg} opacity="0.8">
            page #19 → outgoing
          </text>
        </g>

        {/* DMA bus → Disk */}
        <g transform="translate(190, 155)">
          {/* Bus track */}
          <rect width="320" height="64" rx="6" fill={color.bg.inset} stroke={color.accent.warning} strokeWidth="1" strokeOpacity="0.4" />
          <text x="160" y="14" textAnchor="middle" fontFamily={font.family.mono} fontSize="8.5" fill={color.accent.warning} fontWeight="700" letterSpacing="2">
            DMA BUS · PCIe / AHCI (WRITE)
          </text>

          {/* Bus rail line */}
          <line x1="10" y1="36" x2="310" y2="36" stroke={color.accent.warning} strokeWidth="1.25" strokeOpacity="0.3" markerEnd="url(#dma-arrow-write)" />

          {/* Animated packets flowing left-to-right */}
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <circle r="6" fill="url(#packet-grad-write)">
                <animateMotion path="M 0 36 L 305 36" dur="2.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          {/* labels under bus */}
          <text x="160" y="58" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.text.muted}>
            no CPU involvement (DMA controller pumps data directly)
          </text>
        </g>

        {/* Disk on right */}
        <g transform="translate(540, 130)">
          <rect width="160" height="120" rx="6" fill={color.region.hardware.bg} stroke={color.region.hardware.fg} strokeWidth="1.5" />
          <text x="80" y="22" textAnchor="middle" fontFamily={font.family.mono} fontSize="11" fontWeight="700" fill={color.region.hardware.fg}>
            DISK
          </text>
          <text x="80" y="38" textAnchor="middle" fontFamily={font.family.mono} fontSize="9" fill={color.region.hardware.accent} opacity="0.8">
            SATA / SCSI
          </text>
          {/* Platter circle */}
          <circle cx="80" cy="78" r="28" fill="none" stroke={color.region.hardware.accent} strokeWidth="1" opacity="0.5" />
          <circle cx="80" cy="78" r="20" fill="none" stroke={color.region.hardware.accent} strokeWidth="1" opacity="0.4" />
          <circle cx="80" cy="78" r="12" fill="none" stroke={color.region.hardware.accent} strokeWidth="1" opacity="0.3" />
          <circle cx="80" cy="78" r="3" fill={color.region.hardware.fg} />
          {/* Write head pointer */}
          <line x1="80" y1="78" x2="105" y2="63" stroke={color.region.hardware.fg} strokeWidth="1.5" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 80 78" to="360 80 78" dur="6s" repeatCount="indefinite" />
          </line>
          <text x="80" y="118" textAnchor="middle" fontFamily={font.family.mono} fontSize="8.5" fill={color.region.hardware.fg} opacity="0.7">
            sector 0x4290 +8
          </text>
        </g>

        {/* IRQ line: from disk top to CPU */}
        <g>
          <path
            d="M 620 130 Q 620 90 620 80"
            fill="none"
            stroke="url(#irq-grad-write)"
            strokeWidth="2"
            strokeDasharray="6 6"
            markerEnd="url(#irq-arrow-write)"
            opacity="0.85"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="0.8s" repeatCount="indefinite" />
          </path>
          {/* IRQ pulse blob traveling along the path */}
          <circle r="4" fill={color.region.hardware.fg} opacity="0.95">
            <animateMotion path="M 620 130 Q 620 90 620 80" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x="680" y="105" textAnchor="middle" fontFamily={font.family.mono} fontSize="9.5" fill={color.region.hardware.fg} fontWeight="700" letterSpacing="0.1em">
            IRQ — "write complete!"
          </text>
        </g>
      </svg>
    </div>
  );
};

export const WriteHardwareIOHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
    <HardwareDiagram />
    <div
      style={{
        background: 'rgba(239, 83, 80, 0.06)',
        border: `1px solid ${color.region.hardware.fg}33`,
        borderRadius: radius.md,
        padding: space[3],
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: color.region.hardware.fg }}>Why this matters:</strong>{' '}
      The CPU does <em>not</em> shuffle bytes from memory to disk — it programs the disk
      controller (via memory-mapped registers) and goes off to do other work. The DMA engine
      shuttles the 4&nbsp;KB block directly from the page-cache page to the disk buffer.
      When the transfer finishes, the disk fires an interrupt; the kernel's IRQ handler
      marks the page clean and wakes anyone waiting for sync.{' '}
      <span style={{ color: color.region.hardware.fg }}>This is the only
      point in the path where there is no kernel source line — it is silicon.</span>
    </div>
  </div>
);

const WriteHardwareIO: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="The hardware does the work — DMA write + interrupt"
    hero={<WriteHardwareIOHero />}
  />
);

export default WriteHardwareIO;
