import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import BufferTransfer from './primitives/BufferTransfer';
import { color, space } from '../../design/tokens';

const ReadReturnPath: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="copy_to_user — kernel page → user buffer → return"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          {/* Buffer copy animation */}
          <div>
            <SectionLabel accent={color.region.return.fg}>
              copy_to_user — 4096 bytes flow from kernel to user
            </SectionLabel>
            <div
              style={{
                background: color.bg.inset,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: '8px',
                padding: space[4],
              }}
            >
              <BufferTransfer
                source={{
                  label: 'kernel page (page cache)',
                  region: 'kernel',
                  size: 4096,
                  filled: 4096,
                  hint: "freshly DMA'd",
                }}
                target={{
                  label: 'user buffer',
                  region: 'return',
                  size: 4096,
                  filled: 4096,
                  hint: 'passed by reader',
                  animatedFill: true,
                }}
                transferLabel="copy_to_user"
                transferSubLabel="SW page-fault checked"
                particleCount={5}
                particleLabel="4K"
              />
            </div>
          </div>

          {/* Return value + register state */}
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="return value"
              type="rax"
              region="return"
              fields={[
                { label: '%rax',  value: '4096', highlight: true },
                { label: 'ssize_t', value: 'bytes read' },
                { label: 'errno', value: '0' },
              ]}
            />
            <div style={{ flex: 1, minWidth: '320px' }}>
              <SectionLabel accent={color.region.return.fg}>iret → user space</SectionLabel>
              <CodeBlock>{`/* Inside vfs_read return path */
file_pos_write(file, pos);   // advance f_pos by 4096
fput(file);                  // drop reference

/* Stack frame restored, sysret instruction → ring 3 */
sysretq                       // user code resumes after \`syscall\``}</CodeBlock>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default ReadReturnPath;
