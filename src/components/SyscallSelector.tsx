import React from 'react';
import { color, font, space, radius, motion } from '../design/tokens';
import { useLanguage } from '../i18n/useLanguage';

interface SyscallSelectorProps {
  syscalls: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

const GROUPS: { labelEn: string; labelZh: string; ids: string[] }[] = [
  { labelEn: 'File I/O', labelZh: '文件I/O', ids: ['read', 'write', 'open'] },
  { labelEn: 'Process', labelZh: '进程', ids: ['fork', 'clone', 'execve', 'exit'] },
  { labelEn: 'Memory', labelZh: '内存', ids: ['mmap', 'brk'] },
  { labelEn: 'Network', labelZh: '网络', ids: ['socket', 'epoll_wait'] },
  { labelEn: 'Device', labelZh: '设备', ids: ['ioctl'] },
];

const SyscallSelector: React.FC<SyscallSelectorProps> = ({ syscalls, selected, onSelect }) => {
  const { lang } = useLanguage();
  const syscallMap = Object.fromEntries(syscalls.map(s => [s.id, s]));

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: `${space[2]} ${space[3]}`,
        padding: `${space[2]} ${space[3]}`,
        background: color.bg.surface,
        borderRadius: radius.lg,
        border: `1px solid ${color.border.subtle}`,
      }}
    >
      {GROUPS.map((group, gi) => (
        <React.Fragment key={group.labelEn}>
          {gi > 0 && (
            <div style={{ width: '1px', alignSelf: 'stretch', background: color.border.subtle, margin: `0 ${space[1]}` }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: font.family.mono,
                fontSize: '9px',
                color: color.text.dim,
                letterSpacing: font.letterSpacing.wider,
                textTransform: 'uppercase',
                marginRight: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {lang === 'zh' ? group.labelZh : group.labelEn}
            </span>
            {group.ids.map(id => {
              const sc = syscallMap[id];
              if (!sc) return null;
              const isSelected = sc.id === selected;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelect(sc.id)}
                  style={{
                    padding: `${space[1]} ${space[3]}`,
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
        </React.Fragment>
      ))}
    </div>
  );
};

export default SyscallSelector;
