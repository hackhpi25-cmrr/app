import React from 'react';
import { StyleSheet, View, Switch, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEnvironmentalData } from '@/hooks/useEnvironmentalData';

interface EnvironmentalDataControlProps {
  showLabel?: boolean;
}

export const EnvironmentalDataControl: React.FC<EnvironmentalDataControlProps> = ({ 
  showLabel = true 
}) => {
  const colorScheme = useColorScheme();
  const { isRunning, useFallback, startService, stopService } = useEnvironmentalData();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (value: boolean) => {
    setIsLoading(true);
    try {
      if (value) {
        await startService();
      } else {
        stopService();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <ThemedText style={styles.label}>
          Automatic Environmental Data Collection
        </ThemedText>
      )}
      
      <View style={styles.controls}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={Colors[colorScheme].tint} 
            style={styles.indicator} 
          />
        ) : (
          <Switch
            value={isRunning}
            onValueChange={handleToggle}
            trackColor={{ 
              false: Colors[colorScheme].tabIconDefault, 
              true: Colors[colorScheme].tint 
            }}
            thumbColor="#f4f3f4"
          />
        )}
      </View>
      
      {isRunning && (
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            Collecting temperature and noise data every 2 minutes
            {useFallback && ' (simulated data only)'}
          </ThemedText>
          {useFallback && (
            <ThemedText style={[styles.infoText, styles.fallbackText]}>
              Using simulated data because location services aren't available
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    marginRight: 8,
  },
  infoContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.7,
  },
  fallbackText: {
    marginTop: 4,
    color: '#E67E22',
  }
}); 