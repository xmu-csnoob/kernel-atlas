import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const SocketSkBuffHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* sk_buff memory layout diagram */}
    <div>
      <SectionLabel accent={color.region.net.fg}>struct sk_buff memory layout</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          overflow: 'auto',
        }}
      >
        {/* Linear buffer visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
          {/* Buffer region bar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                height: '36px',
                borderRadius: radius.sm,
                overflow: 'hidden',
                border: `1px solid ${color.border.subtle}`,
              }}
            >
              {/* Headroom (unused before data) */}
              <div
                style={{
                  width: '15%',
                  background: color.bg.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.text.dim,
                }}
              >
                headroom
              </div>
              {/* MAC header */}
              <div
                style={{
                  width: '10%',
                  background: 'rgba(255, 183, 77, 0.15)',
                  borderLeft: `1px dashed ${color.border.subtle}`,
                  borderRight: `1px dashed ${color.border.subtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.region.user.fg,
                }}
              >
                MAC
              </div>
              {/* IP header */}
              <div
                style={{
                  width: '12%',
                  background: 'rgba(149, 117, 205, 0.15)',
                  borderRight: `1px dashed ${color.border.subtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.region.net.fg,
                }}
              >
                IP
              </div>
              {/* TCP header */}
              <div
                style={{
                  width: '12%',
                  background: 'rgba(77, 208, 225, 0.15)',
                  borderRight: `1px dashed ${color.border.subtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.accent.primary,
                }}
              >
                TCP
              </div>
              {/* Payload */}
              <div
                style={{
                  width: '26%',
                  background: 'rgba(102, 187, 106, 0.15)',
                  borderRight: `1px dashed ${color.border.subtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.accent.success,
                }}
              >
                payload
              </div>
              {/* Tailroom */}
              <div
                style={{
                  flex: 1,
                  background: color.bg.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.text.dim,
                }}
              >
                tailroom
              </div>
            </div>

            {/* Pointer labels */}
            <div style={{ display: 'flex', marginTop: space[2], fontFamily: font.family.mono, fontSize: '9px' }}>
              <span style={{ width: '15%', textAlign: 'center', color: color.text.dim }}>head</span>
              <span style={{ width: '10%', textAlign: 'center', color: color.region.user.fg }}>mac_header</span>
              <span style={{ width: '12%', textAlign: 'center', color: color.region.net.fg }}>network_header</span>
              <span style={{ width: '12%', textAlign: 'center', color: color.accent.primary }}>transport_header</span>
              <span style={{ width: '26%', textAlign: 'center', color: color.accent.success }}>data → tail</span>
              <span style={{ flex: 1, textAlign: 'center', color: color.text.dim }}>end</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Socket buffer limits + sk_buff struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct sock"
        type="buffer limits"
        region="net"
        fields={[
          { label: 'sk_sndbuf', value: '~16 KB (wmem_default)', highlight: true },
          { label: 'sk_rcvbuf', value: '~16 KB (rmem_default)', highlight: true },
          { label: 'sk_wmem_queued', value: '0' },
          { label: 'sk_rmem_alloc', value: '0' },
        ]}
      />
      <StructCard
        name="sk_buff queues"
        type="initialized"
        region="net"
        fields={[
          { label: 'sk_receive_queue', value: 'empty', highlight: true },
          { label: 'sk_write_queue', value: 'empty', highlight: true },
          { label: 'sk_error_queue', value: 'empty' },
          { label: 'backlog', value: 'empty' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.net.fg}>alloc_skb() from slab cache</SectionLabel>
        <CodeBlock compact>{`struct sk_buff *__alloc_skb(unsigned int size,
                            gfp_t gfp_mask, int fclone, int node)
{
    struct sk_buff *skb;
    // 1. Allocate sk_buff head from slab
    skb = kmem_cache_alloc_node(skbuff_head_cache,
                                gfp_mask & ~GFP_DMA, node);
    // 2. Allocate data buffer
    size = SKB_DATA_ALIGN(size);
    data = kmalloc_node_track_caller(
               size + sizeof(struct skb_shared_info),
               gfp_mask, node);
    // 3. Initialize pointers
    skb->head = data;
    skb->data = data;
    skb->tail = data;
    skb->end  = data + size;
    return skb;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const SocketSkBuff: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="sk_buff layout: head → data → tail → end, with header pointers"
    hero={<SocketSkBuffHero />}
  />
);

export default SocketSkBuff;
