import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import SyscallTableGrid from './primitives/SyscallTableGrid';
import { color, font, space } from '../../design/tokens';

// The first 32 entries of x86_64 sys_call_table (with write at slot 1)
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

export const WriteKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <div>
      <SyscallTableGrid
        entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
        activeIndex={1}
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
        %rax = 1 → sys_call_table[1] = <span style={{ color: color.pulse }}>sys_write</span>
      </div>
    </div>

    {/* fd → file* lookup */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="files_struct"
        type="current->files"
        region="vfs"
        fields={[
          { label: 'count',    value: 'atomic 1' },
          { label: 'fdt',      value: '→ fdtable', highlight: true },
          { label: 'next_fd',  value: '4' },
        ]}
      />
      <StructCard
        name="fdtable"
        type="fd → file*"
        region="vfs"
        fields={[
          { label: 'fd[0]', value: 'tty (stdin)' },
          { label: 'fd[1]', value: 'tty (stdout)' },
          { label: 'fd[2]', value: 'tty (stderr)' },
          { label: 'fd[3]', value: '*file (out, O_WRONLY)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.vfs.fg}>fget(3) returns the file* (write mode)</SectionLabel>
        <CodeBlock>{`asmlinkage long sys_write(unsigned int fd,
                         const char __user *buf, size_t count)
{
    struct file *file = fget(fd);     // → fdtable[3]
    if (!(file->f_mode & FMODE_WRITE))
        return -EBADF;
    loff_t pos = file_pos_read(file);
    ret = vfs_write(file, buf, count, &pos);
    ...
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const WriteKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="syscall table dispatch and fd→file* lookup" hero={<WriteKernelEntryHero />} />
);

export default WriteKernelEntry;
