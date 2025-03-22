import { useEffect, useState } from 'react';
import EnvironmentalDataService from '@/services/EnvironmentalDataService';
import FallbackEnvironmentalService from '@/services/FallbackEnvironmentalService';

export function useEnvironmentalData(autoStart = false) {
  const [isRunning, setIsRunning] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  
  // Get the appropriate service based on availability
  const getService = () => {
    return useFallback ? FallbackEnvironmentalService : EnvironmentalDataService;
  };
  
  // Start the environmental data collection service
  const startService = async () => {
    try {
      // First try the main service
      if (!useFallback) {
        const started = await EnvironmentalDataService.start();
        if (started) {
          setIsRunning(true);
          return true;
        }
        
        // If main service fails, switch to fallback
        console.log('Switching to fallback environmental service...');
        setUseFallback(true);
      }
      
      // Try the fallback service
      const fallbackStarted = await FallbackEnvironmentalService.start();
      setIsRunning(fallbackStarted);
      return fallbackStarted;
    } catch (error) {
      console.error('Failed to start any environmental service:', error);
      setIsRunning(false);
      return false;
    }
  };
  
  // Stop the environmental data collection service
  const stopService = () => {
    const service = getService();
    service.stop();
    setIsRunning(false);
  };
  
  // Auto-start the service if specified
  useEffect(() => {
    if (autoStart) {
      startService();
    }
    
    // Clean up on unmount
    return () => {
      if (isRunning) {
        EnvironmentalDataService.stop();
        FallbackEnvironmentalService.stop();
      }
    };
  }, [autoStart]);
  
  return {
    isRunning,
    useFallback,
    startService,
    stopService
  };
} 