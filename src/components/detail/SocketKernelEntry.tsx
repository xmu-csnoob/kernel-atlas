import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space } from '../../design/tokens';

// Syscall table preview (socket at slot 41, beyond the 32-entry preview)
const SYSCALL_TABLE_PREVIEW: string[] = [
  'sys_read', 'sys_write', 'sys_open', 'sys_close',
  'sys_stat', 'sys_fstat', 'sys_lstat', 'sys_poll',
  'sys_lseek', 'sys_mmap', 'sys_mprotect', 'sys_munmap',
  'sys_brk', 'sys_rt_sigaction', 'sys_rt_sigprocmask', 'sys_rt_sigreturn',
  'sys_ioctl', 'sys_pread64', 'sys_pwrite64', 'sys_readv',
  'sys_writev', 'sys_access', 'sys_pipe', 'sys_select',
  'sys_sched_yield', 'sys_mremap', 'sys_msync', 'sys_mincore',
  'sys_madvise', 'sys_shmget', 'sys_shmat', 'sys_shmctl',
];

export const SocketKernelEntryHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Syscall table grid — socket is beyond the preview, show annotation */}
    <div>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: '6px',
          padding: `${space[3]} ${space[4]}`,
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.secondary,
        }}
      >
        <div style={{ color: color.text.muted, marginBottom: space[2], fontSize: font.size.xs }}>
          sys_call_table[]  ·  arch/x86/kernel/syscall_64.c
        </div>
        <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
          {SYSCALL_TABLE_PREVIEW.map((name, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                padding: '2px 6px',
                borderRadius: '3px',
                background: color.bg.surface,
                border: `1px solid ${color.border.subtle}`,
                fontSize: font.size.xs,
                color: color.text.dim,
              }}
            >
              {i}:{name}
            </span>
          ))}
          <span style={{ color: color.text.dim, padding: '2px 6px' }}>…</span>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '3px',
              background: `${color.pulse}22`,
              border: `1px solid ${color.pulse}`,
              fontSize: font.size.xs,
              color: color.pulse,
              fontWeight: font.weight.bold,
            }}
          >
            41:<span style={{ color: color.pulse }}>sys_socket</span>
          </span>
        </div>
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        %rax = 41 → sys_call_table[41] = <span style={{ color: color.pulse }}>sys_socket</span>
      </div>
    </div>

    {/* sys_socket → sock_create → sock_map_fd flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="sys_socket"
        type="net/socket.c"
        region="net"
        fields={[
          { label: 'family',   value: 'AF_INET (2)', highlight: true },
          { label: 'type',     value: 'SOCK_STREAM (1)', highlight: true },
          { label: 'protocol', value: '0' },
          { label: '→',        value: 'sock_create()' },
        ]}
      />
      <StructCard
        name="sock_create"
        type="net/socket.c"
        region="net"
        fields={[
          { label: 'net',      value: 'current->nsproxy->net_ns' },
          { label: 'family',   value: '→ inet_create', highlight: true },
          { label: 'type',     value: 'SOCK_STREAM' },
          { label: '→',        value: 'sk_alloc()' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.net.fg}>sys_socket() → sock_map_fd()</SectionLabel>
        <CodeBlock compact>{`SYSCALL_DEFINE3(socket, int, family, int, type,
                int, protocol)
{
    struct socket *sock;
    int retval;

    retval = sock_create(family, type, protocol, &sock);
    if (retval < 0)
        goto out;

    retval = sock_map_fd(sock, flags);
    // fd → struct file → socket
out:
    return retval;
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const SocketKernelEntry: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="syscall table dispatch: NR_socket = 41 → sys_socket() → sock_create()"
    hero={<SocketKernelEntryHero />}
  />
);

export default SocketKernelEntry;
