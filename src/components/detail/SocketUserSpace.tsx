import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, space } from '../../design/tokens';

export const SocketUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Top row: process state + socket params */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid',     value: '1234' },
          { label: 'comm',    value: '"curl"' },
          { label: 'tgid',    value: '1234' },
          { label: '*files',  value: '→ files_struct', highlight: true },
        ]}
      />
      <StructCard
        name="socket args"
        type="AF_INET / TCP"
        region="user"
        fields={[
          { label: 'domain',   value: 'AF_INET (2)', highlight: true },
          { label: 'type',     value: 'SOCK_STREAM (1)', highlight: true },
          { label: 'protocol', value: 'IPPROTO_IP (0)' },
          { label: '→ fd',     value: '3 (expected)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
        <CodeBlock>{`mov  $41,   %rax     # __NR_socket = 41
mov  $2,    %rdi     # domain = AF_INET
mov  $1,    %rsi     # type = SOCK_STREAM
mov  $0,    %rdx     # protocol = 0
syscall              # → ring 0`}</CodeBlock>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner
      fromLabel="USER"
      fromRing="ring 3"
      toLabel="KERNEL"
      toRing="ring 0"
      arrowLabel="socket syscall"
    />
  </div>
);

const SocketUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="What the user process does"
    hero={<SocketUserSpaceHero />}
  />
);

export default SocketUserSpace;
