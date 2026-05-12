import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExitSignalParentHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Parent-Child signal flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
      {/* Child (zombie) */}
      <div style={{ flex: 1, minWidth: '240px', maxWidth: '320px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.hardware.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          Child (zombie)
        </div>
        <StructCard
          name="task_struct"
          type="TASK_DEAD"
          region="signal"
          fields={[
            { label: 'pid', value: '1234', highlight: true },
            { label: 'exit_code', value: '0 << 8', highlight: true },
            { label: 'exit_state', value: 'EXIT_ZOMBIE', highlight: true },
            { label: 'parent', value: '→ PID 1' },
          ]}
        />
      </div>

      {/* Signal arrow */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minWidth: '100px',
        paddingTop: '24px',
      }}>
        <span style={{
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.pulse,
          fontWeight: 700,
        }}>
          SIGCHLD
        </span>
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="5" y1="20" x2="70" y2="20" stroke={color.pulse} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#sig-arrow)" opacity="0.9">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
          </line>
          <defs>
            <marker id="sig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
            </marker>
          </defs>
        </svg>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9px',
          color: color.text.dim,
          textAlign: 'center',
          lineHeight: 1.4,
        }}>
          si_pid=1234<br />
          si_status=0<br />
          si_code=CLD_EXITED
        </div>
      </div>

      {/* Parent */}
      <div style={{ flex: 1, minWidth: '240px', maxWidth: '320px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.signal.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          Parent (waiting)
        </div>
        <StructCard
          name="task_struct"
          type="TASK_INTERRUPTIBLE"
          region="signal"
          fields={[
            { label: 'pid', value: '1 (init)' },
            { label: 'state', value: 'TASK_INTERRUPTIBLE → RUNNING', highlight: true },
            { label: 'signal', value: 'SIGCHLD pending', highlight: true },
            { label: 'wait_chldexit', value: 'woken up', highlight: true },
          ]}
        />
      </div>
    </div>

    {/* siginfo detail */}
    <div>
      <SectionLabel accent={color.region.signal.fg}>
        struct siginfo payload · include/asm-generic/siginfo.h
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '6px',
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
        }}>
          {[
            { field: 'si_signo', value: 'SIGCHLD (17)', highlight: false },
            { field: 'si_errno', value: '0', highlight: false },
            { field: 'si_code', value: 'CLD_EXITED (1)', highlight: true },
            { field: 'si_pid', value: '1234', highlight: true },
            { field: 'si_uid', value: '1000', highlight: false },
            { field: 'si_status', value: '0', highlight: true },
            { field: 'si_utime', value: '12', highlight: false },
            { field: 'si_stime', value: '3', highlight: false },
          ].map((f) => (
            <div
              key={f.field}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: `${space[1]} ${space[2]}`,
                borderRadius: radius.sm,
                background: f.highlight ? 'rgba(77, 208, 225, 0.06)' : 'transparent',
                border: f.highlight ? `1px solid ${color.accent.primary}33` : '1px solid transparent',
              }}
            >
              <span style={{ color: f.highlight ? color.accent.primary : color.text.muted }}>
                {f.field}
              </span>
              <span style={{
                color: f.highlight ? color.text.primary : color.text.secondary,
                fontWeight: f.highlight ? 600 : 400,
              }}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.signal.fg}>do_notify_parent()</SectionLabel>
        <CodeBlock compact>{`static void do_notify_parent(struct task_struct *tsk, int sig)
{
    struct siginfo info;
    info.si_signo = sig;
    info.si_code = CLD_EXITED;
    info.si_pid = task_pid_nr(tsk);
    info.si_status = tsk->exit_code >> 8;
    info.si_utime = cputime_to_clock_t(tsk->utime);
    info.si_stime = cputime_to_clock_t(tsk->stime);

    __group_send_sig_info(sig, &info, tsk->parent);
    wake_up_interruptible(&tsk->parent->signal->wait_chldexit);
}`}</CodeBlock>
      </div>
      <StructCard
        name="sighand_struct"
        type="parent's SIGCHLD handler"
        region="signal"
        fields={[
          { label: 'sa_handler', value: 'SIG_DFL / SIG_IGN / &handler', highlight: true },
          { label: 'sa_flags', value: 'SA_NOCLDWAIT?', highlight: true },
          { label: 'sa_mask', value: 'blocked during handler' },
        ]}
      />
    </div>
  </div>
);

const ExitSignalParent: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="do_notify_parent() → SIGCHLD → wake_up_parent()"
    hero={<ExitSignalParentHero />}
  />
);

export default ExitSignalParent;
