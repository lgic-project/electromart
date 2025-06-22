import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E1466', '#2F185A']} style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>Prabhat Raj Poudel</Text>
            <Text style={styles.email}>poudelprabhas88@gmail.com</Text>
          </View>
        </View>
      </LinearGradient>

      {/* User Details */}
      <TouchableOpacity style={styles.item}>
        <Ionicons name="person-circle-outline" size={24} color="white" />
        <View style={styles.itemText}>
          <Text style={styles.title}>User Details</Text>
          <Text style={styles.subtitle}>View your account details</Text>
        </View>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity style={styles.item}>
        <Ionicons name="notifications-outline" size={24} color="white" />
        <View style={styles.itemText}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Explore the important notifications</Text>
        </View>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity style={styles.item}>
        <Feather name="settings" size={24} color="white" />
        <View style={styles.itemText}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Control the app as per your preferences</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    color: '#ccc',
    fontSize: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  itemText: {
    marginLeft: 16,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 13,
  },
});

export default ProfileScreen;
