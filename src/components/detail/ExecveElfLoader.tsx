import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const ExecveElfLoaderHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* ELF header + magic check */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '260px' }}>
        <SectionLabel accent={color.region.process.fg}>ELF header validation</SectionLabel>
        <CodeBlock compact>{`struct elfhdr elf_ex;
elf_ex = *((struct elfhdr *) bprm-{'>'}buf);

/* Magic: 0x7f 'E' 'L' 'F' */
if (memcmp(elf_ex.e_ident, ELFMAG, SELFMAG) != 0)
    goto out;

/* e_type must be ET_EXEC or ET_DYN */
if (elf_ex.e_type != ET_EXEC && elf_ex.e_type != ET_DYN)
    goto out;`}</CodeBlock>
      </div>
      <div style={{ minWidth: '180px' }}>
        <SectionLabel accent={color.region.process.fg}>bprm-{'>'}buf (first 16 bytes)</SectionLabel>
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            fontFamily: font.family.mono,
            fontSize: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
            {['0x7f', '0x45', '0x4c', '0x46', '0x02', '0x01', '0x01', '0x00',
              '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'].map((b, i) => (
              <div
                key={i}
                style={{
                  background: i < 4 ? 'rgba(255, 235, 59, 0.12)' : color.bg.surface,
                  border: `1px solid ${i < 4 ? color.pulse + '55' : color.border.subtle}`,
                  borderRadius: radius.sm,
                  padding: '2px 6px',
                  color: i < 4 ? color.pulse : color.text.secondary,
                  fontWeight: i < 4 ? 700 : 400,
                  minWidth: '36px',
                  textAlign: 'center',
                }}
              >
                {b}
              </div>
            ))}
          </div>
          <div style={{ marginTop: space[2], color: color.text.muted, fontSize: '9px' }}>
            <span style={{ color: color.pulse }}>■</span> ELFMAG = 0x7f 'E' 'L' 'F'
          </div>
        </div>
      </div>
    </div>

    {/* PT_LOAD segment mapping diagram */}
    <div>
      <SectionLabel accent={color.region.process.fg}>PT_LOAD segment mapping</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: font.family.mono, fontSize: '10px' }}>
          {/* Segment rows */}
          {[
            { name: 'PT_LOAD (text)', addr: '0x400000', size: '0x1a000', perm: 'R-X', color: color.region.process.fg },
            { name: 'PT_LOAD (data)', addr: '0x41a000', size: '0x4000', perm: 'RW-', color: color.accent.primary },
            { name: 'PT_LOAD (bss)',  addr: '0x41e000', size: '0x1000', perm: 'RW-', color: color.text.muted },
          ].map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
              <span style={{ color: seg.color, minWidth: '140px', fontWeight: 600 }}>{seg.name}</span>
              <span style={{ color: color.text.secondary, minWidth: '80px' }}>{seg.addr}</span>
              <span style={{ color: color.text.muted, minWidth: '60px' }}>{seg.size}</span>
              <span style={{
                color: seg.color,
                background: seg.color + '15',
                border: `1px solid ${seg.color}44`,
                borderRadius: radius.sm,
                padding: '1px 6px',
                fontSize: '9px',
                fontWeight: 700,
              }}>
                {seg.perm}
              </span>
              <svg width="60" height="12" style={{ marginLeft: 'auto' }}>
                <line x1="0" y1="6" x2="55" y2="6" stroke={seg.color} strokeWidth="2" strokeDasharray={i === 2 ? '3 3' : '0'} opacity="0.6" />
                <polygon points="55,3 60,6 55,9" fill={seg.color} opacity="0.6" />
              </svg>
              <span style={{ color: color.text.dim, fontSize: '9px' }}>elf_map() → do_mmap()</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Interpreter row */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="PT_INTERP"
        type="fs/binfmt_elf.c"
        region="process"
        fields={[
          { label: 'interpreter', value: '/lib64/ld-linux-x86-64.so.2', highlight: true },
          { label: 'entry_point', value: '→ ld.so _start' },
          { label: 'dynamic', value: 'true (ET_DYN)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.process.fg}>load_elf_binary flow</SectionLabel>
        <CodeBlock compact>{`load_elf_binary(bprm, regs)
  ├── read ELF header
  ├── parse program headers
  ├── for each PT_LOAD:
  │     elf_map() → do_mmap()
  ├── if PT_INTERP:
  │     load_elf_interp() → ld.so
  └── start_thread(entry, sp)`}</CodeBlock>
      </div>
    </div>
  </div>
);

const ExecveElfLoader: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="ELF magic check → PT_LOAD segment mapping → interpreter"
    hero={<ExecveElfLoaderHero />}
  />
);

export default ExecveElfLoader;
