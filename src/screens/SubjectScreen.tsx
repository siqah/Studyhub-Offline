import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuizStore } from '../store/useQuizStore';
import { getWrongForSubject } from '../store/persistence';
import { loadQuiz, loadNotes, SubjectKey, Question } from '../data/loaders';

export default function SubjectScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { loadQuestions } = useQuizStore();

  const subject: SubjectKey = route.params?.subject ?? 'Mathematics';
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [dataset, setDataset] = useState<Question[] | null>(null);
  const [notesCount, setNotesCount] = useState<number>(0);

  useEffect(() => {
    getWrongForSubject(subject).then(setWrongIds);
    let mounted = true;
    (async () => {
      const [qz, nts] = await Promise.all([
        loadQuiz(subject),
        loadNotes(subject)
      ]);
      if (!mounted) return;
      setDataset(qz);
      setNotesCount(nts.length);
    })();
    return () => { mounted = false; };
  }, [subject]);

  const startQuiz = () => {
    if (!dataset) return;
    // Shuffle and take up to 15 questions for each quiz session
    const shuffled = [...(dataset as any)];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const sampled = shuffled.slice(0, Math.min(15, shuffled.length));
    const dataWithSubject = sampled.map((q: any) => ({ ...q, _subject: subject }));
    loadQuestions(dataWithSubject);
    navigation.navigate('Quiz');
  };

  const startReview = () => {
    if (!dataset) return;
    const filtered = (dataset as any).filter((q: any) => wrongIds.includes(q.id)).map((q: any) => ({ ...q, _subject: subject }));
    if (filtered.length === 0) return;
    loadQuestions(filtered);
    navigation.navigate('Quiz');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject} Revision</Text>
      {!dataset ? (
        <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginLeft: 8, color: '#6B7280' }}>Loading…</Text>
        </View>
      ) : (
        <Text style={styles.subtitle}>Number of questions: {dataset.length}</Text>
      )}

      {/* small preview */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Preview</Text>
        {(dataset ?? []).slice(0,3).map((q: any)=> (
          <Text key={q.id} style={{ color: '#374151' }}>• {q.question}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </TouchableOpacity>

      {wrongIds.length > 0 && (
        <TouchableOpacity style={[styles.startButton, { marginTop: 12, backgroundColor: '#F59E0B' }]} onPress={startReview}>
          <Text style={styles.startButtonText}>Review Mistakes ({wrongIds.length})</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.startButton, { marginTop: 12, backgroundColor: '#3B82F6' }]} onPress={() => navigation.navigate('NotesList', { subject })}>
        <Text style={styles.startButtonText}>View Notes ({notesCount})</Text>
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
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
