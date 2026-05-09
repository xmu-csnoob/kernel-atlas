import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, space } from '../../design/tokens';

const ReadUserSpace: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="What the user process does"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          {/* Top row: process state + open files */}
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="task_struct"
              type="user process"
              region="user"
              fields={[
                { label: 'pid',     value: '1234' },
                { label: 'comm',    value: '"cat"' },
                { label: 'tgid',    value: '1234' },
                { label: '*files',  value: '→ files_struct', highlight: true },
              ]}
            />
            <StructCard
              name="files_struct"
              type="open file table"
              region="user"
              fields={[
                { label: 'fdt[0]', value: 'stdin'  },
                { label: 'fdt[1]', value: 'stdout' },
                { label: 'fdt[2]', value: 'stderr' },
                { label: 'fdt[3]', value: '/etc/passwd', highlight: true },
              ]}
            />
            <div style={{ flex: 1, minWidth: '220px' }}>
              <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
              <CodeBlock>{`mov  $0,    %rax     # __NR_read = 0
mov  $3,    %rdi     # fd = 3
lea  buf,   %rsi     # buf pointer
mov  $4096, %rdx     # count
syscall              # → ring 0`}</CodeBlock>
            </div>
          </div>

          {/* Boundary indicator */}
          <RingBoundaryBanner />
        </div>
      }
    />
  );
};

export default ReadUserSpace;
