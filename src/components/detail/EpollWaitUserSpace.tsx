import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* User-space call flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="user process"
        type="caller"
        region="user"
        fields={[
          { label: 'epfd', value: '3 (epoll instance)', highlight: true },
          { label: 'events', value: '→ epoll_event[128]', highlight: true },
          { label: 'maxevents', value: '128' },
          { label: 'timeout', value: '-1 (infinite)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.user.fg}>glibc wrapper → syscall</SectionLabel>
        <CodeBlock>{`int epoll_wait(int epfd, struct epoll_event *events,
               int maxevents, int timeout)
{
    // glibc sets up registers:
    // %rax = __NR_epoll_wait (232 on x86-64)
    // %rdi = epfd, %rsi = events, %rdx = 128, %r10 = -1
    return syscall(SYS_epoll_wait, epfd, events,
                   maxevents, timeout);
}`}</CodeBlock>
      </div>
    </div>

    {/* epoll_event layout */}
    <div>
      <SectionLabel accent={color.region.user.fg}>struct epoll_event layout (per ready fd)</SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: space[3],
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.primary,
              fontWeight: font.weight.bold,
              marginBottom: space[2],
            }}
          >
            epoll_event[0]
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>events</span>
              <span style={{ color: color.accent.success }}>EPOLLIN</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>data.fd</span>
              <span style={{ color: color.accent.primary }}>4</span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.primary,
              fontWeight: font.weight.bold,
              marginBottom: space[2],
            }}
          >
            epoll_event[1]
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>events</span>
              <span style={{ color: color.accent.warning }}>EPOLLOUT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>data.fd</span>
              <span style={{ color: color.accent.primary }}>5</span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.primary,
              fontWeight: font.weight.bold,
              marginBottom: space[2],
            }}
          >
            epoll_event[2]
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>events</span>
              <span style={{ color: color.region.hardware.fg }}>EPOLLIN | EPOLLERR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: color.text.muted }}>data.ptr</span>
              <span style={{ color: color.accent.primary }}>0x7fff...a8</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner
      fromLabel="USER"
      fromRing="ring 3"
      toLabel="KERNEL"
      toRing="ring 0"
      arrowLabel="epoll_wait syscall"
    />
  </div>
);

const EpollWaitUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="User calls epoll_wait() with events buffer and timeout"
    hero={<EpollWaitUserSpaceHero />}
  />
);

export default EpollWaitUserSpace;
