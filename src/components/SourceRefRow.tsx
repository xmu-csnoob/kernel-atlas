import React from 'react';
import type { DetailNode } from '../data/types';
import type { Region } from '../design/tokens';
import { color, font, space, radius } from '../design/tokens';
import { SourceCard } from './detail/primitives';
import { useLanguage } from '../i18n/useLanguage';
import { zh } from '../i18n/zh';

interface SourceRefRowProps {
  detailNodes: DetailNode[];
  region: Region;
}

const SourceRefRow: React.FC<SourceRefRowProps> = ({ detailNodes, region }) => {
  const { lang } = useLanguage();
  const t = lang === 'zh' ? zh : null;

  if (detailNodes.length === 0) return null;

  return (
    <div
      style={{
        borderTop: `1px solid ${color.border.subtle}`,
        paddingTop: space[5],
        marginTop: space[2],
      }}
    >
      {/* Section heading */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[3],
          marginBottom: space[4],
        }}
      >
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            fontWeight: font.weight.bold,
            color: color.text.muted,
            letterSpacing: font.letterSpacing.label,
            textTransform: 'uppercase',
          }}
        >
          {t
            ? t.detail.sourceRefs.replace('{n}', String(detailNodes.length))
            : 'Kernel anchors'}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: radius.sm,
            background: color.bg.elevated,
            border: `1px solid ${color.border.subtle}`,
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            fontWeight: font.weight.bold,
            color: color.text.secondary,
          }}
        >
          {detailNodes.length}
        </span>
      </div>

      {/* Grid of cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: space[4],
        }}
      >
        {detailNodes.map(dn => (
          <SourceCard key={dn.id} detailNode={dn} region={region} />
        ))}
      </div>
    </div>
  );
};

export default SourceRefRow;
