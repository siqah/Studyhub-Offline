# StudyHub Offline

A comprehensive offline study application designed for students to practice and learn various subjects without requiring an internet connection. Built with React Native and Expo for cross-platform compatibility.

## 📱 About

StudyHub Offline is an educational mobile application that provides:
- **Offline Learning**: Study materials and quizzes work without internet connectivity
- **Multiple Subjects**: Mathematics, English, Physics, and Machine Learning
- **Progress Tracking**: Monitor your learning journey with detailed statistics
- **Interactive Quizzes**: Test your knowledge with multiple-choice questions
- **Study Notes**: Access comprehensive lessons and explanations
- **Study Timer**: Track time spent studying each subject

## ✨ Features

### 🎯 Interactive Learning
- **Subject-based Organization**: Four main subjects with structured content
- **Multiple Difficulty Levels**: Beginner, Intermediate, and Advanced content
- **Quiz System**: Practice with multiple-choice questions
- **Immediate Feedback**: Get instant results and explanations

### 📊 Progress Tracking
- **Performance Analytics**: Track scores, attempts, and improvement over time
- **Study Time Monitoring**: See how much time you spend on each subject
- **Daily Statistics**: Monitor today's study session
- **Session History**: Review past quiz attempts and scores

### 📚 Study Materials
- **Comprehensive Notes**: Detailed lessons with examples and step-by-step explanations
- **Bookmark System**: Save important questions for later review
- **Review Mode**: Revisit incorrectly answered questions
- **Offline Access**: All content available without internet connection

### 🎨 User Experience
- **Clean Interface**: Modern, intuitive design
- **Cross-platform**: Works on iOS, Android, and Web
- **Responsive Design**: Optimized for different screen sizes
- **Smooth Navigation**: Easy-to-use interface with React Navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI
- For mobile development:
  - iOS: Xcode (macOS only)
  - Android: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/siqah/Studyhub-Offline.git
   cd Studyhub-Offline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your platform**
   ```bash
   # For iOS (macOS only)
   npm run ios
   
   # For Android
   npm run android
   
   # For Web
   npm run web
   ```

### Development Setup

The project uses:
- **React Native 0.79.5** with the new architecture enabled
- **Expo 53** for cross-platform development
- **TypeScript** for type safety
- **TailwindCSS** with NativeWind for styling
- **Zustand** for state management
- **React Navigation** for navigation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── QuestionCard.tsx # Quiz question display
│   └── SubjectCard.tsx  # Subject selection cards
├── screens/             # Application screens
│   ├── HomeScreen.tsx   # Main dashboard
│   ├── SubjectScreen.tsx # Subject overview
│   ├── QuizScreen.tsx   # Quiz interface
│   ├── NotesListScreen.tsx # Notes listing
│   └── NoteDetailScreen.tsx # Individual note view
├── data/               # Study content and data
│   ├── study_datasets_full/ # Quiz questions by subject/level
│   ├── study_notes_all_subjects/ # Study notes
│   └── loaders.ts      # Data loading utilities
├── store/              # State management
│   ├── useQuizStore.ts # Quiz state
│   └── persistence.ts  # Data persistence
├── hooks/              # Custom React hooks
│   └── useStudyTimer.ts # Study time tracking
└── utils/              # Utility functions
    └── gitUtils.ts     # Git statistics
```

## 📖 Available Subjects

### 📐 Mathematics
- **Topics**: Algebra, Geometry, Calculus
- **Levels**: Beginner to Advanced
- **Content**: 25+ lessons with examples and exercises

### 📚 English
- **Topics**: Grammar, Literature, Composition
- **Levels**: Beginner to Advanced
- **Content**: Comprehensive language learning materials

### ⚛️ Physics
- **Topics**: Mechanics, Waves, Electricity
- **Levels**: Beginner to Advanced
- **Content**: Scientific concepts with practical examples

### 🤖 Machine Learning
- **Topics**: Algorithms, Models, Data Science
- **Levels**: Beginner to Advanced
- **Content**: Modern AI and ML concepts

## 🛠️ Technologies Used

### Frontend
- **React Native**: Cross-platform mobile development
- **TypeScript**: Static type checking
- **Expo**: Development platform and build system
- **React Navigation**: Navigation library
- **NativeWind**: TailwindCSS for React Native

### State Management
- **Zustand**: Lightweight state management
- **AsyncStorage**: Local data persistence

### Development Tools
- **Metro**: JavaScript bundler
- **Babel**: JavaScript compiler
- **ESLint**: Code linting (if configured)

## 📊 Features in Detail

### Quiz System
- Multiple-choice questions with 4 options
- Immediate scoring and feedback
- Progress tracking across sessions
- Bookmark important questions
- Review incorrect answers

### Study Timer
- Automatic time tracking when screens are focused
- Per-subject time accumulation
- Daily and total study time statistics
- Session-based tracking

### Data Persistence
- Local storage of progress and preferences
- Offline-first architecture
- Session history and statistics
- Bookmark management

## 🔧 Configuration

### App Configuration (`app.json`)
- **App Name**: KCSE Study App
- **Bundle ID**: com.masika.kcsestudyapp
- **Supported Platforms**: iOS, Android, Web
- **Expo SDK**: Version 53

### Build Configuration
- **iOS**: Supports tablets, edge-to-edge display
- **Android**: Adaptive icon, edge-to-edge enabled
- **Web**: PWA-ready with favicon

## 🚀 Deployment

### Building for Production

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for platforms**
   ```bash
   # For iOS
   eas build --platform ios
   
   # For Android
   eas build --platform android
   
   # For both
   eas build --platform all
   ```

### Web Deployment
```bash
npm run web
# Build files will be in web-build/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI components styled with [NativeWind](https://nativewind.dev/)
- Navigation powered by [React Navigation](https://reactnavigation.org/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**StudyHub Offline** - Learn anywhere. No internet required. 🎓