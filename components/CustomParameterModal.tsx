import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ParameterService, Parameter, EnumOption } from '@/services/ParameterService';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface Props {
  visible: boolean;
  userId: number;
  onClose: () => void;
}

export function CustomParameterModal({ visible, userId, onClose }: Props) {
  const [step, setStep] = useState<'parameter' | 'enum-options'>('parameter');
  const [parameterName, setParameterName] = useState('');
  const [parameterType, setParameterType] = useState<'Enum' | 'Boolean' | 'Number'>('Enum');
  const [createdParameterId, setCreatedParameterId] = useState<number | null>(null);
  const [enumOption, setEnumOption] = useState('');
  const [enumOptions, setEnumOptions] = useState<EnumOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get theme colors
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = 'light'; // App is locked to light mode

  const resetForm = () => {
    setParameterName('');
    setParameterType('Enum');
    setCreatedParameterId(null);
    setEnumOption('');
    setEnumOptions([]);
    setStep('parameter');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  const createParameter = async () => {
    if (!parameterName.trim()) {
      Alert.alert('Error', 'Please enter a parameter name');
      return;
    }

    setLoading(true);
    try {
      const parameterId = await ParameterService.createParameter(
        userId, 
        parameterName.trim(), 
        parameterType
      );
      
      if (parameterId) {
        setCreatedParameterId(parameterId);
        if (parameterType === 'Enum') {
          setStep('enum-options');
        } else {
          Alert.alert('Success', 'Parameter created successfully', [
            { text: 'OK', onPress: handleClose }
          ]);
        }
      } else {
        Alert.alert('Error', 'Failed to create parameter');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addEnumOption = async () => {
    if (!enumOption.trim() || !createdParameterId) {
      Alert.alert('Error', 'Please enter an option name');
      return;
    }

    setLoading(true);
    try {
      const success = await ParameterService.createEnumOption(
        userId,
        createdParameterId,
        enumOption.trim()
      );
      
      if (success) {
        // Refresh enum options
        const updatedOptions = await ParameterService.getEnumOptions(
          userId,
          createdParameterId
        );
        setEnumOptions(updatedOptions);
        setEnumOption(''); // Clear input
      } else {
        Alert.alert('Error', 'Failed to add option');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finishEnumSetup = () => {
    if (enumOptions.length === 0) {
      Alert.alert('Warning', 'You haven\'t added any options. Are you sure you want to finish?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: handleClose }
      ]);
    } else {
      Alert.alert('Success', 'Parameter and options created successfully', [
        { text: 'OK', onPress: handleClose }
      ]);
    }
  };

  // Fetch enum options if parameter ID is available
  useEffect(() => {
    if (createdParameterId && step === 'enum-options') {
      const fetchEnumOptions = async () => {
        setLoading(true);
        try {
          const options = await ParameterService.getEnumOptions(userId, createdParameterId);
          setEnumOptions(options);
        } catch (error) {
          console.error('Error fetching enum options:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchEnumOptions();
    }
  }, [createdParameterId, step]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalView} lightColor="#ffffff">
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              {step === 'parameter' ? 'Create Custom Parameter' : 'Add Options'}
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
          >
            {step === 'parameter' ? (
              <View style={styles.formContent}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Parameter Name</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={parameterName}
                    onChangeText={setParameterName}
                    placeholder="Enter parameter name"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Parameter Type</ThemedText>
                  <View style={styles.typeGrid}>
                    {['Enum', 'Boolean', 'Number'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeCard,
                          parameterType === type && {
                            borderColor: getTypeColor(type),
                            backgroundColor: `${getTypeColor(type)}10`,
                          }
                        ]}
                        onPress={() => setParameterType(type as any)}
                      >
                        <View style={[
                          styles.typeIconContainer, 
                          { backgroundColor: `${getTypeColor(type)}15` }
                        ]}>
                          <FontAwesome6 
                            name={getTypeIcon(type)} 
                            size={22} 
                            color={getTypeColor(type)}
                          />
                        </View>
                        <ThemedText
                          style={[
                            styles.typeText,
                            parameterType === type && {
                              color: getTypeColor(type),
                              fontWeight: '600',
                            }
                          ]}
                        >
                          {type}
                        </ThemedText>
                        <ThemedText style={styles.typeDescription}>
                          {type === 'Enum' ? 'Multiple options' : 
                           type === 'Boolean' ? 'Yes/No values' : 
                           'Numeric values'}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    label="Cancel"
                    onPress={handleClose}
                    variant="outline"
                    size="medium"
                    style={{flex: 1, marginRight: 10}}
                    disabled={loading}
                  />
                  <Button
                    label={loading ? "Creating..." : "Create Parameter"}
                    onPress={createParameter}
                    size="medium"
                    style={{flex: 1}}
                    disabled={loading}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.formContent}>
                <View style={styles.stepInfo}>
                  <ThemedText style={styles.stepTitle}>
                    Add Options for "{parameterName}"
                  </ThemedText>
                  <ThemedText style={styles.stepInstructions}>
                    Define the options users can select for this parameter
                  </ThemedText>
                </View>
                
                <View style={styles.enumInputContainer}>
                  <TextInput
                    style={[styles.enumInput, { color: textColor }]}
                    value={enumOption}
                    onChangeText={setEnumOption}
                    placeholder="Enter option name"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={[styles.addOptionButton, { backgroundColor: tintColor }]}
                    onPress={addEnumOption}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <FontAwesome6 name="plus" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>

                {enumOptions.length > 0 ? (
                  <View style={styles.optionsContainer}>
                    <ThemedText style={styles.optionsTitle}>Added Options</ThemedText>
                    {enumOptions.map((option, index) => (
                      <View key={option.id} style={styles.optionItem}>
                        <View style={styles.optionDot} />
                        <ThemedText style={styles.optionText}>{option.display}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <ThemedView style={styles.emptyOptions}>
                    <FontAwesome6 name="list" size={24} color="#ccc" style={{marginBottom: 10}} />
                    <ThemedText style={styles.emptyOptionsText}>
                      No options added yet
                    </ThemedText>
                  </ThemedView>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    label="Cancel"
                    onPress={handleClose}
                    variant="outline"
                    size="medium"
                    style={{flex: 1, marginRight: 10}}
                    disabled={loading}
                  />
                  <Button
                    label="Finish"
                    onPress={finishEnumSetup}
                    size="medium"
                    style={{flex: 1}}
                    disabled={loading}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    borderRadius: 20,
    padding: 0,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableContent: {
    flexGrow: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stepInfo: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  stepInstructions: {
    fontSize: 14,
    opacity: 0.7,
  },
  enumInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  enumInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  addOptionButton: {
    height: 50,
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  emptyOptions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  emptyOptionsText: {
    fontSize: 16,
    opacity: 0.5,
  },
}); 