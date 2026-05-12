import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import AnimatedArrow from './primitives/AnimatedArrow';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitEventNotifyHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Event notification flow */}
    <div>
      <SectionLabel accent={color.region.fs.fg}>Event notification chain</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
          <NotifySource label="socket" event="data arrives" color={color.accent.success} />
          <AnimatedArrow width={50} color={color.text.dim} animated={false} />
          <NotifySource label="pipe" event="write side active" color={color.accent.warning} />
          <AnimatedArrow width={50} color={color.text.dim} animated={false} />
          <NotifySource label="timer" event="expiry" color={color.accent.primary} />
          <AnimatedArrow width={50} color={color.text.dim} animated={false} />
          <NotifySource label="signal" event="signalfd" color={color.region.hardware.fg} />
        </div>

        <div style={{ marginTop: space[4], display: 'flex', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
          <div style={{ fontFamily: font.family.mono, fontSize: font.size.xs, color: color.text.muted }}>
            All trigger:
          </div>
          <CodeBlock compact>wake_up(&file{'>'}wait_queue)</CodeBlock>
          <AnimatedArrow label="calls" width={60} />
          <CodeBlock compact>ep_poll_callback()</CodeBlock>
        </div>
      </div>
    </div>

    {/* ep_poll_callback code + struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '320px' }}>
        <SectionLabel accent={color.region.fs.fg}>ep_poll_callback() — fs/eventpoll.c</SectionLabel>
        <CodeBlock>{`static int ep_poll_callback(wait_queue_t *wait,
                            unsigned mode, int sync, void *key)
{
    struct epitem *epi = ep_item_from_wait(wait);
    struct eventpoll *ep = epi->ep;
    unsigned long flags;

    spin_lock_irqsave(&ep->lock, flags);

    // Already in ready list?
    if (!list_empty(&epi->rdllink))
        goto is_linked;

    // Add to ready list
    list_add_tail(&epi->rdllink, &ep->rdllist);

    // Wake up epoll_wait() callers
    if (waitqueue_active(&ep->wq))
        wake_up_locked(&ep->wq);
    if (waitqueue_active(&ep->poll_wait))
        wake_up_locked(&ep->poll_wait);

is_linked:
    spin_unlock_irqrestore(&ep->lock, flags);
    return 1;
}`}</CodeBlock>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space[3], minWidth: '240px' }}>
        <StructCard
          name="epitem (after callback)"
          type="now ready"
          region="fs"
          fields={[
            { label: 'rdllink', value: '→ ep->rdllist', highlight: true },
            { label: 'ffd.fd', value: '4', highlight: true },
            { label: 'event.events', value: 'EPOLLIN' },
            { label: 'ep', value: '→ eventpoll*' },
          ]}
        />
        <div
          style={{
            background: `${color.accent.success}10`,
            border: `1px solid ${color.accent.success}40`,
            borderRadius: radius.md,
            padding: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: color.accent.success, fontWeight: font.weight.bold, marginBottom: space[1] }}>
            Key insight
          </div>
          The callback runs in interrupt or softirq context. It must use
          <span style={{ color: color.accent.primary }}> spin_lock_irqsave()</span> to safely
          manipulate the ready list while epoll_wait() may hold the same lock.
        </div>
      </div>
    </div>
  </div>
);

const EpollWaitEventNotify: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="fd ready → wake_up() → ep_poll_callback() → rdllist + wake_up(&ep->wq)"
    hero={<EpollWaitEventNotifyHero />}
  />
);

const NotifySource: React.FC<{ label: string; event: string; color: string }> = ({
  label,
  event,
  color: c,
}) => (
  <div
    style={{
      background: `${c}10`,
      border: `1px solid ${c}40`,
      borderRadius: radius.sm,
      padding: '6px 10px',
      fontFamily: font.family.mono,
      fontSize: '10px',
      minWidth: '90px',
    }}
  >
    <div style={{ color: c, fontWeight: font.weight.bold }}>{label}</div>
    <div style={{ color: color.text.secondary, fontSize: '9px' }}>{event}</div>
  </div>
);

export default EpollWaitEventNotify;
