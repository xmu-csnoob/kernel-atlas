import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import AnimatedArrow from './primitives/AnimatedArrow';
import { color, font, space, radius } from '../../design/tokens';

export const BrkPageAllocHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Demand-zero flow */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>Demand-zero page allocation</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          display: 'flex',
          alignItems: 'center',
          gap: space[3],
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            background: `${color.region.user.fg}10`,
            border: `1px solid ${color.region.user.fg}40`,
            borderRadius: radius.sm,
            padding: '6px 10px',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.region.user.fg,
          }}
        >
          <div style={{ fontWeight: font.weight.bold }}>user write</div>
          <div style={{ fontSize: '10px', color: color.text.secondary }}>*(char *)0x8a3000 = 'x'</div>
        </div>
        <AnimatedArrow label="#PF" width={40} color={color.region.hardware.fg} />
        <div
          style={{
            background: `${color.region.hardware.fg}10`,
            border: `1px solid ${color.region.hardware.fg}40`,
            borderRadius: radius.sm,
            padding: '6px 10px',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.region.hardware.fg,
          }}
        >
          <div style={{ fontWeight: font.weight.bold }}>MMU fault</div>
          <div style={{ fontSize: '10px', color: color.text.secondary }}>no PTE → #PF</div>
        </div>
        <AnimatedArrow width={30} color={color.text.dim} animated={false} />
        <div
          style={{
            background: `${color.accent.primary}10`,
            border: `1px solid ${color.accent.primary}40`,
            borderRadius: radius.sm,
            padding: '6px 10px',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.primary,
          }}
        >
          <div style={{ fontWeight: font.weight.bold }}>do_page_fault</div>
          <div style={{ fontSize: '10px', color: color.text.secondary }}>arch/x86/mm/fault.c</div>
        </div>
        <AnimatedArrow width={30} color={color.text.dim} animated={false} />
        <div
          style={{
            background: `${color.accent.success}10`,
            border: `1px solid ${color.accent.success}40`,
            borderRadius: radius.sm,
            padding: '6px 10px',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.success,
          }}
        >
          <div style={{ fontWeight: font.weight.bold }}>alloc_page()</div>
          <div style={{ fontSize: '10px', color: color.text.secondary }}>GFP_HIGHUSER</div>
        </div>
      </div>
    </div>

    {/* Code + struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.mm.fg}>__do_fault() — allocate + zero</SectionLabel>
        <CodeBlock>{`static int __do_fault(struct mm_struct *mm,
    struct vm_area_struct *vma,
    unsigned long address, ...)
{
    struct page *page;

    page = alloc_page_vma(
        GFP_HIGHUSER_MOVABLE, vma, address);
    if (!page)
        return VM_FAULT_OOM;

    clear_user_highpage(page, address);
    // page is now zero-filled

    entry = mk_pte(page, vma->vm_page_prot);
    set_pte_at(mm, address, pte, entry);
    // ...
}`}</CodeBlock>
      </div>
      <StructCard
        name="struct page"
        type="newly allocated"
        region="mm"
        fields={[
          { label: 'flags', value: 'PG_highmem' },
          { label: '_count', value: '1 (mapped)', highlight: true },
          { label: 'mapping', value: 'NULL (anon)', highlight: true },
          { label: 'virtual', value: 'page_address(page)' },
        ]}
      />
    </div>

    {/* Zero-fill note */}
    <div
      style={{
        background: `${color.accent.success}10`,
        border: `1px solid ${color.accent.success}40`,
        borderRadius: radius.md,
        padding: space[3],
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: color.accent.success }}>Zero-fill guarantee:</strong>{' '}
      clear_user_highpage() zeroes the entire page before mapping it. This prevents
      information leakage — a process cannot read data left by a previous owner of
      the physical page frame. This is why uninitialized heap memory appears as zeros
      (modulo allocator metadata like malloc's chunk headers).
    </div>
  </div>
);

const BrkPageAlloc: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="first write → #PF → do_page_fault() → handle_mm_fault() → alloc_page() → zeroed page"
    hero={<BrkPageAllocHero />}
  />
);

export default BrkPageAlloc;
