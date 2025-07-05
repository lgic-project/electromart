// ForgotPassword.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useToast } from 'react-native-toast-notifications';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z
  .object({
    verificationCode: z.string().min(6, 'Verification code must be 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;
type Step = 'email' | 'reset';

// OTP Input Component
const OTPInput = ({ value, onChange, error, disabled }: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  // Update local state when value changes from form
  useEffect(() => {
    if (value && value.length <= 6) {
      const otpArray = value.split('').concat(Array(6 - value.length).fill(''));
      setOtp(otpArray);
    } else if (!value) {
      setOtp(['', '', '', '', '', '']);
    }
  }, [value]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);
      
      // Update form value - this is the critical part
      const otpString = newOtp.join('');
      console.log('OTP updated:', otpString); // Debug log
      onChange(otpString);
      
      // Auto focus next input
      if (numericText && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Clear previous box and focus it
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
      inputs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Clear the current box when focused
    const newOtp = [...otp];
    newOtp[index] = '';
    setOtp(newOtp);
    onChange(newOtp.join(''));
  };

  return (
    <View style={styles.otpContainer}>
      <Text style={styles.inputLabel}>Verification Code</Text>
      <View style={styles.otpBoxContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[
              styles.otpBox,
              error && styles.otpBoxError,
              digit && styles.otpBoxFilled
            ]}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            editable={!disabled}
            selectTextOnFocus
            autoCorrect={false}
            autoComplete="off"
          />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.debugText}>Current OTP: "{value}" (Length: {value?.length || 0})</Text>
    </View>
  );
};

export default function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [userEmail, setUserEmail] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSendOTP = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      // Use resetPasswordForEmail for password reset flow
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: undefined, // We don't want redirect, we want OTP
      });

      if (error) {
        console.error('Send OTP error:', error);
        if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
          toast.show('No account found with this email address', { type: 'danger' });
        } else {
          toast.show(error.message, { type: 'danger' });
        }
        return;
      }

      setUserEmail(data.email);
      // Force complete reset of the form
      resetForm.reset({
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
      });
      setCurrentStep('reset');

      toast.show('Password reset code sent to your email!', {
        type: 'success',
        duration: 4000,
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.show('Failed to send verification code', { type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    
    // Add immediate feedback
    toast.show('Processing password reset...', { type: 'normal', duration: 2000 });
    
    try {
      console.log('=== STARTING PASSWORD RESET ===');
      console.log('Email:', userEmail);
      console.log('OTP Code:', data.verificationCode);
      console.log('New Password Length:', data.newPassword.length);
      
      // Step 1: Verify OTP
      console.log('Step 1: Verifying OTP...');
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: data.verificationCode,
        type: 'recovery',
      });

      console.log('OTP Verification Result:', { authData, verifyError });

      if (verifyError) {
        console.error('❌ OTP Verification Failed:', verifyError);
        toast.show(`Verification failed: ${verifyError.message}`, { 
          type: 'danger',
          duration: 4000 
        });
        return;
      }

      if (!authData?.user) {
        console.error('❌ No user data returned after OTP verification');
        toast.show('Authentication failed. Please try again.', { type: 'danger' });
        return;
      }

      console.log('✅ OTP verified successfully! User:', authData.user.email);
      toast.show('Code verified! Updating password...', { type: 'success', duration: 2000 });

      // Step 2: Update password
      console.log('Step 2: Updating password...');
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      console.log('Password Update Result:', { updateData, updateError });

      if (updateError) {
        console.error('❌ Password Update Failed:', updateError);
        toast.show(`Password update failed: ${updateError.message}`, { 
          type: 'danger',
          duration: 4000 
        });
        return;
      }

      console.log('✅ Password updated successfully!');
      toast.show('Password updated! Signing out...', { type: 'success', duration: 2000 });

      // Step 3: Sign out and cleanup
      console.log('Step 3: Signing out...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.warn('⚠️ Sign out error (non-critical):', signOutError);
      }

      // Final success message
      toast.show('Password reset complete! Please login with your new password.', {
        type: 'success',
        duration: 5000,
      });

      // Reset forms and state
      emailForm.reset();
      resetForm.reset();
      setCurrentStep('email');
      setUserEmail('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      console.log('✅ Password reset process completed successfully!');
      
      // Navigate to login after a delay
      setTimeout(() => {
        router.replace('/auth');
      }, 3000);
      
    } catch (error: any) {
      console.error('💥 UNEXPECTED ERROR in password reset:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.show(`Error: ${errorMessage}`, { 
        type: 'danger',
        duration: 4000 
      });
    } finally {
      setIsLoading(false);
      console.log('=== PASSWORD RESET PROCESS ENDED ===');
    }
  };

  const goBack = () => {
    if (currentStep === 'reset') {
      setCurrentStep('email');
      resetForm.reset({
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      router.back();
    }
  };

  const resendCode = async () => {
    if (userEmail) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: undefined,
        });
        
        if (error) {
          toast.show('Failed to resend code: ' + error.message, { type: 'danger' });
        } else {
          toast.show('New verification code sent!', { type: 'success' });
          // Reset the OTP input
          resetForm.setValue('verificationCode', '');
        }
      } catch (error) {
        toast.show('Failed to resend verification code', { type: 'danger' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {currentStep === 'email' ? 'Forgot Password' : 'Reset Password'}
          </Text>
        </View>

        {currentStep === 'email' ? (
          <View style={styles.stepContainer}>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to reset your password.
            </Text>

            <View style={styles.formContainer}>
              <Controller
                control={emailForm.control}
                name="email"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, error && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                      <TextInput
                        placeholder="Enter your email"
                        style={styles.textInput}
                        value={value || ''}
                        onChangeText={(text) => onChange(text)}
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </View>
                    {error && <Text style={styles.error}>{error.message}</Text>}
                  </View>
                )}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={emailForm.handleSubmit(onSendOTP)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.subtitle}>
              Enter the verification code sent to {userEmail} and set your new password.
            </Text>

            <View style={styles.formContainer}>
              <Controller
                control={resetForm.control}
                name="verificationCode"
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  console.log('OTP Controller render - value:', value); // Debug log
                  return (
                    <OTPInput
                      value={value || ''}
                      onChange={(newValue) => {
                        console.log('OTP onChange called with:', newValue); // Debug log
                        onChange(newValue);
                      }}
                      error={error?.message}
                      disabled={isLoading}
                    />
                  );
                }}
              />

              <Controller
                control={resetForm.control}
                name="newPassword"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={[styles.inputContainer, error && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                      <TextInput
                        placeholder="Enter new password"
                        style={styles.textInput}
                        value={value || ''}
                        onChangeText={(text) => onChange(text)}
                        secureTextEntry={!showNewPassword}
                        placeholderTextColor="#aaa"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                        <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
                      </Pressable>
                    </View>
                    {error && <Text style={styles.error}>{error.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={resetForm.control}
                name="confirmPassword"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={[styles.inputContainer, error && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                      <TextInput
                        placeholder="Confirm new password"
                        style={styles.textInput}
                        value={value || ''}
                        onChangeText={(text) => onChange(text)}
                        secureTextEntry={!showConfirmPassword}
                        placeholderTextColor="#aaa"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                        <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
                      </Pressable>
                    </View>
                    {error && <Text style={styles.error}>{error.message}</Text>}
                  </View>
                )}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={() => {
                  console.log('Reset Password button pressed');
                  console.log('Form values:', resetForm.getValues());
                  resetForm.handleSubmit(onResetPassword)();
                }}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Processing...' : 'Update Password'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.linkButton, isLoading && styles.buttonDisabled]} onPress={resendCode} disabled={isLoading}>
                <Text style={styles.linkText}>Didn't receive the code? Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/auth')}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  container: { padding: 20, paddingBottom: 40, minHeight: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 40 },
  backButton: { marginRight: 16, padding: 8 },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', flex: 1 },
  stepContainer: { flex: 1 },
  subtitle: { fontSize: 16, color: '#ccc', marginBottom: 24, textAlign: 'center', lineHeight: 22 },
  formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 20, marginBottom: 20 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: '#ff6b6b', borderWidth: 1 },
  icon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, color: '#000', paddingVertical: 4 },
  eyeButton: { padding: 4 },
  error: { color: '#ff6b6b', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#666', opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: '#4CAF50', fontSize: 14, textDecorationLine: 'underline' },
  
  // OTP Styles
  otpContainer: {
    marginBottom: 20,
  },
  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  otpBoxFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  otpBoxError: {
    borderColor: '#ff6b6b',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
});