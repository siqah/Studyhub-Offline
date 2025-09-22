import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { loadQuiz, SubjectKey, Question } from '../data/loaders';
import useStudyTimer from '../hooks/useStudyTimer';
import { useQuizStore } from '../store/useQuizStore';

type RouteParams = { subject: SubjectKey };

export default function QuestionsPickerScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { loadQuestions } = useQuizStore();
  const subject: SubjectKey = (route.params as RouteParams)?.subject ?? 'Mathematics';
  useStudyTimer('questions-picker', subject);

  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setError(null);
    setQuestions(null);
    (async () => {
      try {
        const data = await loadQuiz(subject);
        if (!active) return;
        setQuestions(data);
      } catch (e) {
        if (!active) return;
        setError('Failed to load questions.');
        setQuestions([]);
      }
    })();
    return () => { active = false; };
  }, [subject]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!questions) return;
    setSelected(new Set(questions.map(q => q.id)));
  };

  const clearAll = () => setSelected(new Set());

  const startWithSelected = () => {
    if (!questions) return;
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const picked = questions.filter(q => ids.includes(q.id)).map(q => ({ ...q, _subject: subject } as any));
    loadQuestions(picked as any);
    navigation.navigate('Quiz');
  };

  const startAll = () => {
    if (!questions || questions.length === 0) return;
    const picked = questions.map(q => ({ ...q, _subject: subject } as any));
    loadQuestions(picked as any);
    navigation.navigate('Quiz');
  };

  const countSelected = selected.size;

  if (!questions) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#6B7280' }}>{error ?? 'Loading questions…'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject} — Choose Questions</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#E5E7EB' }]} onPress={selectAll}>
          <Text style={styles.smallBtnText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#FEE2E2' }]} onPress={clearAll}>
          <Text style={[styles.smallBtnText, { color: '#991B1B' }]}>Clear</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.primaryBtn, countSelected === 0 && styles.disabledBtn]}
          onPress={startWithSelected}
          disabled={countSelected === 0}
        >
          <Text style={styles.primaryBtnText}>Start Selected ({countSelected})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item, index }) => {
          const isOn = selected.has(item.id);
          return (
            <TouchableOpacity style={[styles.item, isOn && styles.itemOn]} onPress={() => toggle(item.id)}>
              <View style={[styles.checkbox, isOn ? styles.checkboxOn : styles.checkboxOff]} />
              <Text style={styles.itemText}>{index + 1}. {item.question}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={[styles.secondaryBtn, (questions.length === 0) && styles.disabledBtn]} onPress={startAll} disabled={questions.length === 0}>
        <Text style={styles.secondaryBtnText}>Start All ({questions.length})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  smallBtnText: { fontWeight: '600', color: '#111827' },
  primaryBtn: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: 'white', fontWeight: '700' },
  disabledBtn: { opacity: 0.5 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, marginBottom: 8 },
  itemOn: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  checkbox: { width: 18, height: 18, borderRadius: 4 },
  checkboxOn: { backgroundColor: '#10B981' },
  checkboxOff: { backgroundColor: '#E5E7EB' },
  itemText: { color: '#111827', flex: 1 },
});
