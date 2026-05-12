import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const BrkReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="return value"
        type="success"
        region="return"
        fields={[
          { label: '%rax', value: '0x9c0000 (new brk)', highlight: true },
          { label: 'errno', value: '0' },
          { label: 'glibc return', value: '0 (success)' },
        ]}
      />
      <StructCard
        name="mm_struct after"
        type="updated"
        region="return"
        fields={[
          { label: 'brk', value: '0x9c0000', highlight: true },
          { label: 'brk_page', value: '0x9c1000', highlight: true },
          { label: 'total_vm', value: '+288 pages' },
        ]}
      />
    </div>

    {/* sysret code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.return.fg}>sysretq — return to user space</SectionLabel>
        <CodeBlock>{`/* sys_brk success path */
mm->brk = brk;          /* update program break */
mm->brk_page = newbrk;  /* page-aligned boundary */
retval = brk;           /* new break in rax */
up_write(&mm->mmap_sem); /* release exclusive lock */

/* syscall exit path */
sysretq                 /* ring 0 → ring 3 */
/* user code resumes, rax = 0x9c0000 */`}</CodeBlock>
      </div>
    </div>

    {/* User space usage */}
    <div>
      <SectionLabel accent={color.region.return.fg}>User space: malloc() → brk() or mmap()</SectionLabel>
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
          <span style={{ color: color.accent.primary }}>void *p</span> ={' '}
          <span style={{ color: color.pulse }}>malloc</span>(1024);{' '}
          <span style={{ color: color.text.dim }}>// glibc arena: brk() if &lt;128KB, mmap() if larger</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>free</span>(p);{' '}
          <span style={{ color: color.text.dim }}>// return to arena, may not shrink brk</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>sbrk</span>(0);{' '}
          <span style={{ color: color.text.dim }}>// query current break (no change)</span>
        </div>
        <div>
          <span style={{ color: color.pulse }}>sbrk</span>(4096);{' '}
          <span style={{ color: color.text.dim }}>// brk(cur + 4096) → expand heap</span>
        </div>
      </div>
    </div>

    {/* Note */}
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
      <strong style={{ color: color.region.return.fg }}>brk() vs mmap() for heap:</strong>{' '}
      Modern glibc uses brk() for small allocations (&lt;128KB default) and mmap() for
      large allocations. mmap()-based heap regions are independent VMAs that can be
      fully returned to the kernel on free(). brk()-based heap is a single contiguous
      region that can only shrink from the top.
    </div>
  </div>
);

const BrkReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="new brk → %rax → sysretq → glibc __curbrk update → user malloc()"
    hero={<BrkReturnPathHero />}
  />
);

export default BrkReturnPath;
