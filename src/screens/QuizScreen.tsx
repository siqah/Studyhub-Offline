import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuizStore } from '../store/useQuizStore';
import QuestionCard from '../components/QuestionCard';
import { toggleBookmark, isBookmarked } from '../store/persistence';
import useStudyTimer from '../hooks/useStudyTimer';
import { useNavigation } from '@react-navigation/native';

export default function QuizScreen() {
  const navigation = useNavigation<any>();
  const { questions, currentQuestion, submitAnswer, nextQuestion, score, isQuizComplete, reset, currentSelected, isAnswered } = useQuizStore();
  const current = questions && questions.length > 0 ? (questions[0] as any) : null;
  const subj = current?._subject ?? undefined;
  useStudyTimer('quiz', subj);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0 || currentQuestion >= questions.length) return;
    const q: any = questions[currentQuestion];
    const subject = q._subject ?? 'Unknown';
    isBookmarked(subject, q.id).then(setBookmarked);
  }, [questions, currentQuestion]);

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No questions loaded.</Text>
      </View>
    );
  }

  if (isQuizComplete || currentQuestion >= questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Finished!</Text>
        <Text style={styles.subtitle}>Your Score: {score}/{questions.length}</Text>

        <TouchableOpacity style={[styles.startButton, { marginTop: 20 }]} onPress={() => { reset(); navigation.navigate('Home'); }}>
          <Text style={styles.startButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q: any = questions[currentQuestion];
  const subject = q._subject ?? 'Unknown';

  const onToggleBookmark = async () => {
    const next = !bookmarked;
    await toggleBookmark(subject, q.id, next);
    setBookmarked(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={[styles.bookmarkBtn, bookmarked ? styles.bookmarkOn : styles.bookmarkOff]} onPress={onToggleBookmark}>
          <Text style={styles.bookmarkText}>{bookmarked ? '★ Bookmarked' : '☆ Bookmark'}</Text>
        </TouchableOpacity>
      </View>

      <QuestionCard
        question={q.question}
        options={q.options}
        onSelect={(opt: string) => submitAnswer(opt)}
        selected={currentSelected}
        isAnswered={isAnswered}
        correctAnswer={q.answer}
      />

      {/* Show feedback and next button when answered */}
      {isAnswered && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>
            {currentSelected === q.answer ? 'Correct 🎉' : `Wrong — correct: ${q.answer}`}
          </Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => nextQuestion()}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.progress}>{currentQuestion}/{questions.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bookmarkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bookmarkOn: { backgroundColor: '#FDE68A' },
  bookmarkOff: { backgroundColor: '#E5E7EB' },
  bookmarkText: { fontWeight: '600', color: '#111827' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  progress: {
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
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
