import { useState, useRef, useEffect, useCallback } from 'react';

const DWELL_MS = 1400;        // pause at each node
const TRANSITION_MS = 850;    // animate move to next node

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface PlaybackState {
  status: PlaybackStatus;
  currentStep: number;
  /** Progress 0..1 within the current "transition" phase (between nodes). */
  transitionProgress: number;
  /** True while moving from currentStep to currentStep+1. */
  isTransitioning: boolean;
}

export interface PlaybackControls {
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setStep: (step: number) => void;
}

export function usePlayback(numSteps: number): [PlaybackState, PlaybackControls] {
  const [state, setState] = useState<PlaybackState>({
    status: 'idle',
    currentStep: 0,
    transitionProgress: 0,
    isTransitioning: false,
  });

  const phaseStartRef = useRef<number>(0);
  const phaseRef = useRef<'dwell' | 'transition'>('dwell');
  const pausedOffsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // RAF tick (only schedules itself while playing)
  useEffect(() => {
    if (state.status !== 'playing') return;

    const tick = (now: number) => {
      setState(prev => {
        if (prev.status !== 'playing') return prev;
        const elapsed = now - phaseStartRef.current;

        if (phaseRef.current === 'dwell') {
          if (elapsed >= DWELL_MS) {
            if (prev.currentStep >= numSteps - 1) {
              return { ...prev, status: 'finished', isTransitioning: false, transitionProgress: 0 };
            }
            phaseRef.current = 'transition';
            phaseStartRef.current = now;
            return { ...prev, isTransitioning: true, transitionProgress: 0 };
          }
          return prev;
        } else {
          // transition
          const t = Math.min(elapsed / TRANSITION_MS, 1);
          if (t >= 1) {
            phaseRef.current = 'dwell';
            phaseStartRef.current = now;
            return {
              ...prev,
              currentStep: Math.min(prev.currentStep + 1, numSteps - 1),
              isTransitioning: false,
              transitionProgress: 0,
            };
          }
          return { ...prev, transitionProgress: t };
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [state.status, numSteps]);

  const play = useCallback(() => {
    setState(prev => {
      const now = performance.now();
      if (prev.status === 'finished') {
        phaseRef.current = 'dwell';
        phaseStartRef.current = now;
        return { status: 'playing', currentStep: 0, transitionProgress: 0, isTransitioning: false };
      }
      if (prev.status === 'paused') {
        phaseStartRef.current = now - pausedOffsetRef.current;
        return { ...prev, status: 'playing' };
      }
      // idle
      phaseRef.current = 'dwell';
      phaseStartRef.current = now;
      return { ...prev, status: 'playing' };
    });
  }, []);

  const pause = useCallback(() => {
    setState(prev => {
      if (prev.status === 'playing') {
        pausedOffsetRef.current = performance.now() - phaseStartRef.current;
        return { ...prev, status: 'paused' };
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    phaseRef.current = 'dwell';
    pausedOffsetRef.current = 0;
    setState({ status: 'idle', currentStep: 0, transitionProgress: 0, isTransitioning: false });
  }, []);

  const stepForward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep < numSteps - 1) {
        return {
          status: 'paused',
          currentStep: prev.currentStep + 1,
          transitionProgress: 0,
          isTransitioning: false,
        };
      }
      return prev;
    });
  }, [numSteps]);

  const stepBackward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep > 0) {
        return {
          status: 'paused',
          currentStep: prev.currentStep - 1,
          transitionProgress: 0,
          isTransitioning: false,
        };
      }
      return prev;
    });
  }, []);

  const setStep = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(numSteps - 1, step));
      setState(prev => ({
        ...prev,
        status: 'paused',
        currentStep: clamped,
        transitionProgress: 0,
        isTransitioning: false,
      }));
    },
    [numSteps]
  );

  return [state, { play, pause, reset, stepForward, stepBackward, setStep }];
}
