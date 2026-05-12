import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const ExecveMmReplacementHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Old mm → new mm transition */}
    <StructChain
      cards={[
        {
          structName: 'mm_struct',
          type: 'old (being destroyed)',
          region: 'mm',
          fields: [
            { label: 'mm_users', value: '1 → 0' },
            { label: 'mmap', value: '→ VMA list (freed)' },
            { label: 'pgd', value: '→ old page tables' },
            { label: 'start_code', value: '0x400000 (old)' },
          ],
        },
        {
          structName: 'mm_struct',
          type: 'new (ELF mapped)',
          region: 'mm',
          fields: [
            { label: 'mm_users', value: '1', highlight: true },
            { label: 'mmap', value: '→ ELF VMAs', highlight: true },
            { label: 'pgd', value: '→ new page tables', highlight: true },
            { label: 'start_code', value: '0x400000 (new)' },
          ],
        },
      ]}
      arrows={[{ label: 'exec_mmap', subLabel: 'activate_mm', width: 120 }]}
    />

    {/* The point of no return */}
    <div
      style={{
        background: 'rgba(239, 83, 80, 0.06)',
        border: `1px solid rgba(239, 83, 80, 0.25)`,
        borderRadius: radius.md,
        padding: space[4],
      }}
    >
      <div style={{
        fontFamily: font.family.mono,
        fontSize: '9.5px',
        color: color.accent.danger,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: space[2],
        fontWeight: 700,
      }}>
        Point of no return
      </div>
      <div style={{
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}>
        Once <code style={{ color: color.accent.primary }}>exec_mmap()</code> succeeds, the old address space is gone.
        If anything fails after this point, the process cannot be restored to its previous state —
        it must be killed (SIGKILL). This is why execve() is all-or-nothing.
      </div>
    </div>

    {/* Code + new mm details */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.mm.fg}>exec_mmap() — atomic swap</SectionLabel>
        <CodeBlock compact>{`static int exec_mmap(struct mm_struct *mm)
{
  struct task_struct *tsk = current;
  struct mm_struct *old_mm = tsk->mm;

  tsk->mm = mm;        /* new mm */
  tsk->active_mm = mm;
  activate_mm(old_mm, mm);

  if (old_mm)
    mmput(old_mm);     /* drop ref → may free */
  return 0;
}`}</CodeBlock>
      </div>
      <StructCard
        name="new mm_struct"
        type="after setup_new_exec"
        region="mm"
        fields={[
          { label: 'start_code', value: '0x400000' },
          { label: 'end_code', value: '0x41a000' },
          { label: 'start_data', value: '0x41a000' },
          { label: 'brk', value: '0x420000', highlight: true },
          { label: 'start_stack', value: '0x7fff... (top)', highlight: true },
        ]}
      />
    </div>
  </div>
);

const ExecveMmReplacement: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="flush_old_exec → exec_mmap → setup_new_exec"
    hero={<ExecveMmReplacementHero />}
  />
);

export default ExecveMmReplacement;
