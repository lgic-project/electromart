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

      

return(
    <ImageBackground 
      source={{
        uri: 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      }}
      style={styles.backgroundImage}
      >
      <View style={styles.overlay} />

      <Stack.Screen options= {{headerShown: false}} />

      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Please Authenticate to continue</Text>

        <Controller
          control={control}
          name='email'
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder='Email'
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor='#aaa'
                autoCapitalize='none'
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />


<Controller
          control={control}
          name='password'
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder='Password'
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholderTextColor='#aaa'
                autoCapitalize='none'
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

<TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(signIn)}
          disabled={formState.isSubmitting}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={handleSubmit(signUp)}
          disabled={formState.isSubmitting}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        </View>




      </ImageBackground>
    )
}

