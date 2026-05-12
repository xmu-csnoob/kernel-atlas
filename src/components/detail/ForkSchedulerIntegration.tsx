import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

// Simulated runqueue entries
const RUNQUEUE_ENTRIES: { pid: string; prio: number; state: string; isNew?: boolean }[] = [
  { pid: '1022', prio: 120, state: 'R' },
  { pid: '1198', prio: 120, state: 'R' },
  { pid: '1234', prio: 120, state: 'R' },
  { pid: '1235', prio: 120, state: 'R', isNew: true },
  { pid: '2001', prio: 120, state: 'R' },
  { pid: '2047', prio: 120, state: 'R' },
];

export const ForkSchedulerIntegrationHero: React.FC = () => (
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Runqueue header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 60px',
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
            <span>PID</span>
            <span>sched_entity</span>
            <span>state</span>
            <span style={{ textAlign: 'right' }}>prio</span>
          </div>

          {RUNQUEUE_ENTRIES.map((entry, i) => (
            <div
              key={entry.pid}
              className={entry.isNew ? 'runqueue-new' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 60px',
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
                  fontWeight: entry.isNew
                    ? 700
                    : 400,
                }}
              >
                {entry.pid}
              </span>
              <span style={{ color: color.text.muted, fontSize: font.size.xs }}>
                {entry.isNew
                  ? 'vruntime=0, on_rq=1'
                  : 'vruntime=T+Δ'}
              </span>
              <span style={{ color: color.accent.success, fontSize: font.size.xs }}>
                {entry.state}
              </span>
              <span
                style={{
                  textAlign: 'right',
                  color: entry.isNew
                    ? color.region.return.fg
                    : color.text.muted,
                  fontWeight: entry.isNew
                    ? 700
                    : 400,
                }}
              >
                {entry.prio}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
          }}
        >
          <span style={{ color: color.pulse, fontWeight: 700 }}>
            New task gets vruntime = 0
          </span>{' '}
          → it will get a generous time slice on its first schedule
        </div>
      </div>
    </div>

    {/* sched_fork + sched_entity */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="sched_fork"
        type="kernel/sched.c"
        region="sched"
        fields={[
          { label: 'p->se.load.weight', value: 'NICE_0_LOAD = 1024' },
          { label: 'p->se.vruntime', value: '0 ← start fresh', highlight: true },
          { label: 'p->se.on_rq', value: '0 (not yet)' },
          { label: 'p->prio', value: '120 (normal)' },
        ]}
      />
      <StructCard
        name="sched_entity"
        type="CFS scheduling unit"
        region="sched"
        fields={[
          { label: 'load', value: '→ sched_load' },
          { label: 'run_node', value: '→ rb_node (red-black)' },
          { label: 'on_rq', value: '1 ← wake_up_new_task', highlight: true },
          { label: 'vruntime', value: 'accumulated fair time' },
        ]}
      />
    </div>
  </div>
);

const ForkSchedulerIntegration: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="sched_fork → wake_up_new_task → runqueue" hero={<ForkSchedulerIntegrationHero />} />
);

export default ForkSchedulerIntegration;
