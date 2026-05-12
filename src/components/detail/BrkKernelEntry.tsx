import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import SyscallTableGrid from './primitives/SyscallTableGrid';
import { color, font, space } from '../../design/tokens';

const SYSCALL_TABLE_PREVIEW: string[] = [
  'sys_read', 'sys_write', 'sys_open', 'sys_close',
  'sys_stat', 'sys_fstat', 'sys_lstat', 'sys_poll',
  'sys_lseek', 'sys_mmap', 'sys_mprotect', 'sys_munmap',
];

export const BrkKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <div>
      <SyscallTableGrid
        entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
        activeIndex={12}
        columns={6}
        label="sys_call_table[]  ·  arch/x86/kernel/syscall_64.c"
      />
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        %rax = 12 → sys_call_table[12] = <span style={{ color: color.pulse }}>sys_brk</span>
      </div>
    </div>

    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="mm_struct"
        type="current->mm"
        region="mm"
        fields={[
          { label: 'start_brk', value: '0x601000', highlight: true },
          { label: 'brk', value: '0x8a3000', highlight: true },
          { label: 'brk_page', value: '0x8a4000' },
          { label: 'end_code', value: '0x600000' },
          { label: 'mmap_sem', value: 'rwsem (locked)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.mm.fg}>sys_brk() — mm/mmap.c</SectionLabel>
        <CodeBlock>{`SYSCALL_DEFINE1(brk, unsigned long, brk)
{
    struct mm_struct *mm = current->mm;
    unsigned long newbrk, oldbrk, retval;

    down_write(&mm->mmap_sem);   // exclusive lock

    if (brk < mm->end_code)
        goto out;
    newbrk = PAGE_ALIGN(brk);
    oldbrk = PAGE_ALIGN(mm->brk);
    if (oldbrk == newbrk)
        goto set_brk;

    /* Always allow shrinking. */
    if (brk <= mm->brk) {
        if (!do_munmap(mm, newbrk, oldbrk-newbrk))
            goto set_brk;
        goto out;
    }

    /* Check RLIMIT_DATA, then expand. */
    ...
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const BrkKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="syscall table: NR_brk = 12 → sys_brk() → down_write(mmap_sem)"
    hero={<BrkKernelEntryHero />}
  />
);

export default BrkKernelEntry;
