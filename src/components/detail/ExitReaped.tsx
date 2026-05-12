import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExitReapedHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* wait4 flow */}
    <div>
      <SectionLabel accent={color.region.return.fg}>
        wait4() reaping flow · kernel/exit.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[3],
          flexWrap: 'wrap',
        }}>
          {[
            { step: 'wait4()', desc: 'parent syscall', active: false },
            { step: 'do_wait()', desc: 'search children', active: false },
            { step: 'find zombie', desc: 'EXIT_ZOMBIE', active: true },
            { step: 'release_task()', desc: 'free resources', active: false },
            { step: 'return PID', desc: 'to parent', active: false },
          ].map((s, i, arr) => (
            <React.Fragment key={s.step}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: `${space[2]} ${space[3]}`,
                borderRadius: radius.sm,
                background: s.active ? 'rgba(77, 208, 225, 0.08)' : color.bg.surface,
                border: `1px solid ${s.active ? color.accent.primary : color.border.subtle}`,
                minWidth: '90px',
              }}>
                <span style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: s.active ? color.accent.primary : color.text.secondary,
                  fontWeight: s.active ? 700 : 600,
                }}>
                  {s.step}
                </span>
                <span style={{
                  fontFamily: font.family.sans,
                  fontSize: '9px',
                  color: s.active ? color.text.secondary : color.text.dim,
                }}>
                  {s.desc}
                </span>
              </div>
              {i < arr.length - 1 && (
                <svg width="24" height="16" viewBox="0 0 24 16">
                  <line x1="0" y1="8" x2="18" y2="8" stroke={color.text.dim} strokeWidth="1.5" markerEnd="url(#reap-arrow)" opacity="0.5" />
                  <defs>
                    <marker id="reap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color.text.dim} />
                    </marker>
                  </defs>
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>

    {/* Parent and child interaction */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
      {/* Parent wait4 */}
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
          Parent calls wait4()
        </div>
        <StructCard
          name="parent task_struct"
          type="TASK_RUNNING"
          region="process"
          fields={[
            { label: 'pid', value: '1 (init)' },
            { label: 'children', value: '→ zombie list', highlight: true },
            { label: 'signal->wait_chldexit', value: 'wait queue', highlight: true },
          ]}
        />
        <div style={{ marginTop: space[3] }}>
          <CodeBlock compact>{`pid_t wait4(pid_t pid, int *status,
          int options, struct rusage *rusage)
{
    /* Search children for EXIT_ZOMBIE */
    list_for_each_entry(child, &current->children, sibling) {
        if (child->exit_state == EXIT_ZOMBIE) {
            *status = child->exit_code;
            release_task(child);
            return child->pid;
        }
    }
    /* No zombie — sleep on wait_chldexit */
    schedule();
}`}</CodeBlock>
        </div>
      </div>

      {/* Status extraction */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minWidth: '120px',
        paddingTop: '40px',
      }}>
        <span style={{
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.pulse,
          fontWeight: 700,
        }}>
          status
        </span>
        <svg width="60" height="50" viewBox="0 0 60 50">
          <line x1="10" y1="25" x2="45" y2="25" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#status-arrow)" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </line>
          <defs>
            <marker id="status-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
            </marker>
          </defs>
        </svg>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9px',
          color: color.text.dim,
          textAlign: 'center',
        }}>
          exit_code {'>>'} 8<br />
          → user status
        </div>
      </div>

      {/* User status */}
      <div style={{ flex: 1, minWidth: '200px', maxWidth: '280px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.return.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          User space status
        </div>
        <div style={{
          background: color.bg.surface,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: space[2],
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>WIFEXITED(status)</span>
              <span style={{ color: color.accent.success, fontWeight: 700 }}>true</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>WEXITSTATUS(status)</span>
              <span style={{ color: color.accent.primary, fontWeight: 700 }}>0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>WIFSIGNALED(status)</span>
              <span style={{ color: color.text.dim }}>false</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>return value</span>
              <span style={{ color: color.region.return.fg, fontWeight: 700 }}>1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Init reaper note */}
    <div style={{
      background: 'rgba(255, 193, 7, 0.06)',
      border: `1px solid rgba(255, 193, 7, 0.25)`,
      borderRadius: radius.md,
      padding: space[4],
    }}>
      <div style={{
        fontFamily: font.family.mono,
        fontSize: '9.5px',
        color: '#ffcc80',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: space[2],
        fontWeight: 700,
      }}>
        init (PID 1) — the ultimate reaper
      </div>
      <div style={{
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}>
        If a parent exits before its children, the kernel reparents orphaned children
        to <code style={{ color: color.accent.primary }}>init</code> (PID 1). init's main loop
        periodically calls <code style={{ color: color.accent.primary }}>wait4(-1, ...)</code> to
        reap any orphaned children, preventing zombie accumulation. This is why a well-behaved
        daemon must either reap its own children or let init do it.
      </div>
    </div>
  </div>
);

const ExitReaped: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="wait4() → do_wait() → release_task() → task_struct freed"
    hero={<ExitReapedHero />}
  />
);

export default ExitReaped;
