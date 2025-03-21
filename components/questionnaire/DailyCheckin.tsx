import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Question, QuestionId, SelectedAnswers } from '@/types/questionnaire';
import { Button } from '@/components/ui/Button';
import { RadioOption } from '@/components/ui/RadioOption';

interface DailyCheckinProps {
  onSubmit?: (answers: SelectedAnswers) => void;
}

// Questions for the daily check-in
const questions: Question[] = [
  {
    id: 'stress',
    question: 'What is your current stress level?',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
  },
  {
    id: 'loudness',
    question: 'How loud is your tinnitus right now?',
    options: ['Silent as a mouse', 'Quiet as a whisper', 'Loud as a conversation', 'Loud as traffic', 'Loud as a siren'],
  },
  {
    id: 'location',
    question: 'Is your tinnitus on one or both sides?',
    options: ['Left side only', 'Right side only', 'Both sides', 'Inside head/Cannot locate'],
  },
  {
    id: 'sleep',
    question: 'How was your sleep last night?',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
  },
];

export const DailyCheckin: React.FC<DailyCheckinProps> = ({ onSubmit }) => {
  const colorScheme = useColorScheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswerSelected = selectedAnswers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex,
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle submission of all answers
      console.log('All answers:', selectedAnswers);
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(selectedAnswers);
      } else {
        // Default behavior if no callback provided
        alert('Thank you for your responses!');
      }
      
      // Reset the form
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
    }
  };
  
  return (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedText style={styles.cardTitle}>Daily Check-in</ThemedText>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: Colors[colorScheme].tint,
                width: `${(currentQuestionIndex / (questions.length - 1)) * 100}%` 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentQuestionIndex + 1}/{questions.length}
        </ThemedText>
      </View>
      
      {/* Question */}
      <ThemedText style={styles.question}>{currentQuestion.question}</ThemedText>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <RadioOption
            key={index}
            label={option}
            selected={selectedAnswers[currentQuestion.id] === index}
            onSelect={() => handleSelectOption(index)}
          />
        ))}
      </View>
      
      {/* Next Button */}
      <Button
        label={isLastQuestion ? 'Submit' : 'Next'}
        onPress={handleNext}
        disabled={!isAnswerSelected}
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
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectedOption: {
    // Colors set dynamically
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 