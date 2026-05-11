import React from 'react';
import { color, font, space, radius, motion, shadow } from '../design/tokens';
import { useLanguage } from '../i18n/useLanguage';
import { zh } from '../i18n/zh';
import type { PlaybackState, PlaybackControls as Controls } from '../hooks/usePlayback';

interface PlaybackControlsProps {
  state: PlaybackState;
  controls: Controls;
  numSteps: number;
  stepLabels: string[];
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  state,
  controls,
  numSteps,
  stepLabels,
}) => {
  const { lang } = useLanguage();
  const t = zh.playback;
  const isPlaying = state.status === 'playing';
  const atStart = state.currentStep === 0 && !state.isTransitioning;
  const atEnd = state.currentStep === numSteps - 1 && !state.isTransitioning;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: `${space[2]} ${space[3]}`,
        padding: `${space[2]} ${space[3]}`,
        background: color.bg.surface,
        borderRadius: radius.lg,
        border: `1px solid ${color.border.subtle}`,
        boxShadow: shadow.md,
        position: 'sticky',
        bottom: space[3],
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
          letterSpacing: font.letterSpacing.label,
          textTransform: 'uppercase',
          marginRight: space[1],
        }}
      >
        {lang === 'zh' ? t.label : 'playback'}
      </span>

      <IconButton
        onClick={controls.stepBackward}
        disabled={atStart}
        title={lang === 'zh' ? t.stepBackward : 'Step back'}
        label="◂◂"
      />

      <IconButton
        onClick={isPlaying ? controls.pause : controls.play}
        primary
        title={isPlaying ? (lang === 'zh' ? t.pause : 'Pause') : (lang === 'zh' ? t.play : 'Play')}
        label={isPlaying ? '❚❚' : '▶'}
        wide
      />

      <IconButton
        onClick={controls.stepForward}
        disabled={atEnd}
        title={lang === 'zh' ? t.stepForward : 'Step forward'}
        label="▸▸"
      />

      <IconButton
        onClick={controls.reset}
        title={lang === 'zh' ? t.reset : 'Reset'}
        label="⟲"
        disabled={state.status === 'idle'}
      />

      {/* Scrubber + label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[3],
          marginLeft: space[2],
          minWidth: '180px',
          flex: '1 1 200px',
        }}
      >
        <input
          type="range"
          min={0}
          max={numSteps - 1}
          step={1}
          value={state.currentStep}
          onChange={e => controls.setStep(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            accentColor: color.accent.primary,
            cursor: 'pointer',
          }}
        />
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            color: color.accent.primary,
            minWidth: '160px',
            flex: '0 1 220px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={`[${state.currentStep + 1}/${numSteps}] ${stepLabels[state.currentStep]}`}
        >
          [{state.currentStep + 1}/{numSteps}] {stepLabels[state.currentStep]}
        </span>
      </div>
    </div>
  );
};

interface IconBtnProps {
  onClick: () => void;
  label: string;
  title: string;
  primary?: boolean;
  wide?: boolean;
  disabled?: boolean;
}

const IconButton: React.FC<IconBtnProps> = ({ onClick, label, title, primary, wide, disabled }) => {
  const [hover, setHover] = React.useState(false);
  const baseBg = primary ? color.accent.primary : 'transparent';
  const hoverBg = primary ? color.accent.primary : color.bg.elevated;
  const textColor = primary ? color.bg.canvas : disabled ? color.text.dim : color.text.secondary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: wide ? '40px' : '32px',
        height: '32px',
        background: hover && !disabled ? hoverBg : baseBg,
        color: textColor,
        border: `1px solid ${primary ? 'transparent' : color.border.subtle}`,
        borderRadius: radius.md,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: font.family.mono,
        fontSize: '11px',
        fontWeight: font.weight.bold,
        opacity: disabled ? 0.4 : 1,
        transition: `background ${motion.duration.fast}ms ${motion.ease.out}, color ${motion.duration.fast}ms`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {label}
    </button>
  );
};

export default PlaybackControls;
