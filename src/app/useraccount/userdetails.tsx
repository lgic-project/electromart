import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type UserData = Database['public']['Tables']['users']['Row'];

interface AccountInfoProps {
  navigation?: any; // For navigation if needed
}

const AccountInfo: React.FC<AccountInfoProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Password change specific states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Area editing states
  const [areaState, setAreaState] = useState('');
  const [areaCity, setAreaCity] = useState('');

  useEffect(() => {
    loadUserData();
    
    // Listen for auth state changes (including email confirmations)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Reload user data when auth state changes
          await loadUserData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
        return;
      }

      setUserData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = (field: string, currentValue: string = '') => {
    setEditingField(field);
    
    if (field === 'area' && userData?.area && typeof userData.area === 'object' && userData.area !== null) {
      const areaObj = userData.area as { state?: string; city?: string };
      setAreaState(areaObj.state || '');
      setAreaCity(areaObj.city || '');
    } else if (field === 'password') {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setEditValue(currentValue || '');
    }
    
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      let updateData: any = {};

      switch (editingField) {
        case 'full_name':
          updateData.full_name = editValue;
          break;
        case 'phone_number':
          updateData.phone_number = editValue;
          break;
        case 'country':
          updateData.country = editValue;
          break;
        case 'email':
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(editValue)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
          }

          // Check if email is different from current
          if (editValue === userData.email) {
            Alert.alert('Info', 'This is already your current email address');
            setModalVisible(false);
            setSaving(false);
            return;
          }

          try {
            // Update email with custom redirect URL
            const { error: emailError } = await supabase.auth.updateUser(
              { email: editValue },
              {
                emailRedirectTo: `${window.location.origin}/auth/callback` // For web
                // For React Native, you might need to use a custom URL scheme:
                // emailRedirectTo: 'your-app://auth/callback'
              }
            );
            
            if (emailError) {
              Alert.alert('Error', emailError.message);
              return;
            }
            
            Alert.alert(
              'Verification Email Sent', 
              `A verification email has been sent to ${editValue}. Please check your email and click the confirmation link to complete the email change.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setModalVisible(false);
                  }
                }
              ]
            );
            setSaving(false);
            return;
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update email');
            return;
          }
          
        case 'password':
          // Validate password inputs
          if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
          }
          
          if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
          }
          
          if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long');
            return;
          }
          
          try {
            // First verify old password by trying to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: oldPassword
            });
            
            if (signInError) {
              Alert.alert('Error', 'Current password is incorrect');
              return;
            }
            
            // Update password
            const { error: passwordError } = await supabase.auth.updateUser({
              password: newPassword
            });
            
            if (passwordError) {
              Alert.alert('Error', passwordError.message);
              return;
            }
            
            Alert.alert('Success', 'Password updated successfully');
            setModalVisible(false);
            setSaving(false);
            return;
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password');
            return;
          }
          
        case 'area':
          updateData.area = {
            state: areaState.trim() || null,
            city: areaCity.trim() || null
          };
          break;
        default:
          break;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id);

      if (error) {
        Alert.alert('Error', 'Failed to update information');
        console.error('Update error:', error);
        return;
      }

      // Update local state
      setUserData(prev => prev ? { ...prev, ...updateData } : null);
      setModalVisible(false);
      Alert.alert('Success', 'Information updated successfully');

    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    return phone.substring(0, 3) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 2);
  };

  const getFieldTitle = () => {
    switch (editingField) {
      case 'full_name': return 'Full Name';
      case 'phone_number': return 'Phone Number';
      case 'country': return 'Country';
      case 'email': return 'Email';
      case 'password': return 'Change Password';
      case 'area': return 'Area';
      default: return 'Edit';
    }
  };

  const getPlaceholder = () => {
    switch (editingField) {
      case 'full_name': return 'Enter your full name';
      case 'phone_number': return 'Enter your phone number';
      case 'country': return 'Enter your country';
      case 'email': return 'Enter your email';
      default: return 'Enter value';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Information</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Full Name */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('full_name', userData?.full_name || '')}
        >
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {userData?.full_name || 'Not Set'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('password')}
        >
          <Text style={styles.label}>Change Password</Text>
          <View style={styles.valueContainer}>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Change Mobile */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('phone_number', userData?.phone_number || '')}
        >
          <Text style={styles.label}>Change Mobile</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {userData?.phone_number ? maskPhone(userData.phone_number) : 'Not Set'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Change Email */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('email', userData?.email || '')}
        >
          <Text style={styles.label}>Change Email</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {userData?.email ? maskEmail(userData.email) : 'Not Set'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Country */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('country', userData?.country || '')}
        >
          <Text style={styles.label}>Country</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {userData?.country || 'Not Set'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Area (State/City) */}
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditPress('area')}
        >
          <Text style={styles.label}>Area</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {userData?.area && typeof userData.area === 'object' && userData.area !== null ? 
                (() => {
                  const areaObj = userData.area as { state?: string; city?: string };
                  const parts = [areaObj.state, areaObj.city].filter(Boolean);
                  return parts.length > 0 ? parts.join(', ') : 'Not Set';
                })()
                : 'Not Set'
              }
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getFieldTitle()}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              {editingField === 'password' ? (
                <>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.textInput}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 20 }]}>New Password</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 20 }]}>Confirm New Password</Text>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </>
              ) : editingField === 'area' ? (
                <>
                  <Text style={styles.inputLabel}>State/Province</Text>
                  <TextInput
                    style={styles.textInput}
                    value={areaState}
                    onChangeText={setAreaState}
                    placeholder="Enter state or province"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 20 }]}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    value={areaCity}
                    onChangeText={setAreaCity}
                    placeholder="Enter city"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>
                    {editingField === 'full_name' ? 'First Last' : getFieldTitle()}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder={getPlaceholder()}
                    keyboardType={editingField === 'phone_number' ? 'phone-pad' : editingField === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={editingField === 'email' ? 'none' : 'words'}
                    autoCorrect={false}
                  />
                </>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountInfo;