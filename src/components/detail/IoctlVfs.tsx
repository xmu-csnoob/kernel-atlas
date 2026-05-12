import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const IoctlVfsHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Dispatch chain */}
    <StructChain
      cards={[
        {
          structName: 'do_vfs_ioctl',
          type: 'fs/ioctl.c',
          region: 'vfs',
          fields: [
            { label: 'FIOCLEX', value: 'close-on-exec' },
            { label: 'FIONREAD', value: 'bytes avail' },
            { label: 'FIGETBSZ', value: 'block size' },
            { label: 'default', value: '→ file_ioctl', highlight: true },
          ],
        },
        {
          structName: 'file_ioctl',
          type: 'fs/ioctl.c',
          region: 'vfs',
          fields: [
            { label: 'FIBMAP', value: 'block map' },
            { label: 'FIGETBSZ', value: 'block size' },
            { label: 'default', value: '→ unlocked_ioctl', highlight: true },
            { label: 'no handler', value: '-ENOTTY' },
          ],
        },
        {
          structName: 'unlocked_ioctl',
          type: 'tty_ioctl.c',
          region: 'vfs',
          fields: [
            { label: 'TCGETS', value: 'get termios' },
            { label: 'TCSETS', value: 'set termios', highlight: true },
            { label: 'TIOCGWINSZ', value: 'window size' },
            { label: 'custom', value: 'driver-defined' },
          ],
        },
      ]}
      arrows={[
        { label: 'generic', subLabel: 'switch(cmd)', width: 90 },
        { label: 'regular file', subLabel: 'S_ISREG', width: 90 },
      ]}
    />

    {/* Command struct + code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct file"
        type="ioctl target"
        region="vfs"
        fields={[
          { label: 'f_op', value: '→ tty_fops', highlight: true },
          { label: 'unlocked_ioctl', value: '→ tty_ioctl', highlight: true },
          { label: 'private_data', value: '→ tty_struct*' },
          { label: 'f_mode', value: 'FMODE_READ | FMODE_WRITE' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.vfs.fg}>do_vfs_ioctl()  ·  fs/ioctl.c</SectionLabel>
        <CodeBlock compact>{`int do_vfs_ioctl(struct file *filp,
    unsigned int fd, unsigned int cmd,
    unsigned long arg)
{
    switch (cmd) {
    case FIOCLEX:  set_close_on_exec(fd, 1); break;
    case FIONREAD: i = filp->f_op->ioctl(...); break;
    default:
        if (S_ISREG(filp->f_dentry->d_inode->i_mode))
            error = file_ioctl(filp, cmd, arg);
        else
            error = vfs_ioctl(filp, cmd, arg);
    }
    return error;
}`}</CodeBlock>
      </div>
    </div>

    <div>
      <SectionLabel accent={color.region.vfs.fg}>The ioctl dispatch pattern</SectionLabel>
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
        <span style={{ color: color.region.vfs.accent }}>do_vfs_ioctl</span>{' '}
        handles generic commands first (FIOCLEX, FIONREAD). For unhandled commands on regular
        files, it calls{' '}
        <span style={{ color: color.accent.primary }}>file_ioctl()</span>. If the file
        operation table has an{' '}
        <span style={{ color: color.pulse }}>unlocked_ioctl</span> pointer, the VFS calls it
        directly — no Big Kernel Lock. For tty devices, this resolves to{' '}
        <span style={{ color: color.region.vfs.accent }}>tty_ioctl()</span>.
      </div>
    </div>
  </div>
);

const IoctlVfs: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="VFS ioctl dispatch: generic commands → file_ioctl → unlocked_ioctl" hero={<IoctlVfsHero />} />
);

export default IoctlVfs;
