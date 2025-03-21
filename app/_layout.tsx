import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeAudio } from '@/services/AudioInit';

// Initialize audio as early as possible
initializeAudio().catch(error => {
  console.error('Failed to initialize audio in app startup:', error);
});

// Add polyfill for Array.prototype.findLast if it doesn't exist
if (!Array.prototype.findLast) {
  Array.prototype.findLast = function<T>(
    this: T[],
    predicate: (value: T, index: number, array: T[]) => boolean
  ): T | undefined {
    for (let i = this.length - 1; i >= 0; i--) {
      if (predicate(this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  };
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(treatments)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
