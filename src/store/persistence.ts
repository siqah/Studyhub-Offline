import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'kcse:progress';

export type Session = { subject: string; score: number; total: number; date: string; durationMs?: number };
export type Progress = {
  quizzesTaken: number;
  totalScore: number;
  sessions: Session[];
  totalDurationMs?: number; // accumulated time across sessions
  bookmarks?: Record<string, boolean>; // key: `${subject}:${id}`
  wrong?: Record<string, number>; // key: `${subject}:${id}` count of wrong attempts
};

export const saveProgress = async (progress: Progress) => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress', e);
  }
};

export const loadProgress = async (): Promise<Progress | null> => {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Progress;
    // ensure defaults for new fields
    parsed.totalDurationMs = parsed.totalDurationMs ?? 0;
    return parsed;
  } catch (e) {
    console.warn('Failed to load progress', e);
    return null;
  }
};

export const resetProgress = async () => {
  try {
    await AsyncStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.warn('Failed to reset progress', e);
  }
};

// --- new helpers ---
const keyFor = (subject: string, id: number | string) => `${subject}:${id}`;

/**
 * Adds elapsed study time (in ms) to the accumulated totalDurationMs.
 * Safe to call frequently; initializes defaults if needed.
 */
export async function addStudyDuration(deltaMs: number) {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
  const current = (await loadProgress()) ?? { quizzesTaken: 0, totalScore: 0, sessions: [] } as Progress;
  current.totalDurationMs = (current.totalDurationMs ?? 0) + deltaMs;
  await saveProgress(current);
}

export async function toggleBookmark(subject: string, id: number, on: boolean) {
  const current = (await loadProgress()) ?? { quizzesTaken: 0, totalScore: 0, sessions: [], bookmarks: {}, wrong: {} };
  current.bookmarks = current.bookmarks ?? {};
  const k = keyFor(subject, id);
  if (on) current.bookmarks[k] = true; else delete current.bookmarks[k];
  await saveProgress(current);
}

export async function isBookmarked(subject: string, id: number): Promise<boolean> {
  const current = (await loadProgress());
  if (!current || !current.bookmarks) return false;
  return !!current.bookmarks[keyFor(subject, id)];
}

export async function recordAnswer(subject: string, id: number, correct: boolean) {
  const current = (await loadProgress()) ?? { quizzesTaken: 0, totalScore: 0, sessions: [], bookmarks: {}, wrong: {} };
  current.wrong = current.wrong ?? {};
  const k = keyFor(subject, id);
  if (!correct) current.wrong[k] = (current.wrong[k] ?? 0) + 1;
  else if (current.wrong[k]) delete current.wrong[k]; // clear when answered correctly
  await saveProgress(current);
}

export async function getWrongForSubject(subject: string): Promise<number[]> {
  const current = await loadProgress();
  if (!current || !current.wrong) return [];
  const ids: number[] = [];
  for (const k of Object.keys(current.wrong)) {
    const [subj, id] = k.split(':');
    if (subj === subject) ids.push(Number(id));
  }
  return ids;
}
