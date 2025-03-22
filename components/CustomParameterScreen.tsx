import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, View, Platform, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { CustomParameterModal } from './CustomParameterModal';
import { ParameterService, Parameter } from '@/services/ParameterService';
import { AuthService } from '@/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export function CustomParameterScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get theme colors
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = 'light'; // App is locked to light mode

  // Get the user ID using AuthService
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Try to get the user ID from AuthService
        const id = await AuthService.getCurrentUserId();
        
        if (id) {
          setUserId(id);
        } else {
          // Temporary fix: Set a default user ID for testing
          // In a production app, this should be removed and the proper login flow fixed
          console.log("No user ID found, using default for testing");
          const defaultUserId = 1; // Use an appropriate test user ID that exists in your system
          setUserId(defaultUserId);
          
          // Store it for future use
          await AsyncStorage.setItem('user_id', defaultUserId.toString());
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch parameters when userId changes or after modal closes
  useEffect(() => {
    if (userId) {
      fetchParameters();
    }
  }, [userId, modalVisible]);

  const fetchParameters = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const fetchedParameters = await ParameterService.getUserParameters(userId);
      setParameters(fetchedParameters);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      Alert.alert('Error', 'Failed to load parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParameter = async (parameterId: number) => {
    if (!userId) return;

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this parameter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await ParameterService.deleteParameter(userId, parameterId);
              if (success) {
                // Update the parameters list
                setParameters(parameters.filter(p => p.id !== parameterId));
              } else {
                Alert.alert('Error', 'Failed to delete parameter');
              }
            } catch (error) {
              console.error('Error deleting parameter:', error);
              Alert.alert('Error', 'An error occurred');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Enum':
        return tintColor; // Purple theme color
      case 'Boolean':
        return '#34a853'; // Green
      case 'Number':
        return '#fbbc04'; // Yellow/Orange
      default:
        return '#9aa0a6'; // Gray
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Enum':
        return 'list';
      case 'Boolean':
        return 'toggle-on';
      case 'Number':
        return 'hashtag';
      default:
        return 'question';
    }
  };

  if (!userId) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>Please log in to manage parameters</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle} type="title">Custom Parameters</ThemedText>
      <ThemedText style={styles.subtitle}>Create and manage your personalized tracking parameters</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
      ) : (
        <>
          {parameters.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: textColor }]}>
                You haven't created any custom parameters yet
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={parameters}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.parameterCardWrapper}
                  activeOpacity={0.9}
                >
                  <ThemedView 
                    style={styles.parameterCard}
                    lightColor="#ffffff"
                  >
                    <View style={styles.parameterHeader}>
                      <View style={[
                        styles.parameterIconContainer, 
                        { backgroundColor: `${getTypeColor(item.parameter_type)}15` }
                      ]}>
                        <FontAwesome6 
                          name={getTypeIcon(item.parameter_type)} 
                          size={20} 
                          color={getTypeColor(item.parameter_type)}
                        />
                      </View>
                      
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteParameter(item.id)}
                      >
                        <FontAwesome6 name="trash-can" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    
                    <ThemedText style={styles.parameterTitle}>{item.name}</ThemedText>
                    
                    <View style={styles.tagsContainer}>
                      <View 
                        style={[
                          styles.tagBadge, 
                          { backgroundColor: `${getTypeColor(item.parameter_type)}15`, 
                            borderColor: `${getTypeColor(item.parameter_type)}30` }
                        ]}
                      >
                        <ThemedText style={[styles.tagText, { color: getTypeColor(item.parameter_type) }]}>
                          {item.parameter_type}
                        </ThemedText>
                      </View>
                      {item.parameter_type === 'Enum' && (
                        <View 
                          style={[
                            styles.tagBadge, 
                            { backgroundColor: '#E76F5115', borderColor: '#E76F5130' }
                          ]}
                        >
                          <ThemedText style={[styles.tagText, { color: '#E76F51' }]}>
                            Options
                          </ThemedText>
                        </View>
                      )}
                      {item.parameter_type === 'Number' && (
                        <View 
                          style={[
                            styles.tagBadge, 
                            { backgroundColor: '#457B9D15', borderColor: '#457B9D30' }
                          ]}
                        >
                          <ThemedText style={[styles.tagText, { color: '#457B9D' }]}>
                            Range
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </ThemedView>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.parametersList}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tintColor }]}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.addButtonText}>+ Add Custom Parameter</ThemedText>
          </TouchableOpacity>

          <CustomParameterModal
            visible={modalVisible}
            userId={userId}
            onClose={() => setModalVisible(false)}
          />
        </>
      )}
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  headerTitle: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  parametersList: {
    paddingBottom: 80,
  },
  parameterCardWrapper: {
    marginBottom: 20,
  },
  parameterCard: {
    borderRadius: 18,
    padding: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  parameterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parameterTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 