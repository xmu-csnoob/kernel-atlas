import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const SocketProtocolStackHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Protocol stack layers diagram */}
    <div>
      <SectionLabel accent={color.region.net.fg}>Transmit path (sendmsg)</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          overflow: 'auto',
        }}
      >
        <svg viewBox="0 0 720 200" width="100%" style={{ minWidth: '600px', maxWidth: '100%' }}>
          {/* Layer boxes */}
          {/* Application / Socket */}
          <g transform="translate(20, 20)">
            <rect width="120" height="48" rx="6" fill={color.region.user.bg} stroke={color.region.user.fg} strokeWidth="1.5" />
            <text x="60" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="10" fontWeight="700" fill={color.region.user.fg}>
              SOCKET
            </text>
            <text x="60" y="36" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.user.accent}>
              tcp_sendmsg
            </text>
          </g>

          {/* TCP */}
          <g transform="translate(160, 20)">
            <rect width="120" height="48" rx="6" fill={color.bg.surface} stroke={color.accent.primary} strokeWidth="1.5" />
            <text x="60" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="10" fontWeight="700" fill={color.accent.primary}>
              TCP
            </text>
            <text x="60" y="36" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.text.muted}>
              tcp_transmit_skb
            </text>
          </g>

          {/* IP */}
          <g transform="translate(300, 20)">
            <rect width="120" height="48" rx="6" fill={color.bg.surface} stroke={color.region.net.fg} strokeWidth="1.5" />
            <text x="60" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="10" fontWeight="700" fill={color.region.net.fg}>
              IP
            </text>
            <text x="60" y="36" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.text.muted}>
              ip_queue_xmit
            </text>
          </g>

          {/* Device */}
          <g transform="translate(440, 20)">
            <rect width="120" height="48" rx="6" fill={color.bg.surface} stroke={color.region.hardware.fg} strokeWidth="1.5" />
            <text x="60" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="10" fontWeight="700" fill={color.region.hardware.fg}>
              DEV
            </text>
            <text x="60" y="36" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.text.muted}>
              dev_queue_xmit
            </text>
          </g>

          {/* NIC / Wire */}
          <g transform="translate(580, 20)">
            <rect width="120" height="48" rx="6" fill={color.region.hardware.bg} stroke={color.region.hardware.fg} strokeWidth="1.5" />
            <text x="60" y="20" textAnchor="middle" fontFamily={font.family.mono} fontSize="10" fontWeight="700" fill={color.region.hardware.fg}>
              NIC
            </text>
            <text x="60" y="36" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.hardware.accent}>
              hard_start_xmit
            </text>
          </g>

          {/* Arrows between layers */}
          <defs>
            <marker id="stk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.text.dim} />
            </marker>
          </defs>
          <line x1="140" y1="44" x2="160" y2="44" stroke={color.text.dim} strokeWidth="1" markerEnd="url(#stk-arrow)" />
          <line x1="280" y1="44" x2="300" y2="44" stroke={color.text.dim} strokeWidth="1" markerEnd="url(#stk-arrow)" />
          <line x1="420" y1="44" x2="440" y2="44" stroke={color.text.dim} strokeWidth="1" markerEnd="url(#stk-arrow)" />
          <line x1="560" y1="44" x2="580" y2="44" stroke={color.text.dim} strokeWidth="1" markerEnd="url(#stk-arrow)" />

          {/* Header addition annotations */}
          <text x="220" y="78" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.accent.primary}>
            + TCP header (20B)
          </text>
          <text x="360" y="78" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.net.fg}>
            + IP header (20B)
          </text>
          <text x="500" y="78" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.hardware.fg}>
            + MAC header (14B)
          </text>

          {/* sk_buff push arrows (downward) */}
          <line x1="220" y1="68" x2="220" y2="88" stroke={color.accent.primary} strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="360" y1="68" x2="360" y2="88" stroke={color.region.net.fg} strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="500" y1="68" x2="500" y2="88" stroke={color.region.hardware.fg} strokeWidth="0.75" strokeDasharray="3 3" />

          {/* skb_push callout */}
          <text x="360" y="108" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.text.muted}>
            skb_push(skb, hdr_len) — move data pointer backward, prepend header
          </text>

          {/* Receive path (reverse) */}
          <text x="360" y="140" textAnchor="middle" fontFamily={font.family.mono} fontSize="9" fontWeight="700" fill={color.text.muted}>
            ←←← Receive path (reverse): NIC → ip_rcv → tcp_v4_rcv → sk_receive_queue → recvmsg ←←←
          </text>

          {/* Packet on wire */}
          <g transform="translate(100, 160)">
            <rect width="520" height="28" rx="4" fill={color.bg.surface} stroke={color.border.subtle} strokeWidth="1" />
            {/* MAC */}
            <rect x="2" y="2" width="80" height="24" rx="2" fill="rgba(255, 183, 77, 0.12)" />
            <text x="42" y="17" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.user.fg}>MAC (14B)</text>
            {/* IP */}
            <rect x="84" y="2" width="100" height="24" rx="2" fill="rgba(149, 117, 205, 0.12)" />
            <text x="134" y="17" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.region.net.fg}>IP (20B)</text>
            {/* TCP */}
            <rect x="186" y="2" width="100" height="24" rx="2" fill="rgba(77, 208, 225, 0.12)" />
            <text x="236" y="17" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.accent.primary}>TCP (20B)</text>
            {/* Payload */}
            <rect x="288" y="2" width="228" height="24" rx="2" fill="rgba(102, 187, 106, 0.12)" />
            <text x="402" y="17" textAnchor="middle" fontFamily={font.family.mono} fontSize="8" fill={color.accent.success}>payload (0–1460B)</text>
          </g>
        </svg>
      </div>
    </div>

    {/* Key functions */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="tcp_transmit_skb"
        type="tcp_output.c"
        region="net"
        fields={[
          { label: 'clone_it', value: '0/1', highlight: true },
          { label: 'th->source', value: 'inet_sport' },
          { label: 'th->dest', value: 'inet_dport' },
          { label: '→', value: 'icsk_af_ops->queue_xmit', highlight: true },
        ]}
      />
      <StructCard
        name="ip_queue_xmit"
        type="ip_output.c"
        region="net"
        fields={[
          { label: 'iph->version', value: '4' },
          { label: 'iph->protocol', value: 'IPPROTO_TCP (6)', highlight: true },
          { label: 'iph->saddr', value: 'rt_src' },
          { label: 'iph->daddr', value: 'rt_dst' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.net.fg}>dev_queue_xmit → NIC driver</SectionLabel>
        <CodeBlock compact>{`dev_queue_xmit(skb)
{
    txq = dev_pick_tx(dev, skb);
    q = rcu_dereference(txq->qdisc);
    rc = q->enqueue(skb, q);     // qdisc queue
    __qdisc_run(q);              // → hard_start_xmit
    // NIC DMAs packet to wire
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const SocketProtocolStack: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="TCP/IP protocol stack: socket → TCP → IP → device → wire"
    hero={<SocketProtocolStackHero />}
  />
);

export default SocketProtocolStack;
