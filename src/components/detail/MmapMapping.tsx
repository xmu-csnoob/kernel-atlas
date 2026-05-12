import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const MmapMappingHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Two-path diagram: anonymous vs file-backed */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        Page mapping — two paths depending on MAP_ANONYMOUS
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <MappingPathsDiagram />
      </div>
    </div>

    {/* Code + struct row */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>do_anonymous_page — allocate zeroed page</SectionLabel>
        <CodeBlock compact>{`static int do_anonymous_page(...)
{
    struct page *page;
    pte_t entry;

    page = alloc_zeroed_user_highpage_movable(vma, addr);
    if (!page)
        return VM_FAULT_OOM;

    entry = mk_pte(page, vma->vm_page_prot);
    if (write_access)
        entry = pte_mkwrite(pte_mkdirty(entry));

    set_pte_at(mm, addr, page_table, entry);
    update_mmu_cache(vma, addr, entry);
    return VM_FAULT_MINOR;
}`}</CodeBlock>
      </div>
      <StructCard
        name="struct page"
        type="newly allocated"
        region="mm"
        fields={[
          { label: 'flags', value: 'PG_active | PG_lru', highlight: true },
          { label: '_count', value: '1 (mapcount)' },
          { label: 'mapping', value: 'NULL (anon)' },
          { label: 'index', value: 'addr >> PAGE_SHIFT' },
          { label: 'virtual', value: 'page_address(page)' },
        ]}
      />
    </div>

    {/* File-backed path */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>do_file_page — page cache lookup or fill</SectionLabel>
        <CodeBlock compact>{`static int do_file_page(...)
{
    struct page *page;
    pgoff_t pgoff = ...;

    page = find_get_page(mapping, pgoff);
    if (!page) {
        /* Cache miss — allocate + readpage() */
        page = page_cache_alloc(mapping);
        add_to_page_cache_lru(page, mapping, pgoff, GFP_KERNEL);
        error = mapping->a_ops->readpage(file, page);
        /* Page locked; I/O in progress */
        return VM_FAULT_LOCKED;
    }
    /* Cache hit — map existing page */
    set_pte_at(mm, addr, page_table, mk_pte(page, prot));
}`}</CodeBlock>
      </div>
      <StructCard
        name="address_space"
        type="page cache"
        region="mm"
        fields={[
          { label: 'host', value: '→ inode', highlight: true },
          { label: 'page_tree', value: 'radix tree', highlight: true },
          { label: 'i_mmap', value: 'prio_tree of VMAs' },
          { label: 'a_ops', value: '→ ext2_aops' },
        ]}
      />
    </div>
  </div>
);

const MmapMapping: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="do_anonymous_page() alloc + zero-fill  OR  do_file_page() page cache lookup"
    hero={<MmapMappingHero />}
  />
);

/** Two-path diagram: anonymous vs file-backed mapping */
const MappingPathsDiagram: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: space[4], flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* Anonymous path */}
      <div
        style={{
          flex: '1 1 260px',
          maxWidth: '320px',
          background: color.bg.surface,
          border: `1px solid ${color.region.mm.fg}44`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: '9.5px',
            color: color.region.mm.fg,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: space[2],
            fontWeight: 700,
          }}
        >
          ANONYMOUS (MAP_ANONYMOUS)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <PathStep label="1. alloc_zeroed_user_highpage()" color={color.region.mm.fg} />
          <PathStep label="2. Zero-fill page from buddy allocator" color={color.text.secondary} />
          <PathStep label="3. mk_pte(page, prot) → PTE entry" color={color.region.mm.fg} />
          <PathStep label="4. set_pte_at() — install PTE" color={color.accent.primary} />
          <PathStep label="5. flush_tlb_page() — invalidate TLB" color={color.region.hardware.fg} />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.dim,
          padding: `0 ${space[2]}`,
        }}
      >
        OR
      </div>

      {/* File-backed path */}
      <div
        style={{
          flex: '1 1 260px',
          maxWidth: '320px',
          background: color.bg.surface,
          border: `1px solid ${color.accent.success}44`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: '9.5px',
            color: color.accent.success,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: space[2],
            fontWeight: 700,
          }}
        >
          FILE-BACKED (vm_file != NULL)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <PathStep label="1. find_get_page(mapping, pgoff)" color={color.accent.success} />
          <PathStep label="2a. Cache HIT → map existing page" color={color.accent.success} />
          <PathStep label="2b. Cache MISS → alloc + readpage()" color={color.pulse} />
          <PathStep label="3. mk_pte(page, prot) → PTE entry" color={color.region.mm.fg} />
          <PathStep label="4. set_pte_at() — install PTE" color={color.accent.primary} />
          <PathStep label="5. flush_tlb_page() — invalidate TLB" color={color.region.hardware.fg} />
        </div>
      </div>
    </div>
  );
};

const PathStep: React.FC<{ label: string; color: string }> = ({ label, color: c }) => (
  <div
    style={{
      fontFamily: font.family.mono,
      fontSize: '10px',
      color: c,
      padding: `${space[1]} ${space[2]}`,
      background: color.bg.inset,
      borderRadius: radius.sm,
      borderLeft: `2px solid ${c}`,
    }}
  >
    {label}
  </div>
);

export default MmapMapping;
