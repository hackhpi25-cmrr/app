import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthService } from '@/services/AuthService';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

// Define the BaseQuestion interface based on the API response
interface BaseQuestion {
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

export default function BaselineScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<BaseQuestion[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: number}>({});
  const [error, setError] = useState('');

  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    // Get user ID from auth token
    getUserIdFromToken();
  }, []);

  useEffect(() => {
    // Only fetch questions once we have the user ID
    if (userId !== null) {
      fetchBaselineQuestions();
    }
  }, [userId]);

  const getUserIdFromToken = async () => {
    try {
      // Check if we have auth tokens
      const tokens = await AuthService.getTokens();
      
      if (!tokens) {
        // No auth tokens, redirect to login
        router.replace('/(auth)/login');
        return;
      }
      
      // Try to get user ID by making an authenticated request
      try {
        const response = await fetch(`${AuthService.API_URL}/amiauth`, {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
          },
        });
        
        if (response.ok) {
          // User is authenticated, use the token data to get user ID
          // In a real app, you would decode the JWT token to get the user ID
          // or have a dedicated endpoint to get the user profile
          // For now, we'll use a placeholder ID of 1
          setUserId(1);
        } else {
          // Auth failed, redirect to login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
      router.replace('/(auth)/login');
    }
  };

  const fetchBaselineQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${AuthService.API_URL}/basequestions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch baseline questions');
      }
      
      const data = await response.json();
      
      // Fetch enum types for each enum question
      const questionsWithEnumTypes = await Promise.all(
        data.map(async (question: BaseQuestion) => {
          if (question.parameter_type === 'Enum') {
            const enumTypesResponse = await fetch(
              `${AuthService.API_URL}/users/${userId}/parameter/${question.id}/enumtype`
            );
            
            if (enumTypesResponse.ok) {
              const enumTypes = await enumTypesResponse.json();
              return { ...question, enumtypes: enumTypes };
            }
          }
          return question;
        })
      );
      
      setQuestions(questionsWithEnumTypes);
      
      // Initialize answers with default values
      const initialAnswers: {[key: string]: number} = {};
      questionsWithEnumTypes.forEach((question: BaseQuestion) => {
        if (question.parameter_type === 'Boolean') {
          initialAnswers[question.id.toString()] = 0;
        } else if (question.parameter_type === 'Number') {
          initialAnswers[question.id.toString()] = 5;
        } else if (question.parameter_type === 'Enum' && question.enumtypes && question.enumtypes.length > 0) {
          initialAnswers[question.id.toString()] = question.enumtypes[0].value;
        }
      });
      
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching baseline questions:', error);
      setError('Failed to load baseline questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeAnswer = (question: BaseQuestion, value: number): number => {
    switch (question.parameter_type) {
      case 'Boolean':
        return value; // 0 or 1
      case 'Number':
        return value / 10; // Assuming slider values are 0-10
      case 'Enum':
        if (question.enumtypes) {
          const maxValue = Math.max(...question.enumtypes.map(et => et.value));
          return maxValue > 0 ? value / maxValue : 0;
        }
        return 0;
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Convert answers to normalized format for submission
      const entries = Object.keys(answers).map(questionId => {
        const question = questions.find(q => q.id.toString() === questionId);
        const normalizedValue = question ? normalizeAnswer(question, answers[questionId]) : 0;
        
        return {
          question_id: parseInt(questionId),
          normalised_answer: normalizedValue
        };
      });
      
      // Submit to the API
      const response = await fetch(`${AuthService.API_URL}/users/${userId}/baseline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit baseline answers');
      }
      
      // Navigate to login screen after successful submission
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error submitting baseline:', error);
      setError('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: BaseQuestion) => {
    const answerId = question.id.toString();
    
    switch (question.parameter_type) {
      case 'Boolean':
        return (
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: textColor }]}>No</Text>
            <Switch
              value={answers[answerId] === 1}
              onValueChange={(value) => 
                setAnswers({...answers, [answerId]: value ? 1 : 0})
              }
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor="#f4f3f4"
            />
            <Text style={[styles.switchLabel, { color: textColor }]}>Yes</Text>
          </View>
        );
        
      case 'Number':
        return (
          <View style={styles.numberContainer}>
            <Text style={[styles.sliderValue, { color: textColor }]}>
              {answers[answerId]}
            </Text>
            <View style={styles.numberButtonsContainer}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    answers[answerId] === num && { backgroundColor: tintColor }
                  ]}
                  onPress={() => setAnswers({...answers, [answerId]: num})}
                >
                  <Text 
                    style={[
                      styles.numberButtonText,
                      answers[answerId] === num && { color: 'white' }
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'Enum':
        if (!question.enumtypes || question.enumtypes.length === 0) {
          return <Text style={{ color: 'red' }}>No options available</Text>;
        }
        
        return (
          <View style={styles.enumContainer}>
            {question.enumtypes.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.enumOption,
                  answers[answerId] === option.value && { backgroundColor: tintColor }
                ]}
                onPress={() => setAnswers({...answers, [answerId]: option.value})}
              >
                <Text style={[
                  styles.enumOptionText,
                  answers[answerId] === option.value && { color: 'white' }
                ]}>
                  {option.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading baseline questions...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, { color: textColor }]}>Baseline Questionnaire</Text>
          <Text style={styles.subHeaderText}>
            Please answer these questions to help us understand your baseline condition
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {questions.map((question) => (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: textColor }]}>
              {question.name}
            </Text>
            {renderQuestionInput(question)}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit & Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
    marginTop: 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  questionContainer: {
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  numberContainer: {
    alignItems: 'center',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
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
    gap: 8,
  },
  enumOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  enumOptionText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 