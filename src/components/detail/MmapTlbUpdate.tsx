import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const MmapTlbUpdateHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* TLB diagram */}
    <div>
      <SectionLabel accent={color.region.hardware.fg}>
        TLB invalidation — INVLPG instruction  ·  arch/x86/mm/tlb.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <TlbDiagram />
      </div>
    </div>

    {/* Code + struct row */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.hardware.fg}>flush_tlb_page — selective TLB shootdown</SectionLabel>
        <CodeBlock compact>{`void flush_tlb_page(struct vm_area_struct *vma,
                    unsigned long addr)
{
    struct mm_struct *mm = vma->vm_mm;

    if (cpumask_test_cpu(cpu, mm_cpumask(mm))) {
        /* Local CPU: INVLPG directly */
        __flush_tlb_one(addr);
    }

    /* Remote CPUs: send IPI for TLB shootdown */
    if (!cpumask_empty(mm_cpumask(mm)))
        smp_call_function_many(mm_cpumask(mm),
                               flush_tlb_func, ...);
}

static inline void __flush_tlb_one(unsigned long addr)
{
    asm volatile("invlpg (%0)" :: "r" (addr) : "memory");
}`}</CodeBlock>
      </div>
      <StructCard
        name="TLB entry"
        type="x86 hardware"
        region="hardware"
        fields={[
          { label: 'VPN', value: '0x7f00...a', highlight: true },
          { label: 'PFN', value: '0xabc2', highlight: true },
          { label: 'G', value: '0 (not global)' },
          { label: 'D', value: '1 (dirty)' },
          { label: 'A', value: '1 (accessed)' },
          { label: 'state', value: 'INVALIDATED', highlight: true },
        ]}
      />
    </div>

    {/* Lazy TLB explanation */}
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
      <strong style={{ color: color.region.hardware.fg }}>Why INVLPG matters:</strong>{' '}
      After the kernel installs a new PTE mapping a virtual page to a physical page,
      the CPU's TLB may still hold a stale (or absent) translation for that virtual address.
      The <code style={{ color: color.accent.primary }}>INVLPG</code> instruction selectively
      invalidates the TLB entry for a single page, avoiding the expensive full-TLB flush
      that would occur with a CR3 reload. On multi-core systems, the kernel uses{' '}
      <em>lazy TLB mode</em> (tracked via mm_cpumask) to avoid broadcasting shootdown IPIs
      to CPUs that are not using this mm.
    </div>
  </div>
);

const MmapTlbUpdate: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="flush_tlb_page() → INVLPG → TLB entry invalidated"
    hero={<MmapTlbUpdateHero />}
  />
);

