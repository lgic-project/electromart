import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, Slot } from 'expo-router'; // ✅ Import Slot

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack>
          
          <Stack.Screen name="(routes)/login/index" options={{ headerShown: false }} />
     <Stack.Screen name="(routes)/onboarding/index" options={{ headerShown: false }} />
     <Stack.Screen name="(routes)/sign-up/index" options={{ headerShown: false }} />

        </Stack>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});