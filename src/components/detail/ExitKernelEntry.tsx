import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExitKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* do_exit flow diagram */}
    <div>
      <SectionLabel accent={color.region.process.fg}>
        do_exit() call sequence · kernel/exit.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { step: 1, fn: 'exit_signals(tsk)', desc: 'block all signal delivery', highlight: true },
            { step: 2, fn: 'tsk->flags |= PF_EXITING', desc: 'mark process as exiting', highlight: true },
            { step: 3, fn: 'exit_io_context(tsk)', desc: 'cancel async I/O', highlight: false },
            { step: 4, fn: 'group_dead = atomic_dec_and_test(&live)', desc: 'last thread in group?', highlight: false },
            { step: 5, fn: 'exit_files(tsk)', desc: 'close all file descriptors', highlight: false },
            { step: 6, fn: 'exit_fs(tsk)', desc: 'release filesystem structs', highlight: false },
            { step: 7, fn: 'exit_mm(tsk)', desc: 'release memory descriptor', highlight: false },
            { step: 8, fn: 'tsk->exit_code = code', desc: 'save exit status for parent', highlight: true },
            { step: 9, fn: 'set_task_state(tsk, TASK_DEAD)', desc: 'process is now a zombie', highlight: true },
            { step: 10, fn: 'schedule()', desc: 'never returns', highlight: true },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space[3],
                padding: `${space[1]} ${space[2]}`,
                borderRadius: radius.sm,
                background: s.highlight ? 'rgba(239, 83, 80, 0.06)' : 'transparent',
                border: s.highlight ? `1px solid rgba(239, 83, 80, 0.25)` : '1px solid transparent',
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
              }}
            >
              <span
                style={{
                  width: '20px',
                  textAlign: 'center',
                  color: s.highlight ? color.region.hardware.fg : color.text.dim,
                  fontWeight: 700,
                }}
              >
                {s.step}
              </span>
              <span
                style={{
                  color: s.highlight ? color.text.primary : color.text.secondary,
                  fontWeight: s.highlight ? 600 : 400,
                  minWidth: '220px',
                }}
              >
                {s.fn}
              </span>
              <span style={{ color: color.text.muted, fontSize: '9.5px' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* PF_EXITING struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="PF_EXITING set"
        region="process"
        fields={[
          { label: 'flags', value: 'PF_EXITING | PF_EXITPIDONE', highlight: true },
          { label: 'state', value: 'TASK_DEAD', highlight: true },
          { label: 'exit_code', value: 'status << 8', highlight: true },
          { label: 'mm', value: 'NULL ← released', highlight: true },
          { label: 'files', value: 'NULL ← released', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.process.fg}>exit_signals() blocks all signals</SectionLabel>
        <CodeBlock compact>{`static void exit_signals(struct task_struct *tsk)
{
    struct signal_struct *sig = tsk->signal;
    /* Block all signal delivery */
    sigemptyset(&tsk->blocked);
    sigaddset(&tsk->blocked, SIGKILL);
    sigaddset(&tsk->blocked, SIGSTOP);
    /* ... all signals now blocked */
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const ExitKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="do_exit() — PF_EXITING → resource release chain"
    hero={<ExitKernelEntryHero />}
  />
);

export default ExitKernelEntry;
