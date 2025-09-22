import { create } from "zustand";
import { saveProgress, loadProgress, Progress, recordAnswer } from './persistence';

export type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

type QuizState = {
  currentQuestion: number;
  score: number;
  questions: Question[];
  selectedAnswers: string[];
  isQuizComplete: boolean;
  currentSelected: string | null;
  isAnswered: boolean;
  _sessionStart?: number; // ms timestamp when quiz started
  loadQuestions: (data: Question[]) => void;
  submitAnswer: (selected: string) => void;
  nextQuestion: () => void;
  reset: () => void;
  getProgress: () => number;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuestion: 0,
  score: 0,
  questions: [],
  selectedAnswers: [],
  isQuizComplete: false,
  currentSelected: null,
  isAnswered: false,
  _sessionStart: undefined,
  
  loadQuestions: (data) => set({ 
    questions: data, 
    currentQuestion: 0, 
    score: 0, 
    selectedAnswers: [],
    isQuizComplete: false,
    currentSelected: null,
    isAnswered: false,
    _sessionStart: Date.now(),
  }),
  
  // record answer but do NOT advance — allow UI to show feedback
  submitAnswer: (selected) => {
    const { currentQuestion, questions, score, selectedAnswers, isAnswered } = get();
    if (isAnswered) return; // ignore repeated taps
    if (!questions || !questions.length) return;

    const current = questions[currentQuestion] as any;
    const correct = current.answer === selected;
    const newScore = correct ? score + 1 : score;
    const newSelectedAnswers = [...selectedAnswers, selected];

    set({
      score: newScore,
      selectedAnswers: newSelectedAnswers,
      currentSelected: selected,
      isAnswered: true,
    });

    // persist outcome for review/bookmarks
    const subject = current._subject ?? 'Unknown';
    const id = current.id ?? currentQuestion;
    recordAnswer(subject, id, correct).catch(() => {});
  },

  // advance to next question; when finished, persist the session
  nextQuestion: () => {
    const { currentQuestion, questions, score } = get();
    const next = currentQuestion + 1;
    const isComplete = next >= questions.length;

    if (isComplete) {
      set({ currentQuestion: next, isQuizComplete: true, isAnswered: false, currentSelected: null });
      // persist session
      (async () => {
        try {
          const existing = (await loadProgress()) || ({
            quizzesTaken: 0,
            totalScore: 0,
            sessions: [],
            totalDurationMs: 0,
            perSubjectDuration: {},
            todayDurationMs: 0,
            perSubjectTodayDuration: {},
            todayDate: undefined,
            bookmarks: {},
            wrong: {},
          } as unknown as Progress);

          const subject = (questions as any)[0]?._subject ?? 'Unknown';
          const start = get()._sessionStart ?? Date.now();
          const durationMs = Math.max(0, Date.now() - start);

          const newProgress: Progress = {
            // preserve everything from existing first
            ...existing,
            // update aggregate counters
            quizzesTaken: (existing.quizzesTaken ?? 0) + 1,
            totalScore: (existing.totalScore ?? 0) + score,
            // append session record
            sessions: [
              ...(existing.sessions ?? []),
              { subject, score, total: questions.length, date: new Date().toISOString(), durationMs },
            ],
            // keep time fields as-is; time tracked by useStudyTimer() separately
            totalDurationMs: existing.totalDurationMs ?? 0,
            perSubjectDuration: existing.perSubjectDuration ?? {},
            todayDurationMs: existing.todayDurationMs ?? 0,
            perSubjectTodayDuration: existing.perSubjectTodayDuration ?? {},
            // preserve other maps
            bookmarks: existing.bookmarks ?? {},
            wrong: existing.wrong ?? {},
          };

          await saveProgress(newProgress);
        } catch (e) {
          console.warn('Error saving progress', e);
        }
      })();
    } else {
      set({ currentQuestion: next, isAnswered: false, currentSelected: null });
    }
  },
  
  reset: () => set({ 
    currentQuestion: 0, 
    score: 0, 
    questions: [], 
    selectedAnswers: [],
    isQuizComplete: false,
    currentSelected: null,
    isAnswered: false,
  }),
  
  getProgress: () => {
    const { currentQuestion, questions } = get();
    return questions.length > 0 ? (currentQuestion / questions.length) * 100 : 0;
  },

  // helper to export/load persisted progress
  loadPersistedProgress: async () => {
    try {
      return await loadProgress();
    } catch (e) {
      return null;
    }
  }
}));
