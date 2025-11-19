import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Image,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function LoginScreen({ onLogin, onNavigateToRegister }) {
  const db = useSQLiteContext();
  const dbRef = useRef(db);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ABOUT MODAL
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleLoginPress = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    try {
      const user = await dbRef.current.getFirstAsync(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );

      if (user) {
        Alert.alert('Success', `Welcome back, ${user.fullName}!`);
        onLogin(user);
      } else {
        Alert.alert('Login Failed', 'Invalid username or password.');
      }
    } catch (error) {
      Alert.alert('Database Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}
    >
      {/* ABOUT MODAL */}
      <Modal visible={aboutVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={require('./assets/pic1.jpg')} style={styles.aboutImage} />

            <Text style={styles.aboutTitle}>About the Developer</Text>

            <Text style={styles.aboutText}>Author / Submitted by: <Text style={styles.bold}>Desie Torrenueva</Text></Text>
            <Text style={styles.aboutText}>Submitted To: <Text style={styles.bold}>Jay Ian Camelotes</Text></Text>
            <Text style={[styles.aboutText, { marginTop: 10 }]}>
              Bio:  
              <Text style={styles.bold}>
                {" "}I am passionate about what I'm doing. Lazy sometimes, but I prefer to do things on my own than relying others.
              </Text>
            </Text>
            <Text style={styles.aboutText}>Address: <Text style={styles.bold}>Camanaga, San Miguel, Bohol</Text></Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setAboutVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* ABOUT BUTTON TOP RIGHT */}
          <TouchableOpacity style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
            <Text style={styles.aboutButtonText}>About</Text>
          </TouchableOpacity>

          {/* PROFILE IMAGE */}
          <Image source={require('./assets/pic2.jpg')} style={styles.profileImage} />

          <Text style={styles.title}>Messenger Offline</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// =======================
//        STYLES
// =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5e8ff' },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // HEADER ABOUT BUTTON
  aboutButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 8,
    backgroundColor: '#d1b3ff',
    borderRadius: 8,
    marginTop: 30,
  },
  aboutButtonText: {
    color: '#4a0072',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // PROFILE IMAGE
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#b26bff',
    marginBottom: 15,
    marginTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#6a0dad',
  },

  form: { width: '100%' },

  input: {
    borderWidth: 1,
    borderColor: '#d1b3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },

  button: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#a64ca6',
    fontSize: 14,
  },

  // ABOUT MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  aboutImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#6a0dad',
    marginBottom: 15,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a0072',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 3,
    textAlign: 'center',
  },
  bold: { fontWeight: 'bold', color: '#4a0072' },

  closeBtn: {
    marginTop: 20,
    backgroundColor: '#6a0dad',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 