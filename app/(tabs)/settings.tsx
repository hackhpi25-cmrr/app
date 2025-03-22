import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
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

  // Check if user ID is available, set a default if needed
  useEffect(() => {
    const checkUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          // Set a default user ID for testing
          await AsyncStorage.setItem('user_id', '1');
          console.log('Set default user ID: 1 in settings screen');
        }
      } catch (error) {
        console.error('Error checking user ID:', error);
      }
    };
    
    checkUserId();
  }, []);

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
  }
}); 