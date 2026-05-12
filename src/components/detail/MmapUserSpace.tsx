import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, space } from '../../design/tokens';

export const MmapUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Top row: process state + mmap args */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid',     value: '1234' },
          { label: 'comm',    value: '"app"' },
          { label: 'mm',      value: '→ mm_struct' },
          { label: '*files',  value: '→ files_struct' },
        ]}
      />
      <StructCard
        name="mmap args"
        type="syscall params"
        region="user"
        fields={[
          { label: 'addr',    value: 'NULL', highlight: true },
          { label: 'length',  value: '4096', highlight: true },
          { label: 'prot',    value: 'R|W' },
          { label: 'flags',   value: 'PRIVATE|ANON' },
          { label: 'fd',      value: '-1' },
          { label: 'offset',  value: '0' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
        <CodeBlock>{`mov  $9,     %rax     # __NR_mmap = 9
mov  $0,     %rdi     # addr = NULL
mov  $4096,  %rsi     # length
mov  $3,     %rdx     # prot = R|W
mov  $0x22,  %r10     # flags = PRIVATE|ANON
mov  $-1,    %r8      # fd
mov  $0,     %r9      # offset
syscall               # → ring 0`}</CodeBlock>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner />
  </div>
);

const MmapUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="User process sets up the mmap() call" hero={<MmapUserSpaceHero />} />
);

export default MmapUserSpace;