/** TLB diagram showing before/after invalidation */
const TlbDiagram: React.FC = () => {
  const W = 680;
  const H = 220;

  const tlbEntries = [
    { vpn: '0x7f00...8', pfn: '0xabc0', valid: true },
    { vpn: '0x7f00...9', pfn: '0xabc1', valid: true },
    { vpn: '0x7f00...a', pfn: '—', valid: false, isTarget: true },
    { vpn: '0x7f00...b', pfn: '0xabc3', valid: true },
    { vpn: '0x7f00...c', pfn: '0xabc4', valid: true },
    { vpn: '0x7f00...d', pfn: '0xabc5', valid: true },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '680px' }}>
      <defs>
        <marker id="invlpg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
        </marker>
      </defs>

      {/* TLB box */}
      <g transform="translate(20, 10)">
        <rect width="200" height={H - 20} rx="6" fill={color.bg.surface} stroke={color.region.hardware.fg} strokeWidth="1.5" />
        <text x="100" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="11px" fontWeight="700" fill={color.region.hardware.fg}>
          TLB (L1 dTLB)
        </text>
        <text x="100" y="34" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          64 entries, 4-way set-assoc
        </text>

        {/* TLB entries */}
        {tlbEntries.map((entry, i) => (
          <g key={i} transform={`translate(10, ${50 + i * 24})`}>
            <rect
              width="180"
              height="20"
              rx="3"
              fill={entry.isTarget ? 'rgba(255, 235, 59, 0.08)' : color.bg.inset}
              stroke={entry.isTarget ? color.pulse : color.border.subtle}
              strokeWidth={entry.isTarget ? '1.5' : '1'}
            >
              {entry.isTarget && (
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
              )}
            </rect>
            <text x="8" y="14" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.pulse : color.text.secondary}>
              VPN {entry.vpn}
            </text>
            <text x="140" y="14" textAnchor="end" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.pulse : entry.valid ? color.accent.success : color.text.dim}>
              {entry.valid ? `→ PFN ${entry.pfn}` : 'INVALID'}
            </text>
            {entry.isTarget && (
              <text x="170" y="14" textAnchor="middle" fontFamily={font.family.mono} fontSize="10px" fill={color.pulse} fontWeight="700">
                ✗
              </text>
            )}
          </g>
        ))}
      </g>

      {/* INVLPG arrow */}
      <g>
        <line
          x1={240}
          y1={110}
          x2={310}
          y2={110}
          stroke={color.pulse}
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd="url(#invlpg-arrow)"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite" />
        </line>
        <text x="275" y="100" textAnchor="middle" fontFamily={font.family.mono} fontSize="9px" fill={color.pulse} fontWeight="700">
          INVLPG
        </text>
        <text x="275" y="130" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          invalidate single entry
        </text>
      </g>

      {/* After: PTE installed */}
      <g transform="translate(330, 10)">
        <rect width="200" height={H - 20} rx="6" fill={color.bg.surface} stroke={color.accent.success} strokeWidth="1.5" />
        <text x="100" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="11px" fontWeight="700" fill={color.accent.success}>
          Page Table (PTE)
        </text>
        <text x="100" y="34" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          freshly installed
        </text>

        {tlbEntries.map((entry, i) => (
          <g key={i} transform={`translate(10, ${50 + i * 24})`}>
            <rect
              width="180"
              height="20"
              rx="3"
              fill={entry.isTarget ? 'rgba(102, 187, 106, 0.12)' : color.bg.inset}
              stroke={entry.isTarget ? color.accent.success : color.border.subtle}
              strokeWidth={entry.isTarget ? '1.5' : '1'}
            />
            <text x="8" y="14" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.accent.success : color.text.secondary}>
              VPN {entry.vpn}
            </text>
            <text
              x="140"
              y="14"
              textAnchor="end"
              fontFamily={font.family.mono}
              fontSize="9px"
              fill={entry.isTarget ? color.accent.success : color.text.secondary}
            >
              {entry.isTarget ? '→ PFN 0xabc2 ✓' : `→ PFN ${entry.pfn}`}
            </text>
          </g>
        ))}
      </g>

      {/* Next access arrow */}
      <g>
        <line
          x1={550}
          y1={110}
          x2={620}
          y2={110}
          stroke={color.region.return.fg}
          strokeWidth="2"
          markerEnd="url(#invlpg-arrow)"
        />
        <text x="585" y="100" textAnchor="middle" fontFamily={font.family.mono} fontSize="9px" fill={color.region.return.fg} fontWeight="700">
          next access
        </text>
        <text x="585" y="130" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          TLB miss → page walk
        </text>
      </g>

      {/* Result */}
      <g transform="translate(640, 80)">
        <rect width="30" height="60" rx="4" fill={color.region.return.bg} stroke={color.region.return.fg} strokeWidth="1.5" />
        <text x="15" y="28" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.region.return.fg} fontWeight="700">
          CPU
        </text>
        <text x="15" y="42" textAnchor="middle" fontFamily={font.family.mono} fontSize="7px" fill={color.region.return.accent}>
          reads
        </text>
        <text x="15" y="54" textAnchor="middle" fontFamily={font.family.mono} fontSize="7px" fill={color.region.return.accent}>
          data
        </text>
      </g>
    </svg>
  );
};

export default MmapTlbUpdate;
