import React from 'react';
import DetailLayout from '../DetailLayout';
import type { DetailViewProps } from '../DetailLayout';
import { StructCard } from '../primitives';
import { color, font, space, radius } from '../../../design/tokens';

const RUNQUEUE_STUB = [
  { pid: '1022', vruntime: 'T+120', state: 'R' },
  { pid: '1198', vruntime: 'T+80', state: 'R' },
  { pid: 'current', vruntime: 'T', state: 'R' },
  { pid: 'NEW', vruntime: '0', state: 'R', isNew: true },
  { pid: '2001', vruntime: 'T+200', state: 'R' },
];

const GenericScheduler: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="Scheduler integration"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <div>
            <div
              style={{
                fontFamily: font.family.mono,
                fontSize: '9.5px',
                color: color.text.muted,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: space[2],
                fontWeight: 700,
              }}
            >
              cfs_rq runqueue (CFS)
            </div>
            <div
              style={{
                background: color.bg.inset,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: radius.md,
                padding: space[4],
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 60px',
                  gap: space[3],
                  paddingBottom: space[2],
                  borderBottom: `1px solid ${color.border.subtle}`,
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: color.text.dim,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <span>PID</span>
                <span>vruntime</span>
                <span style={{ textAlign: 'right' }}>state</span>
              </div>

              {RUNQUEUE_STUB.map((entry, i) => (
                <div
                  key={entry.pid}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 60px',
                    gap: space[3],
                    alignItems: 'center',
                    padding: `${space[1]} ${space[2]}`,
                    background: entry.isNew
                      ? color.region.return.bg
                      : i % 2 === 0
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                    borderRadius: radius.sm,
                    border: entry.isNew
                      ? `1px solid ${color.region.return.fg}66`
                      : '1px solid transparent',
                    fontFamily: font.family.mono,
                    fontSize: font.size.sm,
                  }}
                >
                  <span
                    style={{
                      color: entry.isNew
                        ? color.region.return.fg
                        : color.text.secondary,
                      fontWeight: entry.isNew ? 700 : 400,
                    }}
                  >
                    {entry.pid}
                  </span>
                  <span style={{ color: color.text.muted, fontSize: font.size.xs }}>
                    {entry.vruntime}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      color: color.accent.success,
                      fontSize: font.size.xs,
                    }}
                  >
                    {entry.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="sched_entity"
              type="CFS unit"
              region="kernel"
              fields={[
                { label: 'load', value: 'NICE_0_LOAD' },
                { label: 'vruntime', value: '0 ← start', highlight: true },
                { label: 'on_rq', value: '1 ← enqueued', highlight: true },
                { label: 'parent', value: '→ cfs_rq' },
              ]}
            />
            <StructCard
              name="wake_up_new_task"
              type="enqueue"
              region="kernel"
              fields={[
                { label: 'p->state', value: 'TASK_RUNNING' },
                { label: 'rq', value: '→ this_cpu' },
                { label: 'enqueue', value: 'sched_class->enqueue_task' },
                { label: 'reschedule', value: 'if needed' },
              ]}
            />
          </div>
        </div>
      }
    />
  );
};

export default GenericScheduler;
