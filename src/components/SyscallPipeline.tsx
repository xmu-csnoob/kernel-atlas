import React, { useMemo, useCallback } from 'react';
import type { SyscallData } from '../data/types';
import { regionOf } from '../design/tokens';
import { usePlayback } from '../hooks/usePlayback';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollSync } from '../hooks/useScrollSync';
import { space } from '../design/tokens';
import MiniLaneStrip from './MiniLaneStrip';
import StageSection from './StageSection';
import PlaybackControls from './PlaybackControls';
import { HERO_REGISTRY } from './heroRegistry';

interface SyscallPipelineProps {
  data: SyscallData;
}

const SyscallPipeline: React.FC<SyscallPipelineProps> = ({ data }) => {
  const sortedNodes = useMemo(
    () => [...data.main_flow].sort((a, b) => a.position - b.position),
    [data]
  );

  const nodeIds = useMemo(() => sortedNodes.map(n => n.id), [sortedNodes]);

  const { activeId, scrollTo } = useActiveSection(nodeIds);

  const [playback, controls] = usePlayback(sortedNodes.length);

  useScrollSync(playback, nodeIds, scrollTo);

  const handleChipClick = useCallback((id: string) => {
    scrollTo(id);
  }, [scrollTo]);

  const stepLabels = useMemo(
    () => sortedNodes.map(n => n.title.replace(/\s—\s.*$/, '')),
    [sortedNodes]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Sticky compressed lane thumbnail */}
      <MiniLaneStrip
        data={data}
        activeNodeId={activeId}
        onChipClick={handleChipClick}
      />

      {/* Stage sections */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: space[5],
          padding: `${space[5]} 0`,
        }}
      >
        {sortedNodes.map((node, idx) => {
          const region = regionOf(node.id);
          const HeroComponent = HERO_REGISTRY[node.id];
          return (
            <StageSection
              key={node.id}
              node={node}
              region={region}
              hero={HeroComponent ? <HeroComponent /> : null}
              isActive={activeId === node.id}
              stepIndex={idx}
              totalSteps={sortedNodes.length}
            />
          );
        })}
      </div>

      {/* Sticky playback controls */}
      <div
        style={{
          position: 'sticky',
          bottom: space[3],
          zIndex: 10,
          background: 'transparent',
        }}
      >
        <PlaybackControls
          state={playback}
          controls={controls}
          numSteps={sortedNodes.length}
          stepLabels={stepLabels}
        />
      </div>
    </div>
  );
};

export default SyscallPipeline;
