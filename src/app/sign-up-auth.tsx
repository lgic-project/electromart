// SignUpAuth.tsx

import React, { useState } from 'react';
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

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  phone_number: z.string().min(7, 'Phone number is required'),
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm to proceed' }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function SignUpAuth() {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      country: '',
      state: '',
      city: '',
      phone_number: '',
      confirm: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    const { full_name, email, password, country, state, city, phone_number } = data;

    const { data: signUpData, error } = await supabase.auth.signUp({ email, password });

    if (error || !signUpData.user) {
      toast.show(error?.message || 'Signup failed', { type: 'danger' });
      return;
    }

    const userId = signUpData.user.id;
    const avatar_url = `https://ui-avatars.com/api/?name=${full_name.replace(' ', '+')}`;

    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: userId,
        email,
        full_name,
        country,
        area: JSON.stringify({ state, city }),
        phone_number,
        avatar_url,
      },
      { onConflict: 'id' } // ✅ Prevent duplicate primary key error
    );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      toast.show('Failed to store user info.', { type: 'danger' });
      return;
    }

    toast.show('Account created successfully!', {
      type: 'success',
      placement: 'top',
      duration: 3000,
    });

    setTimeout(() => router.replace('/auth'), 3000);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <InputField name="full_name" placeholder="Full Name" icon="person-outline" control={control} />
        <InputField name="email" placeholder="Email" icon="mail-outline" control={control} />
        <InputField name="country" placeholder="Country" icon="flag-outline" control={control} />
        <InputField name="state" placeholder="State" icon="map-outline" control={control} />
        <InputField name="city" placeholder="City" icon="business-outline" control={control} />
        <InputField name="phone_number" placeholder="Phone Number" icon="call-outline" control={control} />
        <PasswordField control={control} showPassword={showPassword} setShowPassword={setShowPassword} />
        <ConfirmCheckbox control={control} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

// --- Field Components ---
const InputField = ({ name, placeholder, icon, control }: any) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, onChange }, fieldState: { error } }) => (
      <>
        <View style={styles.inputContainer}>
          <Ionicons name={icon} size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder={placeholder}
            style={styles.textInput}
            value={value || ''}
            onChangeText={onChange}
            placeholderTextColor="#aaa"
          />
        </View>
        {error && <Text style={styles.error}>{error.message}</Text>}
      </>
    )}
  />
);

const PasswordField = ({ control, showPassword, setShowPassword }: any) => (
  <Controller
    control={control}
    name="password"
    render={({ field: { value, onChange }, fieldState: { error } }) => (
      <>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Password"
            style={styles.textInput}
            value={value}
            onChangeText={onChange}
            secureTextEntry={!showPassword}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
          </Pressable>
        </View>
        {error && <Text style={styles.error}>{error.message}</Text>}
      </>
    )}
  />
);

const ConfirmCheckbox = ({ control }: any) => (
  <Controller
    control={control}
    name="confirm"
    render={({ field: { value, onChange }, fieldState: { error } }) => (
      <>
        <Pressable style={styles.checkboxContainer} onPress={() => onChange(!value)}>
          <Ionicons
            name={value ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={value ? 'green' : '#aaa'}
          />
          <Text style={styles.checkboxText}>I confirm my details are correct for delivery</Text>
        </Pressable>
        {error && <Text style={styles.error}>{error.message}</Text>}
      </>
    )}
  />
);

// --- Styles ---
const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  icon: { marginRight: 8 },
  textInput: { flex: 1, fontSize: 16, color: '#000' },
  error: { color: 'red', fontSize: 12, marginBottom: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxText: { color: '#fff', marginLeft: 8, flex: 1 },
  button: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});