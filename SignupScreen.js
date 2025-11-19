import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getDB } from './Database';

export default function SignupScreen({ navigation }) {
  const db = getDB();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('');

  const handleSignup = () => {
    if (!username || !password || !profile) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (username, password, profile) VALUES (?, ?, ?);',
        [username, password, profile],
        () => {
          Alert.alert('Success', 'Account created successfully');
          navigation.navigate('Login');
        },
        (_, error) => {
          Alert.alert('Error', 'Username already exists');
          console.log(error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Create Account</Text>
      <TextInput style={styles.input} placeholder="Username" onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Profile Picture URL" onChangeText={setProfile} />
      <TouchableOpacity style={styles.btn} onPress={handleSignup}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 6 },
  btn: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});