import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import rawData from '../data/data-structures.json';
import type { DataStructureNode, DataStructureEdge } from '../data/types';
import { color, font, space, radius } from '../design/tokens';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GraphData {
  nodes: DataStructureNode[];
  edges: DataStructureEdge[];
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  struct_name: string;
  description: string;
  key_fields: string[];
  source_ref: { file: string; line: number; snippet: string } | null;
  x?: number;
  y?: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  label: string;
  multiplicity: string;
  source: SimNode | string;
  target: SimNode | string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  node: SimNode | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 900;
const HEIGHT = 540;
const NODE_W = 180;
const NODE_H = 90;
const ARROW_ID = 'ds-arrowhead';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DataStructDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, node: null });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const data = rawData as GraphData;

    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const nodeById = new Map<string, SimNode>(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = data.edges.map((e) => ({
      id: e.id,
      label: e.label,
      multiplicity: e.multiplicity,
      source: nodeById.get(e.source_id) ?? e.source_id,
      target: nodeById.get(e.target_id) ?? e.target_id,
    }));

    const svg = d3.select(svgRef.current!);
    svg.selectAll('*').remove();

    // Defs: arrowhead + glow filter
    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', ARROW_ID)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', color.region.kernel.fg);

    // Edge glow filter
    const filter = defs.append('filter').attr('id', 'ds-edge-glow');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '2')
      .attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background
    svg
      .append('rect')
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .attr('fill', color.bg.canvas)
      .attr('rx', 6);

    // Edge group
    const linkGroup = svg.append('g').attr('class', 'links');

    // Edge glow
    linkGroup
      .selectAll<SVGLineElement, SimLink>('line.glow')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('class', 'glow')
      .attr('stroke', color.region.kernel.fg)
      .attr('stroke-width', 5)
      .attr('stroke-opacity', 0.08)
      .attr('filter', 'url(#ds-edge-glow)');

    const linkLines = linkGroup
      .selectAll<SVGLineElement, SimLink>('line.edge')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('stroke', color.region.kernel.fg)
      .attr('stroke-width', 1.25)
      .attr('stroke-opacity', 0.55)
      .attr('marker-end', `url(#${ARROW_ID})`);

    const linkLabels = linkGroup
      .selectAll<SVGTextElement, SimLink>('text.label')
      .data(simLinks)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9.5px')
      .attr('font-family', font.family.mono)
      .attr('fill', color.region.kernel.accent)
      .attr('pointer-events', 'none')
      .attr('font-weight', 500)
      .text((d) => d.label);

    // Node group
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const nodeGs = nodeGroup
      .selectAll<SVGGElement, SimNode>('g.node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('mouseenter', (_event: MouseEvent, d: SimNode) => {
        setHighlightedId(d.id);
        const svgEl = svgRef.current!;
        const rect = svgEl.getBoundingClientRect();
        const scaleX = rect.width / WIDTH;
        const scaleY = rect.height / HEIGHT;
        const nx = (d.x ?? 0) * scaleX + rect.left;
        const ny = (d.y ?? 0) * scaleY + rect.top;
        setTooltip({
          visible: true,
          x: nx + NODE_W / 2 * scaleX + 8,
          y: ny,
          node: d,
        });
      })
      .on('mouseleave', () => {
        setHighlightedId(null);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Node rect
    nodeGs
      .append('rect')
      .attr('width', NODE_W)
      .attr('height', NODE_H)
      .attr('x', -NODE_W / 2)
      .attr('y', -NODE_H / 2)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', color.bg.elevated)
      .attr('stroke', color.border.default)
      .attr('stroke-width', 1.25);

    // Left accent bar
    nodeGs
      .append('rect')
      .attr('width', 3)
      .attr('height', NODE_H)
      .attr('x', -NODE_W / 2)
      .attr('y', -NODE_H / 2)
      .attr('rx', 1.5)
      .attr('fill', color.region.kernel.fg);

    // Primary label
    nodeGs
      .append('text')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('x', -NODE_W / 2 + 10)
      .attr('y', -12)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', font.family.sans)
      .attr('fill', color.text.primary)
      .attr('pointer-events', 'none')
      .text((d) => d.label);

    // Sub-label (struct name)
    nodeGs
      .append('text')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('x', -NODE_W / 2 + 10)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('font-family', font.family.mono)
      .attr('font-style', 'italic')
      .attr('fill', color.region.kernel.accent)
      .attr('pointer-events', 'none')
      .text((d) => d.struct_name);

    // Key fields (mini list)
    nodeGs.each(function (d: SimNode) {
      const g = d3.select(this);
      const startX = -NODE_W / 2 + 10;
      const startY = 18;
      d.key_fields.slice(0, 3).forEach((field, i) => {
        g.append('rect')
          .attr('x', startX + i * 56)
          .attr('y', startY - 6)
          .attr('width', 52)
          .attr('height', 14)
          .attr('rx', 2)
          .attr('fill', 'rgba(149, 117, 205, 0.10)')
          .attr('stroke', 'rgba(149, 117, 205, 0.3)')
          .attr('stroke-width', 0.5);
        g.append('text')
          .attr('x', startX + i * 56 + 26)
          .attr('y', startY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '7.5px')
          .attr('font-family', font.family.mono)
          .attr('fill', color.region.kernel.fg)
          .attr('opacity', 0.9)
          .attr('pointer-events', 'none')
          .text(field.length > 10 ? field.slice(0, 9) + '…' : field);
      });
    });

    // Force simulation
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(180)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collision', d3.forceCollide(105));

    function clamp(v: number, lo: number, hi: number) {
      return Math.max(lo, Math.min(hi, v));
    }

    simulation.on('tick', () => {
      simNodes.forEach((d) => {
        d.x = clamp(d.x ?? WIDTH / 2, NODE_W / 2 + 8, WIDTH - NODE_W / 2 - 8);
        d.y = clamp(d.y ?? HEIGHT / 2, NODE_H / 2 + 8, HEIGHT - NODE_H / 2 - 8);
      });

      linkGroup.selectAll<SVGLineElement, SimLink>('line.glow').attr('x1', (d) => ((d.source as SimNode).x ?? 0))
        .attr('y1', (d) => ((d.source as SimNode).y ?? 0))
        .attr('x2', (d) => ((d.target as SimNode).x ?? 0))
        .attr('y2', (d) => ((d.target as SimNode).y ?? 0));

      linkLines
        .attr('x1', (d) => ((d.source as SimNode).x ?? 0))
        .attr('y1', (d) => ((d.source as SimNode).y ?? 0))
        .attr('x2', (d) => ((d.target as SimNode).x ?? 0))
        .attr('y2', (d) => ((d.target as SimNode).y ?? 0));

      linkLabels
        .attr('x', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return ((s.x ?? 0) + (t.x ?? 0)) / 2;
        })
        .attr('y', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return ((s.y ?? 0) + (t.y ?? 0)) / 2 - 10;
        });

      nodeGs.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Drag
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGs.call(drag as any);

    return () => {
      simulation.stop();
    };
  }, []);

  // Highlight effect
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .selectAll<SVGRectElement, SimNode>('g.nodes g.node rect')
      .attr('stroke', (d: SimNode) => (highlightedId === d.id ? color.region.kernel.fg : color.border.default))
      .attr('stroke-width', (d: SimNode) => (highlightedId === d.id ? 2 : 1.25))
      .attr('fill', (d: SimNode) => (highlightedId === d.id ? color.region.kernel.bg : color.bg.elevated));
  }, [highlightedId]);

  return (
    <div
      style={{
        background: color.bg.surface,
        borderRadius: radius.xl,
        border: `1px solid ${color.border.subtle}`,
        padding: space[5],
        position: 'relative',
      }}
    >
      <div style={{ marginBottom: space[4] }}>
        <div
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.lg,
            fontWeight: font.weight.semibold,
            color: color.text.primary,
            letterSpacing: font.letterSpacing.tight,
            marginBottom: space[1],
          }}
        >
          Kernel Data-Structure Relationships
        </div>
        <div
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.base,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}
        >
          Drag nodes to rearrange. Hover for field details.
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: radius.lg,
          border: `1px solid ${color.border.subtle}`,
          background: color.bg.canvas,
          minHeight: '400px',
        }}
      />

      {/* Tooltip */}
      {tooltip.visible && tooltip.node && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 8,
            top: tooltip.y,
            background: color.bg.elevated,
            border: `1px solid ${color.border.strong}`,
            borderRadius: radius.lg,
            padding: `${space[3]} ${space[4]}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6)`,
            zIndex: 9999,
            maxWidth: 300,
            pointerEvents: 'none',
            fontFamily: font.family.sans,
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.sm,
              fontWeight: font.weight.bold,
              color: color.region.kernel.fg,
              marginBottom: space[1],
              borderBottom: `1px solid ${color.border.subtle}`,
              paddingBottom: space[1],
            }}
          >
            {tooltip.node.struct_name}
          </div>
          <div
            style={{
              fontSize: font.size.sm,
              color: color.text.secondary,
              marginBottom: space[2],
              lineHeight: 1.5,
            }}
          >
            {tooltip.node.description}
          </div>
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.text.muted,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[1],
            }}
          >
            Key fields
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tooltip.node.key_fields.map((f) => (
              <span
                key={f}
                style={{
                  background: 'rgba(149, 117, 205, 0.12)',
                  border: `1px solid rgba(149, 117, 205, 0.35)`,
                  color: color.region.kernel.accent,
                  borderRadius: radius.sm,
                  padding: '1px 6px',
                  fontFamily: font.family.mono,
                  fontSize: '9.5px',
                }}
              >
                {f}
              </span>
            ))}
          </div>
          {tooltip.node.source_ref && (
            <div
              style={{
                marginTop: space[2],
                paddingTop: space[2],
                borderTop: `1px solid ${color.border.subtle}`,
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
                color: color.accent.primary,
              }}
            >
              {tooltip.node.source_ref.file}:{tooltip.node.source_ref.line}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
