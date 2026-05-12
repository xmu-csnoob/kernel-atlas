import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const BrkTlbUpdateHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* PTE → TLB mapping diagram */}
    <div>
      <SectionLabel accent={color.region.hardware.fg}>
        PTE installation + TLB invalidation
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <TlbMappingDiagram />
      </div>
    </div>

    {/* PTE structure + code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="x86_64 PTE"
        type="64-bit"
        region="mm"
        fields={[
          { label: 'bits 0-11', value: 'flags (see below)', highlight: true },
          { label: 'bits 12-51', value: 'PFN (physical frame)', highlight: true },
          { label: 'bits 52-62', value: 'reserved / NX' },
          { label: 'bit 63', value: 'NX (no-execute)' },
        ]}
      />
      <StructCard
        name="PTE flags"
        type="0x827"
        region="mm"
        fields={[
          { label: 'P (bit 0)', value: '1  present', highlight: true },
          { label: 'R/W (bit 1)', value: '1  writable', highlight: true },
          { label: 'U/S (bit 2)', value: '1  user', highlight: true },
          { label: 'A (bit 5)', value: '1  accessed' },
          { label: 'D (bit 6)', value: '1  dirty' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>set_pte_at() + TLB flush</SectionLabel>
        <CodeBlock>{`/* Write the page table entry */
set_pte_at(mm, address, ptep, pte);

/* Invalidate TLB for this address */
__flush_tlb_one(address);

/* x86: invlpg instruction */
asm volatile("invlpg (%0)"
    :: "r" (addr) : "memory");`}</CodeBlock>
      </div>
    </div>

    {/* Page table walk */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>x86_64 4-level page table walk</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.8,
        }}
      >
        <div>
          <span style={{ color: color.text.muted }}>cr3</span>
          <span style={{ color: color.accent.primary, marginLeft: space[3] }}>→ PML4[0x100]</span>
        </div>
        <div style={{ paddingLeft: space[6] }}>
          <span style={{ color: color.accent.primary }}>→ PDPT[0x1]</span>
        </div>
        <div style={{ paddingLeft: space[6] }}>
          <span style={{ color: color.accent.primary }}>→ PD[0x8a]</span>
        </div>
        <div style={{ paddingLeft: space[6] }}>
          <span style={{ color: color.accent.warning }}>→ PT[0x300]</span>
          <span style={{ color: color.pulse, marginLeft: space[3], fontWeight: font.weight.bold }}>
            = PTE(0x15a04827) ← new mapping
          </span>
        </div>
        <div style={{ marginTop: space[2], color: color.text.dim, fontSize: font.size.xs }}>
          Virtual 0x8a3000 → PTE PFN 0x15a04 → Physical 0x15a04000 (4KB page)
        </div>
      </div>
    </div>

    {/* Hardware insight */}
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
      <strong style={{ color: color.region.hardware.fg }}>Why TLB flush is required:</strong>{' '}
      The CPU caches page table translations in the TLB for speed. When the kernel
      installs a new PTE, the TLB may still hold a stale (or absent) translation for
      that virtual address. The{' '}
      <code style={{ color: color.accent.primary }}>invlpg</code> instruction selectively
      invalidates the TLB entry for a single page, avoiding the expensive full-TLB flush.
      On the next access, the CPU performs a page walk to find the new PTE and caches
      it in the TLB.
    </div>
  </div>
);

const BrkTlbUpdate: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="set_pte_at() → invlpg → TLB flush → virtual address valid"
    hero={<BrkTlbUpdateHero />}
  />
);

/** TLB to PTE mapping diagram for brk() page fault */
const TlbMappingDiagram: React.FC = () => {
  const W = 600;
  const H = 180;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '600px' }}>
      <defs>
        <marker id="brk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
        </marker>
      </defs>

      {/* Before: TLB miss */}
      <g transform="translate(20, 10)">
        <rect width="160" height={H - 20} rx="6" fill={color.bg.surface} stroke={color.region.hardware.fg} strokeWidth="1.5" />
        <text x="80" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="11px" fontWeight="700" fill={color.region.hardware.fg}>
          TLB
        </text>
        <text x="80" y="34" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          before access
        </text>

        {/* TLB entries */}
        {[
          { vpn: '0x8a2000', state: 'cached', valid: true },
          { vpn: '0x8a3000', state: 'MISS', valid: false, isTarget: true },
          { vpn: '0x8a4000', state: 'cached', valid: true },
        ].map((entry, i) => (
          <g key={i} transform={`translate(10, ${55 + i * 32})`}>
            <rect
              width="140"
              height="24"
              rx="3"
              fill={entry.isTarget ? 'rgba(255, 235, 59, 0.08)' : color.bg.inset}
              stroke={entry.isTarget ? color.pulse : color.border.subtle}
              strokeWidth={entry.isTarget ? '1.5' : '1'}
            >
              {entry.isTarget && (
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
              )}
            </rect>
            <text x="8" y="16" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.pulse : color.text.secondary}>
              {entry.vpn}
            </text>
            <text x="130" y="16" textAnchor="end" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.pulse : entry.valid ? color.accent.success : color.text.dim}>
              {entry.isTarget ? 'MISS' : 'cached'}
            </text>
          </g>
        ))}
      </g>

      {/* Arrow: page walk */}
      <g>
        <line x1={200} y1={90} x2={260} y2={90} stroke={color.pulse} strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#brk-arrow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite" />
        </line>
        <text x="230" y="80" textAnchor="middle" fontFamily={font.family.mono} fontSize="9px" fill={color.pulse} fontWeight="700">
          page walk
        </text>
        <text x="230" y="110" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          CR3 → PML4 → PDPT → PD → PT
        </text>
      </g>

      {/* PTE */}
      <g transform="translate(280, 10)">
        <rect width="160" height={H - 20} rx="6" fill={color.bg.surface} stroke={color.accent.success} strokeWidth="1.5" />
        <text x="80" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="11px" fontWeight="700" fill={color.accent.success}>
          Page Table
        </text>
        <text x="80" y="34" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          PTE installed
        </text>

        {[
          { vpn: '0x8a2000', pfn: '0x15a03' },
          { vpn: '0x8a3000', pfn: '0x15a04', isTarget: true },
          { vpn: '0x8a4000', pfn: '0x15a05' },
        ].map((entry, i) => (
          <g key={i} transform={`translate(10, ${55 + i * 32})`}>
            <rect
              width="140"
              height="24"
              rx="3"
              fill={entry.isTarget ? 'rgba(102, 187, 106, 0.12)' : color.bg.inset}
              stroke={entry.isTarget ? color.accent.success : color.border.subtle}
              strokeWidth={entry.isTarget ? '1.5' : '1'}
            />
            <text x="8" y="16" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.accent.success : color.text.secondary}>
              {entry.vpn}
            </text>
            <text x="130" y="16" textAnchor="end" fontFamily={font.family.mono} fontSize="9px" fill={entry.isTarget ? color.accent.success : color.text.secondary}>
              {entry.isTarget ? `→ PFN ${entry.pfn} ✓` : `→ PFN ${entry.pfn}`}
            </text>
          </g>
        ))}
      </g>

      {/* Arrow: invlpg + retry */}
      <g>
        <line x1={460} y1={90} x2={520} y2={90} stroke={color.region.return.fg} strokeWidth="2" markerEnd="url(#brk-arrow)" />
        <text x="490" y="80" textAnchor="middle" fontFamily={font.family.mono} fontSize="9px" fill={color.region.return.fg} fontWeight="700">
          invlpg
        </text>
        <text x="490" y="110" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.text.dim}>
          CPU retries
        </text>
      </g>

      {/* Result: user access */}
      <g transform="translate(540, 55)">
        <rect width="50" height="70" rx="4" fill={color.region.return.bg} stroke={color.region.return.fg} strokeWidth="1.5" />
        <text x="25" y="28" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.region.return.fg} fontWeight="700">
          write
        </text>
        <text x="25" y="44" textAnchor="middle" fontFamily={font.family.mono} fontSize="8px" fill={color.region.return.fg} fontWeight="700">
          0x8a3000
        </text>
        <text x="25" y="58" textAnchor="middle" fontFamily={font.family.mono} fontSize="7px" fill={color.region.return.accent}>
          success
        </text>
      </g>
    </svg>
  );
};

export default BrkTlbUpdate;
