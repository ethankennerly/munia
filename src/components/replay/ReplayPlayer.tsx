'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Action } from '@/lib/replay/encoding';
import { decodeAction } from '@/lib/replay/encoding';
import { createCommandFromAction } from '@/lib/replay/commands';
import { defaultCommandPlayer } from '@/lib/replay/commandPlayer';
import { useReplayContext } from '@/lib/replay/replayContext';

type ReplayState = 'idle' | 'playing' | 'paused' | 'completed';

interface ReplayPlayerProps {
  actions: Action[];
  onComplete?: () => void;
}

/**
 * Replays recorded session commands (routes and activations)
 */
export function ReplayPlayer({ actions, onComplete }: ReplayPlayerProps) {
  const { setIsReplaying } = useReplayContext();
  const [state, setState] = useState<ReplayState>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const replayWindowRef = useRef<Window | null>(null);

  const executeAction = useCallback((action: Action, targetWindow: Window) => {
    // Convert action to command and execute using shared CommandPlayer
    const command = createCommandFromAction(action);
    const context = {
      window: targetWindow,
      document: targetWindow.document,
    };
    defaultCommandPlayer.executeCommand(command, context);
  }, []);

  const scheduleNextAction = useCallback(
    (index: number, delayOverride?: number) => {
      if (index >= actions.length) {
        isPlayingRef.current = false;
        setIsReplaying(false); // Allow recording again when completed
        setState('completed');
        setCurrentIndex(actions.length);
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const currentAction = actions[index - 1];
      const nextAction = actions[index];

      // Calculate delay based on timestamps
      let delay = 0;
      if (delayOverride !== undefined) {
        delay = delayOverride;
      } else if (currentAction && startTimeRef.current) {
        const timeDiff = nextAction.timestamp - currentAction.timestamp;
        delay = Math.max(0, timeDiff); // Ensure non-negative
      } else {
        delay = 500; // Default 500ms between actions
      }

      // Cap delay at 5 seconds max for reasonable replay speed
      delay = Math.min(delay, 5000);

      timeoutRef.current = setTimeout(() => {
        // Check ref instead of state to avoid setState during action execution
        if (isPlayingRef.current && replayWindowRef.current && !replayWindowRef.current.closed) {
          // Execute action in the replay window
          executeAction(nextAction, replayWindowRef.current);
          setCurrentIndex(index + 1);
          scheduleNextAction(index + 1);
        } else if (isPlayingRef.current && (!replayWindowRef.current || replayWindowRef.current.closed)) {
          // Window was closed, stop replay
          isPlayingRef.current = false;
          setIsReplaying(false);
          setState('idle');
          setCurrentIndex(0);
          startTimeRef.current = null;
          pausedTimeRef.current = null;
        }
      }, delay);
    },
    [actions, executeAction, onComplete, setIsReplaying],
  );

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPlayingRef.current = false;
    setIsReplaying(false); // Allow recording again when stopped
    // Close replay window
    if (replayWindowRef.current && !replayWindowRef.current.closed) {
      replayWindowRef.current.close();
    }
    replayWindowRef.current = null;
    setState('idle');
    setCurrentIndex(0);
    startTimeRef.current = null;
    pausedTimeRef.current = null;
  }, [setIsReplaying]);

  const play = useCallback(() => {
    if (actions.length === 0) return;

    // Open new window for replay if not already open
    if (!replayWindowRef.current || replayWindowRef.current.closed) {
      const newWindow = window.open('/', '_blank', 'width=1200,height=800');
      if (!newWindow) {
        // eslint-disable-next-line no-alert
        alert('Please allow popups to replay sessions');
        return;
      }
      replayWindowRef.current = newWindow;

      // Update title in the replay window
      const updateTitle = () => {
        if (newWindow.document && newWindow.document.title) {
          const currentTitle = newWindow.document.title;
          if (!currentTitle.includes('Replay')) {
            newWindow.document.title = `${currentTitle} - Replay`;
          }
        }
      };

      // Try to update title immediately
      if (newWindow.document) {
        updateTitle();
      }

      // Update title when window loads
      newWindow.addEventListener('load', () => {
        setTimeout(updateTitle, 100);
      });

      // Poll for title updates (in case title changes after load)
      const titleInterval = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(titleInterval);
          return;
        }
        updateTitle();
      }, 1000);

      // Clear interval after 10 seconds (title should be set by then)
      setTimeout(() => {
        clearInterval(titleInterval);
      }, 10000);
    }

    // Update ref first
    isPlayingRef.current = true;
    setIsReplaying(true); // Prevent recording during replay

    setState((currentState) => {
      if (currentState === 'paused' && pausedTimeRef.current !== null) {
        // Resume from paused position
        const remainingTime = pausedTimeRef.current;
        pausedTimeRef.current = null;
        // Defer to avoid setState during render
        setTimeout(() => {
          scheduleNextAction(currentIndex, remainingTime);
        }, 0);
        return 'playing';
      }
      // Start from beginning or current position
      startTimeRef.current = Date.now();
      // Wait for window to load before executing first action
      const checkWindowReady = () => {
        if (replayWindowRef.current && !replayWindowRef.current.closed) {
          if (replayWindowRef.current.document.readyState === 'complete') {
            setTimeout(() => {
              if (isPlayingRef.current && currentIndex < actions.length && replayWindowRef.current) {
                executeAction(actions[currentIndex], replayWindowRef.current);
                scheduleNextAction(currentIndex + 1);
              }
            }, 500); // Small delay to ensure window is ready
          } else {
            replayWindowRef.current.addEventListener('load', () => {
              setTimeout(() => {
                if (isPlayingRef.current && currentIndex < actions.length && replayWindowRef.current) {
                  executeAction(actions[currentIndex], replayWindowRef.current);
                  scheduleNextAction(currentIndex + 1);
                }
              }, 500);
            });
          }
        }
      };
      checkWindowReady();
      return 'playing';
    });
  }, [actions, currentIndex, executeAction, scheduleNextAction, setIsReplaying]);

  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPlayingRef.current = false;
    setIsReplaying(false); // Allow recording again when paused
    setState('paused');
    pausedTimeRef.current = null; // Will be calculated on resume
  }, [setIsReplaying]);

  // Reset when actions change
  useEffect(() => {
    isPlayingRef.current = false;
    setIsReplaying(false);
    // Close replay window if open
    if (replayWindowRef.current && !replayWindowRef.current.closed) {
      replayWindowRef.current.close();
    }
    replayWindowRef.current = null;
    setState('idle');
    setCurrentIndex(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [actions, setIsReplaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayWindowRef.current && !replayWindowRef.current.closed) {
        replayWindowRef.current.close();
      }
    };
  }, []);

  const progress = actions.length > 0 ? (currentIndex / actions.length) * 100 : 0;
  const progressStyle = useMemo(() => ({ width: `${progress}%` }), [progress]);

  const handlePlay = useCallback(() => {
    play();
  }, [play]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleResume = useCallback(() => {
    play();
  }, [play]);

  return (
    <div className="mt-4 rounded border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Replay Controls</h3>
        <div className="flex gap-2">
          {state === 'idle' && (
            <button
              type="button"
              onClick={handlePlay}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              Play
            </button>
          )}
          {state === 'playing' && (
            <button
              type="button"
              onClick={handlePause}
              className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600">
              Pause
            </button>
          )}
          {state === 'paused' && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Resume
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600">
                Stop
              </button>
            </>
          )}
          {state === 'completed' && (
            <button
              type="button"
              onClick={handleStop}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600">
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="mb-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-500" style={progressStyle} />
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {currentIndex} / {actions.length} actions
        </div>
      </div>
      {state !== 'idle' && state !== 'completed' && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Status: <span className="font-semibold capitalize">{state}</span>
        </div>
      )}
    </div>
  );
}
