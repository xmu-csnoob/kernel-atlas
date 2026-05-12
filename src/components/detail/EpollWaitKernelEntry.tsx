import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall dispatch → sys_epoll_wait flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SectionLabel accent={color.region.fs.fg}>sys_epoll_wait() → do_epoll_wait()</SectionLabel>
        <CodeBlock>{`SYSCALL_DEFINE4(epoll_wait, int, epfd,
                struct epoll_event __user *, events,
                int, maxevents, int, timeout)
{
    struct file *file;
    struct eventpoll *ep;

    file = fget(epfd);          // fd → struct file
    if (!file)
        return -EBADF;

    ep = file->private_data;    // → eventpoll instance
    if (!is_file_epoll(file)) {
        fput(file);
        return -EINVAL;
    }

    error = do_epoll_wait(ep, events, maxevents, timeout);
    fput(file);
    return error;
}`}</CodeBlock>
      </div>
      <StructCard
        name="struct file (epoll)"
        type="fd=3"
        region="fs"
        fields={[
          { label: 'f_op', value: '→ eventpoll_fops', highlight: true },
          { label: 'private_data', value: '→ struct eventpoll*', highlight: true },
          { label: 'f_count', value: 'ref 2' },
          { label: 'f_mode', value: 'FMODE_READ' },
        ]}
      />
    </div>

    {/* Validation check */}
    <div
      style={{
        background: color.bg.inset,
        border: `1px solid ${color.border.subtle}`,
        borderRadius: radius.md,
        padding: space[3],
      }}
    >
      <SectionLabel accent={color.region.fs.fg}>is_file_epoll() validation</SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: space[4],
          flexWrap: 'wrap',
          alignItems: 'center',
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
        }}
      >
        <span style={{ color: color.text.secondary }}>file-&gt;f_op</span>
        <span style={{ color: color.text.dim }}>==</span>
        <span style={{ color: color.accent.primary }}>&amp;eventpoll_fops</span>
        <span
          style={{
            background: `${color.accent.success}22`,
            border: `1px solid ${color.accent.success}`,
            borderRadius: radius.sm,
            padding: '2px 8px',
            color: color.accent.success,
            fontSize: font.size.xs,
          }}
        >
          ✓ valid epoll fd
        </span>
        <span style={{ color: color.text.dim, fontSize: font.size.xs }}>
          (rejects regular files, sockets not wrapped in epoll)
        </span>
      </div>
    </div>
  </div>
);

const EpollWaitKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="syscall dispatch → fget() → is_file_epoll() → do_epoll_wait()"
    hero={<EpollWaitKernelEntryHero />}
  />
);

export default EpollWaitKernelEntry;
