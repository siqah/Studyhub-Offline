import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { loadNotes, Lesson, SubjectKey } from '../data/loaders';
import useStudyTimer from '../hooks/useStudyTimer';

export default function NotesListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const subject = route.params.subject as SubjectKey;
  useStudyTimer('notes-list', subject);

  const [notes, setNotes] = React.useState<Lesson[] | null>(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadNotes(subject);
      if (mounted) setNotes(data);
    })();
    return () => { mounted = false; };
  }, [subject]);

  const filtered = React.useMemo(() => {
    if (!notes) return [] as Lesson[];
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
    );
  }, [notes, query]);

  if (!notes) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading notes…</Text>
      </View>
    );
  }

  if (notes.length === 0) {
    return (
      <View style={[styles.center, { paddingHorizontal: 24 }]}> 
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{subject}</Text>
        <Text style={{ color: '#6B7280', textAlign: 'center' }}>No notes found for this subject yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TextInput
          placeholder="Search notes…"
          value={query}
          onChangeText={setQuery}
          style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        data={filtered}
        keyExtractor={(item, idx) => `${idx}-${item.title}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('NoteDetail', { subject, lesson: item })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>{item.content}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { color: '#374151', marginTop: 6 },
});
