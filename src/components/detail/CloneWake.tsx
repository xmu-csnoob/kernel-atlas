import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

// Simulated runqueue entries with thread group
const RUNQUEUE_ENTRIES: { pid: string; tid: string; prio: number; state: string; isNew?: boolean; isThread?: boolean }[] = [
  { pid: '1234', tid: '1234', prio: 120, state: 'R' },
  { pid: '1234', tid: '1235', prio: 120, state: 'R', isNew: true, isThread: true },
  { pid: '1234', tid: '1236', prio: 120, state: 'R', isThread: true },
  { pid: '1198', tid: '1198', prio: 120, state: 'R' },
  { pid: '2001', tid: '2001', prio: 120, state: 'R' },
];

export const CloneWakeHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <style>{`
      @keyframes enqueue-slide {
        0% { transform: translateX(-60px); opacity: 0; }
        60% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(0); opacity: 1; }
      }
      .runqueue-new {
        animation: enqueue-slide 1.2s ease-out;
      }
    `}</style>

    {/* Thread group visual */}
    <div>
      <SectionLabel accent={color.region.sched.fg}>
        Thread group (CLONE_THREAD)  ·  kernel/fork.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', gap: space[3], flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {/* Thread group leader */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9px',
              color: color.text.dim,
              marginBottom: space[1],
            }}>
              group_leader
            </div>
            <StructCard
              name="task_struct"
              type="PID 1234"
              region="sched"
              fields={[
                { label: 'pid', value: '1234' },
                { label: 'tgid', value: '1234' },
                { label: 'thread_group', value: '→ list' },
              ]}
            />
          </div>

          {/* Thread group list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}>
            <span style={{
              fontFamily: font.family.mono,
              fontSize: '9px',
              color: color.pulse,
              fontWeight: 700,
            }}>
              thread_group
            </span>
            <svg width="80" height="24" viewBox="0 0 80 24">
              <line x1="0" y1="12" x2="70" y2="12" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <circle cx="70" cy="12" r="3" fill={color.pulse} />
            </svg>
          </div>

          {/* Thread 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9px',
              color: color.text.dim,
              marginBottom: space[1],
            }}>
              thread
            </div>
            <StructCard
              name="task_struct"
              type="PID 1235"
              region="return"
              fields={[
                { label: 'pid', value: '1235', highlight: true },
                { label: 'tgid', value: '1234 (shared)', highlight: true },
                { label: 'group_leader', value: '→ 1234' },
              ]}
            />
          </div>

          {/* Thread 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9px',
              color: color.text.dim,
              marginBottom: space[1],
            }}>
              thread
            </div>
            <StructCard
              name="task_struct"
              type="PID 1236"
              region="return"
              fields={[
                { label: 'pid', value: '1236' },
                { label: 'tgid', value: '1234 (shared)' },
                { label: 'group_leader', value: '→ 1234' },
              ]}
            />
          </div>
        </div>

        <div style={{
          marginTop: space[3],
          paddingTop: space[3],
          borderTop: `1px solid ${color.border.subtle}`,
          fontFamily: font.family.sans,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: color.pulse }}>CLONE_THREAD:</strong>{' '}
          All threads share the same{' '}
          <code style={{ color: color.accent.primary }}>tgid</code>.
          Signals sent to the tgid are delivered to all threads.
          <code style={{ color: color.accent.primary }}> getpid()</code>{' '}
          returns tgid; <code style={{ color: color.accent.primary }}>gettid()</code>{' '}
          returns each thread's unique PID.
        </div>
      </div>
    </div>

    {/* Runqueue visual */}
    <div>
      <SectionLabel accent={color.region.sched.fg}>
        cfs_rq runqueue (CFS)  ·  kernel/sched.c
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
          {/* Runqueue header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 60px 1fr 1fr 60px',
              gap: space[3],
              paddingBottom: space[2],
              borderBottom: `1px solid ${color.border.subtle}`,
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.text.dim,
              letterSpacing: font.letterSpacing.wide,
              textTransform: 'uppercase',
            }}
          >
            <span>TID</span>
            <span>TGID</span>
            <span>sched_entity</span>
            <span>state</span>
            <span style={{ textAlign: 'right' }}>prio</span>
          </div>

          {RUNQUEUE_ENTRIES.map((entry, i) => (
            <div
              key={entry.tid}
              className={entry.isNew ? 'runqueue-new' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 60px 1fr 1fr 60px',
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
              <span style={{ color: entry.isNew ? color.region.return.fg : color.text.secondary, fontWeight: entry.isNew ? 700 : 400 }}>
                {entry.tid}
              </span>
              <span style={{ color: entry.isThread ? color.pulse : color.text.muted, fontSize: font.size.xs }}>
                {entry.pid}
              </span>
              <span style={{ color: color.text.muted, fontSize: font.size.xs }}>
                {entry.isNew ? 'vruntime=0, on_rq=1' : 'vruntime=T+Δ'}
              </span>
              <span style={{ color: color.accent.success, fontSize: font.size.xs }}>
                {entry.state}
              </span>
              <span style={{ textAlign: 'right', color: entry.isNew ? color.region.return.fg : color.text.muted, fontWeight: entry.isNew ? 700 : 400 }}>
                {entry.prio}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: space[3],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}>
          <span style={{ color: color.pulse, fontWeight: 700 }}>
            New thread gets vruntime = 0
          </span>{' '}
          → it will get a generous time slice on its first schedule
        </div>
      </div>
    </div>
  </div>
);

const CloneWake: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="wake_up_new_task → thread group → runqueue" hero={<CloneWakeHero />} />
);

export default CloneWake;
