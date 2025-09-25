/**
 * Time utility functions for formatting, validation, and debugging
 */

/**
 * Format milliseconds into a human-readable string
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format milliseconds for display in timer (MM:SS or H:MM:SS)
 */
export function formatTimerDisplay(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Validate if a duration is reasonable (not negative, not too large)
 */
export function isValidDuration(ms: number): boolean {
  return Number.isFinite(ms) && ms >= 0 && ms <= 24 * 60 * 60 * 1000; // Max 24 hours
}

/**
 * Sanitize duration - ensure it's a valid positive number
 */
export function sanitizeDuration(ms: number): number {
  if (!Number.isFinite(ms) || ms < 0) return 0;
  if (ms > 24 * 60 * 60 * 1000) return 24 * 60 * 60 * 1000; // Cap at 24 hours
  return Math.floor(ms);
}

/**
 * Calculate average time per item
 */
export function calculateAverage(totalMs: number, itemCount: number): number {
  if (!Number.isFinite(totalMs) || !Number.isFinite(itemCount) || itemCount <= 0) return 0;
  return Math.floor(totalMs / itemCount);
}

/**
 * Get current date string in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Debug utility to log time tracking information
 */
export function logTimeDebug(label: string, duration: number, subject?: string): void {
  if (__DEV__) {
    console.log(`[TimeTracker] ${label}: ${formatDuration(duration)}${subject ? ` (${subject})` : ''}`);
  }
}

/**
 * Performance tracking for development
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }

  end(): number {
    const duration = Date.now() - this.startTime;
    if (__DEV__) {
      console.log(`[Performance] ${this.label}: ${duration}ms`);
    }
    return duration;
  }
}

/**
 * Create a performance timer (only in development)
 */
export function createPerformanceTimer(label: string): PerformanceTimer | null {
  return __DEV__ ? new PerformanceTimer(label) : null;
}

export default {
  formatDuration,
  formatTimerDisplay,
  isValidDuration,
  sanitizeDuration,
  calculateAverage,
  getCurrentDateString,
  isSameDay,
  logTimeDebug,
  PerformanceTimer,
  createPerformanceTimer,
};