import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Platform, Dimensions, Modal, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Button } from '@/components/ui/Button';

// Define exercise types
type Exercise = {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'challenging';
  steps: string[];
  tags: string[];
  equipmentNeeded?: string;
  imageSource?: string;
};

// Define category type
type Category = {
  title: string;
  icon: string;
  description: string;
  exercises: Exercise[];
};

// Component for exercise card
const ExerciseCard: React.FC<{
  exercise: Exercise;
  onPress: (id: string) => void;
}> = ({ exercise, onPress }) => {
  const colorScheme = useColorScheme();
  
  // Determine tag colors
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'jaw':
        return '#2A9D8F'; // Teal
      case 'neck':
        return '#F4A261'; // Orange
      case 'stretch':
        return '#E76F51'; // Coral
      case 'massage':
        return '#457B9D'; // Blue
      case 'equipment':
        return '#8a4fff'; // Purple
      case 'tmj':
        return '#4CAF50'; // Green
      case 'tension':
        return '#FF9800'; // Amber
      case 'relief':
        return '#03A9F4'; // Light Blue
      default:
        return Colors[colorScheme].tint;
    }
  };
  
  // Determine difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#34a853'; // Green
      case 'medium':
        return '#fbbc04'; // Yellow
      case 'challenging':
        return '#ea4335'; // Red
      default:
        return '#9aa0a6'; // Gray
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.exerciseCardWrapper}
      onPress={() => onPress(exercise.id)}
      activeOpacity={0.9}
    >
      <ThemedView 
        style={styles.exerciseCard}
        lightColor="#ffffff"
      >
        <View style={styles.exerciseHeader}>
          <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
          <View style={styles.exerciseMeta}>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: `${getDifficultyColor(exercise.difficulty)}20`, 
                borderColor: getDifficultyColor(exercise.difficulty) 
              }
            ]}>
              <ThemedText style={[
                styles.difficultyText, 
                { color: getDifficultyColor(exercise.difficulty) }
              ]}>
                {exercise.difficulty}
              </ThemedText>
            </View>
            <ThemedText style={styles.durationText}>{exercise.duration}</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.exerciseDescription}>{exercise.description}</ThemedText>
        
        {exercise.equipmentNeeded && (
          <View style={styles.equipmentContainer}>
            <FontAwesome6 name="toolbox" size={14} color={Colors[colorScheme].tint} style={styles.equipmentIcon} />
            <ThemedText style={styles.equipmentText}>
              Needed: {exercise.equipmentNeeded}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.tagsContainer}>
          {exercise.tags.map((tag, index) => (
            <View 
              key={index} 
              style={[
                styles.tagBadge, 
                { backgroundColor: `${getTagColor(tag)}15`, borderColor: `${getTagColor(tag)}30` }
              ]}
            >
              <ThemedText style={[styles.tagText, { color: getTagColor(tag) }]}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

// Feedback component
const TreatmentFeedback: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: Exercise;
}> = ({ visible, onClose, exercise }) => {
  const colorScheme = useColorScheme();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  useEffect(() => {
    if (!visible) {
      setRating(null);
      setFeedback(null);
    }
  }, [visible]);
  
  const handleRating = (value: number) => {
    setRating(value);
    
    // Set automatic feedback message based on rating
    if (value <= 1) {
      setFeedback("Sorry it didn't help. Next time try a different technique or longer duration.");
    } else if (value <= 3) {
      setFeedback("Great start! Try this exercise again or explore other treatments.");
    } else {
      setFeedback("Excellent! We're glad this technique helped with your tinnitus symptoms.");
    }
  };
  
  if (!exercise) return null;
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.feedbackModal} lightColor="#ffffff">
          <View style={styles.feedbackHeader}>
            <ThemedText style={styles.feedbackTitle}>How was your experience?</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.feedbackContent}>
            <ThemedText style={styles.exerciseCompleteText}>
              You've completed:
            </ThemedText>
            <ThemedText style={styles.exerciseNameText}>
              {exercise.title}
            </ThemedText>
            
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.ratingLabel}>
                Did this help with your tinnitus symptoms?
              </ThemedText>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity 
                    key={star} 
                    onPress={() => handleRating(star)}
                    style={styles.starButton}
                  >
                    <FontAwesome6 
                      name={star <= (rating || 0) ? "star" : "star"} 
                      solid={star <= (rating || 0)}
                      size={36} 
                      color={star <= (rating || 0) ? Colors[colorScheme].tint : '#e0e0e0'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              {feedback && (
                <View style={styles.feedbackMessageContainer}>
                  <ThemedText style={styles.feedbackMessage}>
                    {feedback}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <Button
              label="Done"
              onPress={onClose}
              size="medium"
              style={{marginTop: 20}}
            />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

// ExerciseDetail component
const ExerciseDetail: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}> = ({ visible, onClose, exercise }) => {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Reset step when modal is closed
  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setShowFeedback(false);
    }
  }, [visible]);
  
  if (!exercise) return null;
  
  const hasMoreSteps = currentStep < exercise.steps.length - 1;
  const hasPreviousSteps = currentStep > 0;
  
  const handleFinish = () => {
    setShowFeedback(true);
  };
  
  const handleFeedbackClose = () => {
    setShowFeedback(false);
    onClose();
  };
  
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible && !showFeedback}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.exerciseModal} lightColor="#ffffff">
            <View style={styles.exerciseDetailHeader}>
              <ThemedText style={styles.exerciseDetailTitle}>{exercise.title}</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome6 name="xmark" size={20} color="#777" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollableContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.exerciseContent}>
                {exercise.equipmentNeeded && (
                  <View style={styles.equipmentNotice}>
                    <FontAwesome6 name="toolbox" size={16} color={Colors[colorScheme].tint} />
                    <ThemedText style={styles.equipmentNoticeText}>
                      You'll need: {exercise.equipmentNeeded}
                    </ThemedText>
                  </View>
                )}
                
                <View style={styles.stepProgress}>
                  <ThemedText style={styles.stepProgressText}>
                    Step {currentStep + 1} of {exercise.steps.length}
                  </ThemedText>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${((currentStep + 1) / exercise.steps.length) * 100}%`,
                          backgroundColor: Colors[colorScheme].tint
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <ThemedText style={styles.stepInstruction}>
                  {exercise.steps[currentStep]}
                </ThemedText>
                
                <View style={styles.navigationControls}>
                  <Button
                    label="Previous"
                    onPress={() => setCurrentStep(prev => prev - 1)}
                    size="medium"
                    variant="outline"
                    style={{flex: 1, marginRight: 10}}
                    disabled={!hasPreviousSteps}
                  />
                  {hasMoreSteps ? (
                    <Button
                      label="Next"
                      onPress={() => setCurrentStep(prev => prev + 1)}
                      size="medium"
                      style={{flex: 1}}
                    />
                  ) : (
                    <Button
                      label="Finish"
                      onPress={handleFinish}
                      size="medium"
                      style={{flex: 1}}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
      
      {exercise && (
        <TreatmentFeedback
          visible={showFeedback}
          onClose={handleFeedbackClose}
          exercise={exercise}
        />
      )}
    </>
  );
};

// Main component
export default function EarJawScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [activeCategory, setActiveCategory] = useState<string>('jaw');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Define exercise categories
  const categories: Category[] = [
    {
      title: 'Jaw Exercises',
      icon: 'face-smile',
      description: 'Exercises to relieve tension in the jaw muscles and TMJ, which can help reduce tinnitus symptoms',
      exercises: [
        {
          id: 'jaw-massage',
          title: 'Jaw Massage',
          description: 'Targeted massage to release tension in the jaw muscles using a mini massage ball',
          icon: 'hand-holding-medical',
          duration: '4-5 min',
          difficulty: 'easy',
          equipmentNeeded: 'Mini Massage Ball',
          tags: ['jaw', 'massage', 'tmj'],
          steps: [
            'Sit in a chair with your back straight.',
            'Take the Mini Massage Ball with both hands. Place it on your left cheek.',
            'Apply as much pressure to the Mini Massage Ball as possible and make small circular motions, covering your entire cheek and jaw.',
            'When you hit a sensitive area, increase the pressure and massage until you feel the tension release.',
            'Continue massaging for 2 to 2.5 minutes.',
            'Finish and repeat on the right cheek.'
          ]
        },
        {
          id: 'jaw-stretch',
          title: 'Jaw Stretch',
          description: 'A gentle stretch for the temporomandibular joint (TMJ) to help relieve tension and pain',
          icon: 'hands',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['jaw', 'stretch', 'tmj'],
          steps: [
            'Look straight ahead.',
            'Place your chin between your thumb and index finger.',
            'Open your mouth as wide as possible.',
            'Using your hand, pull your chin down as far as you can. You\'ll feel a stretch in your temporomandibular joint (TMJ).',
            'On each exhale, pull your chin down further.',
            'Continue stretching for between 2 and 2.5 minutes.',
            'Finish.'
          ]
        },
      ]
    },
    {
      title: 'Neck Exercises',
      icon: 'head-side',
      description: 'Exercises for the neck muscles that can help alleviate tension contributing to tinnitus symptoms',
      exercises: [
        {
          id: 'neck-massage',
          title: 'Neck Massage',
          description: 'Use a mini foam roller to release tension in the neck muscles',
          icon: 'hand-holding-medical',
          duration: '4-5 min',
          difficulty: 'medium',
          equipmentNeeded: 'Mini Foam Roller',
          tags: ['neck', 'massage', 'tension'],
          steps: [
            'Take the Mini Foam Roller in both hands and place it next to your left ear at the base of your skull.',
            'Angle the Mini Foam Roller at 45 degrees.',
            'Apply as much pressure as possible, and slowly roll down your neck.',
            'Roll for 2 to 2.5 minutes.',
            'Finish when you reach the bottom of your neck.',
            'Repeat on the right side.'
          ]
        },
        {
          id: 'neck-stretch',
          title: 'Neck Stretch',
          description: 'Stretch the side neck muscles to relieve tension that may contribute to tinnitus',
          icon: 'hand-holding',
          duration: '4-5 min',
          difficulty: 'medium',
          tags: ['neck', 'stretch', 'tension'],
          steps: [
            'Make a fist with your left hand and bring it to your left shoulder.',
            'Pull your fist and shoulder down.',
            'Place your right hand on the left side of your head just above your ear. Pull your head to the right.',
            'You\'ll feel a stretch along the side of your neck.',
            'On each exhale, increase the intensity of the stretch by pulling your shoulder further down and your head more to the right.',
            'When you feel like you\'ve reached peak intensity, hold the stretch for 2 to 2.5 minutes.',
            'Slowly release and finish.',
            'Repeat the stretch on the other side.'
          ]
        },
        {
          id: 'angled-neck-stretch',
          title: 'Angled Neck Stretch',
          description: 'A deeper stretch targeting specific neck muscles that may be contributing to tinnitus',
          icon: 'person',
          duration: '4-5 min',
          difficulty: 'challenging',
          tags: ['neck', 'stretch', 'tension'],
          steps: [
            'Start the stretch by looking straight ahead.',
            'Turn your head 45 degrees to the left.',
            'Pull your left shoulder down with your left hand.',
            'Place your right hand on the left side of your head just above your ear.',
            'Pull your head down at a 45-degree angle.',
            'On each exhale, pull your head down further.',
            'When the stretch has reached peak intensity, hold for 2 to 2.5 minutes.',
            'Release and repeat on the other side.'
          ]
        },
      ]
    },
    {
      title: 'Combined Techniques',
      icon: 'people-group',
      description: 'Comprehensive approaches that combine multiple techniques for maximum relief from tinnitus symptoms',
      exercises: [
        {
          id: 'ear-jaw-routine',
          title: 'Complete Ear & Jaw Relief Routine',
          description: 'A comprehensive sequence combining multiple exercises for maximum relief',
          icon: 'clipboard-list',
          duration: '10-15 min',
          difficulty: 'medium',
          equipmentNeeded: 'Mini Massage Ball, Mini Foam Roller',
          tags: ['jaw', 'neck', 'relief', 'equipment'],
          steps: [
            'Start with the Jaw Massage exercise (2.5 minutes per side).',
            'Follow with the Neck Massage (2.5 minutes per side).',
            'Perform the Jaw Stretch (2.5 minutes).',
            'Complete one side of the Neck Stretch (2.5 minutes).',
            'Complete the other side of the Neck Stretch (2.5 minutes).',
            'Finish with gentle head rotations: slowly turn your head from side to side 5 times.'
          ]
        },
        {
          id: 'quick-relief',
          title: 'Quick Relief Sequence',
          description: 'A shorter routine for when you need fast relief from tinnitus symptoms',
          icon: 'bolt',
          duration: '5-6 min',
          difficulty: 'easy',
          tags: ['jaw', 'neck', 'relief'],
          steps: [
            'Place your fingers on your jaw joints (where your jaw connects to your skull).',
            'Apply gentle pressure and make small circular motions for 1 minute.',
            'Open and close your mouth slowly 10 times while maintaining the pressure.',
            'Move your hands to the base of your skull and apply pressure with your thumbs for 1 minute.',
            'Gently stretch your neck to each side, holding for 30 seconds per side.',
            'Finish with 5 deep breaths, focusing on relaxing your jaw and neck with each exhale.'
          ]
        }
      ]
    }
  ];

  // Get the active category's techniques
  const activeExercises = categories.find(cat => cat.title.toLowerCase().includes(activeCategory))?.exercises || [];

  // Handle exercise selection
  const handleExerciseSelect = (id: string) => {
    const allExercises = categories.flatMap(cat => cat.exercises);
    const exercise = allExercises.find(ex => ex.id === id);
    
    if (exercise) {
      setSelectedExercise(exercise);
      setModalVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Exercise detail modal */}
      <ExerciseDetail 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        exercise={selectedExercise}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.headerTitle} type="title">Ear & Jaw Care</ThemedText>
        <ThemedText style={styles.subtitle}>Targeted exercises to help reduce acute tinnitus symptoms</ThemedText>
        
        {/* Category selection tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.categoryTab,
                activeCategory === category.title.toLowerCase().split(' ')[0] && styles.activeTab
              ]}
              onPress={() => setActiveCategory(category.title.toLowerCase().split(' ')[0])}
            >
              <ThemedText 
                style={[
                  styles.categoryTitle,
                  activeCategory === category.title.toLowerCase().split(' ')[0] && styles.activeCategoryTitle
                ]}
              >
                {category.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Category description */}
        <ThemedView style={styles.categoryDescription} lightColor="#f8f8fa">
          <ThemedText style={styles.categoryDescriptionText}>
            {categories.find(cat => cat.title.toLowerCase().includes(activeCategory))?.description}
          </ThemedText>
        </ThemedView>
        
        {/* Exercise cards */}
        <View style={styles.exercisesContainer}>
          {activeExercises.map((exercise, index) => (
            <ExerciseCard 
              key={index}
              exercise={exercise}
              onPress={handleExerciseSelect}
            />
          ))}
        </View>
        
        <View style={styles.backButtonContainer}>
          <Button
            label="Back to Treatments"
            onPress={() => router.back()}
            variant="outline"
            size="medium"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerTitle: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  categoryTabsContainer: {
    paddingVertical: 6,
    paddingBottom: 14,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  activeTab: {
    backgroundColor: `${Colors.light.tint}15`, 
  },
  categoryTitle: {
    fontSize: 14,
    color: '#777',
  },
  activeCategoryTitle: {
    fontWeight: '600',
    color: Colors.light.tint,
  },
  categoryDescription: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  exercisesContainer: {
    marginBottom: 20,
  },
  exerciseCardWrapper: {
    marginBottom: 20,
  },
  exerciseCard: {
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 0,
    flex: 1,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 13,
    opacity: 0.6,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  equipmentIcon: {
    marginRight: 8,
  },
  equipmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseDescription: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 8,
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
  backButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  exerciseModal: {
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
  exerciseDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  exerciseDetailTitle: {
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
  exerciseContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  equipmentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    alignSelf: 'center',
  },
  equipmentNoticeText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  stepProgress: {
    width: '100%',
    marginBottom: 30,
  },
  stepProgressText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepInstruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  navigationControls: {
    flexDirection: 'row',
    width: '100%',
  },
  // Feedback modal styles
  feedbackModal: {
    width: '100%',
    borderRadius: 20,
    padding: 0,
    maxHeight: '80%',
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
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  feedbackContent: {
    padding: 20,
    alignItems: 'center',
  },
  exerciseCompleteText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 5,
  },
  exerciseNameText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  ratingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  starButton: {
    padding: 5,
  },
  feedbackMessageContainer: {
    backgroundColor: `${Colors.light.tint}10`,
    borderRadius: 12,
    padding: 15,
    width: '100%',
  },
  feedbackMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 