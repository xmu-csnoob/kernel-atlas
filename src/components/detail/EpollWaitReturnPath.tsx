import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.return.fg}>Return path: kernel → user</SectionLabel>
        <CodeBlock>{`// In do_epoll_wait():
if (!list_empty(&ep->rdllist)) {
    // Events are ready — copy to user
    res = ep_send_events(ep, events, maxevents);
}

// Return: number of events (0 = timeout, -EINTR = signal)
return res;

// entry_64.S restores registers and sysretq:
// %rax = res (event count or negative errno)`}</CodeBlock>
      </div>

      <StructCard
        name="return values"
        type="epoll_wait()"
        region="return"
        fields={[
          { label: '> 0', value: 'N events delivered', highlight: true },
          { label: '0', value: 'timeout expired' },
          { label: '-1', value: 'error (errno set)', highlight: true },
          { label: 'errno=EINTR', value: 'interrupted by signal' },
        ]}
      />
    </div>

    {/* User-space handling pattern */}
    <div>
      <SectionLabel accent={color.region.user.fg}>Typical user-space event loop</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <CodeBlock>{`for (;;) {
    int nfds = epoll_wait(epfd, events, MAX_EVENTS, -1);
    if (nfds == -1) {
        if (errno == EINTR) continue;
        perror("epoll_wait");
        break;
    }

    for (int i = 0; i < nfds; i++) {
        int fd = events[i].data.fd;
        uint32_t ev = events[i].events;

        if (ev & EPOLLIN) {
            // Data available — read until EAGAIN for EPOLLET
            handle_read(fd);
        }
        if (ev & EPOLLOUT) {
            // Writable — send pending data
            handle_write(fd);
        }
        if (ev & (EPOLLERR | EPOLLHUP)) {
            // Error or hangup — close fd
            close(fd);
        }
    }
}`}</CodeBlock>
      </div>
    </div>

    {/* LT vs ET comparison */}
    <div>
      <SectionLabel accent={color.region.return.fg}>Level-triggered vs Edge-triggered</SectionLabel>
      <div style={{ display: 'flex', gap: space[3], flexWrap: 'wrap' }}>
        <div
          style={{
            flex: '1 1 240px',
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.primary,
              fontWeight: font.weight.bold,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[2],
            }}
          >
            Level-triggered (default)
          </div>
          <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6 }}>
            Event is reported as long as the condition holds. If you only read partial data,
            the next epoll_wait() will return the same fd again. Safe and easy to use.
          </div>
          <div
            style={{
              marginTop: space[2],
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.text.dim,
            }}
          >
            epitem removed from rdllist after ep_send_events; re-added on next poll if still ready
          </div>
        </div>

        <div
          style={{
            flex: '1 1 240px',
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.warning,
              fontWeight: font.weight.bold,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[2],
            }}
          >
            Edge-triggered (EPOLLET)
          </div>
          <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6 }}>
            Event is reported only when the state transitions from not-ready to ready.
            You must read/write until EAGAIN to avoid missing events. Higher performance
            but requires careful handling.
          </div>
          <div
            style={{
              marginTop: space[2],
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.text.dim,
            }}
          >
            epitem stays in rdllist; only re-added when new data arrives (edge)
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EpollWaitReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="ep_send_events → __put_user → %rax = event count → user loop"
    hero={<EpollWaitReturnPathHero />}
  />
);

export default EpollWaitReturnPath;
