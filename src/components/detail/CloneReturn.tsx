import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const CloneReturnHero: React.FC = () => (
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

    {/* The clone split */}
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
          Parent process (PID/TGID 1234)
        </div>
        <StructCard
          name="parent task_struct"
          type="clone() return path"
          region="process"
          fields={[
            { label: 'return value', value: '1235 (child TID)', highlight: true },
            { label: 'pid', value: '1234' },
            { label: 'tgid', value: '1234' },
            { label: 'state', value: 'TASK_RUNNING' },
          ]}
        />
        <div style={{ marginTop: space[3] }}>
          <CodeBlock compact>{`/* In do_fork, parent path */
nr = task_pid_vnr(p);
if (clone_flags & CLONE_PARENT_SETTID)
    put_user(nr, parent_tidptr);
return nr;   // → 1235`}</CodeBlock>
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
          clone()
        </span>
        <svg width="60" height="80" viewBox="0 0 60 80">
          <line x1="30" y1="5" x2="30" y2="35" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#clone-split-arrow)" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </line>
          <line x1="30" y1="35" x2="10" y2="70" stroke={color.region.return.fg} strokeWidth="1.5" opacity="0.5" />
          <line x1="30" y1="35" x2="50" y2="70" stroke={color.region.return.fg} strokeWidth="1.5" opacity="0.5" />
          <defs>
            <marker id="clone-split-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
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
          Child thread (PID 1235, TGID 1234)
        </div>
        <StructCard
          name="child task_struct"
          type="ret_from_fork → fn(arg)"
          region="return"
          fields={[
            { label: 'entry', value: 'fn(arg)', highlight: true },
            { label: 'pid', value: '1235' },
            { label: 'tgid', value: '1234 (shared)' },
            { label: 'parent', value: '→ PID 1234' },
            { label: 'state', value: 'TASK_RUNNING' },
          ]}
        />
        <div style={{ marginTop: space[3] }}>
          <CodeBlock compact>{`/* Child starts at user fn */
ret_from_fork:
    call schedule_tail
    /* restore childregs */
    jmp fn          # user function
    /* arg on child_stack */

# When fn returns, glibc wrapper
# calls exit() automatically`}</CodeBlock>
        </div>
      </div>
    </div>

    {/* CLONE_CHILD_CLEARTID diagram */}
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
        CLONE_CHILD_CLEARTID — pthread_join synchronization
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
            pthread_join
          </div>
          <div style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}>
            Parent waits on futex<br />
            at <code style={{ color: color.accent.primary }}>child_tidptr</code>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <line x1="5" y1="20" x2="30" y2="20" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#futex-arrow)" opacity="0.8">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
            </line>
            <defs>
              <marker id="futex-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
              </marker>
            </defs>
          </svg>
          <span style={{
            fontFamily: font.family.mono,
            fontSize: '9px',
            color: color.text.dim,
          }}>
            FUTEX_WAKE
          </span>
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
            Thread exit
          </div>
          <div style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}>
            Kernel clears TID at<br />
            <code style={{ color: color.accent.primary }}>child_tidptr</code><br />
            and wakes futex waiters
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CloneReturn: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="parent gets TID; child starts at fn(arg)" hero={<CloneReturnHero />} />
);

export default CloneReturn;
