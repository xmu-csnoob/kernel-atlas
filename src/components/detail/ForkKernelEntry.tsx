import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { StructCard, CodeBlock } from './primitives';
import SyscallTableGrid from './primitives/SyscallTableGrid';
import { space } from '../../design/tokens';

// fork syscall sits at nr=57 on x86_64
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

export const ForkKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid */}
    <SyscallTableGrid
      entries={SYSCALL_TABLE_PREVIEW.map((name, i) => ({ index: i, name }))}
      activeIndex={57}
      columns={10}
      label="sys_call_table[]  ·  %rax = 57 → sys_fork"
    />

    {/* sys_fork → do_fork */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="do_fork()"
        type="kernel/fork.c"
        region="process"
        fields={[
          { label: 'clone_flags', value: 'SIGCHLD | ...', highlight: true },
          { label: 'stack_start', value: '0 (child = same)' },
          { label: 'regs', value: '→ pt_regs (parent ctx)' },
          { label: 'parent_tidptr', value: '&tid' },
          { label: 'child_tidptr', value: '&tid' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <CodeBlock compact>{`SYSCALL_DEFINE0(fork)
{
    return do_fork(SIGCHLD, 0, NULL, NULL, NULL);
}

long do_fork(unsigned long clone_flags,
             unsigned long stack_start,
             struct pt_regs *regs,
             unsigned long stack_size,
             int __user *parent_tidptr,
             int __user *child_tidptr)
{
    struct task_struct *p;
    p = copy_process(clone_flags, ...);
    ...
    wake_up_new_task(p);
    return p->pid;   // parent gets child PID
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const ForkKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="syscall 57 → do_fork() dispatch" hero={<ForkKernelEntryHero />} />
);

export default ForkKernelEntry;