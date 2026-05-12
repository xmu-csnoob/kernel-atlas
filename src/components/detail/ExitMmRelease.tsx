import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const ExitMmReleaseHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* MM release chain */}
    <StructChain
            cards={[
              {
                structName: 'task_struct',
                type: 'exiting process',
                region: 'mm',
                fields: [
                  { label: 'pid', value: '1234' },
                  { label: 'mm', value: '→ mm_struct (ref=1)', highlight: true },
                  { label: 'active_mm', value: '→ mm_struct' },
                ],
              },
              {
                structName: 'mm_struct',
                type: 'mmput() → ref=0',
                region: 'mm',
                fields: [
                  { label: 'mm_users', value: '0 ← last ref', highlight: true },
                  { label: 'mm_count', value: '1' },
                  { label: 'mmap', value: '→ vma list' },
                  { label: 'pgd', value: '→ page tables' },
                ],
              },
            ]}
            arrows={[{ label: 'exit_mm()', subLabel: 'tsk->mm = NULL', width: 120 }]}
          />

          {/* Page table teardown visual */}
          <div>
            <SectionLabel accent={color.region.mm.fg}>
              exit_mmap() — page table teardown · mm/memory.c
            </SectionLabel>
            <div
              style={{
                background: color.bg.inset,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: radius.md,
                padding: space[4],
              }}
            >
              <div style={{ display: 'flex', gap: space[4], flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                {/* PGD */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.region.mm.fg,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    PGD
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {['pgd[0]', 'pgd[1]', 'pgd[2]', '...', 'pgd[511]'].map((l, i) => (
                      <div key={i} style={{
                        background: color.bg.surface,
                        border: `1px solid ${color.border.subtle}`,
                        borderRadius: radius.sm,
                        padding: `${space[1]} ${space[2]}`,
                        fontFamily: font.family.mono,
                        fontSize: '10px',
                        color: color.text.secondary,
                        width: '80px',
                      }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrows */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  paddingTop: '24px',
                }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="30" height="16" viewBox="0 0 30 16">
                      <line x1="0" y1="8" x2="24" y2="8" stroke={color.text.dim} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                      <polygon points="24,5 30,8 24,11" fill={color.text.dim} opacity="0.5" />
                    </svg>
                  ))}
                </div>

                {/* PUD */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.text.dim,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    PUD
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {['pud[0]', 'pud[1]', '...'].map((l, i) => (
                      <div key={i} style={{
                        background: color.bg.surface,
                        border: `1px solid ${color.border.subtle}`,
                        borderRadius: radius.sm,
                        padding: `${space[1]} ${space[2]}`,
                        fontFamily: font.family.mono,
                        fontSize: '10px',
                        color: color.text.muted,
                        width: '70px',
                      }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrows */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  paddingTop: '24px',
                }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <svg key={i} width="30" height="16" viewBox="0 0 30 16">
                      <line x1="0" y1="8" x2="24" y2="8" stroke={color.text.dim} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                      <polygon points="24,5 30,8 24,11" fill={color.text.dim} opacity="0.5" />
                    </svg>
                  ))}
                </div>

                {/* PMD */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.text.dim,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    PMD
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {['pmd[0]', 'pmd[1]', '...'].map((l, i) => (
                      <div key={i} style={{
                        background: color.bg.surface,
                        border: `1px solid ${color.border.subtle}`,
                        borderRadius: radius.sm,
                        padding: `${space[1]} ${space[2]}`,
                        fontFamily: font.family.mono,
                        fontSize: '10px',
                        color: color.text.muted,
                        width: '70px',
                      }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrows */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  paddingTop: '24px',
                }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <svg key={i} width="30" height="16" viewBox="0 0 30 16">
                      <line x1="0" y1="8" x2="24" y2="8" stroke={color.text.dim} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                      <polygon points="24,5 30,8 24,11" fill={color.text.dim} opacity="0.5" />
                    </svg>
                  ))}
                </div>

                {/* PTE + Pages */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: font.family.mono,
                    fontSize: '9.5px',
                    color: color.region.hardware.fg,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: space[2],
                    fontWeight: 700,
                  }}>
                    PTE → Pages
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {['pte[0] → PFN', 'pte[1] → PFN', 'pte[2] → PFN', '...'].map((l, i) => (
                      <div key={i} style={{
                        background: i === 0 ? 'rgba(239, 83, 80, 0.08)' : color.bg.surface,
                        border: `1px solid ${i === 0 ? 'rgba(239, 83, 80, 0.3)' : color.border.subtle}`,
                        borderRadius: radius.sm,
                        padding: `${space[1]} ${space[2]}`,
                        fontFamily: font.family.mono,
                        fontSize: '10px',
                        color: i === 0 ? color.region.hardware.fg : color.text.muted,
                        width: '100px',
                      }}>
                        {l}
                      </div>
                    ))}
                  </div>
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
                <strong style={{ color: color.region.hardware.fg }}>unmap_vmas()</strong>{' '}
                walks all page table levels (PGD→PUD→PMD→PTE), clearing each entry and
                decrementing page reference counts. When a page's refcount reaches zero, it is
                returned to the buddy allocator.
              </div>
            </div>
          </div>

          {/* mmput code */}
          <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <SectionLabel accent={color.region.mm.fg}>mmput() refcount path</SectionLabel>
              <CodeBlock>{`void mmput(struct mm_struct *mm)
{
    if (atomic_dec_and_test(&mm->mm_users)) {
        exit_aio(mm);
        ksm_exit(mm);
        exit_mmap(mm);     /* tear down all VMAs */
        set_mm_exe_file(mm, NULL);
        mmdrop(mm);        /* free mm_struct */
    }
}`}</CodeBlock>
            </div>
            <StructCard
              name="mm_struct"
              type="after mmdrop()"
              region="mm"
              fields={[
                { label: 'mm_users', value: '0 → freed', highlight: true },
                { label: 'mmap', value: 'NULL', highlight: true },
                { label: 'pgd', value: 'NULL', highlight: true },
                { label: 'total_vm', value: '0' },
                { label: 'locked_vm', value: '0' },
              ]}
            />
          </div>
        </div>
);

const ExitMmRelease: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="exit_mm() → mmput() → exit_mmap() → mmdrop()"
    hero={<ExitMmReleaseHero />}
  />
);

export default ExitMmRelease;
