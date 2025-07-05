import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router'; 

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  area: any | null;
  phone_number: string | null;
}

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        Alert.alert('Error', 'Failed to get user information');
        return;
      }

      if (!user) {
        Alert.alert('Error', 'No user found');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        if (profileError.code === 'PGRST116') {
          await createUserProfile(user);
        } else {
          Alert.alert('Error', 'Failed to fetch profile');
        }
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);

      if (!userProfile) {
        Alert.alert('Error', 'User profile not found');
        return;
      }

      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userProfile.id}/${fileName}`;

      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Upload Error', `Failed to upload image: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id)
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Database Error', `Failed to update profile: ${updateError.message}`);
        return;
      }

      setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      Alert.alert('Success', 'Profile picture updated successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    return userProfile?.email?.split('@')[0] || 'User';
  };

  const getAvatarSource = () => {
    if (userProfile?.avatar_url) {
      return { uri: userProfile.avatar_url };
    }
    return { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
  };

  const navigateToUserDetails = () => {
    router.push('/useraccount/userdetails'); 
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1E1466" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#1E1466', '#2F185A']} style={styles.header}>
        <View style={styles.profileInfo}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Image source={getAvatarSource()} style={styles.avatar} />
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{getDisplayName()}</Text>
            <Text style={styles.email}>{userProfile?.email || 'No email'}</Text>
            {userProfile?.country && (
              <Text style={styles.location}>📍 {userProfile.country}</Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity style={styles.item} onPress={() => router.push('/useraccount/userdetails')}>
        <Ionicons name="person-circle-outline" size={24} color="#1E1466" />
        <View style={styles.itemText}>
          <Text style={styles.title}>User Details</Text>
          <Text style={styles.subtitle}>View and edit your account details</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="notifications-outline" size={24} color="#1E1466" />
        <View style={styles.itemText}>
          <Text style={styles.title}>Notifications(coming soon)</Text>
          <Text style={styles.subtitle}>Explore the important notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Feather name="settings" size={24} color="#1E1466" />
        <View style={styles.itemText}>
          <Text style={styles.title}>Settings(coming soon)</Text>
          <Text style={styles.subtitle}>Control the app as per your preferences</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchUserProfile}>
        <Ionicons name="refresh" size={20} color="#1E1466" />
        <Text style={styles.refreshText}>Refresh Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#333',
    marginTop: 10,
    fontSize: 16,
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E1466',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  name: {
    color: '#222',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  email: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  location: {
    color: '#888',
    fontSize: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 8,
  },
  refreshText: {
    color: '#1E1466',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;