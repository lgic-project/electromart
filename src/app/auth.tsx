import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TextInput,
    TouchableOpacity,
  } from 'react-native';

  import { useForm, Controller } from 'react-hook-form';
  import * as zod from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Redirect,Stack } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Toast } from 'react-native-toast-notifications';
import { useAuth } from '../providers/auth-provider';


  const authSchema = zod.object({
    email: zod.string().email({ message: 'Invalid email address' }),
    password: zod
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  });


export default function Auth()
{
  const { session } =useAuth();

  if (session) return <Redirect href='/' />;




    const {control, handleSubmit, formState} =useForm({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: '',
            password: '',
          },
    });

    const signIn = async (data: zod.infer<typeof authSchema>) => {
      const { error } = await supabase.auth.signInWithPassword(data);

      if (error) {
        alert(error.message);
      } else {
        Toast.show('Signed in successfully', {
          type: 'success',
          placement: 'top',
          duration: 1500,
        });
      }     
      };

      const signUp = async (data: zod.infer<typeof authSchema>) => {
        const { error } = await supabase.auth.signUp(data);

        if (error) {
          alert(error.message);
        } else {
          Toast.show('Signed up successfully', {
            type: 'success',
            placement: 'top',
            duration: 1500,
          });
        }
        
       };

      

