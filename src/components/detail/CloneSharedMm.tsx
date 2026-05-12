import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const CloneSharedMmHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Shared mm_struct diagram */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        CLONE_VM path — both tasks point to same mm_struct
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
          {/* Parent task */}
          <div>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: color.region.mm.fg,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: space[2],
              fontWeight: 700,
            }}>
              Parent task_struct
            </div>
            <StructCard
              name="task_struct"
              type="PID 1234"
              region="mm"
              fields={[
                { label: 'mm', value: '→ mm_struct A', highlight: true },
                { label: 'active_mm', value: '→ mm_struct A' },
                { label: 'pid', value: '1234' },
              ]}
            />
          </div>

          {/* Arrow: share */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            paddingTop: '24px',
          }}>
            <span style={{
              fontFamily: font.family.mono,
              fontSize: '10px',
              color: color.pulse,
              fontWeight: 700,
              textAlign: 'center',
            }}>
              CLONE_VM
            </span>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="20" y1="5" x2="20" y2="30"
                stroke={color.pulse} strokeWidth="1.5" strokeDasharray="4 4"
                markerEnd="url(#vm-arrow)" opacity="0.8">
                <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
              </line>
              <defs>
                <marker id="vm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
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
              refcount++
            </span>
          </div>

          {/* Child task */}
          <div>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: color.region.return.fg,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: space[2],
              fontWeight: 700,
            }}>
              Child task_struct
            </div>
            <StructCard
              name="task_struct"
              type="PID 1235 ← NEW"
              region="return"
              fields={[
                { label: 'mm', value: '→ mm_struct A', highlight: true },
                { label: 'active_mm', value: '→ mm_struct A' },
                { label: 'pid', value: '1235' },
              ]}
            />
          </div>

          {/* Shared mm_struct */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: space[2],
            paddingTop: '24px',
          }}>
            <div style={{
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: color.text.dim,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}>
              SHARED
            </div>
            <StructCard
              name="mm_struct"
              type="refcounted"
              region="mm"
              fields={[
                { label: 'mm_users', value: '2 ← was 1', highlight: true },
                { label: 'mm_count', value: '1' },
                { label: 'mmap', value: '→ VMA list' },
                { label: 'pgd', value: '→ page tables' },
              ]}
            />
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
          <strong style={{ color: color.pulse }}>CLONE_VM:</strong>{' '}
          Both parent and child share the same{' '}
          <code style={{ color: color.accent.primary }}>mm_struct</code>.
          They see the same virtual address space — heap, mappings, and all.
          No CoW overhead. Used by pthreads and container threads.
        </div>
      </div>
    </div>

    {/* copy_files + copy_sighand row */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="files_struct"
        type="CLONE_FILES → refcount +1"
        region="mm"
        fields={[
          { label: 'count', value: '2 ← was 1', highlight: true },
          { label: 'fdt', value: '→ shared fdtable' },
          { label: 'max_fds', value: '256' },
        ]}
      />
      <StructCard
        name="sighand_struct"
        type="CLONE_SIGHAND → refcount +1"
        region="mm"
        fields={[
          { label: 'count', value: '2 ← was 1', highlight: true },
          { label: 'action[]', value: 'shared signal handlers' },
          { label: 'siglock', value: 'spinlock_t' },
        ]}
      />
      <StructCard
        name="fs_struct"
        type="CLONE_FS → refcount +1"
        region="mm"
        fields={[
          { label: 'count', value: '2 ← was 1', highlight: true },
          { label: 'pwd', value: '→ shared cwd' },
          { label: 'root', value: '→ shared root' },
        ]}
      />
    </div>
  </div>
);

const CloneSharedMm: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="CLONE_VM → shared mm_struct (threads)" hero={<CloneSharedMmHero />} />
);

export default CloneSharedMm;
