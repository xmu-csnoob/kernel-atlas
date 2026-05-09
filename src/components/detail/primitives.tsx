import React from 'react';
import type { DetailNode } from '../../data/types';
import { color, font, space, radius } from '../../design/tokens';
import type { Region } from '../../design/tokens';
import { regionPalette } from '../../design/tokens';

// ─── Section heading ─────────────────────────────────────────────────────────
export const SectionLabel: React.FC<{ children: React.ReactNode; accent?: string }> = ({
  children,
  accent,
}) => (
  <div
    style={{
      fontFamily: font.family.mono,
      fontSize: font.size.xs,
      fontWeight: font.weight.bold,
      color: accent ?? color.text.muted,
      letterSpacing: font.letterSpacing.label,
      textTransform: 'uppercase',
      marginBottom: space[2],
    }}
  >
    {children}
  </div>
);

// ─── Code block ─────────────────────────────────────────────────────────────
export const CodeBlock: React.FC<{
  lang?: string;
  children: React.ReactNode;
  compact?: boolean;
}> = ({ children, compact }) => (
  <pre
    style={{
      margin: 0,
      background: color.bg.inset,
      border: `1px solid ${color.border.subtle}`,
      borderRadius: radius.md,
      padding: compact ? `${space[2]} ${space[3]}` : space[3],
      fontFamily: font.family.mono,
      fontSize: compact ? font.size.xs : font.size.sm,
      color: '#a5d6a7',
      overflowX: 'auto',
      lineHeight: 1.55,
    }}
  >
    {children}
  </pre>
);

// ─── File:line ref chip ──────────────────────────────────────────────────────
export const FileRef: React.FC<{ file: string; line: number }> = ({ file, line }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: font.family.mono,
      fontSize: font.size.xs,
      color: color.accent.primary,
      background: 'rgba(77, 208, 225, 0.08)',
      border: `1px solid rgba(77, 208, 225, 0.3)`,
      padding: '1px 6px',
      borderRadius: radius.sm,
      letterSpacing: '-0.01em',
    }}
  >
    {file}:{line}
  </span>
);

// ─── DataStruct chips ────────────────────────────────────────────────────────
export const StructChips: React.FC<{ ids: string[] }> = ({ ids }) => {
  if (ids.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {ids.map(id => (
        <span
          key={id}
          style={{
            background: 'rgba(149, 117, 205, 0.12)',
            border: `1px solid rgba(149, 117, 205, 0.4)`,
            color: color.region.kernel.fg,
            borderRadius: radius.sm,
            padding: '1px 6px',
            fontFamily: font.family.mono,
            fontSize: '9.5px',
          }}
        >
          {id}
        </span>
      ))}
    </div>
  );
};

// ─── Source card (used in source-refs row) ──────────────────────────────────
export const SourceCard: React.FC<{ detailNode: DetailNode; region: Region }> = ({
  detailNode,
  region,
}) => {
  const palette = regionPalette(region);
  const isHardware = detailNode.type === 'hardware';

  return (
    <div
      style={{
        background: color.bg.inset,
        border: `1px solid ${color.border.subtle}`,
        borderRadius: radius.md,
        padding: space[3],
        flex: '1 1 240px',
        minWidth: '240px',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: space[2],
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: space[2], flexWrap: 'wrap' }}>
        <strong
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            color: palette.accent,
            fontWeight: font.weight.semibold,
            wordBreak: 'break-word',
          }}
        >
          {detailNode.title}
        </strong>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: '8.5px',
            color: color.text.dim,
            letterSpacing: font.letterSpacing.wider,
            textTransform: 'uppercase',
          }}
        >
          [{detailNode.type}]
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.55,
        }}
      >
        {detailNode.description}
      </p>

      {/* Data structures */}
      <StructChips ids={detailNode.data_structures} />

      {/* Source / hardware block */}
      {!isHardware && detailNode.source_ref && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <FileRef file={detailNode.source_ref.file} line={detailNode.source_ref.line} />
          <CodeBlock compact>{detailNode.source_ref.snippet}</CodeBlock>
        </div>
      )}
      {isHardware && detailNode.hw_description && (
        <div
          style={{
            background: 'rgba(239, 83, 80, 0.05)',
            border: `1px solid rgba(239, 83, 80, 0.25)`,
            borderRadius: radius.sm,
            padding: `${space[2]} ${space[3]}`,
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: '#ffcc80',
            lineHeight: 1.5,
          }}
        >
          {detailNode.hw_description}
          <div
            style={{
              marginTop: space[1],
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: color.text.dim,
              letterSpacing: font.letterSpacing.wider,
            }}
          >
            no kernel source
          </div>
        </div>
      )}
      {!isHardware && !detailNode.source_ref && (
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.dim,
          }}
        >
          source pending
        </div>
      )}
    </div>
  );
};

// ─── Generic struct card ─────────────────────────────────────────────────────
export const StructCard: React.FC<{
  name: string;
  type?: string;
  fields: { label: string; value: string; highlight?: boolean }[];
  width?: string | number;
  region?: Region;
  pointerOut?: string; // label to show as outgoing pointer
}> = ({ name, type, fields, width, region, pointerOut }) => {
  const accent = region ? regionPalette(region).fg : color.region.kernel.fg;
  return (
    <div
      style={{
        background: color.bg.elevated,
        border: `1px solid ${accent}55`,
        borderRadius: radius.md,
        padding: space[3],
        width: width ?? 'auto',
        minWidth: '180px',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.2)`,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: space[2],
          marginBottom: space[2],
          paddingBottom: space[2],
          borderBottom: `1px solid ${color.border.subtle}`,
        }}
      >
        <strong
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            color: accent,
            fontWeight: font.weight.bold,
          }}
        >
          {name}
        </strong>
        {type && (
          <span
            style={{
              fontFamily: font.family.mono,
              fontSize: '9px',
              color: color.text.dim,
              letterSpacing: font.letterSpacing.wide,
              textTransform: 'uppercase',
            }}
          >
            {type}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {fields.map(f => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              padding: '2px 0',
              opacity: f.highlight ? 1 : 0.85,
            }}
          >
            <span style={{ color: f.highlight ? color.accent.primary : color.text.muted }}>
              {f.label}
            </span>
            <span
              style={{
                color: f.highlight ? color.accent.primary : color.text.secondary,
                fontWeight: f.highlight ? font.weight.semibold : font.weight.regular,
                marginLeft: space[3],
              }}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
      {pointerOut && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '-10px',
            transform: 'translateY(-50%)',
            fontFamily: font.family.mono,
            fontSize: '9px',
            color: accent,
            background: color.bg.canvas,
            padding: '0 4px',
            borderRadius: radius.sm,
          }}
        >
          {pointerOut} →
        </div>
      )}
    </div>
  );
};
