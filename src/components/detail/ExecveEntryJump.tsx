import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExecveEntryJumpHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <style>{`
      @keyframes exec-jump {
        0% { opacity: 0.3; transform: translateX(-10px); }
        50% { opacity: 0.9; }
        100% { opacity: 1; transform: translateX(0); }
      }
      .new-program-anim {
        animation: exec-jump 1.2s ease-out;
      }
    `}</style>

    {/* The transformation: old process → new program */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* Before */}
      <div style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.text.muted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          Before execve (PID 1234)
        </div>
        <StructCard
          name="pt_regs (old)"
          type="bash context"
          region="return"
          fields={[
            { label: 'rip', value: '0x7f... (bash code)' },
            { label: 'rsp', value: '0x7fff... (old stack)' },
            { label: 'rax', value: '59 (NR_execve)' },
            { label: 'rdi', value: '"/bin/ls"' },
          ]}
        />
      </div>

      {/* Arrow */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        minWidth: '100px',
      }}>
        <span style={{
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.pulse,
          fontWeight: 700,
        }}>
          start_thread()
        </span>
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="10" y1="30" x2="65" y2="30" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#exec-arrow)" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </line>
          <defs>
            <marker id="exec-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
            </marker>
          </defs>
        </svg>
        <span style={{
          fontFamily: font.family.mono,
          fontSize: '9px',
          color: color.text.dim,
          textAlign: 'center',
        }}>
          same PID<br/>new code
        </span>
      </div>

      {/* After */}
      <div className="new-program-anim" style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
        <div style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.region.return.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}>
          After execve (PID 1234)
        </div>
        <StructCard
          name="pt_regs (new)"
          type="ls context"
          region="return"
          fields={[
            { label: 'rip', value: '0x400520 (_start)', highlight: true },
            { label: 'rsp', value: '0x7fff... (new stack)', highlight: true },
            { label: 'rax', value: 'undefined' },
            { label: 'rdi', value: 'argc = 2' },
          ]}
        />
      </div>
    </div>

    {/* start_thread code + syscall return */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.return.fg}>start_thread()</SectionLabel>
        <CodeBlock compact>{`void start_thread(struct pt_regs *regs,
  unsigned long new_ip,
  unsigned long new_sp)
{
  loadsegment(fs, 0);
  loadsegment(gs, 0);
  loadsegment(ds, __USER_DS);
  loadsegment(es, __USER_DS);
  regs->ip = new_ip;   /* ELF e_entry */
  regs->sp = new_sp;   /* new stack top */
  ...
}`}</CodeBlock>
      </div>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.return.fg}>sysretq — enter new program</SectionLabel>
        <CodeBlock compact>{`syscall_return:
  RESTORE_ARGS 1,-ARG_SKIP,0
  movq EFLAGS-ARGOFFSET(%rsp), %r11
  sysretq

# CPU switches to ring 3
# %rip = ELF entry point
# %rsp = new stack top
# → _start in the new program`}</CodeBlock>
      </div>
    </div>

    {/* Summary banner */}
    <div
      style={{
        background: color.region.return.bg,
        border: `1px solid ${color.region.return.fg}44`,
        borderRadius: radius.md,
        padding: space[4],
        textAlign: 'center',
      }}
    >
      <div style={{
        fontFamily: font.family.mono,
        fontSize: font.size.lg,
        color: color.region.return.fg,
        fontWeight: 700,
        marginBottom: space[2],
      }}>
        Same PID. New mm. New code. New stack.
      </div>
      <div style={{
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.5,
      }}>
        The process that called <code style={{ color: color.accent.primary }}>execve()</code> is gone.
        Its PID, file descriptors (that were not close-on-exec), and
        certain attributes survive, but the memory image is completely replaced.
      </div>
    </div>
  </div>
);

const ExecveEntryJump: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="start_thread → sysretq → new program _start"
    hero={<ExecveEntryJumpHero />}
  />
);

export default ExecveEntryJump;
