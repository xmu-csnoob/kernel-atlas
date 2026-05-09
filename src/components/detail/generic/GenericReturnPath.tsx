import React from 'react';
import DetailLayout from '../DetailLayout';
import type { DetailViewProps } from '../DetailLayout';
import { StructCard, CodeBlock } from '../primitives';
import { color, font, space } from '../../../design/tokens';

const GenericReturnPath: React.FC<DetailViewProps> = ({ node, region }) => {
  // Try to infer return semantics from detail_nodes
  const returnNode = node.detail_nodes.find(
    (dn) => dn.type === 'code' && dn.title.toLowerCase().includes('return')
  );
  const returnValue = returnNode?.description?.includes('0')
    ? '0 or error'
    : 'result or error';

  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="Return to user space"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="return value"
              type="%rax"
              region="return"
              fields={[
                { label: '%rax', value: returnValue, highlight: true },
                { label: 'errno', value: '0 on success' },
                { label: 'flags', value: 'EFLAGS restored' },
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
                sysret → user space
              </div>
              <CodeBlock compact>{`/* Kernel exit path */
/* Restore pt_regs, drop kernel stack frame */
sysretq    # or iret

/* User code resumes after syscall instruction */
/* %rax holds return value */`}</CodeBlock>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default GenericReturnPath;
