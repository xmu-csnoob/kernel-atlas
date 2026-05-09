import React from 'react';
import { color, font, space, radius, motion } from '../design/tokens';

interface SyscallSelectorProps {
  syscalls: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

const SyscallSelector: React.FC<SyscallSelectorProps> = ({ syscalls, selected, onSelect }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '2px',
        padding: '3px',
        background: color.bg.surface,
        borderRadius: radius.lg,
        border: `1px solid ${color.border.subtle}`,
      }}
    >
      <span
        style={{
          alignSelf: 'center',
          padding: `0 ${space[2]} 0 ${space[3]}`,
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
          letterSpacing: font.letterSpacing.label,
          textTransform: 'uppercase',
        }}
      >
        syscall
      </span>
      {syscalls.map(sc => {
        const isSelected = sc.id === selected;
        return (
          <button
            key={sc.id}
            onClick={() => onSelect(sc.id)}
            style={{
              padding: `${space[1]} ${space[4]}`,
              borderRadius: radius.md,
              border: 'none',
              background: isSelected ? color.accent.primary : 'transparent',
              color: isSelected ? color.bg.canvas : color.text.secondary,
              fontFamily: font.family.mono,
              fontSize: font.size.base,
              fontWeight: isSelected ? font.weight.semibold : font.weight.medium,
              cursor: 'pointer',
              transition: `background ${motion.duration.fast}ms ${motion.ease.out}, color ${motion.duration.fast}ms ${motion.ease.out}`,
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                (e.currentTarget as HTMLButtonElement).style.background = color.bg.elevated;
                (e.currentTarget as HTMLButtonElement).style.color = color.text.primary;
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = color.text.secondary;
              }
            }}
          >
            {sc.name}
          </button>
        );
      })}
    </div>
  );
};

export default SyscallSelector;
