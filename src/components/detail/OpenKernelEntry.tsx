import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import SyscallTableGrid from './primitives/SyscallTableGrid';
import { color, font, space } from '../../design/tokens';

// The first 32 entries of x86_64 sys_call_table (with open at slot 2)
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

export const OpenKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <div>
      <SyscallTableGrid
        entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
        activeIndex={2}
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
        %rax = 2 → sys_call_table[2] = <span style={{ color: color.pulse }}>sys_open</span>
      </div>
    </div>

    {/* do_sys_open flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="do_sys_open"
        type="fs/open.c"
        region="vfs"
        fields={[
          { label: 'dfd',      value: 'AT_FDCWD' },
          { label: 'filename', value: '→ "./passwd"', highlight: true },
          { label: 'flags',    value: 'O_RDONLY' },
          { label: 'mode',     value: '0' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.vfs.fg}>do_sys_open()  ·  fs/open.c:1000</SectionLabel>
        <CodeBlock compact>{`long do_sys_open(int dfd, const char *filename,
                 int flags, int mode)
{
    char *tmp = getname(filename);   // copy from user
    int fd = get_unused_fd_flags(flags);
    struct file *f = do_filp_open(dfd, tmp, flags, mode, 0);
    fd_install(fd, f);               // fd → struct file*
    return fd;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const OpenKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="syscall table dispatch: NR_open = 2 → do_sys_open()" hero={<OpenKernelEntryHero />} />
);

export default OpenKernelEntry;
