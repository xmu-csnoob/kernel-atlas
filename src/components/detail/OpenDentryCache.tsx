import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

// Visualize the dentry hash table with some entries
const HASH_BUCKETS = 16;
const BUCKET_ENTRIES: { bucket: number; name: string; hit: boolean }[] = [
  { bucket: 0, name: 'etc', hit: false },
  { bucket: 2, name: 'usr', hit: false },
  { bucket: 3, name: 'home', hit: false },
  { bucket: 5, name: 'passwd', hit: true },
  { bucket: 5, name: 'group', hit: false },
  { bucket: 7, name: 'bin', hit: false },
  { bucket: 9, name: 'lib', hit: false },
  { bucket: 10, name: 'tmp', hit: false },
  { bucket: 12, name: 'var', hit: false },
  { bucket: 14, name: 'dev', hit: false },
];

export const OpenDentryCacheHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Hash table visualization */}
    <div>
      <SectionLabel accent={color.region.vfs.fg}>
        d_hash table  ·  fs/dcache.c  ·  d_lookup()
      </SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '4px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {Array.from({ length: HASH_BUCKETS }).map((_, i) => {
          const entries = BUCKET_ENTRIES.filter((e) => e.bucket === i);
          const hasHit = entries.some((e) => e.hit);
          return (
            <div
              key={i}
              style={{
                background: hasHit
                  ? 'rgba(102, 187, 106, 0.15)'
                  : color.bg.surface,
                border: `1px solid ${hasHit ? color.accent.success + '66' : color.border.subtle}`,
                borderRadius: radius.sm,
                padding: `${space[1]} ${space[2]}`,
                minHeight: '48px',
              }}
            >
              <div
                style={{
                  fontFamily: font.family.mono,
                  fontSize: '8px',
                  color: color.text.dim,
                  marginBottom: '2px',
                }}
              >
                bucket {i}
              </div>
              {entries.map((e) => (
                <div
                  key={e.name}
                  style={{
                    fontFamily: font.family.mono,
                    fontSize: '9px',
                    color: e.hit ? color.accent.success : color.text.secondary,
                    fontWeight: e.hit ? 700 : 400,
                    padding: '1px 0',
                  }}
                >
                  {e.hit ? '● ' : '○ '}
                  {e.name}
                </div>
              ))}
              {entries.length === 0 && (
                <div
                  style={{
                    fontFamily: font.family.mono,
                    fontSize: '9px',
                    color: color.text.dim,
                  }}
                >
                  (empty)
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        hash(parent_dentry, &quot;passwd&quot;) → bucket{' '}
        <span style={{ color: color.accent.success }}>5</span> →{' '}
        <span style={{ color: color.accent.success }}>cache hit</span> → dget()
      </div>
    </div>

    {/* dcache flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="dentry (hit)"
        type="dcache"
        region="vfs"
        fields={[
          { label: 'd_count', value: '2 → 3', highlight: true },
          { label: 'd_inode', value: '→ inode #4821' },
          { label: 'd_hash', value: 'bucket 5' },
          { label: 'd_flags', value: 'DCACHE_REFERENCED' },
        ]}
      />
      <StructCard
        name="dentry (miss)"
        type="dcache"
        region="vfs"
        fields={[
          { label: 'source', value: 'kmem_cache_alloc()', highlight: true },
          { label: 'd_name', value: 'new component' },
          { label: 'd_parent', value: '→ parent dentry' },
          { label: 'd_subdirs', value: '{}' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.vfs.fg}>The dcache invariant</SectionLabel>
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
          <span style={{ color: color.region.vfs.accent }}>d_lookup</span>{' '}
          hashes <span style={{ color: color.accent.primary }}>(parent, name)</span> → bucket.
          On{' '}
          <span style={{ color: color.accent.success }}>hit</span>: dget() bumps refcount.
          On{' '}
          <span style={{ color: color.pulse }}>miss</span>:{' '}
          <span style={{ color: color.region.vfs.accent }}>d_alloc()</span> creates new
          dentry from slab, links to parent d_subdirs, then filesystem{' '}
          <span style={{ color: color.accent.primary }}>lookup()</span> fills d_inode.
        </div>
      </div>
    </div>
  </div>
);

const OpenDentryCache: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="dentry cache: hash lookup → hit or d_alloc()"
    hero={<OpenDentryCacheHero />}
  />
);

export default OpenDentryCache;
