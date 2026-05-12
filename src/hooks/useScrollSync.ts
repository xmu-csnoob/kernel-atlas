import { useEffect, useRef } from 'react';
import type { PlaybackState } from './usePlayback';

export function useScrollSync(
  playbackState: PlaybackState,
  nodeIds: string[],
  scrollTo: (id: string) => void
) {
  const lastStepRef = useRef<number>(-1);

  useEffect(() => {
    if (playbackState.status === 'idle') {
      lastStepRef.current = -1;
      return;
    }
    const { currentStep } = playbackState;
    if (currentStep !== lastStepRef.current) {
      lastStepRef.current = currentStep;
      const nodeId = nodeIds[currentStep];
      if (nodeId) scrollTo(nodeId);
    }
  }, [playbackState.status, playbackState.currentStep, nodeIds, scrollTo]);
}
