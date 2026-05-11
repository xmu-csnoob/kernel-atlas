import React from 'react';
import type { MainFlowNode } from '../data/types';
import type { Region } from '../design/tokens';
import {
  color, font, space, radius,
  regionPalette, REGION_LABEL, REGION_LABEL_ZH,
} from '../design/tokens';
import { useLanguage } from '../i18n/useLanguage';
import { zh } from '../i18n/zh';
import SourceRefRow from './SourceRefRow';

interface StageSectionProps {
  node: MainFlowNode;
  region: Region;
  hero: React.ReactNode;
  isActive: boolean;
  stepIndex: number;
  totalSteps: number;
}

const StageSection: React.FC<StageSectionProps> = ({
  node, region, hero, isActive, stepIndex, totalSteps,
}) => {
  const { lang } = useLanguage();
  const t = lang === 'zh' ? zh : null;
  const palette = regionPalette(region);
  const stepNum = String(stepIndex + 1).padStart(2, '0');
  const totalNum = String(totalSteps).padStart(2, '0');

  return (
    <section
      id={node.id}
      data-active={isActive ? 'true' : 'false'}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${palette.fg}08 0%, ${color.bg.surface} 60%)`
          : color.bg.surface,
        border: `1px solid ${isActive ? palette.fg + '44' : color.border.subtle}`,
        borderRadius: radius.xl,
        padding: `${space[6]} ${space[6]}`,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: '216px',
        transition: 'border-color 0.3s ease, background 0.3s ease',
        '--play-state': isActive ? 'running' : 'paused',
      } as React.CSSProperties}
    >
      {/* Left accent bar — thicker and brighter when active */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: isActive ? '5px' : '3px',
          background: isActive
            ? palette.fg
            : `linear-gradient(180deg, ${palette.fg}88 0%, ${palette.fg}22 100%)`,
          transition: 'width 0.3s ease, background 0.3s ease',
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: space[4],
          paddingBottom: space[4],
          borderBottom: `1px solid ${color.border.subtle}`,
          gap: space[4],
        }}
      >
        {/* Left: step badge + region tag + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
          {/* Step counter */}
          <span
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              fontWeight: font.weight.bold,
              color: isActive ? palette.fg : color.text.dim,
              background: isActive ? `${palette.fg}18` : color.bg.elevated,
              border: `1px solid ${isActive ? palette.fg + '55' : color.border.subtle}`,
              borderRadius: radius.sm,
              padding: `2px ${space[2]}`,
              letterSpacing: font.letterSpacing.wide,
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {stepNum} / {totalNum}
          </span>

          {/* Region label */}
          <span
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: palette.fg,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              fontWeight: font.weight.bold,
            }}
          >
            {t ? REGION_LABEL_ZH[region] : REGION_LABEL[region]}
          </span>

          {/* Node title */}
          <span
            style={{
              fontFamily: font.family.sans,
              fontSize: font.size.xl,
              color: color.text.primary,
              fontWeight: font.weight.semibold,
              letterSpacing: font.letterSpacing.tight,
            }}
          >
            {node.title.replace(/\s—\s.*$/, '')}
          </span>
        </div>

      </div>

      {/* ── Description ────────────────────────────────────────────────────── */}
      {node.description && (
        <p
          style={{
            margin: `0 0 ${space[5]} 0`,
            fontSize: font.size.md,
            color: color.text.secondary,
            lineHeight: 1.7,
            maxWidth: '760px',
          }}
        >
          {node.description}
        </p>
      )}

      {/* ── Hero visualization ──────────────────────────────────────────────── */}
      {hero && (
        <div style={{ marginBottom: space[6] }}>
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.text.muted,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[3],
            }}
          >
            {lang === 'zh' ? '可视化' : 'Visualization'}
          </div>
          <div
            style={{
              background: color.bg.canvas,
              border: `1px solid ${color.border.subtle}`,
              borderRadius: radius.lg,
              padding: space[5],
              overflow: 'auto',
            }}
          >
            {hero}
          </div>
        </div>
      )}

      {/* ── Source refs ─────────────────────────────────────────────────────── */}
      <SourceRefRow detailNodes={node.detail_nodes} region={region} />
    </section>
  );
};

export default StageSection;
