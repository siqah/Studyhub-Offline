import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuizStore } from '../store/useQuizStore';

import mathData from '../data/math.json';
import englishData from '../data/english.json';
import physicsData from '../data/physics.json';
import mlData from '../data/ml.json';

export default function SubjectScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { loadQuestions } = useQuizStore();

  const subject: string = route.params?.subject ?? 'Mathematics';

  const startQuiz = () => {
    if (subject === 'Mathematics') {
      const data = (mathData as any).map((q: any) => ({ ...q, _subject: 'Mathematics' }));
      loadQuestions(data);
    }
    else if (subject === 'English') {
      const data = (englishData as any).map((q: any) => ({ ...q, _subject: 'English' }));
      loadQuestions(data);
    }
    else if (subject === 'Physics') {
      const data = (physicsData as any).map((q: any) => ({ ...q, _subject: 'Physics' }));
      loadQuestions(data);
    }
    else if (subject === 'Machine Learning') {
      const data = (mlData as any).map((q: any) => ({ ...q, _subject: 'Machine Learning' }));
      loadQuestions(data);
    }
    else loadQuestions(mathData as any);

    navigation.navigate('Quiz');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject} Revision</Text>
      <Text style={styles.subtitle}>Number of questions: {(() => {
        if (subject === 'Mathematics') return mathData.length;
        if (subject === 'English') return englishData.length;
        if (subject === 'Physics') return physicsData.length;
        return 0;
      })()}</Text>

      {/* small preview */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Preview</Text>
        {(subject === 'Mathematics' ? mathData : subject === 'English' ? englishData : physicsData).slice(0,3).map((q: any)=> (
          <Text key={q.id} style={{ color: '#374151' }}>• {q.question}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
        <Text style={styles.startButtonText}>Start Quiz</Text>
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
