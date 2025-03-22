import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';
import { ThemedText } from './ThemedText';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthRequired({ children, fallback }: AuthRequiredProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();
        if (isAuth) {
          // Verify that the token is still valid with the server
          const isValid = await AuthService.checkAuth();
          setIsAuthenticated(isValid);
          
          if (!isValid) {
            // If token is not valid, redirect to login
            await AuthService.logout();
            router.replace('/(auth)/login');
          }
        } else {
          // Not authenticated at all
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <ThemedText style={styles.loadingText}>Checking authentication...</ThemedText>
      </View>
    );
  }

  if (!isAuthenticated && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
}); 