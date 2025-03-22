import { StyleSheet, TouchableOpacity, Alert, View, Text, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';
import { useState, useEffect } from 'react';
import { CustomParameterScreen } from '@/components/CustomParameterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnvironmentalDataControl } from '@/components/EnvironmentalDataControl';
import { useEnvironmentalData } from '@/hooks/useEnvironmentalData';
import { getEnvironmentalDataAutoStart, setEnvironmentalDataAutoStart } from '@/components/EnvironmentalDataProvider';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showParameters, setShowParameters] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(false);

  // Check if user ID is available
  useEffect(() => {
    getUserId();
    loadAutoStartPreference();
  }, []);
  
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);
    } catch (error) {
      // Silently handle error
    }
  };

  // Load auto-start preference
  const loadAutoStartPreference = async () => {
    try {
      const preference = await getEnvironmentalDataAutoStart();
      setAutoStart(preference);
    } catch (error) {
      console.error('Failed to load auto-start preference:', error);
    }
  };

  // Handle auto-start toggle
  const handleAutoStartToggle = async (value: boolean) => {
    setAutoStart(value);
    await setEnvironmentalDataAutoStart(value);
  };
  
  const handleRefreshUserId = async () => {
    try {
      const refreshedId = await AuthService.refreshUserId();
      if (refreshedId) {
        setUserId(refreshedId.toString());
        Alert.alert("Success", "User ID refreshed successfully");
      } else {
        Alert.alert("Error", "Failed to refresh user ID");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while refreshing user ID");
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Logout Confirmation",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await AuthService.logout();
              router.replace('/(auth)/login');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (showParameters) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowParameters(false)}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
        </View>
        <CustomParameterScreen />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text} type="title">Settings</ThemedText>
      
      {/* Display User ID for debugging */}
      <View style={[styles.userInfoSection, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.userInfoHeader}>
          <ThemedText style={styles.userInfoLabel}>User ID:</ThemedText>
          <TouchableOpacity onPress={handleRefreshUserId} style={[styles.refreshButton, { backgroundColor: Colors[colorScheme].tint }]}>
            <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.userInfoValue}>{userId || 'Not available'}</ThemedText>
      </View>
      
      <ThemedView style={styles.optionsContainer}>
        {/* Environmental Data Collection */}
        <View style={[styles.sectionContainer, { backgroundColor: Colors[colorScheme].background }]}>
          <ThemedText style={styles.sectionTitle}>Environmental Data</ThemedText>
          <EnvironmentalDataControl />

          <View style={styles.optionRow}>
            <View>
              <ThemedText style={styles.optionText}>Auto-start on app launch</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Automatically start data collection when the app starts
              </ThemedText>
            </View>
            <Switch
              value={autoStart}
              onValueChange={handleAutoStartToggle}
              trackColor={{ false: Colors[colorScheme].tabIconDefault, true: Colors[colorScheme].tint }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* Custom Parameters option */}
        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: Colors[colorScheme].background }]}
          onPress={() => setShowParameters(true)}
        >
          <ThemedText style={styles.optionText}>Manage Custom Parameters</ThemedText>
        </TouchableOpacity>

        {/* Additional settings options can be added here */}
        
        {/* Logout button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 30,
  },
  optionsContainer: {
    marginTop: 20,
  },
  sectionContainer: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  optionButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  backButton: {
    fontSize: 18,
    fontWeight: '500',
  },
  userInfoSection: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  userInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    opacity: 0.7,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 