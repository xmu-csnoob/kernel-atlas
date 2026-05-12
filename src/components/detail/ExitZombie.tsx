import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExitZombieHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Zombie state lifecycle */}
    <div>
      <SectionLabel accent={color.region.hardware.fg}>
        process state transition · kernel/exit.c
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
          gap: space[2],
          flexWrap: 'wrap',
        }}>
          {/* State boxes */}
          {[
            { state: 'TASK_RUNNING', label: 'Running', color: color.accent.success, active: false },
            { state: 'PF_EXITING', label: 'Exiting', color: color.accent.warning, active: false },
            { state: 'TASK_DEAD', label: 'Zombie', color: color.region.hardware.fg, active: true },
            { state: 'FREED', label: 'Reaped', color: color.text.dim, active: false },
          ].map((s, i, arr) => (
            <React.Fragment key={s.state}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: `${space[3]} ${space[4]}`,
                borderRadius: radius.md,
                background: s.active ? `${s.color}15` : color.bg.surface,
                border: `2px solid ${s.active ? s.color : `${s.color}33`}`,
                minWidth: '100px',
              }}>
                <span style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.sm,
                  color: s.active ? s.color : color.text.muted,
                  fontWeight: s.active ? 700 : 400,
                }}>
                  {s.state}
                </span>
                <span style={{
                  fontFamily: font.family.sans,
                  fontSize: '9.5px',
                  color: s.active ? color.text.secondary : color.text.dim,
                }}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <svg width="30" height="20" viewBox="0 0 30 20">
                  <line x1="0" y1="10" x2="24" y2="10" stroke={color.text.dim} strokeWidth="1.5" markerEnd="url(#zombie-arrow)" opacity="0.6" />
                  <defs>
                    <marker id="zombie-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color.text.dim} />
                    </marker>
                  </defs>
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{
          marginTop: space[3],
          paddingTop: space[3],
          borderTop: `1px solid ${color.border.subtle}`,
          fontFamily: font.family.sans,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          <strong style={{ color: color.region.hardware.fg }}>Zombie state:</strong>{' '}
          The process has exited but its task_struct is retained so the parent can
          collect the exit status via wait4(). Only the PID and exit_code remain.
        </div>
      </div>
    </div>

    {/* What remains in a zombie */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct (zombie)"
        type="minimal footprint"
        region="hardware"
        fields={[
          { label: 'pid', value: '1234', highlight: true },
          { label: 'exit_code', value: '0 << 8', highlight: true },
          { label: 'exit_state', value: 'EXIT_ZOMBIE', highlight: true },
          { label: 'mm', value: 'NULL (freed)', highlight: true },
          { label: 'files', value: 'NULL (freed)', highlight: true },
          { label: 'fs', value: 'NULL (freed)', highlight: true },
          { label: 'signal', value: '→ signal_struct (shared)', highlight: false },
          { label: 'parent', value: '→ init (if orphaned)', highlight: false },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.hardware.fg}>release_task() frees the zombie</SectionLabel>
        <CodeBlock compact>{`void release_task(struct task_struct *p)
{
    write_lock_irq(&tasklist_lock);
    __exit_signal(p);          /* detach from lists */
    __unhash_process(p);       /* remove from PID hash */
    write_unlock_irq(&tasklist_lock);

    release_thread(p);         /* arch-specific cleanup */
    put_task_struct(p);        /* final free */
}`}</CodeBlock>
        <div style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}>
          <span style={{ color: color.pulse, fontWeight: 700 }}>Note:</span>{' '}
          If parent exits first, child is reparented to init (PID 1).
        </div>
      </div>
    </div>

    {/* PID namespace cleanup */}
    <div>
      <SectionLabel accent={color.region.hardware.fg}>
        zap_pid_ns_processes() — PID namespace teardown
      </SectionLabel>
      <CodeBlock>{`void zap_pid_ns_processes(struct pid_namespace *pid_ns)
{
    /* Prevent any new PID allocations */
    pid_ns->nr_hashed = PIDMAP_ENTRIES;

    /* Send SIGKILL to all processes in namespace */
    read_lock(&tasklist_lock);
    nr = next_pidmap(pid_ns, 1);
    while (nr > 0) {
        task = pid_task(find_vpid(nr), PIDTYPE_PID);
        if (task)
            send_sig_info(SIGKILL, SEND_SIG_FORCED, task);
        nr = next_pidmap(pid_ns, nr);
    }
    read_unlock(&tasklist_lock);
}`}</CodeBlock>
    </div>
  </div>
);

const ExitZombie: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="TASK_DEAD → zombie → release_task() → free_pid()"
    hero={<ExitZombieHero />}
  />
);

export default ExitZombie;
