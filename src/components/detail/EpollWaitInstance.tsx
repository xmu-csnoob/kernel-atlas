import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const EpollWaitInstanceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Main eventpoll struct visualization */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct eventpoll"
        type="epoll instance"
        region="fs"
        fields={[
          { label: 'lock', value: 'spinlock_t' },
          { label: 'mtx', value: 'struct mutex' },
          { label: 'wq', value: '→ wait_queue_head_t', highlight: true },
          { label: 'rdllist', value: '→ ready epitems', highlight: true },
          { label: 'rbr', value: '→ rb_root (all fds)', highlight: true },
          { label: 'ovflist', value: 'NULL' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.fs.fg}>epoll_create() → ep_alloc()</SectionLabel>
        <CodeBlock compact>{`static int ep_alloc(struct eventpoll **pep)
{
    struct eventpoll *ep;
    ep = kzalloc(sizeof(*ep), GFP_KERNEL);
    if (!ep)
        return -ENOMEM;
    spin_lock_init(&ep->lock);
    mutex_init(&ep->mtx);
    init_waitqueue_head(&ep->wq);
    init_waitqueue_head(&ep->poll_wait);
    INIT_LIST_HEAD(&ep->rdllist);
    ep->rbr = RB_ROOT;
    *pep = ep;
    return 0;
}`}</CodeBlock>
      </div>
    </div>

    {/* Red-black tree → epitem chain */}
    <div>
      <SectionLabel accent={color.region.fs.fg}>Red-black tree: fd → epitem (all monitored fds)</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          overflow: 'auto',
        }}
      >
        {/* Simple RB tree visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space[3] }}>
          {/* Root */}
          <RbNode label="epitem(fd=5)" active />
          {/* Level 1 */}
          <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space[2] }}>
              <RbNode label="epitem(fd=3)" />
              <div style={{ display: 'flex', gap: '40px' }}>
                <RbNode label="epitem(fd=2)" size="sm" />
                <RbNode label="epitem(fd=4)" size="sm" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space[2] }}>
              <RbNode label="epitem(fd=8)" />
              <div style={{ display: 'flex', gap: '40px' }}>
                <RbNode label="epitem(fd=7)" size="sm" />
                <RbNode label="epitem(fd=10)" size="sm" />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
            textAlign: 'center',
          }}
        >
          Each epitem contains: file*, events mask, user data, rbn (tree link), rdllink (ready list link)
        </div>
      </div>
    </div>

    {/* epitem struct detail */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructChain
        cards={[
          {
            structName: 'struct epitem',
            type: 'per-fd node',
            region: 'fs',
            fields: [
              { label: 'rbn', value: 'rb_node (tree)' },
              { label: 'rdllink', value: 'list_head (ready)', highlight: true },
              { label: 'ffd.file', value: '→ struct file*', highlight: true },
              { label: 'ffd.fd', value: '5', highlight: true },
              { label: 'event.events', value: 'EPOLLIN' },
              { label: 'event.data', value: 'fd=5' },
              { label: 'pwqlist', value: '→ eppoll_entry[]' },
            ],
          },
        ]}
        arrows={[]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.fs.fg}>ep_insert() — epoll_ctl(EPOLL_CTL_ADD)</SectionLabel>
        <CodeBlock compact>{`static int ep_insert(struct eventpoll *ep,
                   struct epoll_event *event,
                   struct file *tfile, int fd)
{
    struct epitem *epi;
    epi = kmem_cache_alloc(epi_cache, GFP_KERNEL);
    epi->ep = ep;
    epi->ffd.file = tfile;
    epi->ffd.fd = fd;
    epi->event = *event;
    ep_rbtree_insert(ep, epi);     // add to rb-tree
    ep_ptable_queue_proc(...);     // register callback
    return 0;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const EpollWaitInstance: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="eventpoll → rb_root (epitems) + rdllist (ready) + wq (waiters)"
    hero={<EpollWaitInstanceHero />}
  />
);

const RbNode: React.FC<{ label: string; active?: boolean; size?: 'sm' | 'md' }> = ({
  label,
  active,
  size = 'md',
}) => (
  <div
    style={{
      background: active ? `${color.accent.primary}18` : color.bg.surface,
      border: `1px solid ${active ? color.accent.primary : color.border.subtle}`,
      borderRadius: radius.sm,
      padding: size === 'sm' ? '4px 8px' : '6px 12px',
      fontFamily: font.family.mono,
      fontSize: size === 'sm' ? '9px' : font.size.xs,
      color: active ? color.accent.primary : color.text.secondary,
      fontWeight: active ? font.weight.bold : font.weight.regular,
      minWidth: size === 'sm' ? '70px' : '90px',
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

export default EpollWaitInstance;
