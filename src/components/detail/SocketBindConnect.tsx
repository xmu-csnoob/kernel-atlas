import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const SocketBindConnectHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Bind flow */}
    <div>
      <SectionLabel accent={color.region.net.fg}>inet_bind() — local address assignment</SectionLabel>
      <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <StructChain
          cards={[
            {
              structName: 'sockaddr_in',
              type: 'user arg',
              region: 'user',
              fields: [
                { label: 'sin_family', value: 'AF_INET' },
                { label: 'sin_port', value: '0 (auto)', highlight: true },
                { label: 'sin_addr', value: 'INADDR_ANY' },
              ],
            },
            {
              structName: 'inet_sock',
              type: 'after bind',
              region: 'net',
              fields: [
                { label: 'inet_saddr', value: '0.0.0.0', highlight: true },
                { label: 'inet_sport', value: 'ephemeral', highlight: true },
                { label: 'inet_daddr', value: '0 (unset)' },
                { label: 'inet_dport', value: '0 (unset)' },
              ],
            },
          ]}
          arrows={[
            { label: 'inet_bind', subLabel: 'af_inet.c:412', width: 120 },
          ]}
        />
      </div>
    </div>

    {/* Connect flow + TCP state machine */}
    <div>
      <SectionLabel accent={color.region.net.fg}>tcp_v4_connect() — initiate three-way handshake</SectionLabel>
      <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <StructCard
          name="tcp_sock"
          type="after connect()"
          region="net"
          fields={[
            { label: 'sk_state', value: 'TCP_SYN_SENT', highlight: true },
            { label: 'write_seq', value: 'ISN (random)', highlight: true },
            { label: 'rcv_nxt', value: '0' },
            { label: 'snd_nxt', value: 'ISN + 1' },
          ]}
        />
        <div style={{ flex: 1, minWidth: '280px' }}>
          <CodeBlock compact>{`tcp_v4_connect(sk, &usin, addr_len)
{
    // 1. Validate destination
    // 2. Set state → TCP_SYN_SENT
    tcp_set_state(sk, TCP_SYN_SENT);

    // 3. Generate initial sequence number
    tp->write_seq = secure_tcp_sequence_number(...);

    // 4. Store remote address
    inet->inet_dport = usin->sin_port;
    inet->inet_daddr = usin->sin_addr.s_addr;

    // 5. Build and send SYN
    tcp_connect(sk);   // → tcp_transmit_skb(SYN)
}`}</CodeBlock>
        </div>
      </div>
    </div>

    {/* TCP state machine */}
    <div
      style={{
        background: color.bg.inset,
        border: `1px solid ${color.border.subtle}`,
        borderRadius: radius.md,
        padding: space[3],
      }}
    >
      <SectionLabel accent={color.region.net.fg}>TCP state machine (client path)</SectionLabel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[2],
          flexWrap: 'wrap',
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.secondary,
        }}
      >
        <StateBox label="CLOSED" active />
        <span style={{ color: color.text.dim }}>→ socket()</span>
        <StateBox label="CLOSED" />
        <span style={{ color: color.text.dim }}>→ bind()</span>
        <StateBox label="CLOSED" />
        <span style={{ color: color.text.dim }}>→ connect()</span>
        <StateBox label="SYN_SENT" highlight />
        <span style={{ color: color.text.dim }}>← SYN-ACK</span>
        <StateBox label="ESTABLISHED" active />
      </div>
    </div>
  </div>
);

const SocketBindConnect: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="bind() local address → connect() initiates TCP handshake"
    hero={<SocketBindConnectHero />}
  />
);

const StateBox: React.FC<{ label: string; active?: boolean; highlight?: boolean }> = ({ label, active, highlight }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      background: active
        ? `${color.accent.success}22`
        : highlight
        ? `${color.pulse}22`
        : color.bg.surface,
      border: `1px solid ${active ? color.accent.success : highlight ? color.pulse : color.border.subtle}`,
      color: active ? color.accent.success : highlight ? color.pulse : color.text.secondary,
      fontWeight: (active || highlight) ? font.weight.bold : font.weight.regular,
    }}
  >
    {label}
  </span>
);

export default SocketBindConnect;
