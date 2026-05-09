import React, { useMemo, useRef, useEffect } from 'react';
import type { SyscallData, MainFlowNode } from '../data/types';
import { useExpand } from '../hooks/useExpand';
import { usePlayback } from '../hooks/usePlayback';
import DetailPanel from './DetailPanel';
import PlaybackControls from './PlaybackControls';
import {
  color,
  font,
  space,
  radius,
  shadow,
  motion,
  regionOf,
  regionPalette,
  REGION_LABEL,
} from '../design/tokens';
import type { Region } from '../design/tokens';

// ─── Geometry ────────────────────────────────────────────────────────────────
const LANE_HEIGHT = 100;
const LANE_GAP = 8;
const NODE_W = 152;
const NODE_H = 80;
const COL_GAP = 36;
const PADDING_X = 32;
const PADDING_Y = 16;
const LANE_LABEL_W = 88;

const LANE_ORDER: Region[] = ['user', 'kernel', 'hardware', 'return'];

function colX(position: number): number {
  return LANE_LABEL_W + PADDING_X + position * (NODE_W + COL_GAP) + NODE_W / 2;
}

function totalWidthFor(numCols: number): number {
  return LANE_LABEL_W + PADDING_X * 2 + numCols * NODE_W + (numCols - 1) * COL_GAP;
}

interface NodeLayout {
  node: MainFlowNode;
  region: Region;
  cx: number;
  cy: number;
  laneIdx: number;
}

const REGION_ICON: Record<Region, string> = {
  user: '◔',
  kernel: '◇',
  hardware: '▣',
  return: '↺',
};

// Stage labels — what data is "in flight" at each step
const STAGE_LABELS: Record<string, string[]> = {
  read: [
    'read(3, buf, 4096)',
    'fd=3 → struct file*',
    'f_op->read dispatch',
    'cache miss → submit_bio',
    'DMA → page cache',
    '4096 → user buffer',
  ],
  fork: [
    'fork()',
    'do_fork(SIGCHLD)',
    'copy task_struct',
    'mm + files + sighand',
    'runqueue + wake',
    'pid → parent',
  ],
};

// ─── Bezier helpers ──────────────────────────────────────────────────────────
interface Point {
  x: number;
  y: number;
}
function bezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

interface EdgeGeometry {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  d: string;
}

function buildEdge(a: NodeLayout, b: NodeLayout): EdgeGeometry {
  const x1 = a.cx + NODE_W / 2 + 2;
  const y1 = a.cy;
  const x2 = b.cx - NODE_W / 2 - 8;
  const y2 = b.cy;
  const dx = x2 - x1;
  const p0 = { x: x1, y: y1 };
  const p1 = { x: x1 + dx * 0.45, y: y1 };
  const p2 = { x: x2 - dx * 0.45, y: y2 };
  const p3 = { x: x2, y: y2 };
  const d = `M ${x1} ${y1} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${x2} ${y2}`;
  return { p0, p1, p2, p3, d };
}

