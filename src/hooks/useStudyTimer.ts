import { useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { addStudyDuration } from '../store/persistence';

/**
 * Tracks focused time on a screen and accumulates it into total study duration.
 * Automatically pauses when app goes to background and resumes on foreground.
 * Starts a timer on focus and saves elapsed time on blur/unmount.
 */
export function useStudyTimer(key?: string, subject?: string) {
  const startRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastPauseRef = useRef<number | null>(null);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const now = Date.now();
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - pause timer
        if (startRef.current && !lastPauseRef.current) {
          lastPauseRef.current = now;
        }
      } else if (nextAppState === 'active') {
        // App coming to foreground - resume timer
        if (lastPauseRef.current) {
          const pauseDuration = now - lastPauseRef.current;
          pausedTimeRef.current += pauseDuration;
          lastPauseRef.current = null;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (() => {
      // Reset pause tracking on focus
      startRef.current = Date.now();
      pausedTimeRef.current = 0;
      lastPauseRef.current = null;

      return () => {
        const start = startRef.current;
        if (start) {
          let delta = Date.now() - start;
          
          // Subtract any paused time
          delta -= pausedTimeRef.current;
          
          // Handle case where app is currently paused
          if (lastPauseRef.current) {
            delta -= (Date.now() - lastPauseRef.current);
          }

          // Only save if we have meaningful time (more than 1 second)
          if (delta > 1000) {
            // fire and forget; persistence handles merging
            addStudyDuration(delta, subject).catch((error) => {
              console.warn('Failed to save study duration:', error);
            });
          }
          
          startRef.current = null;
          pausedTimeRef.current = 0;
          lastPauseRef.current = null;
        }
      };
    })()
  );
}

export default useStudyTimer;
