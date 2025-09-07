import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'kcse:progress';

export type Progress = {
  quizzesTaken: number;
  totalScore: number;
  sessions: Array<{ subject: string; score: number; total: number; date: string }>;
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
    return JSON.parse(raw) as Progress;
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
