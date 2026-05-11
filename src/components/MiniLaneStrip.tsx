import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { SyscallData } from '../data/types';
import { regionOf, regionPalette, REGION_LABEL, color, font, space } from '../design/tokens';
import type { Region } from '../design/tokens';

// ─── Geometry ─────────────────────────────────────────────────────────────────
const MINI_LANE_H = 22;
const MINI_LANE_GAP = 3;
const MINI_NODE_W = 72;
const MINI_NODE_H = 18;
const MINI_PAD_Y = 8;
const MINI_LABEL_W = 38;
const MINI_PAD_X = 16;
// Minimum SVG width — below this the strip scrolls horizontally
const MIN_SVG_W = 480;

const REGION_ICON: Record<Region, string> = {
  user: '◔',
  vfs: '◇',
  fs: '◆',
  mm: '○',
  net: '◎',
  sched: '●',
  process: '◐',
  signal: '◑',
  driver: '◒',
  block: '◓',
  hardware: '▣',
  return: '↺',
};

const LANE_ORDER: Region[] = [
  'user', 'vfs', 'fs', 'mm', 'net', 'sched',
  'process', 'signal', 'driver', 'block', 'hardware', 'return',
];

/** Distribute numCols node centers evenly across the available node zone. */
function spreadColX(position: number, svgW: number, numCols: number): number {
  const nodeZone = svgW - MINI_LABEL_W - MINI_PAD_X * 2;
  const step = nodeZone / numCols;
  return MINI_LABEL_W + MINI_PAD_X + position * step + step / 2;
}

interface MiniLaneStripProps {
  data: SyscallData;
  activeNodeId: string | null;
  onChipClick: (id: string) => void;
}

