import React from 'react';
import DetailLayout from '../DetailLayout';
import type { DetailViewProps } from '../DetailLayout';
import { StructCard, CodeBlock } from '../primitives';
import RingBoundaryBanner from '../primitives/RingBoundaryBanner';
import { color, font, space } from '../../../design/tokens';

const GenericUserSpace: React.FC<DetailViewProps> = ({ node, region }) => {
  // Generic register layout based on x86_64 syscall convention
  const paramRegs = ['%rdi', '%rsi', '%rdx', '%r10', '%r8', '%r9'];
  const defaultParams = ['arg0', 'arg1', 'arg2', 'arg3', 'arg4', 'arg5'];

  const regRows = defaultParams.map((param: string, i: number) => ({
    label: paramRegs[i] ?? `%r${i}`,
    value: param,
    highlight: i === 0,
  }));

  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="User space → kernel transition"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="task_struct"
              type="current process"
              region="user"
              fields={[
                { label: 'pid', value: 'current' },
                { label: 'state', value: 'TASK_RUNNING' },
                { label: 'mm', value: '→ mm_struct' },
                { label: 'files', value: '→ files_struct' },
              ]}
            />

            <StructCard
              name="registers"
              type="x86_64 syscall"
              region="user"
              fields={regRows}
            />

            <div style={{ flex: 1, minWidth: '220px' }}>
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
                syscall instruction
              </div>
              <CodeBlock>{`/* user-space assembly */
mov  %rax, __NR_${node.id}
/* args already in %rdi, %rsi, ... */
syscall              # → ring 0`}</CodeBlock>
            </div>
          </div>

          <RingBoundaryBanner />
        </div>
      }
    />
  );
};

export default GenericUserSpace;
