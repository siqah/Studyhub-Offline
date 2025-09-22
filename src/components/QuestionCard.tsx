import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuestionCard = ({ question, options, onSelect, selected, isAnswered, correctAnswer }: any) =>{
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      {options.map((opt: string) => {
        const isCorrect = isAnswered && opt === correctAnswer;
        const isSelectedWrong = isAnswered && selected === opt && selected !== correctAnswer;
        const backgroundColor = isCorrect ? '#10B981' : isSelectedWrong ? '#EF4444' : '#3B82F6';

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.optionButton, { backgroundColor }]}
            onPress={() => onSelect(opt)}
            disabled={isAnswered}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default QuestionCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
  },
});
