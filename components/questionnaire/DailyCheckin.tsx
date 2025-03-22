import { StyleSheet, View, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SelectedAnswers } from '@/types/questionnaire';
import { Button } from '@/components/ui/Button';
import { RadioOption } from '@/components/ui/RadioOption';
import { AuthService } from '@/services/AuthService';
import { Switch } from 'react-native';
import { jwtDecode } from '@/utils/jwtHelper';

// Parameter interface based on API response
interface Parameter {
  id: number;
  name: string;
  parameter_type: 'Number' | 'Boolean' | 'Enum';
  passive: boolean;
  baselineQuestion: boolean;
  weight: number;
  user: number | null;
  enumtypes?: EnumType[];
}

interface EnumType {
  id: number;
  display: string;
  value: number;
}

interface DailyCheckinProps {
  userId?: number; // Make userId optional to prevent TypeScript errors
  onSubmit?: (answers: any) => void;
  onError?: (error: string) => void;
}

// Helper function to get a color on a green-yellow-red gradient
const getGradientColor = (value: number, max: number = 10): string => {
  // Normalize the value to a 0-1 range
  const normalizedValue = value / max;
  
  // RGB values for gradient: green (low) -> yellow (medium) -> red (high)
  let r, g, b = 0;
  
  if (normalizedValue < 0.5) {
    // Green to Yellow gradient for first half
    r = Math.floor(255 * (normalizedValue * 2));
    g = 180;
  } else {
    // Yellow to Red gradient for second half
    r = 255;
    g = Math.floor(180 * (1 - (normalizedValue - 0.5) * 2));
  }
  
  return `rgb(${r}, ${g}, ${b})`;
};

