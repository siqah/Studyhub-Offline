import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { addStudyDuration } from '../store/persistence';

interface TimeSession {
  id: string;
  subject?: string;
  startTime: number;
  pausedTime: number;
  lastPause?: number;
  type: 'screen' | 'quiz' | 'notes';
}

interface TimeTrackingContextType {
  startSession: (id: string, subject?: string, type?: 'screen' | 'quiz' | 'notes') => void;
  endSession: (id: string) => Promise<number>; // returns total duration
  pauseSession: (id: string) => void;
  resumeSession: (id: string) => void;
  getSessionDuration: (id: string) => number;
  isSessionActive: (id: string) => boolean;
  getAllActiveSessions: () => TimeSession[];
}

const TimeTrackingContext = createContext<TimeTrackingContextType | null>(null);

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};

interface TimeTrackingProviderProps {
  children: React.ReactNode;
}

export const TimeTrackingProvider: React.FC<TimeTrackingProviderProps> = ({ children }) => {
  const sessionsRef = useRef<Map<string, TimeSession>>(new Map());
  const appStateRef = useRef<AppStateStatus>('active');

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const now = Date.now();
      const sessions = sessionsRef.current;

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Pause all active sessions
        sessions.forEach((session) => {
          if (!session.lastPause) {
            session.lastPause = now;
          }
        });
      } else if (nextAppState === 'active' && appStateRef.current !== 'active') {
        // Resume all sessions that were paused
        sessions.forEach((session) => {
          if (session.lastPause) {
            const pauseDuration = now - session.lastPause;
            session.pausedTime += pauseDuration;
            session.lastPause = undefined;
          }
        });
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const startSession = useCallback((id: string, subject?: string, type: 'screen' | 'quiz' | 'notes' = 'screen') => {
    const sessions = sessionsRef.current;
    
    // End existing session with same ID if it exists
    if (sessions.has(id)) {
      endSession(id);
    }

    const session: TimeSession = {
      id,
      subject,
      startTime: Date.now(),
      pausedTime: 0,
      type,
    };

    sessions.set(id, session);
  }, []);

  const endSession = useCallback(async (id: string): Promise<number> => {
    const sessions = sessionsRef.current;
    const session = sessions.get(id);
    
    if (!session) return 0;

    const now = Date.now();
    let duration = now - session.startTime;
    
    // Subtract paused time
    duration -= session.pausedTime;
    
    // Handle current pause
    if (session.lastPause) {
      duration -= (now - session.lastPause);
    }

    // Remove session
    sessions.delete(id);

    // Save duration if meaningful (more than 1 second)
    if (duration > 1000 && session.subject) {
      try {
        await addStudyDuration(duration, session.subject);
      } catch (error) {
        console.warn(`Failed to save study duration for session ${id}:`, error);
      }
    }

    return Math.max(0, duration);
  }, []);

  const pauseSession = useCallback((id: string) => {
    const sessions = sessionsRef.current;
    const session = sessions.get(id);
    
    if (session && !session.lastPause) {
      session.lastPause = Date.now();
    }
  }, []);

  const resumeSession = useCallback((id: string) => {
    const sessions = sessionsRef.current;
    const session = sessions.get(id);
    
    if (session && session.lastPause) {
      const pauseDuration = Date.now() - session.lastPause;
      session.pausedTime += pauseDuration;
      session.lastPause = undefined;
    }
  }, []);

  const getSessionDuration = useCallback((id: string): number => {
    const sessions = sessionsRef.current;
    const session = sessions.get(id);
    
    if (!session) return 0;

    const now = Date.now();
    let duration = now - session.startTime;
    
    // Subtract paused time
    duration -= session.pausedTime;
    
    // Handle current pause
    if (session.lastPause) {
      duration -= (now - session.lastPause);
    }

    return Math.max(0, duration);
  }, []);

  const isSessionActive = useCallback((id: string): boolean => {
    return sessionsRef.current.has(id);
  }, []);

  const getAllActiveSessions = useCallback((): TimeSession[] => {
    return Array.from(sessionsRef.current.values());
  }, []);

  const value: TimeTrackingContextType = {
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getSessionDuration,
    isSessionActive,
    getAllActiveSessions,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export default TimeTrackingContext;