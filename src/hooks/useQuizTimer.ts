import { useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { addStudyDuration } from '../store/persistence';

/**
 * Specialized timer for quiz sessions that tracks active quiz time.
 * Different from useStudyTimer as it tracks actual quiz engagement time.
 */
export function useQuizTimer(subject?: string, isActive: boolean = true) {
  const startRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastPauseRef = useRef<number | null>(null);
  const totalQuizTimeRef = useRef<number>(0);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const now = Date.now();
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - pause timer
        if (startRef.current && !lastPauseRef.current && isActive) {
          lastPauseRef.current = now;
        }
      } else if (nextAppState === 'active') {
        // App coming to foreground - resume timer
        if (lastPauseRef.current && isActive) {
          const pauseDuration = now - lastPauseRef.current;
          pausedTimeRef.current += pauseDuration;
          lastPauseRef.current = null;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isActive]);

  // Start timer when quiz becomes active
  useEffect(() => {
    if (isActive && !startRef.current) {
      startRef.current = Date.now();
      pausedTimeRef.current = 0;
      lastPauseRef.current = null;
    } else if (!isActive && startRef.current) {
      // Quiz finished - calculate total time and save
      const now = Date.now();
      let quizTime = now - startRef.current;
      
      // Subtract paused time
      quizTime -= pausedTimeRef.current;
      if (lastPauseRef.current) {
        quizTime -= (now - lastPauseRef.current);
      }

      totalQuizTimeRef.current = quizTime;

      // Save quiz time if meaningful (more than 5 seconds)
      if (quizTime > 5000 && subject) {
        addStudyDuration(quizTime, subject).catch((error) => {
          console.warn('Failed to save quiz duration:', error);
        });
      }

      // Reset refs
      startRef.current = null;
      pausedTimeRef.current = 0;
      lastPauseRef.current = null;
    }
  }, [isActive, subject]);

  // Handle screen focus/blur
  useFocusEffect(
    (() => {
      // If quiz is active when screen is focused, ensure timer is running
      if (isActive && !startRef.current) {
        startRef.current = Date.now();
        pausedTimeRef.current = 0;
        lastPauseRef.current = null;
      }

      return () => {
        // Don't save on blur - let the isActive effect handle saving
        // This prevents double-saving when quiz completes
      };
    })
  );

  // Get current quiz duration for display purposes
  const getCurrentDuration = (): number => {
    if (!startRef.current) return totalQuizTimeRef.current;
    
    const now = Date.now();
    let duration = now - startRef.current;
    duration -= pausedTimeRef.current;
    
    if (lastPauseRef.current) {
      duration -= (now - lastPauseRef.current);
    }
    
    return Math.max(0, duration);
  };

  return {
    getCurrentDuration,
    totalQuizTime: totalQuizTimeRef.current,
  };
}

export default useQuizTimer;