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
  
  loadQuestions: (data) => set({ 
    questions: data, 
    currentQuestion: 0, 
    score: 0, 
    selectedAnswers: [],
    isQuizComplete: false,
    currentSelected: null,
    isAnswered: false,
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
          const existing = (await loadProgress()) || ({ quizzesTaken: 0, totalScore: 0, sessions: [] } as Progress);
          const subject = (questions as any)[0]?._subject ?? 'Unknown';
          const newProgress: Progress = {
            quizzesTaken: existing.quizzesTaken + 1,
            totalScore: existing.totalScore + score,
            sessions: [
              ...existing.sessions,
              { subject, score, total: questions.length, date: new Date().toISOString() }
            ]
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
