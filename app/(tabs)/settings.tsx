import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';

export default function SettingsScreen() {
  const router = useRouter();

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text} type="title">Settings</ThemedText>
      
      <ThemedView style={styles.optionsContainer}>
        {/* Settings options can be added here */}
        
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
  }
}); 