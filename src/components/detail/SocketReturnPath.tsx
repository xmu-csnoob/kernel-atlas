import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const SocketReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return value + fd table */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="return value"
        type="rax"
        region="return"
        fields={[
          { label: '%rax', value: '3', highlight: true },
          { label: 'int', value: 'new socket fd' },
          { label: 'errno', value: '0' },
        ]}
      />
      <StructCard
        name="files_struct"
        type="after socket()"
        region="return"
        fields={[
          { label: 'fd[0]', value: 'stdin' },
          { label: 'fd[1]', value: 'stdout' },
          { label: 'fd[2]', value: 'stderr' },
          { label: 'fd[3]', value: '→ socket file*', highlight: true },
        ]}
      />
      <StructCard
        name="struct file (fd=3)"
        type="socket"
        region="return"
        fields={[
          { label: 'f_op', value: '→ socket_file_ops', highlight: true },
          { label: 'private_data', value: '→ struct socket', highlight: true },
          { label: 'f_mode', value: 'FMODE_READ | FMODE_WRITE' },
          { label: 'f_count', value: '1' },
        ]}
      />
    </div>

    {/* User space usage pattern */}
    <div>
      <SectionLabel accent={color.region.return.fg}>User space socket lifecycle</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.7,
        }}
      >
        <div>
          <span style={{ color: color.accent.primary }}>int fd</span> ={' '}
          <span style={{ color: color.pulse }}>socket</span>(AF_INET, SOCK_STREAM, 0);{' '}
          <span style={{ color: color.text.dim }}>// fd = 3</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>bind</span>(fd, &local_addr, sizeof(local_addr));{' '}
          <span style={{ color: color.text.dim }}>// → inet_bind</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>connect</span>(fd, &remote_addr, sizeof(remote_addr));{' '}
          <span style={{ color: color.text.dim }}>// → tcp_v4_connect → SYN</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>send</span>(fd, buf, len, 0);{' '}
          <span style={{ color: color.text.dim }}>// → tcp_sendmsg → sk_buff → wire</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>recv</span>(fd, buf, len, 0);{' '}
          <span style={{ color: color.text.dim }}>// ← sk_receive_queue → tcp_recvmsg</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>close</span>(fd);{' '}
          <span style={{ color: color.text.dim }}>// → inet_release → tcp_close</span>
        </div>
      </div>
    </div>

    {/* Return path note */}
    <div
      style={{
        background: 'rgba(77, 208, 163, 0.06)',
        border: `1px solid ${color.region.return.fg}33`,
        borderRadius: radius.md,
        padding: space[3],
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: color.region.return.fg }}>Socket fd lifecycle:</strong>{' '}
      The fd (3) indexes into{' '}
      <span style={{ color: color.accent.primary }}>current-&gt;files-&gt;fdt-&gt;fd[]</span>,
      {' '}which points to a struct file whose <span style={{ color: color.accent.primary }}>private_data</span> is the
      {' '}struct socket. The file&apos;s <span style={{ color: color.accent.primary }}>f_op</span> is set to
      {' '}socket_file_ops, so all subsequent syscalls (read, write, close, ioctl) on this fd are routed through
      {' '}the socket layer and then to the protocol-specific implementation (TCP/UDP).
    </div>
  </div>
);

const SocketReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="fd → %rax → sysretq → user space socket API"
    hero={<SocketReturnPathHero />}
  />
);

export default SocketReturnPath;
