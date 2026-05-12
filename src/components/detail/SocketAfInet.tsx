import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const SocketAfInetHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Protocol family dispatch chain */}
    <StructChain
      cards={[
        {
          structName: 'net_proto_family',
          type: 'inetsw_array',
          region: 'net',
          fields: [
            { label: 'family', value: 'PF_INET' },
            { label: 'create', value: 'inet_create', highlight: true },
            { label: 'owner', value: 'THIS_MODULE' },
          ],
        },
        {
          structName: 'inet_create',
          type: 'af_inet.c',
          region: 'net',
          fields: [
            { label: 'lookup', value: 'inetsw[type]', highlight: true },
            { label: 'TCP', value: 'SOCK_STREAM → tcp_prot' },
            { label: 'UDP', value: 'SOCK_DGRAM → udp_prot' },
            { label: '→', value: 'sk_alloc()' },
          ],
        },
        {
          structName: 'struct sock',
          type: 'sk_alloc',
          region: 'net',
          fields: [
            { label: 'sk_family', value: 'AF_INET', highlight: true },
            { label: 'sk_type', value: 'SOCK_STREAM' },
            { label: 'sk_state', value: 'TCP_CLOSE' },
            { label: 'sk_prot', value: '→ tcp_prot', highlight: true },
          ],
        },
      ]}
      arrows={[
        { label: 'family->create', subLabel: 'net/socket.c', width: 110 },
        { label: 'sk_alloc', subLabel: 'net/core/sock.c', width: 90 },
      ]}
    />

    {/* proto_ops and proto vectors */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div
        style={{
          flex: '1 1 280px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <SectionLabel accent={color.region.net.fg}>socket ops — inet_stream_ops</SectionLabel>
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
            lineHeight: 1.7,
          }}
        >
          <div><span style={{ color: color.text.muted }}>.bind</span> → <span style={{ color: color.accent.primary }}>inet_bind</span></div>
          <div><span style={{ color: color.text.muted }}>.connect</span> → <span style={{ color: color.accent.primary }}>inet_stream_connect</span></div>
          <div><span style={{ color: color.text.muted }}>.listen</span> → <span style={{ color: color.accent.primary }}>inet_listen</span></div>
          <div><span style={{ color: color.text.muted }}>.accept</span> → <span style={{ color: color.accent.primary }}>inet_accept</span></div>
          <div><span style={{ color: color.text.muted }}>.sendmsg</span> → <span style={{ color: color.accent.primary }}>tcp_sendmsg</span></div>
          <div><span style={{ color: color.text.muted }}>.recvmsg</span> → <span style={{ color: color.accent.primary }}>inet_recvmsg</span></div>
        </div>
      </div>
      <div
        style={{
          flex: '1 1 280px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <SectionLabel accent={color.region.net.fg}>transport proto — tcp_prot</SectionLabel>
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
            lineHeight: 1.7,
          }}
        >
          <div><span style={{ color: color.text.muted }}>.init</span> → <span style={{ color: color.accent.primary }}>tcp_v4_init_sock</span></div>
          <div><span style={{ color: color.text.muted }}>.connect</span> → <span style={{ color: color.accent.primary }}>tcp_v4_connect</span></div>
          <div><span style={{ color: color.text.muted }}>.sendmsg</span> → <span style={{ color: color.accent.primary }}>tcp_sendmsg</span></div>
          <div><span style={{ color: color.text.muted }}>.recvmsg</span> → <span style={{ color: color.accent.primary }}>tcp_recvmsg</span></div>
          <div><span style={{ color: color.text.muted }}>.backlog_rcv</span> → <span style={{ color: color.accent.primary }}>tcp_v4_do_rcv</span></div>
          <div><span style={{ color: color.text.muted }}>.destroy</span> → <span style={{ color: color.accent.primary }}>tcp_v4_destroy_sock</span></div>
        </div>
      </div>
    </div>
  </div>
);

const SocketAfInet: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="AF_INET protocol family: inet_create → sk_alloc → proto ops setup"
    hero={<SocketAfInetHero />}
  />
);

export default SocketAfInet;
