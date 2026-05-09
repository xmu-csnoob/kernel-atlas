import React from 'react';
import { color, font, space, radius, motion } from '../design/tokens';

type View = 'syscall' | 'data-structures';

interface NavProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const VIEWS: { id: View; label: string }[] = [
  { id: 'syscall', label: 'Syscall Flow' },
  { id: 'data-structures', label: 'Data Structures' },
];

const Nav: React.FC<NavProps> = ({ activeView, onViewChange }) => {
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

      {/* View tabs */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          background: color.bg.surface,
          borderRadius: radius.lg,
          border: `1px solid ${color.border.subtle}`,
          padding: '3px',
        }}
      >
        {VIEWS.map(v => {
          const active = v.id === activeView;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              style={{
                padding: `${space[1]} ${space[4]}`,
                borderRadius: radius.md,
                border: 'none',
                background: active ? color.accent.primary : 'transparent',
                color: active ? color.bg.canvas : color.text.secondary,
                fontFamily: font.family.sans,
                fontSize: font.size.sm,
                fontWeight: active ? font.weight.semibold : font.weight.medium,
                cursor: 'pointer',
                transition: `background ${motion.duration.fast}ms ${motion.ease.out}, color ${motion.duration.fast}ms ${motion.ease.out}`,
                letterSpacing: font.letterSpacing.normal,
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = color.bg.elevated;
                  (e.currentTarget as HTMLButtonElement).style.color = color.text.primary;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = color.text.secondary;
                }
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Nav;