// Helper function to extract user ID from JWT token
const extractUserIdFromToken = (token: string): number | null => {
  try {
    // Basic JWT decoding (in a real app, use a JWT library)
    const payload = jwtDecode(token);
    
    // Check for user_id first (most common)
    if (payload && payload.user_id) {
      return payload.user_id;
    }
    
    // Then check for sub (subject) field
    if (payload && payload.sub && typeof payload.sub === 'string') {
      try {
        const userId = parseInt(payload.sub, 10);
        if (!isNaN(userId)) {
          return userId;
        }
      } catch {
        // If parseInt fails, continue to return null
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const DailyCheckin: React.FC<DailyCheckinProps> = ({ userId, onSubmit, onError }) => {
  const colorScheme = useColorScheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({});
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(userId);

  // Try to get userId from auth service if not provided
  useEffect(() => {
    const getUserId = async () => {
      if (userId) {
        setCurrentUserId(userId);
        return;
      }
      
      try {
        // Attempt to get user ID from auth token
        const tokens = await AuthService.getTokens();
        if (!tokens) {
          setError('Not logged in. Please log in to continue.');
          return;
        }
        
        // Extract user ID from token
        const extractedUserId = extractUserIdFromToken(tokens.access);
        if (extractedUserId) {
          setCurrentUserId(extractedUserId);
        } else {
          // Fallback to auth check API if token doesn't contain ID
          const response = await fetch(`${AuthService.API_URL}/amiauth`, {
            headers: {
              'Authorization': `Bearer ${tokens.access}`,
            },
          });
          
          if (!response.ok) {
            setError('Could not authenticate. Please log in again.');
          } else {
            // If the auth check is successful but we couldn't extract the ID,
            // use a fallback ID (typically this would come from the response)
            setCurrentUserId(1); // Fallback ID, replace with actual ID extraction when available
          }
        }
      } catch (err) {
        setError('Authentication error. Please try again.');
      }
    };
    
    getUserId();
  }, [userId]);

  // Load parameters when component mounts
  useEffect(() => {
    fetchParameters();
  }, []);

  // Fetch parameters from backend
  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      // Fetch user-specific and general parameters
      const response = await fetch(`${AuthService.API_URL}/parameters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch parameters');
      }
      
      const data = await response.json();
      
      // Filter out baseline questions and passive parameters
      const activeParameters = data.filter((param: Parameter) => 
        !param.baselineQuestion && !param.passive
      );
      
      // Fetch enum types for each enum parameter
      const parametersWithEnumTypes = await Promise.all(
        activeParameters.map(async (parameter: Parameter) => {
          if (parameter.parameter_type === 'Enum') {
            const enumTypesResponse = await fetch(
              `${AuthService.API_URL}/parameter/${parameter.id}/enumtype`
            );
            
            if (enumTypesResponse.ok) {
              const enumTypes = await enumTypesResponse.json();
              return { ...parameter, enumtypes: enumTypes };
            }
          }
          return parameter;
        })
      );
      
      setParameters(parametersWithEnumTypes);
      
      // Initialize answers with default values
      const initialAnswers: {[key: string]: number} = {};
      parametersWithEnumTypes.forEach((parameter: Parameter) => {
        if (parameter.parameter_type === 'Boolean') {
          initialAnswers[parameter.id.toString()] = 0;
        } else if (parameter.parameter_type === 'Number') {
          initialAnswers[parameter.id.toString()] = 5;
        } else if (parameter.parameter_type === 'Enum' && parameter.enumtypes && parameter.enumtypes.length > 0) {
          initialAnswers[parameter.id.toString()] = parameter.enumtypes[0].value;
        }
      });
      
      setSelectedAnswers(initialAnswers);
    } catch (error) {
      setError('Failed to load questions. Please try again.');
      if (onError) onError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (parameterId: string, value: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [parameterId]: value
    });
  };
  
  const normalizeAnswer = (parameter: Parameter, value: number): number => {
    switch (parameter.parameter_type) {
      case 'Boolean':
        return value; // 0 or 1
      case 'Number':
        return value / 10; // Assuming slider values are 0-10
      case 'Enum':
        if (parameter.enumtypes) {
          const maxValue = Math.max(...parameter.enumtypes.map(et => et.value));
          return maxValue > 0 ? value / maxValue : 0;
        }
        return 0;
      default:
        return 0;
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < parameters.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle submission of all answers
      handleSubmit();
    }
  };
  
  const handleSubmit = async () => {
    // Check if userId is available before submitting
    if (!currentUserId) {
      const errorMsg = 'User ID is not available. Please login again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert answers to format expected by logs endpoint
      const entries = Object.keys(selectedAnswers).map(parameterId => {
        const parameter = parameters.find(p => p.id.toString() === parameterId);
        const normalizedValue = parameter ? normalizeAnswer(parameter, selectedAnswers[parameterId]) : 0;
        
        return {
          parameter_id: parseInt(parameterId),
          answer: selectedAnswers[parameterId],
          normalised_answer: normalizedValue
        };
      });
      
      // Submit to logs endpoint
      const response = await fetch(`${AuthService.API_URL}/users/${currentUserId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit daily check-in');
      }
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(selectedAnswers);
      }
      
      // Reset the form
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      
    } catch (error) {
      const errorMsg = 'Failed to submit answers. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render different input types based on parameter type
  const renderQuestionInput = (parameter: Parameter) => {
    const parameterId = parameter.id.toString();
    
    switch (parameter.parameter_type) {
      case 'Boolean':
        return (
          <View style={styles.switchContainer}>
            <ThemedText style={styles.switchLabel}>No</ThemedText>
            <Switch
              value={selectedAnswers[parameterId] === 1}
              onValueChange={(value) => 
                handleSelectOption(parameterId, value ? 1 : 0)
              }
              trackColor={{ false: '#767577', true: Colors[colorScheme].tint }}
              thumbColor="#f4f3f4"
            />
            <ThemedText style={styles.switchLabel}>Yes</ThemedText>
          </View>
        );
        
      case 'Number':
        return (
          <View style={styles.numberContainer}>
            <ThemedText style={[styles.sliderValue, { color: getGradientColor(selectedAnswers[parameterId]) }]}>
              {selectedAnswers[parameterId]}
            </ThemedText>
            <View style={styles.numberButtonsContainer}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const buttonColor = getGradientColor(num);
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      selectedAnswers[parameterId] === num ? 
                        { backgroundColor: buttonColor, borderColor: buttonColor } : 
                        { borderColor: buttonColor }
                    ]}
                    onPress={() => handleSelectOption(parameterId, num)}
                  >
                    <ThemedText 
                      style={[
                        styles.numberButtonText,
                        { color: selectedAnswers[parameterId] === num ? 'white' : buttonColor }
                      ]}
                    >
                      {num}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
        
      case 'Enum':
        if (!parameter.enumtypes || parameter.enumtypes.length === 0) {
          return <ThemedText style={{ color: 'red' }}>No options available</ThemedText>;
        }
        
        // Sort enumtypes by value for proper color gradient
        const sortedEnumTypes = [...parameter.enumtypes].sort((a, b) => a.value - b.value);
        const maxEnumValue = Math.max(...sortedEnumTypes.map(et => et.value));
        
        return (
          <View style={styles.enumContainer}>
            {sortedEnumTypes.map((option) => {
              const optionColor = getGradientColor(option.value, maxEnumValue);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.enumOption,
                    selectedAnswers[parameterId] === option.value ? 
                      { backgroundColor: optionColor, borderColor: optionColor } : 
                      { borderColor: optionColor }
                  ]}
                  onPress={() => handleSelectOption(parameterId, option.value)}
                >
                  <ThemedText style={[
                    styles.enumOptionText,
                    { color: selectedAnswers[parameterId] === option.value ? 'white' : optionColor }
                  ]}>
                    {option.display}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText style={styles.loadingText}>
          Loading daily check-in...
        </ThemedText>
      </View>
    );
  }

  if (parameters.length === 0) {
    return (
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>No questions available</ThemedText>
        <ThemedText>There are no check-in questions configured for you.</ThemedText>
      </View>
    );
  }

  const currentParameter = parameters[currentQuestionIndex];
  const isAnswerSelected = selectedAnswers[currentParameter.id.toString()] !== undefined;
  const isLastQuestion = currentQuestionIndex === parameters.length - 1;
  
  return (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedText style={styles.cardTitle}>How are you feeling today?</ThemedText>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: Colors[colorScheme].tint,
                width: `${(currentQuestionIndex / (parameters.length - 1)) * 100}%` 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentQuestionIndex + 1}/{parameters.length}
        </ThemedText>
      </View>
      
      {/* Error message if present */}
      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : null}
      
      {/* Question */}
      <ThemedText style={styles.question}>{currentParameter.name}</ThemedText>
      
      {/* Input for the current question */}
      {renderQuestionInput(currentParameter)}
      
      {/* Next Button */}
      <Button
        label={isLastQuestion ? 'Submit' : 'Next'}
        onPress={handleNext}
        disabled={!isAnswerSelected || isSubmitting}
        size="large"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    paddingBottom: 28,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE8E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9999',
  },
  errorText: {
    color: '#D00000',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f1f4',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  question: {
    fontSize: 18,
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  switchLabel: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  numberContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  numberButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  enumContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  enumOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  enumOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 