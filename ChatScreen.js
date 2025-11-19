import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Image
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function ChatScreen({ currentUser, chatUser, onBack }) {
  const db = useSQLiteContext();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const loadMessages = async () => {
    const result = await db.getAllAsync(
      `SELECT * FROM messages
       WHERE (senderId = ? AND receiverId = ?)
          OR (senderId = ? AND receiverId = ?)
       ORDER BY timestamp ASC`,
      [currentUser.id, chatUser.id, chatUser.id, currentUser.id]
    );
    setMessages(result);
  };

  useEffect(() => { loadMessages(); }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await db.runAsync(
      'INSERT INTO messages (senderId, receiverId, message) VALUES (?, ?, ?)',
      [currentUser.id, chatUser.id, message.trim()]
    );
    setMessage('');
    await loadMessages();
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.senderId === currentUser.id ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={[styles.messageText, item.senderId === currentUser.id && { color: '#fff' }]}>{item.message}</Text>
      <Text style={styles.timeText}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust offset for iOS header
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>←</Text></TouchableOpacity>
        {chatUser.profilePic ? (
          <Image source={{ uri: chatUser.profilePic }} style={styles.chatAvatar} />
        ) : (
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{chatUser.fullName[0]}</Text></View>
        )}
        <Text style={styles.title}>{chatUser.fullName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        keyboardShouldPersistTaps="handled"
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#d6b3ff',
    elevation: 2,
  },
  back: { color: '#4b0082', fontSize: 24, marginRight: 10 },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  avatarPlaceholder: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#bfa0ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  avatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#4b0082' },
  chatContainer: { padding: 10, paddingBottom: 20 },
  messageBubble: { padding: 10, borderRadius: 15, marginVertical: 5, maxWidth: '80%' },
  myMessage: { backgroundColor: '#9b30ff', alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#d6b3ff', alignSelf: 'flex-start' },
  messageText: { color: '#000' },
  timeText: { fontSize: 10, color: '#555', textAlign: 'right', marginTop: 2 },
  inputContainer: {
    flexDirection: 'row', padding: 10, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#ddd',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#d1b3ff', borderRadius: 25,
    paddingHorizontal: 15, paddingVertical: 8, color: '#000', backgroundColor: '#fff'
  },
  sendButton: {
    marginLeft: 10, backgroundColor: '#6a0dad', borderRadius: 25,
    paddingVertical: 10, paddingHorizontal: 20, justifyContent: 'center'
  },
  sendText: { color: '#fff', fontWeight: 'bold' },
});