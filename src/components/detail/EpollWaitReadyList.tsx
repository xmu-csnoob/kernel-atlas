import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import AnimatedArrow from './primitives/AnimatedArrow';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitReadyListHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Ready list flow */}
    <div>
      <SectionLabel accent={color.region.fs.fg}>Ready list (rdllist) → event delivery</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        {/* rdllist chain visualization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space[2], flexWrap: 'wrap', marginBottom: space[4] }}>
          <div
            style={{
              background: `${color.accent.success}18`,
              border: `1px solid ${color.accent.success}`,
              borderRadius: radius.sm,
              padding: '6px 10px',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.success,
            }}
          >
            rdllist head
          </div>
          <AnimatedArrow label="next" width={50} color={color.accent.success} />
          <ReadyEpitem fd={4} events="EPOLLIN" data="fd=4" />
          <AnimatedArrow width={40} color={color.text.dim} animated={false} />
          <ReadyEpitem fd={7} events="EPOLLOUT" data="fd=7" />
          <AnimatedArrow width={40} color={color.text.dim} animated={false} />
          <ReadyEpitem fd={9} events="EPOLLIN|EPOLLERR" data="0xabc0" />
          <AnimatedArrow width={40} color={color.text.dim} animated={false} />
          <div
            style={{
              color: color.text.dim,
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
            }}
          >
            ...
          </div>
        </div>

        {/* ep_send_events code */}
        <CodeBlock compact>{`static int ep_send_events(struct eventpoll *ep,
                          struct epoll_event __user *events,
                          int maxevents)
{
    int eventcnt = 0;
    struct epitem *epi, *tmp;

    list_for_each_entry_safe(epi, tmp, &ep->rdllist, rdllink) {
        __poll_t revents = ep_item_poll(epi, &pt);
        if (revents) {
            __put_user(revents, &uevent->events);
            __put_user(epi->event.data, &uevent->data);
            uevent++;  eventcnt++;
            if (epi->event.events & EPOLLONESHOT)
                epi->event.events &= EP_PRIVATE_BITS;
        }
        list_del_init(&epi->rdllink);  // remove from ready list
    }
    return eventcnt;
}`}</CodeBlock>
      </div>
    </div>

    {/* Event mask breakdown */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.fs.fg}>Event flags</SectionLabel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: space[2],
          }}
        >
          <EventFlag label="EPOLLIN" value="0x001" desc="Readable" color={color.accent.success} />
          <EventFlag label="EPOLLOUT" value="0x004" desc="Writable" color={color.accent.warning} />
          <EventFlag label="EPOLLERR" value="0x008" desc="Error" color={color.region.hardware.fg} />
          <EventFlag label="EPOLLHUP" value="0x010" desc="Hangup" color={color.text.muted} />
          <EventFlag label="EPOLLET" value="1u<<31" desc="Edge-triggered" color={color.accent.primary} />
          <EventFlag label="EPOLLONESHOT" value="1u<<30" desc="One-shot" color={color.accent.primary} />
        </div>
      </div>
      <StructCard
        name="epoll_event"
        type="user output"
        region="user"
        fields={[
          { label: 'events', value: 'EPOLLIN (0x001)', highlight: true },
          { label: 'data.fd', value: '4', highlight: true },
        ]}
      />
    </div>
  </div>
);

const EpollWaitReadyList: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="rdllist → ep_send_events() → __put_user() → user events[]"
    hero={<EpollWaitReadyListHero />}
  />
);

const ReadyEpitem: React.FC<{ fd: number; events: string; data: string }> = ({ fd, events, data }) => (
  <div
    style={{
      background: `${color.accent.primary}10`,
      border: `1px solid ${color.accent.primary}55`,
      borderRadius: radius.sm,
      padding: '6px 10px',
      fontFamily: font.family.mono,
      fontSize: '10px',
      minWidth: '100px',
    }}
  >
    <div style={{ color: color.accent.primary, fontWeight: font.weight.bold }}>epitem(fd={fd})</div>
    <div style={{ color: color.text.secondary, marginTop: '2px' }}>{events}</div>
    <div style={{ color: color.text.dim, fontSize: '9px' }}>data={data}</div>
  </div>
);

const EventFlag: React.FC<{ label: string; value: string; desc: string; color: string }> = ({
  label,
  value,
  desc,
  color,
}) => (
  <div
    style={{
      background: `${color}10`,
      border: `1px solid ${color}40`,
      borderRadius: radius.sm,
      padding: `${space[1]} ${space[2]}`,
      fontFamily: font.family.mono,
      fontSize: '10px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ color, fontWeight: font.weight.bold }}>{label}</span>
      <span style={{ color: '#888', fontSize: '9px' }}>{value}</span>
    </div>
    <div style={{ color: '#aaa', fontSize: '9px', marginTop: '1px' }}>{desc}</div>
  </div>
);

export default EpollWaitReadyList;
