import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, Alert, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableWithoutFeedback, Keyboard, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const db = useSQLiteContext();
  const dbRef = useRef(db);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showPickerOptions, setShowPickerOptions] = useState(false);

  const [aboutVisible, setAboutVisible] = useState(false);

  const pickImage = async (fromCamera) => {
    let result;

    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        return Alert.alert('Permission required', 'Camera permission is needed!');
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, base64: true });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted)
        return Alert.alert('Permission required', 'Photo library access is needed!');
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, base64: true });
    }

    setShowPickerOptions(false);

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !username || !password || !confirmPassword)
      return Alert.alert('Error', 'All fields are required.');

    if (password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match.');

    try {
      const existingUser = await dbRef.current.getFirstAsync(
        'SELECT * FROM users WHERE username = ?', 
        [username]
      );
      if (existingUser) return Alert.alert('Error', 'Username already taken.');

      await dbRef.current.runAsync(
        'INSERT INTO users (username, password, fullName, profilePic) VALUES (?, ?, ?, ?)',
        [username, password, fullName, profilePhoto]
      );

      Alert.alert('Success', 'Registration successful!');
      onRegisterSuccess();
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
              <Text style={styles.bold}> I am passionate about what I'm doing. Lazy sometimes, but I prefer to do things on my own than relying others.</Text>
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
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

          {/* ABOUT BUTTON */}
          <TouchableOpacity style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
            <Text style={styles.aboutButtonText}>About</Text>
          </TouchableOpacity>

          {/* TOP PROFILE IMAGE (same as LoginScreen) */}
          <Image source={require('./assets/pic2.jpg')} style={styles.headerImage} />

          <Text style={styles.title}>Register</Text>

          <TouchableOpacity onPress={() => setShowPickerOptions(true)}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 40 }}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.text}>Profile Photo (Optional)</Text>

          {/* PICKER OPTIONS */}
          {showPickerOptions && (
            <View style={styles.popup}>
              <TouchableOpacity style={styles.popupButton} onPress={() => pickImage(true)}>
                <Text style={styles.popupText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.popupButton} onPress={() => pickImage(false)}>
                <Text style={styles.popupText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.popupButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowPickerOptions(false)}
              >
                <Text style={styles.popupText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Full Name"
              value={fullName} onChangeText={setFullName} />

            <TextInput style={styles.input} placeholder="Username"
              value={username} onChangeText={setUsername} autoCapitalize="none" />

            <TextInput style={styles.input} placeholder="Password"
              secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" />

            <TextInput style={styles.input} placeholder="Confirm Password"
              secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} autoCapitalize="none" />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5e8ff' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', padding: 20 },

  // About Button
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

  // Top Header Picture
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#b26bff',
    marginBottom: 10,
    marginTop: 60
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6a0dad',
  },

  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },

  text: { color: '#888', marginBottom: 20 },

  popup: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 15
  },

  popupButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#d6b3ff',
    marginBottom: 10
  },

  popupText: {
    color: '#4b0082',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  form: { width: '100%' },

  input: {
    borderWidth: 1,
    borderColor: '#d1b3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },

  registerButton: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },

  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6a0dad',
    fontSize: 14
  },

  // About Modal
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