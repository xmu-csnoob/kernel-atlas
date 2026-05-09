import React from 'react';
import DetailLayout from '../DetailLayout';
import type { DetailViewProps } from '../DetailLayout';
import { StructCard, CodeBlock } from '../primitives';
import SyscallTableGrid from '../primitives/SyscallTableGrid';
import { color, font, space } from '../../../design/tokens';

// Minimal syscall table — just enough to show context
const SYSCALL_TABLE: string[] = [
  'sys_read', 'sys_write', 'sys_open', 'sys_close',
  'sys_stat', 'sys_fstat', 'sys_lstat', 'sys_poll',
  'sys_lseek', 'sys_mmap', 'sys_mprotect', 'sys_munmap',
  'sys_brk', 'sys_rt_sigaction', 'sys_rt_sigprocmask', 'sys_rt_sigreturn',
  'sys_ioctl', 'sys_pread64', 'sys_pwrite64', 'sys_readv',
  'sys_writev', 'sys_access', 'sys_pipe', 'sys_select',
  'sys_sched_yield', 'sys_mremap', 'sys_msync', 'sys_mincore',
  'sys_madvise', 'sys_shmget', 'sys_shmat', 'sys_shmctl',
];

const GenericKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => {
  // Try to find the entry function name from detail_nodes
  const entryNode = node.detail_nodes.find(
    (dn) => dn.type === 'code' && dn.source_ref?.file
  );
  const entryFile = entryNode?.source_ref?.file ?? 'kernel/entry.S';
  const entryLine = entryNode?.source_ref?.line ?? 0;
  const entryFn = entryNode?.title ?? `sys_${node.id}`;

  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="syscall dispatch → kernel entry"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <SyscallTableGrid
            entries={SYSCALL_TABLE.map((name, i) => ({ index: i, name }))}
            activeIndex={0}
            columns={8}
            label={`sys_call_table[]  ·  ${entryFile}`}
          />

          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="pt_regs"
              type="saved context"
              region="kernel"
              fields={[
                { label: 'rax', value: `__NR_${node.id}` },
                { label: 'rdi', value: 'arg0' },
                { label: 'rsi', value: 'arg1' },
                { label: 'rdx', value: 'arg2' },
              ]}
            />
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div
                style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: color.text.muted,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: space[2],
                }}
              >
                {entryFn}  ·  {entryFile}:{entryLine > 0 ? entryLine : '—'}
              </div>
              <CodeBlock compact>{`/* System call entry stub */
${entryFn}(...)
{
    /* Validate args, lock if needed */
    /* Dispatch to implementation */
    /* ... */
    return result;
}`}</CodeBlock>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default GenericKernelEntry;
