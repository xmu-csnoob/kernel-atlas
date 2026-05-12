import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import AnimatedArrow from './primitives/AnimatedArrow';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitWaitQueueHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Sleep flow diagram */}
    <div>
      <SectionLabel accent={color.region.sched.fg}>epoll_wait() sleep path</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
          <StateBox label="TASK_RUNNING" active />
          <AnimatedArrow label="rdllist empty" width={90} />
          <StateBox label="TASK_INTERRUPTIBLE" highlight />
          <AnimatedArrow label="schedule_timeout()" width={110} />
          <StateBox label="SLEEPING" />
          <AnimatedArrow label="ep_poll_callback wakes" width={130} color={color.accent.success} />
          <StateBox label="TASK_RUNNING" active />
        </div>

        <div
          style={{
            marginTop: space[4],
            display: 'flex',
            gap: space[3],
            flexWrap: 'wrap',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
          }}
        >
          <span style={{ color: color.text.dim }}>Wakeup sources:</span>
          <span style={{ color: color.accent.success }}>event ready</span>
          <span style={{ color: color.text.dim }}>|</span>
          <span style={{ color: color.accent.warning }}>signal</span>
          <span style={{ color: color.text.dim }}>|</span>
          <span style={{ color: color.accent.primary }}>timeout expiry</span>
        </div>
      </div>
    </div>

    {/* Code + struct side by side */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.sched.fg}>do_epoll_wait() sleep loop</SectionLabel>
        <CodeBlock>{`for (;;) {
    set_current_state(TASK_INTERRUPTIBLE);

    // Check: did events arrive while we were setting up?
    if (!list_empty(&ep->rdllist) || !jtimeout)
        break;

    // Check: were we interrupted by a signal?
    if (signal_pending(current)) {
        res = -EINTR;
        break;
    }

    // Yield CPU; will resume here when woken
    jtimeout = schedule_timeout(jtimeout);
}

// Back to running — try to send events
set_current_state(TASK_RUNNING);`}</CodeBlock>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space[3], minWidth: '240px' }}>
        <StructCard
          name="wait_queue_t"
          type="epoll waiter"
          region="fs"
          fields={[
            { label: 'flags', value: 'WQ_FLAG_EXCLUSIVE', highlight: true },
            { label: 'private', value: '→ current task', highlight: true },
            { label: 'func', value: '→ default_wake_function' },
            { label: 'task_list', value: '→ ep->wq' },
          ]}
        />
        <StructCard
          name="eppoll_entry"
          type="per-fd callback link"
          region="fs"
          fields={[
            { label: 'base', value: '→ epitem', highlight: true },
            { label: 'wait', value: 'wait_queue_t' },
            { label: 'whead', value: '→ file->wait_queue', highlight: true },
            { label: 'llink', value: '→ epitem->pwqlist' },
          ]}
        />
      </div>
    </div>
  </div>
);

const EpollWaitWaitQueue: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="TASK_INTERRUPTIBLE → add_wait_queue_exclusive() → schedule_timeout()"
    hero={<EpollWaitWaitQueueHero />}
  />
);

const StateBox: React.FC<{ label: string; active?: boolean; highlight?: boolean }> = ({
  label,
  active,
  highlight,
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: radius.sm,
      background: active
        ? `${color.accent.success}22`
        : highlight
        ? `${color.pulse}22`
        : color.bg.surface,
      border: `1px solid ${active ? color.accent.success : highlight ? color.pulse : color.border.subtle}`,
      color: active ? color.accent.success : highlight ? color.pulse : color.text.secondary,
      fontFamily: font.family.mono,
      fontSize: font.size.xs,
      fontWeight: (active || highlight) ? font.weight.bold : font.weight.regular,
    }}
  >
    {label}
  </span>
);

export default EpollWaitWaitQueue;
