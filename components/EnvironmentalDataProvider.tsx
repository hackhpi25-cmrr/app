import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { useEnvironmentalData } from '@/hooks/useEnvironmentalData';

const AUTO_START_KEY = 'environmental_data_auto_start';

interface EnvironmentalDataProviderProps {
  children: React.ReactNode;
}

export const EnvironmentalDataProvider: React.FC<EnvironmentalDataProviderProps> = ({ 
  children 
}) => {
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isRunning, startService } = useEnvironmentalData();

  // Check if auto-start is enabled on component mount
  useEffect(() => {
    const checkAutoStart = async () => {
      try {
        const value = await AsyncStorage.getItem(AUTO_START_KEY);
        const shouldStart = value === 'true';
        setShouldAutoStart(shouldStart);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error reading auto-start setting:', error);
        setIsInitialized(true);
      }
    };

    checkAutoStart();
  }, []);

  // Start service if auto-start is enabled
  useEffect(() => {
    if (isInitialized && shouldAutoStart && !isRunning) {
      startService().catch(error => {
        console.error('Failed to auto-start environmental data service:', error);
      });
    }
  }, [isInitialized, shouldAutoStart, isRunning, startService]);

  // Just render children, no UI for this component
  return <>{children}</>;
};

// Helper function to set auto-start preference
export const setEnvironmentalDataAutoStart = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTO_START_KEY, enabled.toString());
  } catch (error) {
    console.error('Failed to save auto-start setting:', error);
  }
};

// Helper function to get current auto-start preference
export const getEnvironmentalDataAutoStart = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(AUTO_START_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Failed to read auto-start setting:', error);
    return false;
  }
}; 