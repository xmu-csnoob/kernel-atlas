import React from 'react';
import { color, font } from '../../../design/tokens';

interface AnimatedArrowProps {
  label?: string;
  subLabel?: string;
  width?: number;
  color?: string;
  animated?: boolean;
}

const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  label,
  subLabel,
  width = 100,
  color: arrowColor = color.region.kernel.fg,
  animated = true,
}) => {
  const markerId = `arr-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: `${width}px`,
        padding: '0 8px',
        gap: '2px',
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: arrowColor,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
      <svg width={width} height="20" viewBox={`0 0 ${width} 20`} preserveAspectRatio="none">
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowColor} />
          </marker>
        </defs>
        <line
          x1="0"
          y1="10"
          x2={width - 8}
          y2="10"
          stroke={arrowColor}
          strokeWidth="1.5"
          strokeDasharray={animated ? '4 4' : 'none'}
          markerEnd={`url(#${markerId})`}
          opacity={0.7}
        >
          {animated && (
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-16"
              dur="1.4s"
              repeatCount="indefinite"
            />
          )}
        </line>
      </svg>
      {subLabel && (
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: '9px',
            color: color.text.dim,
            letterSpacing: '0.05em',
          }}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
};

export default AnimatedArrow;
