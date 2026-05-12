import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const MmapPageFaultHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Page fault flow diagram */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        Page fault handling flow  ·  arch/x86/mm/fault.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <PageFaultFlow />
      </div>
    </div>

    {/* Page table walk visualization */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        4-level page table walk (x86-64)  ·  mm/memory.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PageTableWalkDiagram />
      </div>
    </div>

    {/* Code + CR2 */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="CR2 register"
        type="x86 hardware"
        region="mm"
        fields={[
          { label: 'CR2', value: '0x7f00...a000', highlight: true },
          { label: 'error_code', value: '0x6 (W+U)' },
          { label: 'RIP', value: '0x401234' },
          { label: 'CPL', value: '3 (user)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>do_page_fault — CR2 → find_vma → handle_mm_fault</SectionLabel>
        <CodeBlock compact>{`static void do_page_fault(struct pt_regs *regs,
                          unsigned long error_code)
{
    unsigned long address = read_cr2();
    struct mm_struct *mm = current->mm;
    struct vm_area_struct *vma;

    vma = find_vma(mm, address);
    if (!vma)
        goto bad_area;       /* SIGSEGV */

    fault = handle_mm_fault(mm, vma, address, write);
    if (unlikely(fault & VM_FAULT_ERROR))
        goto do_sigbus;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const MmapPageFault: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="CPU page fault → do_page_fault() → handle_mm_fault() → page table walk"
    hero={<MmapPageFaultHero />}
  />
);

/** Page fault handling flow diagram */
const PageFaultFlow: React.FC = () => {
  const steps = [
    { label: 'CPU raises #PF', sub: 'CR2 = fault addr', color: color.region.hardware.fg },
    { label: 'do_page_fault()', sub: 'arch/x86/mm/fault.c', color: color.region.mm.fg },
    { label: 'find_vma()', sub: 'search rb_tree', color: color.region.mm.fg },
    { label: 'handle_mm_fault()', sub: 'mm/memory.c', color: color.region.mm.fg },
    { label: 'handle_pte_fault()', sub: 'anon or file?', color: color.region.mm.fg },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space[2], flexWrap: 'wrap', justifyContent: 'center' }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              background: color.bg.surface,
              border: `1px solid ${step.color}55`,
              borderRadius: radius.md,
              padding: `${space[2]} ${space[3]}`,
              minWidth: '100px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
                color: step.color,
                fontWeight: 700,
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                fontFamily: font.family.mono,
                fontSize: '9px',
                color: color.text.dim,
                marginTop: '2px',
              }}
            >
              {step.sub}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span style={{ color: color.text.dim, fontSize: '14px' }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/** 4-level page table walk diagram */
const PageTableWalkDiagram: React.FC = () => {
  const W = 640;
  const H = 200;

  const levels = [
    { name: 'CR3 / PGD', x: 40, y: 20, w: 80, h: 32, entries: '512', color: color.region.mm.fg },
    { name: 'PUD', x: 160, y: 20, w: 80, h: 32, entries: '512', color: color.region.mm.fg },
    { name: 'PMD', x: 280, y: 20, w: 80, h: 32, entries: '512', color: color.region.mm.fg },
    { name: 'PTE', x: 400, y: 20, w: 80, h: 32, entries: '512', color: color.region.mm.fg },
    { name: 'PAGE', x: 520, y: 20, w: 80, h: 32, entries: '4 KB', color: color.accent.success },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '640px' }}>
      <defs>
        <marker id="pt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color.region.mm.fg} />
        </marker>
      </defs>

      {/* Level boxes */}
      {levels.map((lvl, i) => (
        <g key={i}>
          <rect
            x={lvl.x}
            y={lvl.y}
            width={lvl.w}
            height={lvl.h}
            rx="4"
            fill={color.bg.surface}
            stroke={lvl.color}
            strokeWidth="1.5"
          />
          <text
            x={lvl.x + lvl.w / 2}
            y={lvl.y + 14}
            textAnchor="middle"
            fontFamily={font.family.mono}
            fontSize="10px"
            fontWeight="700"
            fill={lvl.color}
          >
            {lvl.name}
          </text>
          <text
            x={lvl.x + lvl.w / 2}
            y={lvl.y + 26}
            textAnchor="middle"
            fontFamily={font.family.mono}
            fontSize="8px"
            fill={color.text.dim}
          >
            {lvl.entries}
          </text>

          {/* Arrow to next level */}
          {i < levels.length - 1 && (
            <line
              x1={lvl.x + lvl.w}
              y1={lvl.y + lvl.h / 2}
              x2={levels[i + 1].x - 4}
              y2={levels[i + 1].y + levels[i + 1].h / 2}
              stroke={color.region.mm.fg}
              strokeWidth="1.5"
              markerEnd="url(#pt-arrow)"
              opacity="0.6"
            />
          )}
        </g>
      ))}

      {/* Address breakdown */}
      <g transform="translate(0, 80)">
        <text
          x={W / 2}
          y={0}
          textAnchor="middle"
          fontFamily={font.family.mono}
          fontSize="9px"
          fill={color.text.muted}
        >
          Virtual address breakdown (48-bit, 4-level)
        </text>
        {/* Address bar */}
        <rect x={40} y={10} width={560} height={28} rx="3" fill={color.bg.surface} stroke={color.border.subtle} />
        {/* Segments */}
        {[
          { label: 'unused', w: 80, color: color.text.dim },
          { label: 'PGD[9b]', w: 90, color: color.region.mm.fg },
          { label: 'PUD[9b]', w: 90, color: color.region.mm.fg },
          { label: 'PMD[9b]', w: 90, color: color.region.mm.fg },
          { label: 'PTE[9b]', w: 90, color: color.region.mm.fg },
          { label: 'offset[12b]', w: 120, color: color.accent.success },
        ].map((seg, i, arr) => {
          const offsetX = arr.slice(0, i).reduce((s, a) => s + a.w, 40);
          return (
            <g key={i}>
              <line
                x1={offsetX}
                y1={10}
                x2={offsetX}
                y2={38}
                stroke={color.border.strong}
                strokeWidth="1"
              />
              <text
                x={offsetX + seg.w / 2}
                y={26}
                textAnchor="middle"
                fontFamily={font.family.mono}
                fontSize="8.5px"
                fill={seg.color}
                fontWeight={i > 0 ? 600 : 400}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        <line x1={600} y1={10} x2={600} y2={38} stroke={color.border.strong} strokeWidth="1" />
      </g>

      {/* Legend */}
      <g transform="translate(40, 140)">
        <text fontFamily={font.family.mono} fontSize="9px" fill={color.text.muted}>
          Each level is a 512-entry table (9 bits). The walk starts at CR3 (physical addr of PGD),
        </text>
        <text y={14} fontFamily={font.family.mono} fontSize="9px" fill={color.text.muted}>
          then follows pointers down. Missing levels are allocated on demand (pud_alloc, pmd_alloc, pte_alloc_map).
        </text>
      </g>
    </svg>
  );
};

export default MmapPageFault;
