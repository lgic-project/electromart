import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnBoarding from './(routes)/onboarding/index'; // ✅ Corrected Import

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const[loaded, error] = useFonts({
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {isLoggedIn ? (
          <View />
        ) : (
          <>
            <OnBoarding />
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          </>
        )}
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
