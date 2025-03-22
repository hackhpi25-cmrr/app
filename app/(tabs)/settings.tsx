import { StyleSheet, TouchableOpacity, Alert, View, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';
import { useState, useEffect } from 'react';
import { CustomParameterScreen } from '@/components/CustomParameterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [showParameters, setShowParameters] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user ID is available
  useEffect(() => {
    getUserId();
  }, []);
  
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);
    } catch (error) {
      // Silently handle error
    }
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
      <View style={styles.userInfoSection}>
        <View style={styles.userInfoHeader}>
          <ThemedText style={styles.userInfoLabel}>User ID:</ThemedText>
          <TouchableOpacity onPress={handleRefreshUserId} style={styles.refreshButton}>
            <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.userInfoValue}>{userId || 'Not available'}</ThemedText>
      </View>
      
      <ThemedView style={styles.optionsContainer}>
        {/* Custom Parameters option */}
        <TouchableOpacity 
          style={styles.optionButton}
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
  optionButton: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
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
    color: '#666',
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
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