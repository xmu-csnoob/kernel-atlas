import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

export const BrkUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Address space layout */}
    <div>
      <SectionLabel accent={color.region.user.fg}>Process address space</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.8,
        }}
      >
        <div>
          <span style={{ color: color.text.muted }}>0x400000</span>
          <span style={{ color: color.accent.primary, marginLeft: space[3] }}>text (code)</span>
        </div>
        <div>
          <span style={{ color: color.text.muted }}>0x600000</span>
          <span style={{ color: color.accent.warning, marginLeft: space[3] }}>data / bss</span>
        </div>
        <div>
          <span style={{ color: color.text.muted }}>0x601000</span>
          <span style={{ color: color.region.user.fg, marginLeft: space[3] }}>heap start</span>
        </div>
        <div>
          <span style={{ color: color.pulse, fontWeight: font.weight.bold }}>0x8a3000</span>
          <span style={{ color: color.pulse, marginLeft: space[3], fontWeight: font.weight.bold }}>program break (current)</span>
        </div>
        <div>
          <span style={{ color: color.text.muted }}>0x7f0000000000</span>
          <span style={{ color: color.text.dim, marginLeft: space[3] }}>mmap region (grows down)</span>
        </div>
        <div>
          <span style={{ color: color.text.muted }}>0x7fff...</span>
          <span style={{ color: color.text.dim, marginLeft: space[3] }}>stack (grows down)</span>
        </div>
      </div>
    </div>

    {/* brk call + syscall */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.user.fg}>glibc wrapper</SectionLabel>
        <CodeBlock>{`/* glibc brk() — set program break directly */
int brk(void *addr) {
    void *newbrk = (void *)INLINE_SYSCALL(brk, 1, addr);
    if (newbrk < addr) {
        __set_errno(ENOMEM);
        return -1;
    }
    __curbrk = newbrk;
    return 0;
}

/* sbrk() — move break by increment */
void *sbrk(intptr_t increment) {
    void *oldbrk = __curbrk;
    if (brk(oldbrk + increment) < 0)
        return (void *)-1;
    return oldbrk;
}`}</CodeBlock>
      </div>
      <StructCard
        name="brk syscall"
        type="x86-64 ABI"
        region="user"
        fields={[
          { label: '%rax', value: '12 (NR_brk)', highlight: true },
          { label: '%rdi', value: '0x8a3000 (new addr)', highlight: true },
          { label: 'return', value: 'new brk on success' },
        ]}
      />
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner
      fromLabel="USER"
      fromRing="ring 3"
      toLabel="KERNEL"
      toRing="ring 0"
      arrowLabel="brk syscall"
    />
  </div>
);

const BrkUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="glibc brk() / sbrk() → syscall → sys_brk()"
    hero={<BrkUserSpaceHero />}
  />
);

export default BrkUserSpace;
