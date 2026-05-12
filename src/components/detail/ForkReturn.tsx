import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ForkReturnHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <style>{`
      @keyframes child-birth {
        0% { opacity: 0; transform: scale(0.9) translateY(10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .child-process-anim {
        animation: child-birth 1.2s ease-out;
      }
    `}</style>

    {/* The fork split */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* Parent */}
      <div style={{ flex: 1, minWidth: '240px', maxWidth: '360px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.return.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          Parent process (PID 1234)
        </div>
        <StructCard
          name="parent task_struct"
          type="fork() return path"
          region="return"
          fields={[
            { label: 'return value', value: '1235 (child PID)', highlight: true },
            { label: 'pid', value: '1234' },
            { label: 'children', value: '→ PID 1235 added' },
            { label: 'state', value: 'TASK_RUNNING' },
          ]}
        />
        <div style={{ marginTop: space[3] }}>
          <CodeBlock compact>{`/* In do_fork, parent path */
p->pid = alloc_pid();
wake_up_new_task(p);
return p->pid;   // → 1235`}</CodeBlock>
        </div>
      </div>

      {/* Split arrow */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        minWidth: '80px',
      }}>
        <span style={{
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.pulse,
          fontWeight: 700,
        }}>
          fork()
        </span>
        <svg width="60" height="80" viewBox="0 0 60 80">
          <line x1="30" y1="5" x2="30" y2="35" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#split-arrow)" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </line>
          <line x1="30" y1="35" x2="10" y2="70" stroke={color.region.return.fg} strokeWidth="1.5" opacity="0.5" />
          <line x1="30" y1="35" x2="50" y2="70" stroke={color.region.return.fg} strokeWidth="1.5" opacity="0.5" />
          <defs>
            <marker id="split-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
            </marker>
          </defs>
          <text x="8" y="78" fontFamily="monospace" fontSize="8" fill={color.region.return.fg}>parent</text>
          <text x="38" y="78" fontFamily="monospace" fontSize="8" fill={color.region.return.fg}>child</text>
        </svg>
      </div>

      {/* Child */}
      <div className="child-process-anim" style={{ flex: 1, minWidth: '240px', maxWidth: '360px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.return.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          Child process (PID 1235)
        </div>
        <StructCard
          name="child task_struct"
          type="ret_from_fork"
          region="return"
          fields={[
            { label: 'return value', value: '0', highlight: true },
            { label: 'pid', value: '1235' },
            { label: 'parent', value: '→ PID 1234' },
            { label: 'state', value: 'TASK_RUNNING' },
            { label: 'entry', value: 'ret_from_fork', highlight: true },
          ]}
        />
        <div style={{ marginTop: space[3] }}>
          <CodeBlock compact>{`/* Child starts here */
ret_from_fork:
    movl $0, %eax        # return value = 0
    jmp syscall_exit

# Child's fork() returns 0
# Parent's fork() returns 1235`}</CodeBlock>
        </div>
      </div>
    </div>

    {/* Visual diagram */}
    <div style={{
      background: color.bg.inset,
      border: `1px solid ${color.border.subtle}`,
      borderRadius: radius.md,
      padding: space[4],
    }}>
      <div style={{
        fontFamily: font.family.mono,
        fontSize: '9.5px',
        color: color.text.muted,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: space[3],
        fontWeight: 700,
      }}>
        The fork return convention
      </div>
      <div style={{
        display: 'flex',
        gap: space[4],
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}>
        <div style={{
          background: color.region.return.bg,
          border: `1px solid ${color.region.return.fg}55`,
          borderRadius: radius.md,
          padding: space[4],
          flex: 1,
          minWidth: '200px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: font.family.mono,
            fontSize: font.size.lg,
            color: color.region.return.fg,
            fontWeight: 700,
            marginBottom: space[2],
          }}>
            PID ≠ 0
          </div>
          <div style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}>
            Parent process<br />
            <code style={{ color: color.accent.primary }}>{`if (pid > 0) { /* parent */ }`}</code>
          </div>
        </div>

        <div style={{
          background: color.region.return.bg,
          border: `1px solid ${color.region.return.fg}55`,
          borderRadius: radius.md,
          padding: space[4],
          flex: 1,
          minWidth: '200px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: font.family.mono,
            fontSize: font.size.lg,
            color: color.region.return.fg,
            fontWeight: 700,
            marginBottom: space[2],
          }}>
            PID = 0
          </div>
          <div style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}>
            Child process<br />
            <code style={{ color: color.accent.primary }}>if (pid == 0) { /* child */ }</code>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ForkReturn: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="parent gets PID, child gets 0" hero={<ForkReturnHero />} />
);

export default ForkReturn;