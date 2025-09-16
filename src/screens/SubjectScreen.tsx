import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuizStore } from '../store/useQuizStore';
import { getWrongForSubject } from '../store/persistence';

import mathData from '../data/math.json';
import englishData from '../data/english.json';
import physicsData from '../data/physics.json';
import mlData from '../data/ml.json';

export default function SubjectScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { loadQuestions } = useQuizStore();

  const subject: string = route.params?.subject ?? 'Mathematics';
  const [wrongIds, setWrongIds] = useState<number[]>([]);

  useEffect(() => {
    getWrongForSubject(subject).then(setWrongIds);
  }, [subject]);

  const dataset = subject === 'Mathematics' ? mathData : subject === 'English' ? englishData : subject === 'Physics' ? physicsData : mlData;

  const startQuiz = () => {
    const dataWithSubject = (dataset as any).map((q: any) => ({ ...q, _subject: subject }));
    loadQuestions(dataWithSubject);
    navigation.navigate('Quiz');
  };

  const startReview = () => {
    const filtered = (dataset as any).filter((q: any) => wrongIds.includes(q.id)).map((q: any) => ({ ...q, _subject: subject }));
    if (filtered.length === 0) return;
    loadQuestions(filtered);
    navigation.navigate('Quiz');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject} Revision</Text>
      <Text style={styles.subtitle}>Number of questions: {dataset.length}</Text>

      {/* small preview */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Preview</Text>
        {dataset.slice(0,3).map((q: any)=> (
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
