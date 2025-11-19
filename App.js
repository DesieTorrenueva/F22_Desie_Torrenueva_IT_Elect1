import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import ChatScreen from './ChatScreen';

// --- AppContent handles screen switching and DB logic ---
function AppContent() {
  const db = useSQLiteContext();
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId]);
        if (user) {
          setCurrentUser(user);
          setCurrentScreen('home');
          return;
        }
      }
      setCurrentScreen('login');
    };
    init();
  }, []);

  const handleLogin = async (user) => {
    await AsyncStorage.setItem('userId', user.id.toString());
    setCurrentUser(user);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleOpenChat = (user) => {
    setSelectedChatUser(user);
    setCurrentScreen('chat');
  };

  const handleBackToHome = () => {
    setSelectedChatUser(null);
    setCurrentScreen('home');
  };

  if (currentScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={() => setCurrentScreen('login')}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChat={handleOpenChat}
      />
    );
  }

  if (currentScreen === 'chat') {
    return (
      <ChatScreen
        currentUser={currentUser}
        chatUser={selectedChatUser}
        onBack={handleBackToHome}
      />
    );
  }

  return null;
}

// --- Main App uses SQLiteProvider to initialize DB ---
export default function App() {
  return (
    <SQLiteProvider
      databaseName="messengerApp.db"
      onInit={async (db) => {
        console.log('Initializing SQLite database...');
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            fullName TEXT NOT NULL,
            profilePic TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            senderId INTEGER NOT NULL,
            receiverId INTEGER NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            isRead INTEGER DEFAULT 0,
            FOREIGN KEY (senderId) REFERENCES users (id),
            FOREIGN KEY (receiverId) REFERENCES users (id)
          );

          CREATE INDEX IF NOT EXISTS idx_sender ON messages(senderId);
          CREATE INDEX IF NOT EXISTS idx_receiver ON messages(receiverId);
        `);
        console.log('SQLite setup complete ✅');
      }}
    >
      <AppContent />
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});