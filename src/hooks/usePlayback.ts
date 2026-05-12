import { useState, useRef, useEffect, useCallback } from 'react';

const DWELL_MS = 1400;
const TRANSITION_MS = 850;

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

export interface UsePlaybackOptions {
  /** Called whenever the playback pulse arrives at a new node. */
  onStepNode?: (nodeId: string) => void;
  /** Node ids in step order; required when onStepNode is provided. */
  nodeIds?: string[];
}

export function usePlayback(
  numSteps: number,
  options?: UsePlaybackOptions
): [PlaybackState, PlaybackControls] {
  const [state, setState] = useState<PlaybackState>({
    status: 'idle',
    currentStep: 0,
    transitionProgress: 0,
    isTransitioning: false,
  });

  const phaseRef = useRef<'dwell' | 'transition'>('dwell');
  const phaseStartRef = useRef<number>(0);
  const pausedOffsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastReportedStepRef = useRef<number>(-1);
  // Mirror of state.currentStep kept outside React state so the RAF tick can
  // read it without going through a setState updater (avoiding Strict Mode
  // double-invocation side-effect bugs).
  const currentStepRef = useRef<number>(0);
  // Mirror of state.status so play/pause can read it synchronously.
  const statusRef = useRef<PlaybackStatus>('idle');

  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

  // RAF tick — all ref mutations happen OUTSIDE the setState updater so the
  // updater stays a pure function (safe under React Strict Mode / concurrent).
  useEffect(() => {
    if (state.status !== 'playing') return;

    const tick = (now: number) => {
      const elapsed = now - phaseStartRef.current;

      if (phaseRef.current === 'dwell') {
        if (elapsed >= DWELL_MS) {
          if (currentStepRef.current >= numSteps - 1) {
            setState(prev =>
              prev.status !== 'playing'
                ? prev
                : { ...prev, status: 'finished', isTransitioning: false, transitionProgress: 0 }
            );
          } else {
            phaseRef.current = 'transition';
            phaseStartRef.current = now;
            setState(prev =>
              prev.status !== 'playing'
                ? prev
                : { ...prev, isTransitioning: true, transitionProgress: 0 }
            );
          }
        }
        // else: still dwelling — no state change needed this frame
      } else {
        const t = Math.min(elapsed / TRANSITION_MS, 1);
        if (t >= 1) {
          const nextStep = currentStepRef.current + 1;
          currentStepRef.current = nextStep;
          phaseRef.current = 'dwell';
          phaseStartRef.current = now;
          setState(prev =>
            prev.status !== 'playing'
              ? prev
              : { ...prev, currentStep: nextStep, isTransitioning: false, transitionProgress: 0 }
          );
        } else {
          setState(prev =>
            prev.status !== 'playing' ? prev : { ...prev, transitionProgress: t }
          );
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [state.status, numSteps]);

  const play = useCallback(() => {
    const now = performance.now();
    const status = statusRef.current;
    if (status === 'finished') {
      currentStepRef.current = 0;
      phaseRef.current = 'dwell';
      phaseStartRef.current = now;
      setState({ status: 'playing', currentStep: 0, transitionProgress: 0, isTransitioning: false });
    } else if (status === 'paused') {
      phaseStartRef.current = now - pausedOffsetRef.current;
      setState(prev => ({ ...prev, status: 'playing' }));
    } else if (status === 'idle') {
      phaseRef.current = 'dwell';
      phaseStartRef.current = now;
      setState(prev => ({ ...prev, status: 'playing' }));
    }
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    pausedOffsetRef.current = performance.now() - phaseStartRef.current;
    setState(prev => prev.status !== 'playing' ? prev : { ...prev, status: 'paused' });
  }, []);

  const reset = useCallback(() => {
    phaseRef.current = 'dwell';
    pausedOffsetRef.current = 0;
    currentStepRef.current = 0;
    lastReportedStepRef.current = -1;
    setState({ status: 'idle', currentStep: 0, transitionProgress: 0, isTransitioning: false });
  }, []);

  const stepForward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep >= numSteps - 1) return prev;
      const next = prev.currentStep + 1;
      currentStepRef.current = next;
      return { status: 'paused', currentStep: next, transitionProgress: 0, isTransitioning: false };
    });
  }, [numSteps]);

  const stepBackward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep <= 0) return prev;
      const next = prev.currentStep - 1;
      currentStepRef.current = next;
      return { status: 'paused', currentStep: next, transitionProgress: 0, isTransitioning: false };
    });
  }, []);

  const setStep = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(numSteps - 1, step));
      currentStepRef.current = clamped;
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

  // Report node arrival to the optional callback
  useEffect(() => {
    if (!options?.nodeIds || !options?.onStepNode) return;
    if (state.status === 'idle') return;
    const nodeId = options.nodeIds[state.currentStep];
    if (nodeId && state.currentStep !== lastReportedStepRef.current) {
      lastReportedStepRef.current = state.currentStep;
      options.onStepNode(nodeId);
    }
  }, [state.status, state.currentStep, options?.nodeIds, options?.onStepNode]);

  return [state, { play, pause, reset, stepForward, stepBackward, setStep }];
}
