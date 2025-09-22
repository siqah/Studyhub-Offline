import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuizStore } from '../store/useQuizStore';
import { getWrongForSubject } from '../store/persistence';
import { loadQuiz, loadNotes, SubjectKey, Question } from '../data/loaders';

type RouteParams = { subject?: SubjectKey };
type WithSubject = Question & { _subject: SubjectKey };

const MAX_QUESTIONS = 15;

export default function SubjectScreen() {
  const route = useRoute<any>(); // Keep loose to avoid coupling with app-wide types
  const navigation = useNavigation<any>();
  const { loadQuestions } = useQuizStore();

  const subject: SubjectKey = (route.params as RouteParams)?.subject ?? 'Mathematics';

  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [dataset, setDataset] = useState<Question[] | null>(null);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const isLoading = dataset === null;

  const refreshWrongAndNotes = useCallback(() => {
    let active = true;
    (async () => {
      try {
        const [ids, notes] = await Promise.all([
          getWrongForSubject(subject),
          loadNotes(subject),
        ]);
        if (!active) return;
        setWrongIds(ids);
        setNotesCount(notes.length);
      } catch (e) {
        if (!active) return;
        setError('Failed to load progress and notes.');
      }
    })();
    return () => {
      active = false;
    };
  }, [subject]);

  useFocusEffect(refreshWrongAndNotes);

  useEffect(() => {
    let active = true;
    setError(null);
    setDataset(null);
    (async () => {
      try {
        const qz = await loadQuiz(subject);
        if (!active) return;
        setDataset(qz);
      } catch {
        if (!active) return;
        setError('Failed to load questions.');
        setDataset([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [subject]);

  const startQuiz = useCallback(() => {
    if (!dataset || dataset.length === 0) return;

    // Fisher–Yates shuffle on a copy
    const shuffled = dataset.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const sampled = shuffled.slice(0, Math.min(MAX_QUESTIONS, shuffled.length));
    const withSubject: WithSubject[] = sampled.map(q => ({ ...q, _subject: subject }));
    loadQuestions(withSubject);
    navigation.navigate('Quiz');
  }, [dataset, subject, loadQuestions, navigation]);

  const startReview = useCallback(() => {
    if (!dataset || dataset.length === 0) return;
    const filtered: WithSubject[] = dataset
      .filter(q => wrongIds.includes(q.id))
      .map(q => ({ ...q, _subject: subject }));
    if (filtered.length === 0) return;
    loadQuestions(filtered);
    navigation.navigate('Quiz');
  }, [dataset, wrongIds, subject, loadQuestions, navigation]);

  const preview = useMemo(() => (dataset ?? []).slice(0, 3), [dataset]);

  const hasQuestions = (dataset?.length ?? 0) > 0;
  const reviewCount = useMemo(
    () => (dataset ? dataset.filter(q => wrongIds.includes(q.id)).length : 0),
    [dataset, wrongIds]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject} Revision</Text>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      )}

      {!isLoading && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!isLoading && !error && (
        <Text style={styles.subtitle}>Number of questions: {dataset?.length ?? 0}</Text>
      )}

      {!isLoading && hasQuestions && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview</Text>
          {preview.map(q => (
            <Text key={q.id} style={styles.previewItem}>• {q.question}</Text>
          ))}
        </View>
      )}

      {!isLoading && !hasQuestions && !error && (
        <Text style={styles.emptyText}>No questions available for this subject.</Text>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, (!hasQuestions || isLoading) && styles.disabledButton]}
        onPress={startQuiz}
        disabled={!hasQuestions || isLoading}
        accessibilityRole="button"
        accessibilityLabel="Start Quiz"
        testID="start-quiz"
      >
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>

      {/* Pick specific questions */}
      <TouchableOpacity
        style={[styles.primaryButton, styles.pickButton, (!hasQuestions || isLoading) && styles.disabledButton]}
        onPress={() => navigation.navigate('QuestionsPicker', { subject })}
        disabled={!hasQuestions || isLoading}
        accessibilityRole="button"
        accessibilityLabel="Pick Questions"
        testID="pick-questions"
      >
        <Text style={styles.buttonText}>Pick Questions</Text>
      </TouchableOpacity>

      {reviewCount > 0 && (
        <TouchableOpacity
          style={[styles.primaryButton, styles.reviewButton]}
          onPress={startReview}
          accessibilityRole="button"
          accessibilityLabel="Review Mistakes"
          testID="review-mistakes"
        >
          <Text style={styles.buttonText}>Review Mistakes ({reviewCount})</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, styles.notesButton, notesCount === 0 && styles.disabledButton]}
        onPress={() => navigation.navigate('NotesList', { subject })}
        disabled={notesCount === 0}
        accessibilityRole="button"
        accessibilityLabel="View Notes"
        testID="view-notes"
      >
        <Text style={styles.buttonText}>View Notes ({notesCount})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  loadingRow: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  previewItem: {
    color: '#374151',
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButton: {
    marginTop: 12,
    backgroundColor: '#F59E0B',
  },
  notesButton: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
  },
  pickButton: {
    marginTop: 12,
    backgroundColor: '#8B5CF6',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
