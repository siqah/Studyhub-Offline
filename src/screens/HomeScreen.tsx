import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StatusBar, StyleSheet, RefreshControl } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SubjectCard from "../components/SubjectCard";
import { loadProgress, Progress } from "../store/persistence";

type Subject = {
  name: string;
  color: string;
  icon: string;
  description: string;
};

const subjects: Subject[] = [
  {
    name: "Mathematics",
    color: "#3B82F6",
    icon: "📐",
    description: "Algebra, Geometry, Calculus"
  },
  {
    name: "English",
    color: "#10B981", 
    icon: "📚",
    description: "Grammar, Literature, Composition"
  },
  {
    name: "Physics",
    color: "#8B5CF6",
    icon: "⚛️",
    description: "Mechanics, Waves, Electricity"
  },
  {
    name: "Machine Learning",
    color: "#F59E0B",
    icon: "🤖",
    description: "Algorithms, Models, Data"
  }
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshProgress = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await loadProgress();
      setProgress(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    refreshProgress();
  }, [refreshProgress]);

  useFocusEffect(
    useCallback(() => {
      // refresh whenever screen gains focus
      refreshProgress();
      return () => {};
    }, [refreshProgress])
  );

  const quizzesTaken = progress?.quizzesTaken ?? 0;
  const totalAnswered = progress?.sessions?.reduce((s, x) => s + x.total, 0) ?? 0;
  const avgScore = totalAnswered > 0 ? Math.round((progress!.totalScore / totalAnswered) * 100) : 0;

  const totalDurationMs = progress?.totalDurationMs ?? 0;
  const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // per-subject stats map: { [subject]: { attempts, avg } }
  const perSubject = React.useMemo(() => {
    const map: Record<string, { attempts: number; avg: number }> = {};
    const sessions = progress?.sessions ?? [];
    const grouped: Record<string, { totalScore: number; total: number; attempts: number }> = {};
    for (const s of sessions) {
      if (!grouped[s.subject]) grouped[s.subject] = { totalScore: 0, total: 0, attempts: 0 };
      grouped[s.subject].totalScore += s.score;
      grouped[s.subject].total += s.total;
      grouped[s.subject].attempts += 1;
    }
    for (const key of Object.keys(grouped)) {
      const g = grouped[key];
      map[key] = {
        attempts: g.attempts,
        avg: g.total > 0 ? Math.round((g.totalScore / g.total) * 100) : 0,
      };
    }
    return map;
  }, [progress?.sessions]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>StudyHub Offline</Text>
        <Text style={styles.subtitle}>Master your subjects with practice quizzes</Text>
      </View>

      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshProgress} />}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎯 Ready to Practice?</Text>
          <Text style={styles.welcomeText}>Choose a subject below and start your revision journey!</Text>
        </View>

        {/* Subjects */}
        <Text style={styles.sectionTitle}>Subjects</Text>
        {subjects.map((subject) => {
          const stats = perSubject[subject.name] ?? { attempts: 0, avg: 0 };
          return (
            <SubjectCard
              key={subject.name}
              name={subject.name}
              description={subject.description}
              icon={subject.icon}
              color={subject.color}
              onPress={() => navigation.navigate("Subject", { subject: subject.name })}
              rightSlot={
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>{stats.avg}%</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{stats.attempts} tries</Text>
                </View>
              }
            />
          );
        })}

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{quizzesTaken}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{avgScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{timeLabel}</Text>
              <Text style={styles.statLabel}>Time Studied</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
});
