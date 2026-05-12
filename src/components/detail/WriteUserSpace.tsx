import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, space } from '../../design/tokens';

export const WriteUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Top row: process state + open files */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid',     value: '1234' },
          { label: 'comm',    value: '"echo"' },
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
          { label: 'fdt[3]', value: '/tmp/out (O_WRONLY)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
        <CodeBlock>{`mov  $1,    %rax     # __NR_write = 1
	mov  $3,    %rdi     # fd = 3
	lea  buf,   %rsi     # buf pointer
	mov  $4096, %rdx     # count
	syscall              # → ring 0`}</CodeBlock>
      </div>
    </div>

    {/* Buffer preview */}
    <div>
      <SectionLabel accent={color.region.user.fg}>user buffer contents</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: '6px',
          padding: space[3],
          fontFamily: 'monospace',
          fontSize: '11px',
          color: color.text.secondary,
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: color.text.muted }}>{'// '}</span>
        <span style={{ color: color.region.user.fg }}>4096 bytes ready to send to kernel</span>
        <div style={{ marginTop: space[2], color: color.text.dim }}>
          {`0x00  48 65 6c 6c 6f 2c 20 77  6f 72 6c 64 21 0a ...  Hello, world!..`}
        </div>
        <div style={{ color: color.text.dim }}>
          {`0x10  00 00 00 00 00 00 00 00  00 00 00 00 00 00 ...  ................`}
        </div>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner
      fromLabel="USER"
      fromRing="ring 3"
      toLabel="KERNEL"
      toRing="ring 0"
      arrowLabel="write syscall"
    />
  </div>
);

const WriteUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="What the user process does" hero={<WriteUserSpaceHero />} />
);

export default WriteUserSpace;
