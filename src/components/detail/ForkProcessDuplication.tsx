import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, space } from '../../design/tokens';

const ForkProcessDuplication: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="copy_process → dup_task_struct → alloc_pid"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <style>{`
            @keyframes grow-anim {
              0% { opacity: 0.3; transform: scale(0.92); }
              50% { opacity: 0.8; transform: scale(1.03); }
              100% { opacity: 1; transform: scale(1); }
            }
            .new-task-anim {
              animation: grow-anim 1.6s ease-out;
            }
          `}</style>

          {/* Parent → Child split */}
          <StructChain
            cards={[
              {
                structName: 'task_struct',
                type: 'parent (PID 1234)',
                region: 'kernel',
                fields: [
                  { label: 'pid', value: '1234' },
                  { label: 'state', value: 'TASK_RUNNING' },
                  { label: 'mm', value: '→ mm_struct A' },
                  { label: 'files', value: '→ files_struct A' },
                  { label: 'thread', value: 'sp=... ip=...' },
                ],
              },
              {
                structName: 'task_struct',
                type: 'child (PID 1235) ← NEW',
                region: 'kernel',
                fields: [
                  { label: 'pid', value: '1235', highlight: true },
                  { label: 'state', value: 'TASK_UNINTERRUPTIBLE' },
                  { label: 'mm', value: '→ mm_struct A (ref++)', highlight: true },
                  { label: 'files', value: '→ files_struct A (ref++)' },
                  { label: 'thread', value: 'sp=child_stack ip=ret_from_fork' },
                ],
              },
            ]}
            arrows={[{ label: 'dup_task_struct', subLabel: 'kmalloc', width: 100 }]}
          />

          {/* alloc_pid */}
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <SectionLabel accent={color.region.kernel.fg}>
                alloc_pid — new PID from idr
              </SectionLabel>
              <CodeBlock compact>{`static struct pid *alloc_pid(struct pid_namespace *ns)
{
    struct pid *pid = kmem_cache_alloc(pid_cachep, GFP_KERNEL);
    /* allocate PID from global idr tree */
    pid->numbers[0].nr = next_pid;   // → 1235
    pid->numbers[0].ns = ns;
    ...
    return pid;
}`}</CodeBlock>
            </div>
            <StructCard
              name="struct pid"
              type="kernel/pid.c"
              region="kernel"
              fields={[
                { label: 'count', value: 'ref 2 (parent + child)' },
                { label: 'level', value: '0' },
                { label: 'numbers[0].nr', value: '1235', highlight: true },
                { label: 'numbers[0].ns', value: '→ init_pid_ns' },
              ]}
            />
          </div>
        </div>
      }
    />
  );
};

export default ForkProcessDuplication;
