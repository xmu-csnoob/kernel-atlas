import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, space } from '../../design/tokens';

export const MmapReturnHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return value flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="return value"
        type="%rax"
        region="return"
        fields={[
          { label: '%rax', value: '0x7f00...a000', highlight: true },
          { label: 'void *', value: 'mapped address' },
          { label: 'len', value: '4096 bytes' },
          { label: 'errno', value: '0' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.return.fg}>sysret → user space</SectionLabel>
        <CodeBlock compact>{`/* do_mmap_pgoff returns mapped address */
addr = mmap_region(file, addr, len, flags, vm_flags, pgoff);

/* Flows back through call chain */
return addr;  /* → sys_mmap_pgoff → sys_mmap2 → entry_64.S */

/* syscall return path places addr in %rax */
sysretq       /* ring 0 → ring 3, %rax = 0x7f00...a000 */`}</CodeBlock>
      </div>
    </div>

    {/* Lazy allocation visualization */}
    <div>
      <SectionLabel accent={color.region.return.fg}>
        Lazy allocation — no physical page until first access
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: '8px',
          padding: space[4],
        }}
      >
        <LazyAllocationDiagram />
      </div>
    </div>
  </div>
);

const MmapReturn: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="Return mapped VA → user space → lazy allocation on first touch"
    hero={<MmapReturnHero />}
  />
);

/** Lazy allocation timeline diagram */
const LazyAllocationDiagram: React.FC = () => {
  const steps = [
    {
      time: 'T0: mmap() returns',
      desc: 'VMA created, no PTE, no physical page',
      state: 'virtual only',
      color: color.text.muted,
    },
    {
      time: 'T1: first read/write',
      desc: 'CPU raises #PF — page not present',
      state: 'page fault',
      color: color.region.hardware.fg,
    },
    {
      time: 'T2: handle_mm_fault()',
      desc: 'Alloc page, install PTE, flush TLB',
      state: 'page mapped',
      color: color.region.return.fg,
    },
    {
      time: 'T3: CPU retries access',
      desc: 'TLB miss → page walk → PTE valid → data access',
      state: 'success',
      color: color.accent.success,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: space[3] }}>
          {/* Timeline dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: step.color,
                border: `2px solid ${color.bg.canvas}`,
                boxShadow: `0 0 6px ${step.color}66`,
              }}
            />
            {i < steps.length - 1 && (
              <div
                style={{
                  width: '2px',
                  flex: 1,
                  minHeight: '24px',
                  background: `linear-gradient(180deg, ${step.color}44, ${steps[i + 1].color}44)`,
                  marginTop: '2px',
                }}
              />
            )}
          </div>

          {/* Step content */}
          <div style={{ flex: 1, paddingBottom: space[2] }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: step.color,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {step.time}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: color.text.secondary,
                marginTop: '2px',
              }}
            >
              {step.desc}
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '1px 6px',
                borderRadius: '3px',
                fontFamily: 'monospace',
                fontSize: '9px',
                color: step.color,
                background: `${step.color}15`,
                border: `1px solid ${step.color}44`,
              }}
            >
              {step.state}
            </div>
          </div>
        </div>
      ))}

      {/* Summary note */}
      <div
        style={{
          marginTop: space[2],
          padding: space[3],
          background: 'rgba(77, 208, 163, 0.06)',
          border: `1px solid ${color.region.return.fg}33`,
          borderRadius: '6px',
          fontFamily: 'sans-serif',
          fontSize: '11px',
          color: color.text.secondary,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: color.region.return.fg }}>Key insight:</strong>{' '}
        mmap() is fast because it does not touch physical memory. The real work
        (page allocation, zero-filling, disk I/O) is deferred until the first access.
        This is called <em>demand paging</em> and is fundamental to Linux memory management.
      </div>
    </div>
  );
};

export default MmapReturn;
