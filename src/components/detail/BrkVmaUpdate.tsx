import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const BrkVmaUpdateHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* VMA before/after */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="VMA before"
        type="heap"
        region="mm"
        fields={[
          { label: 'vm_start', value: '0x601000' },
          { label: 'vm_end', value: '0x8a4000' },
          { label: 'vm_flags', value: 'RW | ACCOUNT' },
        ]}
      />
      <div style={{ display: 'flex', alignItems: 'center', fontSize: font.size.lg, color: color.accent.primary }}>
        →
      </div>
      <StructCard
        name="VMA after"
        type="expanded heap"
        region="mm"
        fields={[
          { label: 'vm_start', value: '0x601000' },
          { label: 'vm_end', value: '0x9c1000', highlight: true },
          { label: 'vm_flags', value: 'RW | ACCOUNT' },
          { label: 'vm_page_prot', value: 'rw, user', highlight: true },
        ]}
      />
    </div>

    {/* do_brk code + rb tree */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.mm.fg}>do_brk() — mm/mmap.c</SectionLabel>
        <CodeBlock>{`int do_brk(unsigned long addr, unsigned long len)
{
    struct mm_struct *mm = current->mm;
    struct vm_area_struct *vma, *prev;
    struct rb_node **rb_link, *rb_parent;
    unsigned long flags;

    len = PAGE_ALIGN(len);
    flags = VM_DATA_DEFAULT_FLAGS
          | VM_ACCOUNT | mm->def_flags;

    if (find_vma_links(mm, addr, addr+len,
            &prev, &rb_link, &rb_parent))
        return -ENOMEM;

    vma = kmem_cache_zalloc(
        vm_area_cachep, GFP_KERNEL);
    vma->vm_mm = mm;
    vma->vm_start = addr;
    vma->vm_end = addr + len;
    vma->vm_flags = flags;
    vma->vm_page_prot = vm_get_page_prot(flags);
    vma_link(mm, vma, prev, rb_link, rb_parent);
    return 0;
}`}</CodeBlock>
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <SectionLabel accent={color.region.mm.fg}>VMA red-black tree</SectionLabel>
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
            lineHeight: 2,
          }}
        >
          <div style={{ color: color.text.muted, marginBottom: space[2] }}>mm-{'>'}mm_rb (ordered by vm_start)</div>
          <div><span style={{ color: color.accent.primary }}>[0x400000]</span> text</div>
          <div style={{ paddingLeft: space[4] }}><span style={{ color: color.accent.warning }}>[0x600000]</span> data</div>
          <div style={{ paddingLeft: space[4] }}><span style={{ color: color.pulse, fontWeight: font.weight.bold }}>[0x601000-0x9c1000]</span> <strong>heap</strong></div>
          <div style={{ paddingLeft: space[4] }}><span style={{ color: color.text.dim }}>[0x7f00...]</span> mmap</div>
          <div style={{ paddingLeft: space[4] }}><span style={{ color: color.text.dim }}>[0x7fff...]</span> stack</div>
        </div>
      </div>
    </div>
  </div>
);

const BrkVmaUpdate: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="do_brk() → vma_merge() or new VMA → vm_start / vm_end / vm_flags"
    hero={<BrkVmaUpdateHero />}
  />
);

export default BrkVmaUpdate;
