import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl 
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function HomeScreen({ currentUser, onLogout, onOpenChat }) {
  const db = useSQLiteContext();
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const loadUsers = async () => {
    const result = await db.getAllAsync(
      'SELECT * FROM users WHERE id != ? ORDER BY fullName',
      [currentUser.id]
    );
    setUsers(result);

    const counts = {};
    for (const user of result) {
      const countResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM messages WHERE senderId = ? AND receiverId = ? AND isRead = 0',
        [user.id, currentUser.id]
      );
      counts[user.id] = countResult?.count || 0;
    }
    setUnreadCounts(counts);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleOpenChat = async (user) => {
    await db.runAsync(
      'UPDATE messages SET isRead = 1 WHERE senderId = ? AND receiverId = ? AND isRead = 0',
      [user.id, currentUser.id]
    );
    await loadUsers();
    onOpenChat(user);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {currentUser.profilePic ? (
            <Image source={{ uri: currentUser.profilePic }} style={styles.profilePic} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{currentUser.fullName[0]}</Text>
            </View>
          )}
          <Text style={styles.welcome}>
            Welcome, {currentUser.fullName.split(' ')[0]}!
          </Text>
        </View>
        {/* Logout Button */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleOpenChat(item)}>
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{item.fullName[0]}</Text>
              </View>
            )}
            <View style={styles.userTextContainer}>
              <Text style={styles.name}>{item.fullName}</Text>
              {unreadCounts[item.id] > 0 && (
                <View style={styles.unreadContainer}>
                  <View style={styles.unreadCircle} />
                  <Text style={styles.unreadText}>
                    {unreadCounts[item.id]} new message{unreadCounts[item.id] > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0ff', padding: 10 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 20, paddingHorizontal: 10, backgroundColor: '#d6b3ff', borderRadius: 10, marginBottom: 10 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  avatarPlaceholder: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#bfa0ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 10 
  },
  avatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  welcome: { color: '#4b0082', fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#808080', borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  userItem: { 
    flexDirection: 'row', alignItems: 'center', padding: 10, 
    borderBottomWidth: 1, borderBottomColor: '#d1b3ff', borderRadius: 8, marginBottom: 5, backgroundColor: '#fff'
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  userTextContainer: { flex: 1 },
  name: { fontSize: 16, color: '#6a0dad', fontWeight: 'bold' },
  unreadContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  unreadCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff3b30', marginRight: 5 },
  unreadText: { fontSize: 12, color: '#6a0dad' },
});