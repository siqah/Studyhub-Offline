import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuizStore } from '../store/useQuizStore';
import QuestionCard from '../components/QuestionCard';

export default function QuizScreen() {
  const { questions, currentQuestion, submitAnswer, nextQuestion, score, isQuizComplete, reset, currentSelected, isAnswered } = useQuizStore();

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

        <TouchableOpacity style={[styles.startButton, { marginTop: 20 }]} onPress={() => { reset(); }}>
          <Text style={styles.startButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = questions[currentQuestion];

  return (
    <View style={styles.container}>
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
