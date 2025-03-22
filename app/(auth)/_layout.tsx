import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();
        if (isAuthenticated) {
          // If user is already authenticated, redirect to main app
          const isStillValid = await AuthService.checkAuth();
          if (isStillValid) {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 