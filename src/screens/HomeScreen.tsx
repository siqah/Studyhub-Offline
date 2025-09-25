import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SubjectCard from "../components/SubjectCard";
import { loadProgress, Progress } from "../store/persistence";
import { loadNotes, SubjectKey } from "../data/loaders";
import { formatDuration } from "../utils/timeUtils";

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
  const [isLoading, setIsLoading] = useState(true);

  const lastNotesRefreshRef = useRef<number>(0);
  
  const refreshProgress = useCallback(async (includeNotes: boolean = false, showSpinner: boolean = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await loadProgress();
      setProgress(data);
      
      if (includeNotes) {
        const entries = await Promise.all(
          subjects.map(async (s) => {
            try {
              const list = await loadNotes(s.name as SubjectKey);
              return [s.name, list.length] as const;
            } catch (error) {
              console.warn(`Failed to load notes for ${s.name}:`, error);
              return [s.name, 0] as const;
            }
          })
        );
        setNotesCounts(Object.fromEntries(entries));
        lastNotesRefreshRef.current = Date.now();
      }
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    } finally {
      if (showSpinner) setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProgress(true, true);
  }, [refreshProgress]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) {
          await refreshProgress(true, false);
        }
      })();
      return () => { active = false; };
    }, [refreshProgress])
  );

  // Calculate quiz statistics
  const quizzesTaken = progress?.quizzesTaken ?? 0;
  const sessions = progress?.sessions ?? [];
  const totalAnswered = sessions.reduce((sum, session) => sum + (session.total || 0), 0);
  const totalScore = sessions.reduce((sum, session) => sum + (session.score || 0), 0);
  const avgScore = totalAnswered > 0 ? Math.round((totalScore / totalAnswered) * 100) : 0;

  // Calculate time statistics
  const totalDurationMs = progress?.totalDurationMs ?? 0;
  const timeLabel = formatDuration(totalDurationMs);

  const todayMs = progress?.todayDurationMs ?? 0;
  const todayLabel = formatDuration(todayMs);

  // Calculate per-subject statistics
  const perSubject = useMemo(() => {
    const map: Record<string, { attempts: number; avg: number; timeMs: number }> = {};
    
    // Initialize all subjects with zero values
    subjects.forEach(subject => {
      map[subject.name] = { attempts: 0, avg: 0, timeMs: 0 };
    });

    // Group sessions by subject
    const grouped: Record<string, { totalScore: number; total: number; attempts: number }> = {};
    
    sessions.forEach(session => {
      if (!session.subject) return;
      
      if (!grouped[session.subject]) {
        grouped[session.subject] = { totalScore: 0, total: 0, attempts: 0 };
      }
      
      grouped[session.subject].totalScore += session.score || 0;
      grouped[session.subject].total += session.total || 0;
      grouped[session.subject].attempts += 1;
    });

    // Calculate averages and add time data
    Object.keys(grouped).forEach(subjectName => {
      const g = grouped[subjectName];
      map[subjectName] = {
        attempts: g.attempts,
        avg: g.total > 0 ? Math.round((g.totalScore / g.total) * 100) : 0,
        timeMs: progress?.perSubjectDuration?.[subjectName] ?? 0,
      };
    });

    return map;
  }, [sessions, progress?.perSubjectDuration]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => refreshProgress(true, true)}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
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
          
          {todayMs > 0 && (
            <View style={styles.todayStats}>
              <Text style={styles.todayLabel}>Today: {todayLabel}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Subjects</Text>
        <View style={styles.subjectList}>
          {subjects.map((subject) => {
            const stats = perSubject[subject.name] ?? { attempts: 0, avg: 0, timeMs: 0 };
            const timeStr = formatDuration(stats.timeMs ?? 0);
            
            const subTodayMs = progress?.perSubjectTodayDuration?.[subject.name] ?? 0;
            const subTodayStr = formatDuration(subTodayMs);
            
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
                      <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                        {stats.avg}%
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                        {stats.attempts} {stats.attempts === 1 ? 'try' : 'tries'}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                        {nCount} {nCount === 1 ? 'note' : 'notes'}
                      </Text>
                      {stats.timeMs > 0 && (
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
                          {timeStr}
                        </Text>
                      )}
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
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
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
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    color: '#2563EB',
    marginBottom: 2,
  },
  statNumberPositive: {
    color: '#10B981',
  },
  statNumberAccent: {
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  todayStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
