import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const MmapVmaAllocationHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* VMA chain: mm_struct → VMA list → rb_tree */}
    <StructChain
      cards={[
        {
          structName: 'mm_struct',
          type: 'current->mm',
          region: 'mm',
          fields: [
            { label: 'mmap',    value: '→ VMA list' },
            { label: 'mm_rb',   value: '→ rb_root', highlight: true },
            { label: 'map_count', value: '12 → 13' },
            { label: 'total_vm',  value: '256 → 257 pg' },
          ],
        },
        {
          structName: 'vm_area_struct',
          type: 'NEW VMA',
          region: 'mm',
          fields: [
            { label: 'vm_start', value: '0x7f00...a000', highlight: true },
            { label: 'vm_end',   value: '0x7f00...b000', highlight: true },
            { label: 'vm_flags', value: 'R|W|PRIVATE' },
            { label: 'vm_mm',    value: '→ mm_struct' },
            { label: 'vm_file',  value: 'NULL (anon)' },
          ],
        },
      ]}
      arrows={[{ label: 'insert', subLabel: 'rb_link + list_add', width: 120 }]}
    />

    {/* RB tree visualization */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        VMA red-black tree  ·  mm/mmap.c  ·  find_vma_prepare()
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
        <RbTreeDiagram />
      </div>
    </div>

    {/* vma_merge + code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>mmap_region — create and link VMA</SectionLabel>
        <CodeBlock compact>{`vma = kmem_cache_alloc(vm_area_cachep, GFP_KERNEL);
vma->vm_mm = mm;
vma->vm_start = addr;
vma->vm_end = addr + len;
vma->vm_flags = vm_flags;
vma->vm_page_prot = vm_get_page_prot(vm_flags);

/* Link into mm's VMA list and rb_tree */
vma_link(mm, vma, prev, rb_link, rb_parent);`}</CodeBlock>
      </div>
      <StructCard
        name="vm_area_struct"
        type="kernel"
        region="mm"
        fields={[
          { label: 'vm_start',  value: '0x7f00...a000', highlight: true },
          { label: 'vm_end',    value: '0x7f00...b000', highlight: true },
          { label: 'vm_flags',  value: 'READ | WRITE | MAYREAD | MAYWRITE' },
          { label: 'vm_page_prot', value: 'pgprot_t (R+W+U)' },
          { label: 'vm_rb',     value: 'rb_node (tree)' },
          { label: 'vm_next',   value: '→ next VMA' },
        ]}
      />
    </div>
  </div>
);

const MmapVmaAllocation: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="do_mmap_pgoff() → find_vma_prepare() → vma_merge() → new VMA"
    hero={<MmapVmaAllocationHero />}
  />
);

/** Simple RB tree diagram showing VMA nodes */
const RbTreeDiagram: React.FC = () => {
  const W = 520;
  const H = 160;

  const nodes = [
    { x: 260, y: 30, label: '0x7f00...8000', color: color.region.mm.fg, isNew: false },
    { x: 130, y: 75, label: '0x7f00...5000', color: color.region.mm.fg, isNew: false },
    { x: 390, y: 75, label: '0x7f00...a000', color: color.pulse, isNew: true },
    { x: 65,  y: 120, label: '0x7f00...3000', color: color.region.mm.fg, isNew: false },
    { x: 195, y: 120, label: '0x7f00...6000', color: color.region.mm.fg, isNew: false },
    { x: 325, y: 120, label: '0x7f00...9000', color: color.region.mm.fg, isNew: false },
    { x: 455, y: 120, label: '0x7f00...b000', color: color.region.mm.fg, isNew: false },
  ];

  const edges = [
    { x1: 260, y1: 30, x2: 130, y2: 75 },
    { x1: 260, y1: 30, x2: 390, y2: 75 },
    { x1: 130, y1: 75, x2: 65,  y2: 120 },
    { x1: 130, y1: 75, x2: 195, y2: 120 },
    { x1: 390, y1: 75, x2: 325, y2: 120 },
    { x1: 390, y1: 75, x2: 455, y2: 120 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '520px' }}>
      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke={color.border.strong}
          strokeWidth="1.5"
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - 46}
            y={n.y - 12}
            width="92"
            height="24"
            rx="4"
            fill={n.isNew ? 'rgba(255, 235, 59, 0.1)' : color.bg.surface}
            stroke={n.isNew ? color.pulse : color.border.strong}
            strokeWidth={n.isNew ? '1.5' : '1'}
          >
            {n.isNew && (
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
            )}
          </rect>
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontFamily={font.family.mono}
            fontSize="9px"
            fill={n.isNew ? color.pulse : color.text.secondary}
            fontWeight={n.isNew ? 700 : 400}
          >
            {n.label}
          </text>
        </g>
      ))}
      {/* Legend */}
      <g transform="translate(10, 145)">
        <rect x="0" y="-8" width="14" height="14" rx="2" fill="rgba(255, 235, 59, 0.1)" stroke={color.pulse} />
        <text x="20" y="3" fontFamily={font.family.mono} fontSize="9px" fill={color.text.muted}>
          new VMA (just inserted)
        </text>
      </g>
    </svg>
  );
};

export default MmapVmaAllocation;
