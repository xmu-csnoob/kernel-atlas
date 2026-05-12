import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

// Simulated fdtable state before exit
const FD_TABLE: { fd: number; file: string | null; state: 'open' | 'closed' | 'null' }[] = [
  { fd: 0, file: 'tty (stdin)', state: 'open' },
  { fd: 1, file: 'tty (stdout)', state: 'open' },
  { fd: 2, file: 'tty (stderr)', state: 'open' },
  { fd: 3, file: '/etc/passwd', state: 'open' },
  { fd: 4, file: 'pipe[0]', state: 'open' },
  { fd: 5, file: 'socket(AF_INET)', state: 'open' },
  { fd: 6, file: null, state: 'null' },
  { fd: 7, file: null, state: 'null' },
];

export const ExitFdCleanupHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* FD table visual */}
    <div>
      <SectionLabel accent={color.region.process.fg}>
        fdtable before exit_files() · fs/file.c
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '6px',
          }}
        >
          {FD_TABLE.map((entry) => {
            const isOpen = entry.state === 'open';
            return (
              <div
                key={entry.fd}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: `${space[2]} ${space[3]}`,
                  borderRadius: radius.sm,
                  background: isOpen ? color.bg.surface : 'transparent',
                  border: isOpen
                    ? `1px solid ${color.region.process.fg}55`
                    : `1px dashed ${color.border.subtle}`,
                  opacity: isOpen ? 1 : 0.4,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: font.family.mono,
                    fontSize: '10px',
                    color: isOpen ? color.region.process.fg : color.text.dim,
                    fontWeight: 700,
                  }}>
                    fd={entry.fd}
                  </span>
                  <span style={{
                    fontFamily: font.family.mono,
                    fontSize: '8px',
                    color: isOpen ? color.accent.success : color.text.dim,
                  }}>
                    {isOpen ? 'OPEN' : '—'}
                  </span>
                </div>
                <span style={{
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: isOpen ? color.text.secondary : color.text.dim,
                  wordBreak: 'break-word',
                }}>
                  {entry.file ?? 'unused'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: space[3],
          paddingTop: space[3],
          borderTop: `1px solid ${color.border.subtle}`,
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}>
          <span style={{ color: color.pulse, fontWeight: 700 }}>close_files()</span>{' '}
          iterates fd[] array, calling filp_close() for each open fd.
          Each filp_close() decrements f_count; when zero, the struct file is freed.
        </div>
      </div>
    </div>

    {/* Reference count chain */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="files_struct"
        type="refcount → 0"
        region="process"
        fields={[
          { label: 'count', value: '0 ← last ref', highlight: true },
          { label: 'fdt', value: '→ fdtable' },
          { label: 'max_fds', value: '256' },
        ]}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        minWidth: '60px',
      }}>
        <svg width="50" height="30" viewBox="0 0 50 30">
          <line x1="0" y1="15" x2="40" y2="15" stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#fd-arrow)" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </line>
          <defs>
            <marker id="fd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color.pulse} />
            </marker>
          </defs>
        </svg>
      </div>
      <StructCard
        name="struct file"
        type="filp_close()"
        region="process"
        fields={[
          { label: 'f_count', value: '0 → freed', highlight: true },
          { label: 'f_dentry', value: '→ dput()' },
          { label: 'f_inode', value: '→ iput()' },
          { label: 'f_op', value: '→ release()' },
        ]}
      />
    </div>

    {/* Code */}
    <div>
      <SectionLabel accent={color.region.process.fg}>put_files_struct() and close_files()</SectionLabel>
      <CodeBlock>{`void put_files_struct(struct files_struct *files)
{
    if (atomic_dec_and_test(&files->count)) {
        close_files(files);      /* close all open fds */
        __free_fdtable(fdt);
        kmem_cache_free(files_cachep, files);
    }
}

static void close_files(struct files_struct *files)
{
    struct fdtable *fdt = files_fdtable(files);
    for (i = 0; i < fdt->max_fds; i++) {
        struct file *file = fdt->fd[i];
        if (file) {
            filp_close(file, files);  /* fput() → release */
        }
    }
}`}</CodeBlock>
    </div>
  </div>
);

const ExitFdCleanup: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="exit_files() → put_files_struct() → close_files() → filp_close()"
    hero={<ExitFdCleanupHero />}
  />
);

export default ExitFdCleanup;
