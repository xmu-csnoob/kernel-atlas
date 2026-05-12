import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

const CLONE_FLAGS: { flag: string; val: string; desc: string; active: boolean }[] = [
  { flag: 'CLONE_VM', val: '0x100', desc: 'share mm', active: true },
  { flag: 'CLONE_FS', val: '0x200', desc: 'share chroot', active: true },
  { flag: 'CLONE_FILES', val: '0x400', desc: 'share files', active: true },
  { flag: 'CLONE_SIGHAND', val: '0x800', desc: 'share sig', active: true },
  { flag: 'CLONE_PTRACE', val: '0x2000', desc: 'ptrace parent', active: false },
  { flag: 'CLONE_VFORK', val: '0x4000', desc: 'suspend parent', active: false },
  { flag: 'CLONE_PARENT', val: '0x8000', desc: 'same ppid', active: false },
  { flag: 'CLONE_THREAD', val: '0x10000', desc: 'same tgid', active: true },
  { flag: 'CLONE_NEWNS', val: '0x20000', desc: 'new mnt ns', active: false },
  { flag: 'CLONE_SYSVSEM', val: '0x40000', desc: 'share semundo', active: true },
  { flag: 'CLONE_SETTLS', val: '0x80000', desc: 'set tls', active: true },
  { flag: 'CLONE_PARENT_SETTID', val: '0x100000', desc: 'write tid', active: true },
  { flag: 'CLONE_CHILD_CLEARTID', val: '0x200000', desc: 'futex clear', active: true },
  { flag: 'CLONE_DETACHED', val: '0x400000', desc: 'legacy', active: false },
  { flag: 'CLONE_UNTRACED', val: '0x800000', desc: 'no ptrace', active: false },
  { flag: 'CLONE_CHILD_SETTID', val: '0x1000000', desc: 'set child tid', active: true },
];

export const CloneUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="parent process"
        region="user"
        fields={[
          { label: 'pid', value: '1234' },
          { label: 'tgid', value: '1234' },
          { label: 'mm', value: '→ mm_struct' },
          { label: 'files', value: '→ files_struct' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>the clone() call</SectionLabel>
        <CodeBlock>{`/* pthread_create calls clone() */
pthread_create(&tid, NULL, fn, arg) {
    clone(CLONE_VM | CLONE_FS | CLONE_FILES
        | CLONE_SIGHAND | CLONE_THREAD
        | CLONE_SYSVSEM | CLONE_SETTLS
        | CLONE_PARENT_SETTID
        | CLONE_CHILD_CLEARTID
        | CLONE_CHILD_SETTID,
        child_stack, &tid, fn, arg);
}`}</CodeBlock>
      </div>
    </div>

    <div>
      <SectionLabel accent={color.region.user.fg}>clone() flags bitfield (pthread_create highlighted)</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '4px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {CLONE_FLAGS.map((f) => (
          <div
            key={f.flag}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: space[2],
              padding: `${space[1]} ${space[2]}`,
              borderRadius: radius.sm,
              background: f.active ? color.region.user.bg : 'transparent',
              border: f.active ? `1px solid ${color.region.user.fg}` : `1px solid transparent`,
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: f.active ? color.region.user.fg : color.text.muted,
              fontWeight: f.active ? font.weight.semibold : font.weight.regular,
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ opacity: 0.7 }}>{f.val}</span>
            <span>{f.flag}</span>
            <span style={{ color: color.text.dim, marginLeft: 'auto' }}>{f.desc}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        <span style={{ color: color.pulse, fontWeight: 700 }}>Highlight:</span>{' '}
        pthread_create uses 10 flags for full thread sharing
      </div>
    </div>

    <RingBoundaryBanner />
  </div>
);

const CloneUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="glibc clone() → pthread_create flags" hero={<CloneUserSpaceHero />} />
);

export default CloneUserSpace;
