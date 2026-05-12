import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const OpenInodePermissionHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Inode chain */}
    <StructChain
      cards={[
        {
          structName: 'dentry',
          type: 'resolved',
          region: 'vfs',
          fields: [
            { label: 'd_name', value: '"passwd"' },
            { label: 'd_inode', value: '→ ?', highlight: true },
            { label: 'd_sb', value: '→ sda1' },
          ],
        },
        {
          structName: 'inode',
          type: 'iget_locked',
          region: 'vfs',
          fields: [
            { label: 'i_ino', value: '#4821', highlight: true },
            { label: 'i_mode', value: '0644 (rw-r--r--)' },
            { label: 'i_uid', value: '0 (root)' },
            { label: 'i_gid', value: '0 (root)' },
            { label: 'i_op', value: '→ ext2_inode_ops' },
          ],
        },
        {
          structName: 'may_open',
          type: 'fs/namei.c',
          region: 'vfs',
          fields: [
            { label: 'check', value: 'S_ISREG?', highlight: true },
            { label: 'check', value: 'FMODE_READ ok?' },
            { label: 'check', value: 'inode_permission()' },
            { label: 'result', value: 'PASS / -EACCES' },
          ],
        },
      ]}
      arrows={[
        { label: 'd_inode', subLabel: 'pointer', width: 80 },
        { label: 'may_open', subLabel: 'validate', width: 90 },
      ]}
    />

    {/* Permission matrix */}
    <div>
      <SectionLabel accent={color.region.vfs.fg}>
        inode_permission() — Unix mode bits vs. process credentials
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
          display: 'flex',
          flexDirection: 'column',
          gap: space[2],
        }}
      >
        {/* Mode bits row */}
        <div
          style={{
            display: 'flex',
            gap: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            alignItems: 'center',
          }}
        >
          <span style={{ color: color.text.muted, minWidth: '80px' }}>i_mode:</span>
          <PermissionBit label="owner" bits="rw-" active />
          <PermissionBit label="group" bits="r--" />
          <PermissionBit label="other" bits="r--" />
        </div>

        {/* Process creds row */}
        <div
          style={{
            display: 'flex',
            gap: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            alignItems: 'center',
          }}
        >
          <span style={{ color: color.text.muted, minWidth: '80px' }}>process:</span>
          <span style={{ color: color.text.secondary }}>
            uid=1000, euid=1000, gid=1000
          </span>
        </div>

        {/* Decision */}
        <div
          style={{
            marginTop: space[1],
            paddingTop: space[2],
            borderTop: `1px solid ${color.border.subtle}`,
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            display: 'flex',
            alignItems: 'center',
            gap: space[3],
          }}
        >
          <span style={{ color: color.text.muted }}>decision:</span>
          <span style={{ color: color.accent.success, fontWeight: 700 }}>
            ✓ other has read → O_RDONLY allowed
          </span>
        </div>
      </div>
    </div>

    {/* MAC check note */}
    <div
      style={{
        background: 'rgba(149, 117, 205, 0.06)',
        border: `1px solid ${color.region.vfs.fg}33`,
        borderRadius: radius.md,
        padding: space[3],
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: color.region.vfs.fg }}>Security stack:</strong>{' '}
      After Unix permission bits pass,{' '}
      <span style={{ color: color.accent.primary }}>security_inode_permission()</span>{' '}
      runs SELinux / AppArmor MAC checks. If the process domain is not allowed{' '}
      <code style={{ color: color.accent.primary }}>file &#123;open&#125;</code> on the target
      file's security context, the open fails with{' '}
      <span style={{ color: color.accent.danger }}>-EACCES</span> even if Unix
      permissions would allow it.
    </div>
  </div>
);

const OpenInodePermission: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="inode lookup → permission check → may_open()"
    hero={<OpenInodePermissionHero />}
  />
);

const PermissionBit: React.FC<{
  label: string;
  bits: string;
  active?: boolean;
}> = ({ label, bits, active }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    }}
  >
    <span
      style={{
        fontFamily: font.family.mono,
        fontSize: '8px',
        color: color.text.dim,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: font.family.mono,
        fontSize: font.size.sm,
        color: active ? color.accent.success : color.text.secondary,
        fontWeight: active ? 700 : 400,
        background: active ? 'rgba(102, 187, 106, 0.12)' : color.bg.surface,
        border: `1px solid ${active ? color.accent.success + '55' : color.border.subtle}`,
        borderRadius: '4px',
        padding: '2px 8px',
      }}
    >
      {bits}
    </span>
  </div>
);

export default OpenInodePermission;
