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
  'sys_brk', 'sys_rt_sigaction', 'sys_rt_sigprocmask', 'sys_rt_sigreturn',
  'sys_ioctl', 'sys_pread64', 'sys_pwrite64', 'sys_readv',
  'sys_writev', 'sys_access', 'sys_pipe', 'sys_select',
  'sys_sched_yield', 'sys_mremap', 'sys_msync', 'sys_mincore',
  'sys_madvise', 'sys_shmget', 'sys_shmat', 'sys_shmctl',
];

export const MmapKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <div>
      <SyscallTableGrid
        entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
        activeIndex={9}
        columns={8}
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
        %rax = 9 → sys_call_table[9] = <span style={{ color: color.pulse }}>sys_mmap</span>
      </div>
    </div>

    {/* get_unmapped_area flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="mm_struct"
        type="current->mm"
        region="mm"
        fields={[
          { label: 'mmap_base', value: '0x7f0000000000' },
          { label: 'task_size', value: '0x7fffffffffff' },
          { label: 'map_count', value: '12' },
          { label: 'total_vm',  value: '256 pages' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>get_unmapped_area — find free VA range</SectionLabel>
        <CodeBlock compact>{`unsigned long get_unmapped_area(...)
{
    if (flags & MAP_FIXED)
        return addr;          /* user insists */

    /* Scan downward from mmap_base */
    addr = mm->mmap_base;
    while (addr >= TASK_SIZE / 3) {
        if (free_area_at(addr, len))
            return addr;
        addr -= PAGE_SIZE;
    }
    return -ENOMEM;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const MmapKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="syscall table dispatch → sys_mmap_pgoff() → get_unmapped_area()"
    hero={<MmapKernelEntryHero />}
  />
);

export default MmapKernelEntry;
