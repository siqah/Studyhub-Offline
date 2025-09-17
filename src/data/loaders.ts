export type SubjectKey = 'Mathematics' | 'English' | 'Physics' | 'Machine Learning';

export type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  topic?: string;
  difficulty?: string; // allow any string from datasets
  explanation?: string;
  _subject?: SubjectKey;
};

export type Lesson = {
  id?: number;
  title: string;
  content: string;
  examples?: string[];
  steps?: string[];
};

async function tryLoad<T>(fn: () => Promise<{ default: T }>): Promise<T | null> {
  try {
    const mod = await fn();
    return (mod as any).default as T;
  } catch {
    return null;
  }
}

export async function loadQuiz(subject: SubjectKey): Promise<Question[]> {
  // Use existing question JSON files for quizzes
  switch (subject) {
    case 'Mathematics': {
      const data = await tryLoad<Question[]>(() => import('./math.json'));
      return (data ?? []).map(q => ({ ...q, _subject: subject }));
    }
    case 'English': {
      const data = await tryLoad<Question[]>(() => import('./english.json'));
      return (data ?? []).map(q => ({ ...q, _subject: subject }));
    }
    case 'Physics': {
      const data = await tryLoad<Question[]>(() => import('./physics.json'));
      return (data ?? []).map(q => ({ ...q, _subject: subject }));
    }
    case 'Machine Learning': {
      const data = await tryLoad<Question[]>(() => import('./ml.json'));
      return (data ?? []).map(q => ({ ...q, _subject: subject }));
    }
    default:
      return [];
  }
}

export async function loadNotes(subject: SubjectKey): Promise<Lesson[]> {
  // unified notes shape: flatten levels arrays into one list
  type NotesFile = { subject?: string; levels?: Record<string, Lesson[]> } | Record<string, Lesson[]> | Lesson[];

  const flatten = (data: NotesFile | null): Lesson[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const out: Lesson[] = [];
    // case A: { levels: { Beginner: [...], Intermediate: [...], Advanced: [...] } }
    const levelsA = (data as any).levels as Record<string, Lesson[]> | undefined;
    if (levelsA) {
      Object.keys(levelsA).forEach(lvl => {
        const arr = levelsA[lvl] ?? [];
        arr.forEach(item => out.push(item));
      });
      return out;
    }
    // case B: direct keys Beginner/Intermediate/Advanced at top level
    const maybeLevels = data as Record<string, any>;
    ['Beginner', 'Intermediate', 'Advanced'].forEach(key => {
      if (Array.isArray(maybeLevels[key])) {
        (maybeLevels[key] as Lesson[]).forEach(item => out.push(item));
      }
    });
    return out;
  };

  switch (subject) {
    case 'Mathematics': {
      const file = await tryLoad<NotesFile>(() => import('./study_notes_all_subjects/Math_notes.json'));
      return flatten(file);
    }
    case 'English': {
      const file = await tryLoad<NotesFile>(() => import('./study_notes_all_subjects/English_notes.json'));
      return flatten(file);
    }
    case 'Physics': {
      const file = await tryLoad<NotesFile>(() => import('./study_notes_all_subjects/Physics_notes.json'));
      return flatten(file);
    }
    case 'Machine Learning': {
      const file = await tryLoad<NotesFile>(() => import('./study_notes_all_subjects/MachineLearning_notes.json'));
      return flatten(file);
    }
    default:
      return [];
  }
}
