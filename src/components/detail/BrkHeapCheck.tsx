import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import AnimatedArrow from './primitives/AnimatedArrow';
import { color, font, space, radius } from '../../design/tokens';

export const BrkHeapCheckHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Check flow */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>Validation chain</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          display: 'flex',
          alignItems: 'center',
          gap: space[3],
          flexWrap: 'wrap',
        }}
      >
        <CheckBox label="brk ≥ end_code" pass />
        <AnimatedArrow width={30} color={color.accent.success} animated={false} />
        <CheckBox label="brk ≤ RLIMIT_DATA" pass />
        <AnimatedArrow width={30} color={color.accent.success} animated={false} />
        <CheckBox label="no VMA overlap" pass />
        <AnimatedArrow width={30} color={color.accent.success} animated={false} />
        <div
          style={{
            background: `${color.accent.success}18`,
            border: `1px solid ${color.accent.success}`,
            borderRadius: radius.sm,
            padding: '4px 10px',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.accent.success,
          }}
        >
          do_brk() expand
        </div>
      </div>
    </div>

    {/* Limits comparison */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="limits"
        type="checks"
        region="mm"
        fields={[
          { label: 'end_code', value: '0x600000 (floor)', highlight: true },
          { label: 'current brk', value: '0x8a3000' },
          { label: 'requested', value: '0x9c0000', highlight: true },
          { label: 'RLIMIT_DATA', value: 'unlimited (pass)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>RLIMIT_DATA + VMA collision check</SectionLabel>
        <CodeBlock>{`/* RLIMIT_DATA soft limit */
rlim = rlimit(RLIMIT_DATA);
if (rlim < RLIM_INFINITY &&
    brk - mm->start_data > rlim)
    goto out;   // fail: exceeds data limit

/* Check for existing mmap overlap */
if (!find_vma_intersection(mm,
        oldbrk, newbrk + PAGE_SIZE))
    if (!do_brk(oldbrk, newbrk - oldbrk))
        goto set_brk;   // success

out:
    retval = mm->brk;   // return unchanged
    up_write(&mm->mmap_sem);
    return retval;`}</CodeBlock>
      </div>
    </div>
  </div>
);

const BrkHeapCheck: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="brk >= end_code → RLIMIT_DATA → find_vma_intersection() → pass/fail"
    hero={<BrkHeapCheckHero />}
  />
);

const CheckBox: React.FC<{ label: string; pass: boolean }> = ({ label, pass }) => (
  <div
    style={{
      background: pass ? `${color.accent.success}10` : `${color.region.hardware.fg}10`,
      border: `1px solid ${pass ? color.accent.success : color.region.hardware.fg}40`,
      borderRadius: radius.sm,
      padding: '4px 10px',
      fontFamily: font.family.mono,
      fontSize: '10px',
      color: pass ? color.accent.success : color.region.hardware.fg,
    }}
  >
    {pass ? '✓ ' : '✗ '}{label}
  </div>
);

export default BrkHeapCheck;
