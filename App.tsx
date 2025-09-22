import React from 'react';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuestionsPickerScreen from './src/screens/QuestionsPickerScreen';
import NotesListScreen from './src/screens/NotesListScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#111',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Subject"
          component={SubjectScreen}

          options={{ title: 'Subjects'}}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: 'Quiz' }}
        />
        <Stack.Screen
          name="QuestionsPicker"
          component={QuestionsPickerScreen}
          options={{ title: 'Choose Questions' }}
        />
        <Stack.Screen
          name="NotesList"
          component={NotesListScreen}
          options={{ title: 'Notes' }}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ title: 'Lesson' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