const MiniLaneStrip: React.FC<MiniLaneStripProps> = ({ data, activeNodeId, onChipClick }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [svgW, setSvgW] = useState(MIN_SVG_W);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setSvgW(Math.max(entry.contentRect.width, MIN_SVG_W));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const sortedNodes = useMemo(
    () => [...data.main_flow].sort((a, b) => a.position - b.position),
    [data]
  );

  const activeLanes = useMemo(() => {
    const used = new Set<Region>();
    sortedNodes.forEach(n => used.add(regionOf(n.id)));
    return LANE_ORDER.filter(r => used.has(r));
  }, [sortedNodes]);

  const numCols = sortedNodes.length;
  const svgH = MINI_PAD_Y * 2 + activeLanes.length * MINI_LANE_H + (activeLanes.length - 1) * MINI_LANE_GAP;

  const layouts = useMemo(() => {
    return sortedNodes.map(n => {
      const region = regionOf(n.id);
      const laneIdx = activeLanes.indexOf(region);
      const cy = MINI_PAD_Y + laneIdx * (MINI_LANE_H + MINI_LANE_GAP) + MINI_LANE_H / 2;
      const cx = spreadColX(n.position, svgW, numCols);
      return { node: n, region, cx, cy, laneIdx };
    });
  }, [sortedNodes, activeLanes, svgW, numCols]);

  // SW/HW boundary — between step 3 and 4 for read()
  const showBoundary = data.id === 'read' && layouts.length >= 5;
  const boundaryX = showBoundary
    ? (spreadColX(3, svgW, numCols) + MINI_NODE_W / 2 + spreadColX(4, svgW, numCols) - MINI_NODE_W / 2) / 2
    : null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'sticky',
        top: 56,
        zIndex: 20,
        background: color.bg.canvas,
        borderBottom: `1px solid ${color.border.subtle}`,
        padding: `${space[2]} ${space[3]}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        overflowX: 'auto',
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        style={{ display: 'block' }}
      >
        <defs>
          {activeLanes.map(region => {
            const palette = regionPalette(region);
            return (
              <marker
                key={region}
                id={`mini-arrow-${region}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.fg} opacity={0.85} />
              </marker>
            );
          })}
        </defs>

        {/* Lane backgrounds — stretch full width */}
        {activeLanes.map((region, i) => {
          const palette = regionPalette(region);
          const y = MINI_PAD_Y + i * (MINI_LANE_H + MINI_LANE_GAP);
          return (
            <g key={region}>
              <rect
                x={MINI_LABEL_W}
                y={y}
                width={svgW - MINI_LABEL_W}
                height={MINI_LANE_H}
                rx={3}
                fill={palette.bg}
                opacity={0.35}
              />
              <text
                x={MINI_LABEL_W - 4}
                y={y + MINI_LANE_H / 2 + 4}
                textAnchor="end"
                fontFamily={font.family.mono}
                fontSize={8}
                fill={palette.fg}
                fontWeight={700}
                letterSpacing={1}
              >
                {REGION_LABEL[region].toUpperCase().slice(0, 6)}
              </text>
            </g>
          );
        })}

        {/* SW/HW boundary */}
        {showBoundary && boundaryX !== null && (
          <g>
            <line
              x1={boundaryX}
              y1={MINI_PAD_Y}
              x2={boundaryX}
              y2={svgH - MINI_PAD_Y}
              stroke={color.border.default}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <text
              x={boundaryX}
              y={svgH - 1}
              textAnchor="middle"
              fontFamily={font.family.mono}
              fontSize={7}
              fill={color.text.dim}
              letterSpacing={0.5}
            >
              SW · HW
            </text>
          </g>
        )}

        {/* Bezier edges */}
        {layouts.slice(0, -1).map((layout, i) => {
          const next = layouts[i + 1];
          const x1 = layout.cx + MINI_NODE_W / 2 + 1;
          const x2 = next.cx - MINI_NODE_W / 2 - 3;
          const dx = x2 - x1;
          const d = `M ${x1} ${layout.cy} C ${x1 + dx * 0.45} ${layout.cy}, ${x2 - dx * 0.45} ${next.cy}, ${x2} ${next.cy}`;
          const palette = regionPalette(layout.region);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={palette.fg}
              strokeWidth={1.2}
              opacity={0.45}
              markerEnd={`url(#mini-arrow-${layout.region})`}
            />
          );
        })}

        {/* Node chips */}
        {layouts.map(({ node, region, cx, cy }) => {
          const palette = regionPalette(region);
          const isActive = node.id === activeNodeId;
          const x = cx - MINI_NODE_W / 2;
          const y = cy - MINI_NODE_H / 2;

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onChipClick(node.id)}
              role="button"
              aria-label={node.title}
            >
              {/* Active glow */}
              {isActive && (
                <rect
                  x={x - 3}
                  y={y - 3}
                  width={MINI_NODE_W + 6}
                  height={MINI_NODE_H + 6}
                  rx={5}
                  fill={palette.fg}
                  opacity={0.15}
                >
                  <animate attributeName="opacity" values="0.08;0.22;0.08" dur="1.2s" repeatCount="indefinite" />
                </rect>
              )}

              {/* Chip background */}
              <rect
                x={x}
                y={y}
                width={MINI_NODE_W}
                height={MINI_NODE_H}
                rx={3}
                fill={isActive ? palette.fg : palette.bg}
                stroke={palette.fg}
                strokeWidth={isActive ? 0 : 0.8}
                opacity={isActive ? 1 : 0.85}
              />

              {/* Icon */}
              <text
                x={x + 10}
                y={cy + 4}
                textAnchor="middle"
                fontFamily={font.family.mono}
                fontSize={9}
                fill={isActive ? color.bg.canvas : palette.fg}
                fontWeight={700}
              >
                {REGION_ICON[region]}
              </text>

              {/* Label — meaningful short title */}
              <text
                x={cx + 6}
                y={cy + 4}
                textAnchor="middle"
                fontFamily={font.family.mono}
                fontSize={8}
                fill={isActive ? color.bg.canvas : palette.accent}
                fontWeight={isActive ? 700 : 400}
              >
                {node.title.split(/\s[—–]\s/)[0].slice(0, 10)}
              </text>

              <title>{node.title}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MiniLaneStrip;
