import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AuthService } from '@/services/AuthService';
import { View, ActivityIndicator } from 'react-native';

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
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      try {
        const authStatus = await AuthService.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthCheckComplete(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Show a loading indicator while loading fonts and checking auth
  if (!loaded || !isAuthCheckComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Always render the navigator first, then handle redirects */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(treatments)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {!isAuthenticated && <Redirect href="/(auth)/login" />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
