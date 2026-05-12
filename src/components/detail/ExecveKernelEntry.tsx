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
  'sys_dup', 'sys_dup2', 'sys_pause', 'sys_nanosleep',
  'sys_getitimer', 'sys_alarm', 'sys_setitimer', 'sys_getpid',
  'sys_sendfile', 'sys_socket', 'sys_connect', 'sys_accept',
  'sys_sendto', 'sys_recvfrom', 'sys_sendmsg', 'sys_recvmsg',
  'sys_shutdown', 'sys_bind', 'sys_listen', 'sys_getsockname',
  'sys_getpeername', 'sys_socketpair', 'sys_setsockopt', 'sys_getsockopt',
  'sys_clone', 'sys_fork', 'sys_vfork', 'sys_execve',
];

export const ExecveKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <div>
      <SyscallTableGrid
        entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
        activeIndex={59}
        columns={10}
        label="sys_call_table[]  ·  %rax = 59 → sys_execve"
      />
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        %rax = 59 → sys_call_table[59] = <span style={{ color: color.pulse }}>sys_execve</span>
      </div>
    </div>

    {/* do_execve → linux_binprm */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="linux_binprm"
        type="fs/exec.c"
        region="process"
        fields={[
          { label: 'buf[128]', value: 'ELF magic (first bytes)', highlight: true },
          { label: 'page[]', value: '→ arg/env pages' },
          { label: 'mm', value: '→ new mm_struct' },
          { label: 'file', value: '→ /bin/ls inode' },
          { label: 'p', value: 'top of mem (grows down)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.process.fg}>do_execve() entry</SectionLabel>
        <CodeBlock compact>{`int do_execve(const char *filename,
  const char __user *const __user *__argv,
  const char __user *const __user *__envp,
  struct pt_regs *regs)
{
  struct linux_binprm *bprm;
  bprm = kzalloc(sizeof(*bprm), GFP_KERNEL);
  bprm->filename = getname(filename);
  ...
  retval = search_binary_handler(bprm, regs);
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const ExecveKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="syscall 59 → do_execve() → linux_binprm setup"
    hero={<ExecveKernelEntryHero />}
  />
);

export default ExecveKernelEntry;
