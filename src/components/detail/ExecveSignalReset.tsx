import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

const SIGNALS: { name: string; default_: string; before: 'dfl' | 'ign' | 'custom'; after: 'dfl' | 'ign' }[] = [
  { name: 'SIGHUP',  default_: 'terminate', before: 'custom', after: 'dfl' },
  { name: 'SIGINT',  default_: 'terminate', before: 'custom', after: 'dfl' },
  { name: 'SIGQUIT', default_: 'core dump', before: 'custom', after: 'dfl' },
  { name: 'SIGILL',  default_: 'core dump', before: 'dfl',   after: 'dfl' },
  { name: 'SIGABRT', default_: 'core dump', before: 'custom', after: 'dfl' },
  { name: 'SIGFPE',  default_: 'core dump', before: 'dfl',   after: 'dfl' },
  { name: 'SIGKILL', default_: 'terminate', before: 'dfl',   after: 'dfl' },
  { name: 'SIGSEGV', default_: 'core dump', before: 'dfl',   after: 'dfl' },
  { name: 'SIGPIPE', default_: 'terminate', before: 'custom', after: 'dfl' },
  { name: 'SIGALRM', default_: 'terminate', before: 'custom', after: 'dfl' },
  { name: 'SIGTERM', default_: 'terminate', before: 'custom', after: 'dfl' },
  { name: 'SIGCHLD', default_: 'ignore',    before: 'ign',   after: 'ign' },
  { name: 'SIGCONT', default_: 'continue',  before: 'dfl',   after: 'dfl' },
  { name: 'SIGSTOP', default_: 'stop',      before: 'dfl',   after: 'dfl' },
  { name: 'SIGTSTP', default_: 'stop',      before: 'custom', after: 'dfl' },
  { name: 'SIGUSR1', default_: 'terminate', before: 'custom', after: 'dfl' },
];

export const ExecveSignalResetHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Signal handler state grid */}
    <div>
      <SectionLabel accent={color.region.signal.fg}>Signal handler state transition</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '3px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {SIGNALS.map((sig) => {
          const changed = sig.before !== sig.after;
          return (
            <div
              key={sig.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space[2],
                padding: `${space[1]} ${space[2]}`,
                borderRadius: radius.sm,
                background: changed ? 'rgba(255, 235, 59, 0.06)' : 'transparent',
                border: changed ? `1px solid ${color.pulse}33` : `1px solid ${color.border.subtle}`,
                fontFamily: font.family.mono,
                fontSize: '9.5px',
              }}
            >
              <span style={{ color: changed ? color.pulse : color.text.secondary, fontWeight: changed ? 700 : 400, minWidth: '52px' }}>
                {sig.name}
              </span>
              <span style={{ color: color.text.dim, marginLeft: 'auto', fontSize: '9px' }}>
                {sig.before === 'custom' ? 'handler()' : sig.before === 'ign' ? 'SIG_IGN' : 'SIG_DFL'}
                <span style={{ color: color.text.dim, margin: '0 4px' }}>→</span>
                {sig.after === 'ign' ? 'SIG_IGN' : 'SIG_DFL'}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        <span style={{ color: color.pulse, fontWeight: 700 }}>Note:</span>{' '}
        SIG_IGN signals (e.g., SIGCHLD) stay ignored per POSIX. Custom handlers reset to SIG_DFL.
      </div>
    </div>

    {/* Code + sighand_struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.signal.fg}>flush_signal_handlers()</SectionLabel>
        <CodeBlock compact>{`void flush_signal_handlers(struct task_struct *t,
  int force_default)
{
  struct k_sigaction *ka = &t->sighand->action[0];
  for (i = _NSIG; i != 0; i--) {
    if (force_default ||
        ka->sa.sa_handler != SIG_IGN)
      ka->sa.sa_handler = SIG_DFL;
    ka->sa.sa_flags = 0;
    sigemptyset(&ka->sa.sa_mask);
    ka++;
  }
}`}</CodeBlock>
      </div>
      <StructCard
        name="sighand_struct"
        type="kernel/signal.c"
        region="signal"
        fields={[
          { label: 'action[SIGHUP]', value: 'SIG_DFL', highlight: true },
          { label: 'action[SIGINT]', value: 'SIG_DFL', highlight: true },
          { label: 'action[SIGCHLD]', value: 'SIG_IGN', highlight: true },
          { label: 'count', value: '1' },
          { label: 'siglock', value: 'spinlock_t' },
        ]}
      />
    </div>
  </div>
);

const ExecveSignalReset: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="flush_signal_handlers — SIG_DFL reset, SIG_IGN preserved"
    hero={<ExecveSignalResetHero />}
  />
);

export default ExecveSignalReset;
