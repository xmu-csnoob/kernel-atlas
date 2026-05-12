import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, space } from '../../design/tokens';

export const CloneCopyProcessHero: React.FC = () => (
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
          region: 'process',
          fields: [
            { label: 'pid', value: '1234' },
            { label: 'tgid', value: '1234' },
            { label: 'mm', value: '→ mm_struct A' },
            { label: 'files', value: '→ files_struct A' },
            { label: 'thread.sp', value: 'parent_stack' },
          ],
        },
        {
          structName: 'task_struct',
          type: 'child (PID 1235) ← NEW',
          region: 'process',
          fields: [
            { label: 'pid', value: '1235', highlight: true },
            { label: 'tgid', value: '1234 (shared)', highlight: true },
            { label: 'mm', value: '→ mm_struct A (ref++)', highlight: true },
            { label: 'files', value: '→ files_struct A (ref++)' },
            { label: 'thread.sp', value: 'child_stack', highlight: true },
          ],
        },
      ]}
      arrows={[{ label: 'dup_task_struct', subLabel: 'kmalloc + copy', width: 100 }]}
    />

    {/* thread_struct init + alloc_pid */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.process.fg}>
          thread_struct init — child stack + ret_from_fork
        </SectionLabel>
        <CodeBlock compact>{`/* copy_process initializes child thread */
p->thread.sp = (unsigned long) childregs;
p->thread.ip = (unsigned long) ret_from_fork;

if (clone_flags & CLONE_SETTLS)
    p->thread.tls = tls;

/* For threads: same tgid */
if (clone_flags & CLONE_THREAD) {
    p->tgid = current->tgid;
    p->group_leader = current->group_leader;
}`}</CodeBlock>
      </div>
      <StructCard
        name="struct pid"
        type="kernel/pid.c"
        region="process"
        fields={[
          { label: 'count', value: 'ref 2 (parent + child)' },
          { label: 'level', value: '0' },
          { label: 'numbers[0].nr', value: '1235', highlight: true },
          { label: 'numbers[0].ns', value: '→ init_pid_ns' },
        ]}
      />
    </div>
  </div>
);

const CloneCopyProcess: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="copy_process → dup_task_struct → thread init" hero={<CloneCopyProcessHero />} />
);

export default CloneCopyProcess;
