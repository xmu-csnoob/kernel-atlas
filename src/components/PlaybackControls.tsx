import React from 'react';
import { color, font, space, radius, motion } from '../design/tokens';
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
  const isPlaying = state.status === 'playing';
  const atStart = state.currentStep === 0 && !state.isTransitioning;
  const atEnd = state.currentStep === numSteps - 1 && !state.isTransitioning;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: space[3],
        padding: `${space[2]} ${space[3]}`,
        background: color.bg.surface,
        borderRadius: radius.lg,
        border: `1px solid ${color.border.subtle}`,
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
        playback
      </span>

      <IconButton
        onClick={controls.stepBackward}
        disabled={atStart}
        title="Step back"
        label="◂◂"
      />

      <IconButton
        onClick={isPlaying ? controls.pause : controls.play}
        primary
        title={isPlaying ? 'Pause' : 'Play'}
        label={isPlaying ? '❚❚' : '▶'}
        wide
      />

      <IconButton
        onClick={controls.stepForward}
        disabled={atEnd}
        title="Step forward"
        label="▸▸"
      />

      <IconButton
        onClick={controls.reset}
        title="Reset"
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
          minWidth: '300px',
          flex: 1,
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
            textAlign: 'right',
          }}
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
