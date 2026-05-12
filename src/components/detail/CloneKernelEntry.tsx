import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import SyscallTableGrid from './primitives/SyscallTableGrid';
import { color, space } from '../../design/tokens';

// clone syscall sits at nr=56 on x86_64
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

export const CloneKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <SyscallTableGrid
      entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
      activeIndex={56}
      columns={10}
      label="sys_call_table[]  ·  %rax = 56 → sys_clone"
    />

    {/* sys_clone → do_fork */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="sys_clone()"
        type="kernel/fork.c"
        region="process"
        fields={[
          { label: 'clone_flags', value: 'CLONE_VM | ...', highlight: true },
          { label: 'newsp', value: '→ child_stack', highlight: true },
          { label: 'parent_tidptr', value: '&tid' },
          { label: 'child_tidptr', value: '&tid' },
          { label: 'tls_val', value: '→ TLS descriptor' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.process.fg}>sys_clone()  ·  kernel/fork.c</SectionLabel>
        <CodeBlock compact>{`SYSCALL_DEFINE5(clone,
    unsigned long, clone_flags,
    unsigned long, newsp,
    int __user *, parent_tidptr,
    int __user *, child_tidptr,
    int, tls_val)
{
    return do_fork(clone_flags, newsp, regs,
                   0, parent_tidptr, child_tidptr);
}`}</CodeBlock>
      </div>
    </div>

    {/* Flag validation */}
    <div style={{ flex: 1, minWidth: '240px' }}>
      <SectionLabel accent={color.region.process.fg}>Flag validation in do_fork()</SectionLabel>
      <CodeBlock compact>{`/* do_fork validates flag combinations */
if ((clone_flags & CLONE_THREAD)
    && !(clone_flags & CLONE_SIGHAND))
    return -EINVAL;
if ((clone_flags & CLONE_SIGHAND)
    && !(clone_flags & CLONE_VM))
    return -EINVAL;

/* Valid: CLONE_VM | CLONE_THREAD | CLONE_SIGHAND */
/* Invalid: CLONE_THREAD without CLONE_SIGHAND */`}</CodeBlock>
    </div>
  </div>
);

const CloneKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="syscall 56 → sys_clone → do_fork()" hero={<CloneKernelEntryHero />} />
);

export default CloneKernelEntry;
