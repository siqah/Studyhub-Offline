import { useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { addStudyDuration } from '../store/persistence';

/**
 * Tracks focused time on a screen and accumulates it into total study duration.
 * Starts a timer on focus and saves elapsed time on blur/unmount.
 */
export function useStudyTimer(key?: string, subject?: string) {
  const startRef = useRef<number | null>(null);

  useFocusEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (() => {
      startRef.current = Date.now();
      return () => {
        const start = startRef.current;
        if (start) {
          const delta = Date.now() - start;
          // fire and forget; persistence handles merging
          addStudyDuration(delta, subject).catch(() => {});
          startRef.current = null;
        }
      };
    })()
  );
}

export default useStudyTimer;
