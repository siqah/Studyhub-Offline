import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTimeTracking } from '../contexts/TimeTrackingContext';

/**
 * Enhanced study timer hook that uses the centralized TimeTrackingContext.
 * Tracks time spent on a screen with automatic pause/resume and focus handling.
 */
export function useEnhancedStudyTimer(screenKey: string, subject?: string, type: 'screen' | 'quiz' | 'notes' = 'screen') {
  const { startSession, endSession, getSessionDuration, isSessionActive } = useTimeTracking();
  const sessionIdRef = useRef<string>(`${screenKey}-${Date.now()}`);

  // Handle screen focus/blur
  useFocusEffect(
    (() => {
      const sessionId = sessionIdRef.current;
      startSession(sessionId, subject, type);

      return () => {
        endSession(sessionId);
      };
    })
  );

  // Get current duration
  const getCurrentDuration = (): number => {
    return getSessionDuration(sessionIdRef.current);
  };

  // Check if session is active
  const isActive = (): boolean => {
    return isSessionActive(sessionIdRef.current);
  };

  return {
    getCurrentDuration,
    isActive,
    sessionId: sessionIdRef.current,
  };
}

export default useEnhancedStudyTimer;