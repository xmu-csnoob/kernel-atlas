import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExecveArgCopyHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Stack layout visualization */}
    <div>
      <SectionLabel accent={color.region.process.fg}>New user stack layout (top → bottom)</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
          fontFamily: font.family.mono,
          fontSize: '10px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Stack grows downward — show top first */}
          {[
            { label: '0x7fff_ffff_ffff', content: 'argv strings ("ls", "-la")', type: 'data' },
            { label: '↓', content: 'envp strings ("PATH=/bin")', type: 'data' },
            { label: '↓', content: 'padding (16-byte align)', type: 'pad' },
            { label: '↓', content: 'auxv[AT_NULL] (terminator)', type: 'auxv' },
            { label: '↓', content: 'auxv[AT_ENTRY] = 0x400520', type: 'auxv', highlight: true },
            { label: '↓', content: 'auxv[AT_PHDR] = 0x400040', type: 'auxv' },
            { label: '↓', content: 'auxv[AT_PAGESZ] = 4096', type: 'auxv' },
            { label: '↓', content: 'envp[0] pointer', type: 'ptr' },
            { label: '↓', content: 'NULL (envp terminator)', type: 'ptr' },
            { label: '↓', content: 'argv[1] pointer', type: 'ptr' },
            { label: '↓', content: 'argv[0] pointer', type: 'ptr' },
            { label: '↓', content: 'argc = 2', type: 'argc', highlight: true },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space[3],
                padding: '3px 8px',
                background: row.highlight ? 'rgba(255, 235, 59, 0.06)' : 'transparent',
                border: row.highlight ? `1px solid ${color.pulse}33` : '1px solid transparent',
                borderRadius: radius.sm,
              }}
            >
              <span style={{ color: color.text.dim, minWidth: '140px', fontSize: '9px' }}>{row.label}</span>
              <span style={{
                color: row.type === 'auxv' ? color.accent.primary :
                       row.type === 'argc' ? color.pulse :
                       row.type === 'ptr' ? color.region.process.fg :
                       color.text.secondary,
                fontWeight: row.highlight ? 700 : 400,
              }}>
                {row.content}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* copy_strings + create_elf_tables code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.process.fg}>copy_strings()</SectionLabel>
        <CodeBlock compact>{`static int copy_strings(int argc,
  const char __user *const __user *argv,
  struct linux_binprm *bprm)
{
  while (argc-- > 0) {
    len = strnlen_user(argv[argc], MAX_ARG_STRLEN);
    /* copy from user to kernel page */
    copy_from_user(kaddr + offset, argv[argc], len);
    bprm->p -= len;  /* grows downward */
  }
}`}</CodeBlock>
      </div>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.process.fg}>create_elf_tables()</SectionLabel>
        <CodeBlock compact>{`static int create_elf_tables(...)
{
  /* argc */
  put_user(argc, sp++);

  /* argv pointers */
  for (i = 0; i < argc; i++)
    put_user(argv_ptrs[i], sp++);
  put_user(0, sp++);  /* argv terminator */

  /* envp pointers */
  ...

  /* auxiliary vector */
  NEW_AUX_ENT(AT_ENTRY, elf_entry);
  NEW_AUX_ENT(AT_PHDR, load_addr + exec->e_phoff);
  NEW_AUX_ENT(AT_PAGESZ, ELF_MIN_ALIGN);
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const ExecveArgCopy: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="copy_strings → create_elf_tables → new stack layout"
    hero={<ExecveArgCopyHero />}
  />
);

export default ExecveArgCopy;
