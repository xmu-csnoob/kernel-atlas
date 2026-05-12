import React from 'react';
import { color, font, space, radius, motion } from '../design/tokens';
import { useLanguage } from '../i18n/useLanguage';

const Nav: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${space[3]} ${space[6]}`,
        background: color.bg.canvas,
        borderBottom: `1px solid ${color.border.subtle}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: space[3] }}>
        <span
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.lg,
            fontWeight: font.weight.bold,
            color: color.text.primary,
            letterSpacing: font.letterSpacing.tight,
          }}
        >
          Kernel
          <span style={{ color: color.accent.primary, marginLeft: '2px' }}>Atlas</span>
        </span>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
            letterSpacing: font.letterSpacing.wide,
            textTransform: 'uppercase',
          }}
        >
          Linux 2.6.32 LTS
        </span>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
        aria-label="Switch language"
        style={{
          padding: `${space[1]} ${space[3]}`,
          borderRadius: radius.md,
          border: `1px solid ${color.border.subtle}`,
          background: color.bg.surface,
          color: color.text.secondary,
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          fontWeight: font.weight.medium,
          cursor: 'pointer',
          transition: `background ${motion.duration.fast}ms ${motion.ease.out}, color ${motion.duration.fast}ms ${motion.ease.out}`,
          letterSpacing: font.letterSpacing.wide,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = color.bg.elevated;
          (e.currentTarget as HTMLButtonElement).style.color = color.text.primary;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = color.bg.surface;
          (e.currentTarget as HTMLButtonElement).style.color = color.text.secondary;
        }}
      >
        {lang === 'en' ? 'EN' : '中'}
      </button>
    </nav>
  );
};

export default Nav;
