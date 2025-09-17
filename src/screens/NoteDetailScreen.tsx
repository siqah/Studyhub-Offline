import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { Lesson, SubjectKey } from '../data/loaders';
import useStudyTimer from '../hooks/useStudyTimer';

export default function NoteDetailScreen() {
  const route = useRoute<any>();
  const lesson = route.params.lesson as Lesson;
  const subject = route.params.subject as SubjectKey;
  useStudyTimer('note-detail');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.breadcrumb}>{subject}</Text>
      <Text style={styles.title}>{lesson.title}</Text>

      <Text style={styles.content}>{lesson.content}</Text>

      {lesson.examples?.length ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Examples</Text>
          {lesson.examples.map((ex, i) => (
            <Text key={i} style={styles.listItem}>• {ex}</Text>
          ))}
        </View>
      ) : null}

      {lesson.steps?.length ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Steps</Text>
          {lesson.steps.map((st, i) => (
            <Text key={i} style={styles.listItem}>{`${i + 1}. ${st}`}</Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  content: { marginTop: 12, fontSize: 16, lineHeight: 22, color: '#111827' },
  section: { fontSize: 18, fontWeight: '700', color: '#111827' },
  listItem: { marginTop: 6, color: '#111827' },
});
