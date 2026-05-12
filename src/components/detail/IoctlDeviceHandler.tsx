import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const IoctlDeviceHandlerHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Three device type cards */}
    <div
      style={{
        display: 'flex',
        gap: space[3],
        flexWrap: 'wrap',
      }}
    >
      {/* TTY */}
      <div
        style={{
          flex: '1 1 240px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.primary,
            fontWeight: font.weight.bold,
            letterSpacing: font.letterSpacing.label,
            textTransform: 'uppercase',
            marginBottom: space[2],
          }}
        >
          tty_ioctl()
        </div>
        <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6, marginBottom: space[2] }}>
          Terminal configuration: termios, window size, line discipline.
        </div>
        <CodeBlock compact>{`case TCGETS:
  copy_to_user(arg, &tty->termios,
               sizeof(struct termios));
  break;
case TCSETS:
  copy_from_user(&tty->termios, arg,
                 sizeof(struct termios));
  tty_set_termios(tty, &tty->termios);
  break;`}</CodeBlock>
      </div>

      {/* Block device */}
      <div
        style={{
          flex: '1 1 240px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.warning,
            fontWeight: font.weight.bold,
            letterSpacing: font.letterSpacing.label,
            textTransform: 'uppercase',
            marginBottom: space[2],
          }}
        >
          blkdev_ioctl()
        </div>
        <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6, marginBottom: space[2] }}>
          Block device control: size, geometry, flush, partition table.
        </div>
        <CodeBlock compact>{`case BLKGETSIZE:
  put_user(bdev->bd_inode->i_size >> 9, arg);
  break;
case BLKSSZGET:
  put_user(bdev_logical_block_size(bdev), arg);
  break;
case BLKFLSBUF:
  invalidate_bdev(bdev);
  break;`}</CodeBlock>
      </div>

      {/* Socket */}
      <div
        style={{
          flex: '1 1 240px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.success,
            fontWeight: font.weight.bold,
            letterSpacing: font.letterSpacing.label,
            textTransform: 'uppercase',
            marginBottom: space[2],
          }}
        >
          sock_ioctl()
        </div>
        <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6, marginBottom: space[2] }}>
          Network interface control: address, flags, ethtool operations.
        </div>
        <CodeBlock compact>{`case SIOCGIFADDR:
  dev_ioctl(cmd, arg);
  break;
case SIOCSIFFLAGS:
  dev_change_flags(dev, flags);
  break;
case SIOCETHTOOL:
  dev_ethtool(dev, arg);
  break;`}</CodeBlock>
      </div>
    </div>

    {/* private_data connection */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct file"
        type="fd=0 (tty)"
        region="driver"
        fields={[
          { label: 'f_op', value: '→ tty_fops', highlight: true },
          { label: 'private_data', value: '→ tty_struct*', highlight: true },
          { label: 'f_mode', value: 'FMODE_READ|WRITE' },
          { label: 'f_pos', value: '0' },
        ]}
      />
      <StructCard
        name="tty_struct"
        type="driver context"
        region="driver"
        fields={[
          { label: 'termios', value: '{c_iflag, ...}', highlight: true },
          { label: 'winsize', value: '{ws_row, ws_col}' },
          { label: 'ldisc', value: '→ n_tty' },
          { label: 'driver', value: '→ tty_driver' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.driver.fg}>file→private_data → driver context</SectionLabel>
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
          The driver stores per-open context in{' '}
          <span style={{ color: color.accent.primary }}>file-&gt;private_data</span>{' '}
          during its open method. The ioctl handler retrieves this pointer to access
          device-specific state without needing to re-look-up the device from the fd.
        </div>
      </div>
    </div>
  </div>
);

const IoctlDeviceHandler: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="Device-specific ioctl handlers: tty, block, socket" hero={<IoctlDeviceHandlerHero />} />
);

export default IoctlDeviceHandler;
