import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

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
  }
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>StudyHub Offline</Text>
        <Text style={styles.subtitle}>Master your KCSE subjects with practice quizzes</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎯 Ready to Practice?</Text>
          <Text style={styles.welcomeText}>Choose a subject below and start your revision journey!</Text>
        </View>

        {/* Subjects */}
        <Text style={styles.sectionTitle}>Subjects</Text>
        
        {subjects.map((subject, index) => (
          <TouchableOpacity
            key={subject.name}
            style={styles.subjectButton}
            onPress={() => navigation.navigate("Subject", { subject: subject.name })}
          >
            <View style={[styles.subjectCard, { backgroundColor: subject.color }]}>
              <View style={styles.subjectContent}>
                <View style={styles.subjectInfo}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                  </View>
                  <Text style={styles.subjectDescription}>{subject.description}</Text>
                </View>
                <View style={styles.arrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>0%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>0</Text>
              <Text style={styles.statLabel}>Hours Studied</Text>
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
  subjectButton: {
    marginBottom: 16,
  },
  subjectCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  subjectName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subjectDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  arrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
  },
  arrowText: {
    color: 'white',
    fontSize: 18,
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
