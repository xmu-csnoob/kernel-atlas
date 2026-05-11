import React from 'react';
import type { DetailNode } from '../../data/types';
import { color, font, space, radius } from '../../design/tokens';
import type { Region } from '../../design/tokens';
import { regionPalette } from '../../design/tokens';
import { useLanguage } from '../../i18n/useLanguage';
import { zh } from '../../i18n/zh';

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
  <a
    href={`https://elixir.bootlin.com/linux/v2.6.32/source/${file}#L${line}`}
    target="_blank"
    rel="noopener noreferrer"
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
      textDecoration: 'none',
      cursor: 'pointer',
    }}
  >
    {file}:{line} ↗
  </a>
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
            color: color.text.secondary,
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

// ─── Helpers for type-badge translation ─────────────────────────────────────
function typeBadgeZh(type: string): string {
  const map: Record<string, string> = {
    code: zh.detail.badgeCode,
    concept: zh.detail.badgeConcept,
    data: zh.detail.badgeData,
    hardware: zh.detail.badgeHardware,
  };
  return map[type] ?? `[${type}]`;
}

// ─── Type-badge colors ───────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, { bg: string; fg: string }> = {
  code:     { bg: 'rgba(77,208,225,0.12)',  fg: '#4dd0e1' },
  concept:  { bg: 'rgba(149,117,205,0.15)', fg: '#b39ddb' },
  data:     { bg: 'rgba(100,181,246,0.12)', fg: '#64b5f6' },
  hardware: { bg: 'rgba(239,83,80,0.12)',   fg: '#ef5350' },
};

// ─── Snippet block with copy button ──────────────────────────────────────────
const SnippetBlock: React.FC<{ file: string; line: number; snippet: string; lang: string }> = ({
  file, line, snippet, lang,
}) => {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(() => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [snippet]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[2], marginTop: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FileRef file={file} line={line} />
        <button
          onClick={copy}
          title={lang === 'zh' ? '复制代码' : 'Copy snippet'}
          style={{
            background: 'transparent',
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.sm,
            padding: '1px 6px',
            fontFamily: font.family.mono,
            fontSize: '9px',
            color: copied ? '#a5d6a7' : color.text.dim,
            cursor: 'pointer',
            transition: 'color 0.2s',
            letterSpacing: '0.03em',
          }}
        >
          {copied ? (lang === 'zh' ? '已复制' : 'Copied!') : (lang === 'zh' ? '复制' : 'Copy')}
        </button>
      </div>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: `${space[2]} ${space[3]}`,
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: '#a5d6a7',
          lineHeight: 1.5,
          maxHeight: '80px',
          overflowY: 'auto',
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {snippet}
      </div>
    </div>
  );
};

// ─── Source card (used in source-refs row) ──────────────────────────────────
export const SourceCard: React.FC<{ detailNode: DetailNode; region: Region }> = ({
  detailNode,
  region,
}) => {
  const { lang } = useLanguage();
  const t = lang === 'zh' ? zh : null;
  const palette = regionPalette(region);
  const isHardware = detailNode.type === 'hardware';
  const typeColor = TYPE_COLOR[detailNode.type] ?? TYPE_COLOR.concept;

  return (
    <div
      style={{
        background: color.bg.elevated,
        border: `1px solid ${color.border.subtle}`,
        borderRadius: radius.lg,
        padding: space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: space[3],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line matching region */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${palette.fg}88, transparent)`,
        }}
      />

      {/* Type badge + title row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space[1] }}>
        <span
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            fontFamily: font.family.mono,
            fontSize: '9px',
            fontWeight: font.weight.bold,
            letterSpacing: font.letterSpacing.wider,
            textTransform: 'uppercase',
            color: typeColor.fg,
            background: typeColor.bg,
            border: `1px solid ${typeColor.fg}44`,
            borderRadius: radius.sm,
            padding: '1px 6px',
          }}
        >
          {t ? typeBadgeZh(detailNode.type) : detailNode.type}
        </span>
        <strong
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.md,
            color: palette.accent,
            fontWeight: font.weight.semibold,
            lineHeight: 1.3,
          }}
        >
          {detailNode.title}
        </strong>
      </div>

      {/* Description — 3-line clamp */}
      <p
        style={{
          margin: 0,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}
      >
        {detailNode.description}
      </p>

      {/* Data-struct chips */}
      {detailNode.data_structures.length > 0 && (
        <StructChips ids={detailNode.data_structures} />
      )}

      {/* Footer: source ref or hw note */}
      {!isHardware && detailNode.source_ref && (
        <SnippetBlock
          file={detailNode.source_ref.file}
          line={detailNode.source_ref.line}
          snippet={detailNode.source_ref.snippet}
          lang={lang}
        />
      )}
      {isHardware && detailNode.hw_description && (
        <div
          style={{
            background: 'rgba(239,83,80,0.06)',
            border: `1px solid rgba(239,83,80,0.2)`,
            borderRadius: radius.md,
            padding: `${space[2]} ${space[3]}`,
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: '#ffcc80',
            lineHeight: 1.5,
            marginTop: 'auto',
          }}
        >
          {detailNode.hw_description}
        </div>
      )}
      {!isHardware && !detailNode.source_ref && (
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.dim,
            marginTop: 'auto',
          }}
        >
          {t ? t.detail.sourcePending : '— source pending'}
        </span>
      )}
    </div>
  );
};

/** Translate known StructCard type strings to Chinese. */
function structTypeZh(en: string): string {
  const map: Record<string, string> = {
    'user process': zh.structType.userProcess,
    'kernel': zh.structType.kernel,
    'fs-specific': zh.structType.fsSpecific,
    'open file table': '打开文件表',
    'current->files': 'current->files',
    'fd → file*': 'fd → file*',
    "passwd's fd=3": "passwd's fd=3",
    'ext2_file_ops': 'ext2_file_ops',
    'filemap.c': 'filemap.c',
    'parent process': '父进程',
    'refcount +1': '引用计数 +1',
    'kernel/fork.c': 'kernel/fork.c',
    'kernel/pid.c': 'kernel/pid.c',
    'parent (PID 1234)': '父进程 (PID 1234)',
    'child (PID 1235) ← NEW': '子进程 (PID 1235) ← 新',
    'CFS scheduling unit': 'CFS 调度单元',
    'fork() return path': 'fork() 返回路径',
    'ret_from_fork': 'ret_from_fork',
    'rax': 'rax',
  };
  return map[en] ?? en;
}

// ─── Generic struct card ─────────────────────────────────────────────────────
export const StructCard: React.FC<{
  name: string;
  type?: string;
  fields: { label: string; value: string; highlight?: boolean }[];
  width?: string | number;
  region?: Region;
  pointerOut?: string; // label to show as outgoing pointer
}> = ({ name, type, fields, width, region, pointerOut }) => {
  const { lang } = useLanguage();
  const t = lang === 'zh' ? zh : null;
  const accent = region ? regionPalette(region).fg : color.text.secondary;
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
            {t ? structTypeZh(type) : type}
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