// ─── Component ────────────────────────────────────────────────────────────────
const MainFlow: React.FC<{ data: SyscallData }> = ({ data }) => {
  const { expanded: userExpanded, toggle } = useExpand();
  const svgRef = useRef<SVGSVGElement>(null);

  const sortedNodes = useMemo(
    () => [...data.main_flow].sort((a, b) => a.position - b.position),
    [data]
  );

  const activeLanes = useMemo(() => {
    const used = new Set<Region>();
    sortedNodes.forEach(n => used.add(regionOf(n.id)));
    return LANE_ORDER.filter(r => used.has(r));
  }, [sortedNodes]);

  const layouts = useMemo<NodeLayout[]>(() => {
    return sortedNodes.map(n => {
      const region = regionOf(n.id);
      const laneIdx = activeLanes.indexOf(region);
      const cy = PADDING_Y + laneIdx * (LANE_HEIGHT + LANE_GAP) + LANE_HEIGHT / 2;
      return { node: n, region, cx: colX(n.position), cy, laneIdx };
    });
  }, [sortedNodes, activeLanes]);

  const edges = useMemo<EdgeGeometry[]>(() => {
    const result: EdgeGeometry[] = [];
    for (let i = 0; i < layouts.length - 1; i++) {
      result.push(buildEdge(layouts[i], layouts[i + 1]));
    }
    return result;
  }, [layouts]);

  const numCols = sortedNodes.length;
  const svgW = totalWidthFor(numCols);
  const svgH =
    PADDING_Y * 2 + activeLanes.length * LANE_HEIGHT + (activeLanes.length - 1) * LANE_GAP;

  // SW/HW boundary (read only)
  const showBoundary = data.id === 'read';
  const boundaryX = showBoundary
    ? (colX(3) + NODE_W / 2 + colX(4) - NODE_W / 2) / 2
    : null;

  // ─── Playback ─────────────────────────────────────────────────────────────
  const [playback, playbackControls] = usePlayback(layouts.length);

  const stepLabels = STAGE_LABELS[data.id] ?? sortedNodes.map(n => n.title);

  // Active node id during playback (highlight + auto-expand)
  const activeNodeId =
    playback.status !== 'idle' ? layouts[playback.currentStep]?.node.id : undefined;

  // Set of visible expansions = userExpanded ∪ {activeNodeId}
  const displayedExpanded = useMemo(() => {
    const set = new Set(userExpanded);
    if (activeNodeId) set.add(activeNodeId);
    return set;
  }, [userExpanded, activeNodeId]);

  // Pulse position
  const pulsePos = useMemo<Point | null>(() => {
    if (playback.status === 'idle') return null;
    const i = playback.currentStep;
    if (playback.isTransitioning && i < layouts.length - 1) {
      const e = edges[i];
      return bezier(playback.transitionProgress, e.p0, e.p1, e.p2, e.p3);
    }
    return { x: layouts[i].cx, y: layouts[i].cy };
  }, [playback, layouts, edges]);

  // ─── Render static SVG layer (lanes, edges, boundary) ────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const ns = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(ns, 'defs');

    LANE_ORDER.forEach(region => {
      const m = document.createElementNS(ns, 'marker');
      m.setAttribute('id', `arrow-${region}`);
      m.setAttribute('viewBox', '0 0 10 10');
      m.setAttribute('refX', '9');
      m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '6');
      m.setAttribute('markerHeight', '6');
      m.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      path.setAttribute('fill', regionPalette(region).fg);
      path.setAttribute('opacity', '0.85');
      m.appendChild(path);
      defs.appendChild(m);
    });

    // Pulse glow filter
    const filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', 'pulse-glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    const blur = document.createElementNS(ns, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'b');
    filter.appendChild(blur);
    const merge = document.createElementNS(ns, 'feMerge');
    const m1 = document.createElementNS(ns, 'feMergeNode');
    m1.setAttribute('in', 'b');
    const m2 = document.createElementNS(ns, 'feMergeNode');
    m2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(m1);
    merge.appendChild(m2);
    filter.appendChild(merge);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // Lanes
    activeLanes.forEach((region, i) => {
      const palette = regionPalette(region);
      const y = PADDING_Y + i * (LANE_HEIGHT + LANE_GAP);

      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(svgW));
      rect.setAttribute('height', String(LANE_HEIGHT));
      rect.setAttribute('fill', palette.bg);
      rect.setAttribute('opacity', '0.5');
      rect.setAttribute('rx', '6');
      svg.appendChild(rect);

      const accent = document.createElementNS(ns, 'rect');
      accent.setAttribute('x', '0');
      accent.setAttribute('y', String(y));
      accent.setAttribute('width', '3');
      accent.setAttribute('height', String(LANE_HEIGHT));
      accent.setAttribute('fill', palette.fg);
      accent.setAttribute('opacity', '0.6');
      accent.setAttribute('rx', '1.5');
      svg.appendChild(accent);

      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', '14');
      label.setAttribute('y', String(y + LANE_HEIGHT / 2 - 6));
      label.setAttribute('font-family', font.family.mono);
      label.setAttribute('font-size', '9px');
      label.setAttribute('font-weight', '700');
      label.setAttribute('fill', palette.fg);
      label.setAttribute('letter-spacing', '0.16em');
      label.setAttribute('opacity', '0.85');
      label.textContent = REGION_LABEL[region].toUpperCase();
      svg.appendChild(label);

      const sub = document.createElementNS(ns, 'text');
      sub.setAttribute('x', '14');
      sub.setAttribute('y', String(y + LANE_HEIGHT / 2 + 8));
      sub.setAttribute('font-family', font.family.mono);
      sub.setAttribute('font-size', '8px');
      sub.setAttribute('fill', palette.fg);
      sub.setAttribute('letter-spacing', '0.08em');
      sub.setAttribute('opacity', '0.45');
      sub.textContent =
        region === 'user' ? 'ring 3'
        : region === 'kernel' ? 'ring 0'
        : region === 'hardware' ? 'devices'
        : 'back to user';
      svg.appendChild(sub);
    });

    // SW/HW boundary
    if (boundaryX !== null) {
      const grad = document.createElementNS(ns, 'linearGradient');
      grad.setAttribute('id', 'sw-hw-grad');
      grad.setAttribute('x1', '0');
      grad.setAttribute('x2', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('y2', '1');
      ([
        ['0%', '0'],
        ['40%', '0.55'],
        ['60%', '0.55'],
        ['100%', '0'],
      ] as const).forEach(([offset, op]) => {
        const s = document.createElementNS(ns, 'stop');
        s.setAttribute('offset', offset);
        s.setAttribute('stop-color', color.region.hardware.fg);
        s.setAttribute('stop-opacity', op);
        grad.appendChild(s);
      });
      defs.appendChild(grad);

      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(boundaryX));
      line.setAttribute('y1', String(PADDING_Y));
      line.setAttribute('x2', String(boundaryX));
      line.setAttribute('y2', String(svgH - PADDING_Y));
      line.setAttribute('stroke', 'url(#sw-hw-grad)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);

      const lbl = document.createElementNS(ns, 'text');
      lbl.setAttribute('x', String(boundaryX));
      lbl.setAttribute('y', String(PADDING_Y - 4));
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('font-family', font.family.mono);
      lbl.setAttribute('font-size', '8.5px');
      lbl.setAttribute('font-weight', '700');
      lbl.setAttribute('fill', color.region.hardware.fg);
      lbl.setAttribute('letter-spacing', '0.18em');
      lbl.setAttribute('opacity', '0.85');
      lbl.textContent = 'SW · HW';
      svg.appendChild(lbl);
    }

    // Edges
    edges.forEach((e, i) => {
      const a = layouts[i];
      const b = layouts[i + 1];

      const gradId = `edge-grad-${i}`;
      const g = document.createElementNS(ns, 'linearGradient');
      g.setAttribute('id', gradId);
      g.setAttribute('x1', String(e.p0.x));
      g.setAttribute('y1', String(e.p0.y));
      g.setAttribute('x2', String(e.p3.x));
      g.setAttribute('y2', String(e.p3.y));
      g.setAttribute('gradientUnits', 'userSpaceOnUse');
      const s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '0%');
      s1.setAttribute('stop-color', regionPalette(a.region).fg);
      s1.setAttribute('stop-opacity', '0.7');
      const s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '100%');
      s2.setAttribute('stop-color', regionPalette(b.region).fg);
      s2.setAttribute('stop-opacity', '0.7');
      g.appendChild(s1);
      g.appendChild(s2);
      defs.appendChild(g);

      const glow = document.createElementNS(ns, 'path');
      glow.setAttribute('d', e.d);
      glow.setAttribute('stroke', regionPalette(b.region).fg);
      glow.setAttribute('stroke-width', '6');
      glow.setAttribute('stroke-opacity', '0.10');
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke-linecap', 'round');
      svg.appendChild(glow);

      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', e.d);
      path.setAttribute('stroke', `url(#${gradId})`);
      path.setAttribute('stroke-width', '1.75');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('marker-end', `url(#arrow-${b.region})`);
      svg.appendChild(path);

      const dash = document.createElementNS(ns, 'path');
      dash.setAttribute('d', e.d);
      dash.setAttribute('stroke', regionPalette(b.region).accent);
      dash.setAttribute('stroke-width', '1.5');
      dash.setAttribute('stroke-opacity', '0.7');
      dash.setAttribute('fill', 'none');
      dash.setAttribute('stroke-linecap', 'round');
      dash.setAttribute('stroke-dasharray', '4 14');
      dash.setAttribute('class', 'flow-dash');
      svg.appendChild(dash);
    });

    // Pulse layer placeholder (we'll position via the dynamic effect below)
    const pulseG = document.createElementNS(ns, 'g');
    pulseG.setAttribute('id', 'pulse-layer');
    svg.appendChild(pulseG);
  }, [layouts, activeLanes, edges, svgW, svgH, boundaryX]);

  // ─── Render dynamic pulse ────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    const layer = svgRef.current.querySelector<SVGGElement>('#pulse-layer');
    if (!layer) return;
    while (layer.firstChild) layer.removeChild(layer.firstChild);

    if (!pulsePos) return;

    const ns = 'http://www.w3.org/2000/svg';

    // Outer halo
    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', String(pulsePos.x));
    halo.setAttribute('cy', String(pulsePos.y));
    halo.setAttribute('r', '14');
    halo.setAttribute('fill', color.pulse);
    halo.setAttribute('opacity', '0.18');
    halo.setAttribute('class', 'pulse-halo');
    layer.appendChild(halo);

    // Core dot
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', String(pulsePos.x));
    dot.setAttribute('cy', String(pulsePos.y));
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', color.pulse);
    dot.setAttribute('filter', 'url(#pulse-glow)');
    layer.appendChild(dot);

    // Stage label that follows the pulse (above the pulse)
    if (playback.status !== 'idle') {
      const labelText = stepLabels[playback.currentStep];
      const labelGroup = document.createElementNS(ns, 'g');
      labelGroup.setAttribute('transform', `translate(${pulsePos.x}, ${pulsePos.y - 22})`);
      labelGroup.setAttribute('opacity', '0.95');

      // measure approximate width
      const w = Math.min(220, Math.max(70, labelText.length * 6 + 16));
      const bg = document.createElementNS(ns, 'rect');
      bg.setAttribute('x', String(-w / 2));
      bg.setAttribute('y', '-12');
      bg.setAttribute('width', String(w));
      bg.setAttribute('height', '18');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', color.bg.canvas);
      bg.setAttribute('stroke', color.pulse);
      bg.setAttribute('stroke-width', '1');
      bg.setAttribute('opacity', '0.95');
      labelGroup.appendChild(bg);

      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', '0');
      txt.setAttribute('y', '1');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'middle');
      txt.setAttribute('font-family', font.family.mono);
      txt.setAttribute('font-size', '10px');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', color.pulse);
      txt.textContent = labelText;
      labelGroup.appendChild(txt);

      layer.appendChild(labelGroup);
    }
  }, [pulsePos, playback.status, playback.currentStep, stepLabels]);

  return (
    <div
      style={{
        background: color.bg.surface,
        borderRadius: radius.xl,
        border: `1px solid ${color.border.subtle}`,
        padding: space[5],
        overflowX: 'auto',
      }}
    >
      <style>{`
        @keyframes flow-dash-anim {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -36; }
        }
        .flow-dash {
          animation: flow-dash-anim 1.6s linear infinite;
        }
        @keyframes pulse-halo-anim {
          0%, 100% { opacity: 0.18; r: 14; }
          50%      { opacity: 0.4;  r: 19; }
        }
        .pulse-halo {
          animation: pulse-halo-anim 1.4s ease-in-out infinite;
          transform-box: fill-box;
        }
      `}</style>

      {/* Syscall header */}
      <div style={{ marginBottom: space[3], display: 'flex', alignItems: 'baseline', gap: space[3] }}>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size['2xl'],
            fontWeight: font.weight.bold,
            color: color.accent.primary,
            letterSpacing: font.letterSpacing.tight,
          }}
        >
          {data.name}
        </span>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.sm,
            color: color.text.secondary,
          }}
        >
          {data.signature}
        </span>
      </div>
      <p
        style={{
          margin: `0 0 ${space[4]}`,
          fontSize: font.size.base,
          color: color.text.secondary,
          lineHeight: 1.55,
          maxWidth: '720px',
        }}
      >
        {data.description}
      </p>

      {/* Playback controls */}
      <div style={{ marginBottom: space[4] }}>
        <PlaybackControls
          state={playback}
          controls={playbackControls}
          numSteps={layouts.length}
          stepLabels={stepLabels}
        />
      </div>

      {/* Main flow canvas */}
      <div
        style={{
          position: 'relative',
          width: svgW,
          height: svgH,
          minWidth: svgW,
        }}
      >
        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        />
        {layouts.map(layout => {
          const isExpanded = displayedExpanded.has(layout.node.id);
          const isActive = activeNodeId === layout.node.id;
          return (
            <NodeCard
              key={layout.node.id}
              layout={layout}
              isExpanded={isExpanded}
              isActive={isActive}
              onToggle={() => toggle(layout.node.id)}
            />
          );
        })}
      </div>

      {/* Expansion slots — DetailPanel for each open node */}
      <div style={{ marginTop: space[6] }}>
        {layouts.map(layout =>
          displayedExpanded.has(layout.node.id) ? (
            <div
              key={layout.node.id}
              className="expansion-slot"
              data-node-id={layout.node.id}
              style={{ marginBottom: space[4] }}
            >
              <DetailPanel node={layout.node} region={layout.region} />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

// ─── NodeCard ────────────────────────────────────────────────────────────────
interface NodeCardProps {
  layout: NodeLayout;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ layout, isExpanded, isActive, onToggle }) => {
  const { node, region, cx, cy } = layout;
  const palette = regionPalette(region);
  const [hover, setHover] = React.useState(false);

  const left = cx - NODE_W / 2;
  const top = cy - NODE_H / 2;

  const subtitle = node.description.split(/[.;]/)[0].trim().slice(0, 44);

  const accentOpacity = isExpanded || isActive ? 1 : hover ? 0.85 : 0.45;
  const cardBg = isActive ? color.bg.elevated : isExpanded ? color.bg.elevated : color.bg.surface;
  const borderAlphaHex = isActive || isExpanded ? 'ff' : hover ? 'cc' : '4d';
  const activeGlow = isActive
    ? `0 0 0 1.5px ${color.pulse}, 0 0 18px ${color.pulseGlow}`
    : null;
  const expandedGlow = isExpanded ? `0 0 0 1px ${palette.fg}, ${shadow.glow[region]}` : null;
  const hoverShadow = hover ? `0 4px 16px rgba(0,0,0,0.45)` : `0 1px 3px rgba(0,0,0,0.3)`;
  const computedShadow = activeGlow ?? expandedGlow ?? hoverShadow;

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        left,
        top,
        width: NODE_W,
        height: NODE_H,
        background: cardBg,
        border: `1.5px solid ${isActive ? color.pulse : palette.fg + borderAlphaHex}`,
        borderRadius: radius.lg,
        padding: `${space[2]} ${space[3]}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        textAlign: 'left',
        outline: 'none',
        boxShadow: computedShadow,
        transform: hover && !isExpanded ? 'translateY(-2px)' : 'translateY(0)',
        transition: `transform ${motion.duration.fast}ms ${motion.ease.out}, box-shadow ${motion.duration.fast}ms ${motion.ease.out}, border-color ${motion.duration.fast}ms ${motion.ease.out}, background ${motion.duration.fast}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: '8.5px',
            fontWeight: font.weight.bold,
            color: isActive ? color.pulse : palette.fg,
            letterSpacing: font.letterSpacing.label,
            textTransform: 'uppercase',
            opacity: 0.95,
          }}
        >
          {REGION_LABEL[region]}
        </span>
        <span
          style={{
            fontSize: '13px',
            color: palette.accent,
            opacity: accentOpacity,
            lineHeight: 1,
          }}
          aria-hidden
        >
          {REGION_ICON[region]}
        </span>
      </div>

      <span
        style={{
          fontFamily: font.family.sans,
          fontSize: font.size.base,
          fontWeight: font.weight.semibold,
          color: color.text.primary,
          lineHeight: 1.2,
          letterSpacing: font.letterSpacing.tight,
        }}
      >
        {node.title.replace(/\s—\s.*$/, '')}
      </span>

      <span
        style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: color.text.muted,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </span>

      <span
        style={{
          position: 'absolute',
          right: 6,
          bottom: 4,
          fontSize: '9px',
          color: isActive ? color.pulse : palette.fg,
          opacity: 0.65,
          fontFamily: font.family.mono,
          letterSpacing: '-0.05em',
        }}
        aria-hidden
      >
        {isExpanded ? '▴ collapse' : '▾ expand'}
      </span>
    </button>
  );
};

export default MainFlow;
