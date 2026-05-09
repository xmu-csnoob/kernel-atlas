import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

const ForkMemoryResources: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="copy_mm → CoW page tables"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <style>{`
            @keyframes pte-blink {
              0%, 100% { opacity: 0.25; }
              50%      { opacity: 0.85; }
            }
          `}</style>

          {/* CoW conceptual diagram */}
          <div>
            <SectionLabel accent={color.region.kernel.fg}>
              Copy-on-Write — parent and child share physical pages until one writes
            </SectionLabel>
            <div
              style={{
                background: color.bg.inset,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: radius.md,
                padding: space[4],
              }}
            >
              <div style={{ display: 'flex', gap: space[4], flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Parent PTE */}
                <div>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.region.kernel.fg,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    Parent PTE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {['P | R | VPN=0x1ff → PFN=0xabc0',
                      'P | R | VPN=0x200 → PFN=0xabc1',
                      'P | W | VPN=0x201 → PFN=0xabc2',
                      'P | R | VPN=0x202 → PFN=0xabc3'].map((l, i) => (
                      <div key={i} style={{
                        background: color.bg.surface,
                        border: `1px solid ${color.border.subtle}`,
                        borderRadius: radius.sm,
                        padding: `${space[1]} ${space[2]}`,
                        fontFamily: font.family.mono,
                        fontSize: '10px',
                        color: color.text.secondary,
                      }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow: copy_page_range clears W bit */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <span style={{
                    fontFamily: font.family.mono,
                    fontSize: '10px',
                    color: color.pulse,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    copy_page_range
                  </span>
                  <svg width="40" height="60" viewBox="0 0 40 60">
                    <line x1="20" y1="5" x2="20" y2="50"
                      stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4"
                      markerEnd="url(#pte-arrow)" opacity="0.8">
                      <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
                    </line>
                    <defs>
                      <marker id="pte-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
                      </marker>
                    </defs>
                  </svg>
                  <span style={{
                    fontFamily: font.family.mono,
                    fontSize: '9px',
                    color: color.text.dim,
                    textAlign: 'center',
                  }}>
                    W → R+CoW<br/>refcount++
                  </span>
                </div>

                {/* Child PTE */}
                <div>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.region.kernel.fg,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    Child PTE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {['P | R | VPN=0x1ff → PFN=0xabc0',
                      'P | R | VPN=0x200 → PFN=0xabc1',
                      { label: 'P | R+CoW | VPN=0x201 → PFN=0xabc2', cow: true },
                      'P | R | VPN=0x202 → PFN=0xabc3'].map((entry, i) => {
                      const l = typeof entry === 'string' ? entry : entry.label;
                      const isCow = typeof entry !== 'string';
                      return (
                        <div key={i} style={{
                          background: isCow ? 'rgba(255, 235, 59, 0.08)' : color.bg.surface,
                          border: `1px solid ${isCow ? color.pulse + '77' : color.border.subtle}`,
                          borderRadius: radius.sm,
                          padding: `${space[1]} ${space[2]}`,
                          fontFamily: font.family.mono,
                          fontSize: '10px',
                          color: isCow ? color.pulse : color.text.secondary,
                          fontWeight: isCow ? 600 : 400,
                          animation: isCow ? 'pte-blink 2.2s ease-in-out infinite' : 'none',
                        }}>
                          {l}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shared physical pages */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: space[2],
                }}>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.text.dim,
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                  }}>
                    PHYSICAL PAGES
                  </div>
                  {['PFN 0xabc0', 'PFN 0xabc1', 'PFN 0xabc2', 'PFN 0xabc3'].map((p, i) => (
                    <div key={i} style={{
                      width: '100px',
                      height: '24px',
                      background: i === 2 ? 'rgba(255, 235, 59, 0.12)' : color.bg.surface,
                      border: `1px solid ${i === 2 ? color.pulse + '55' : color.border.subtle}`,
                      borderRadius: radius.sm,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: font.family.mono,
                      fontSize: '9px',
                      color: i === 2 ? color.pulse : color.text.muted,
                      fontWeight: i === 2 ? 700 : 400,
                    }}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: space[3],
                paddingTop: space[3],
                borderTop: `1px solid ${color.border.subtle}`,
                fontFamily: font.family.sans,
                fontSize: font.size.sm,
                color: color.text.secondary,
                lineHeight: 1.6,
              }}>
                <strong style={{ color: color.pulse }}>The trick:</strong>{' '}
                Both parent and child share the same physical pages. The write (W) bit is
                <em>cleared</em> in both page tables, and a "CoW" (copy-on-write) marker is set.
                When either process tries to write, a page fault fires, the kernel copies the page,
                and gives the writer a private copy. This is why <code style={{ color: color.accent.primary }}>fork()</code> is fast.
              </div>
            </div>
          </div>

          {/* copy_files + copy_sighand row */}
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StructCard
              name="files_struct"
              type="refcount +1"
              region="kernel"
              fields={[
                { label: 'count', value: '2 ← was 1', highlight: true },
                { label: 'fdt', value: '→ shared fdtable' },
                { label: 'max_fds', value: '256' },
                { label: 'next_fd', value: '4' },
              ]}
            />
            <StructCard
              name="sighand_struct"
              type="refcount +1"
              region="kernel"
              fields={[
                { label: 'count', value: '2 ← was 1', highlight: true },
                { label: 'action[]', value: 'shared signal handlers' },
                { label: 'siglock', value: 'spinlock_t' },
                { label: 'signalfd_wqh', value: '→ wait queue' },
              ]}
            />
          </div>
        </div>
      }
    />
  );
};

export default ForkMemoryResources;