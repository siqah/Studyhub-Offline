import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SubjectCard from "../components/SubjectCard";
import { loadProgress, Progress } from "../store/persistence";
import { loadNotes, SubjectKey } from "../data/loaders";
import { getGitStats, getTimeSinceLastCommit, GitStats } from "../utils/gitUtils";

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
  const [notesCounts, setNotesCounts] = useState<Record<string, number>>({});
  const [gitStats, setGitStats] = useState<GitStats | null>(null);

  const lastNotesRefreshRef = useRef<number>(0);
  const refreshProgress = useCallback(async (includeNotes: boolean = false, showSpinner: boolean = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const [data, stats] = await Promise.all([
        loadProgress(),
        getGitStats()
      ]);
      setProgress(data);
      setGitStats(stats);
      if (includeNotes) {
        const entries = await Promise.all(
          subjects.map(async (s) => {
            const list = await loadNotes(s.name as SubjectKey);
            return [s.name, list.length] as const;
          })
        );
        setNotesCounts(Object.fromEntries(entries));
        lastNotesRefreshRef.current = Date.now();
      }
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // initial load includes notes counts (show spinner once)
    refreshProgress(true, true);
  }, [refreshProgress]);

  // Refresh on focus and keep stats live with a lightweight interval.
  // Only refresh notes counts occasionally to avoid heavy work.
  useFocusEffect(
    useCallback(() => {
      // On focus, do a single refresh including notes (no spinner)
      refreshProgress(true, false);
      return () => {};
    }, [refreshProgress])
  );

  const quizzesTaken = progress?.quizzesTaken ?? 0;
  const totalAnswered = progress?.sessions?.reduce((s, x) => s + x.total, 0) ?? 0;
  const avgScore = totalAnswered > 0 && progress ? Math.round((progress.totalScore / totalAnswered) * 100) : 0;

  const totalDurationMs = progress?.totalDurationMs ?? 0;
  const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const todayMs = progress?.todayDurationMs ?? 0;
  const tHours = Math.floor(todayMs / (1000 * 60 * 60));
  const tMinutes = Math.floor((todayMs % (1000 * 60 * 60)) / (1000 * 60));
  const todayLabel = tHours > 0 ? `${tHours}h ${tMinutes}m` : `${tMinutes}m`;

  const perSubject = useMemo(() => {
    const map: Record<string, { attempts: number; avg: number; timeMs: number }> = {};
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
        timeMs: progress?.perSubjectDuration?.[key] ?? 0,
      };
    }
    return map;
  }, [progress?.sessions, progress?.perSubjectDuration]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.appTitle}>StudyHub Offline</Text>
        </View>
        <Text style={styles.appSubtitle}>Learn anywhere. No internet required.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => refreshProgress(true, true)} />
        }
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎯 Ready to practice?</Text>
          <Text style={styles.welcomeText}>
            Choose a subject below and start your revision journey.
          </Text>
        </View>

          <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statItem, styles.statDividerRight]}>
              <Text style={styles.statNumber}>{quizzesTaken}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={[styles.statItem, styles.statDividerRight]}>
              <Text style={[styles.statNumber, styles.statNumberPositive]}>{avgScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statNumberAccent]}>{timeLabel}</Text>
              <Text style={styles.statLabel}>Time Studied</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Subjects</Text>
        <View style={styles.subjectList}>
          {subjects.map((subject) => {
            const stats = perSubject[subject.name] ?? { attempts: 0, avg: 0, timeMs: 0 };
            const tHrs = Math.floor((stats.timeMs ?? 0) / (1000 * 60 * 60));
            const tMin = Math.floor(((stats.timeMs ?? 0) % (1000 * 60 * 60)) / (1000 * 60));
            const timeStr = tHrs > 0 ? `${tHrs}h ${tMin}m` : `${tMin}m`;
            const subTodayMs = progress?.perSubjectTodayDuration?.[subject.name] ?? 0;
            const subTHrs = Math.floor(subTodayMs / (1000 * 60 * 60));
            const subTMin = Math.floor((subTodayMs % (1000 * 60 * 60)) / (1000 * 60));
            const subTodayStr = subTHrs > 0 ? `${subTHrs}h ${subTMin}m` : `${subTMin}m`;
            const nCount = notesCounts[subject.name] ?? 0;
            return (
              <View key={subject.name} style={styles.subjectItem}>
                <SubjectCard
                  name={subject.name}
                  description={subject.description}
                  icon={subject.icon}
                  color={subject.color}
                  onPress={() => navigation.navigate("Subject", { subject: subject.name })}
                  rightSlot={
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{stats.avg}%</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{stats.attempts} tries</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{nCount} notes</Text>
                    </View>
                  }
                />
              </View>
            );
          })}
        </View>

      
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // slate-50
  },

  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A', // slate-900
    letterSpacing: 0.2,
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B', // slate-500
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  statItemSmall: {
    flex: 1,
    alignItems: 'center',
  },
  statNumberSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...shadow,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  subjectList: {
    gap: 12,
  },
  subjectItem: {
    marginBottom: 0,
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...shadow,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  statDividerRight: {
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB', // blue-600
    marginBottom: 2,
  },
  statNumberPositive: {
    color: '#10B981', // emerald-500
  },
  statNumberAccent: {
    color: '#8B5CF6', // violet-500
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
});
