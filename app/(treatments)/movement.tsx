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
      case 'neck':
        return '#2A9D8F'; // Teal
      case 'shoulders':
        return '#F4A261'; // Orange
      case 'back':
        return '#E76F51'; // Coral
      case 'stretch':
        return '#457B9D'; // Blue
      case 'strength':
        return '#8a4fff'; // Purple
      case 'posture':
        return '#4CAF50'; // Green
      case 'balance':
        return '#FF9800'; // Amber
      case 'mobility':
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
export default function MovementScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [activeCategory, setActiveCategory] = useState<string>('office');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Define exercise categories
  const categories: Category[] = [
    {
      title: 'Office Exercises',
      icon: 'chair',
      description: 'Quick exercises you can do at your desk to relieve tension and reduce tinnitus awareness',
      exercises: [
        {
          id: 'head-turns',
          title: 'Head Turns',
          description: 'Gentle neck rotations to release tension in the neck and shoulders',
          icon: 'head',
          duration: '2-3 min',
          difficulty: 'easy',
          tags: ['neck', 'mobility', 'posture'],
          steps: [
            'Sit upright with straight shoulders and back, facing forward.',
            'Turn your head all the way to the left, then to the right. Repeat 10 times, moving slowly.',
            'Next, tilt your head forward and backward, as if nodding excessively. Repeat 10 times.',
            'Finally, keep your head upright and move it in a half-circle from one shoulder to the other. Repeat 10 times.'
          ]
        },
        {
          id: 'shoulder-circles',
          title: 'Shoulder Circles',
          description: 'Circular movements to release tension in shoulders and upper back',
          icon: 'user',
          duration: '1-2 min',
          difficulty: 'easy',
          tags: ['shoulders', 'mobility'],
          steps: [
            'Sit upright in your chair and let your arms hang loosely at your sides.',
            'Roll your shoulders forward in circular motions, repeating 4 times.',
            'Reverse direction and roll your shoulders backward 4 times.',
            'Focus on complete circles and keeping your neck relaxed throughout the movement.'
          ]
        },
        {
          id: 'torso-twist',
          title: 'Torso Twist',
          description: 'Gentle rotation of the upper body to improve spine mobility',
          icon: 'person',
          duration: '2-3 min',
          difficulty: 'easy',
          tags: ['back', 'stretch', 'mobility'],
          steps: [
            'Sit upright in your chair with a straight back.',
            'Place your right hand on your left knee and your left hand beside you on the seat.',
            'Rotate your upper body backward, keeping your back straight. Follow the movement with your gaze.',
            'Switch sides by placing your left hand on your right knee and your right hand on the seat. Repeat 4 times on each side.'
          ]
        },
        {
          id: 'back-mobilization',
          title: 'Back Mobilization',
          description: 'Cat-cow style movement to improve spine flexibility',
          icon: 'user',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['back', 'mobility', 'posture'],
          steps: [
            'Stand up straight with your feet shoulder-width apart.',
            'Slightly bend your knees and place your hands on them.',
            'Arch your back upward like a cat, while dropping your head slightly.',
            'Then reverse by creating a slight hollow in your lower back while raising your head slightly. Repeat this movement several times.'
          ]
        },
      ]
    },
    {
      title: 'Standing Exercises',
      icon: 'person-walking',
      description: 'Exercises performed while standing to improve balance, strength, and reduce muscle tension',
      exercises: [
        {
          id: 'figure-eights',
          title: 'Figure Eights',
          description: 'Draw figure eights in the air with your leg to improve balance and coordination',
          icon: '8',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['balance', 'mobility', 'legs'],
          steps: [
            'Stand upright and shift your weight to your left leg, slightly bending it.',
            'With your right leg, trace the shape of the number 8 in the air.',
            'Repeat this motion 4 times.',
            'Switch to standing on your right leg and trace figure eights with your left leg. Keep your back straight throughout.'
          ]
        },
        {
          id: 'shoulder-strength',
          title: 'Shoulder Strengthening',
          description: 'Strengthen shoulder muscles using light weights like water bottles',
          icon: 'dumbbell',
          duration: '3-4 min',
          difficulty: 'medium',
          tags: ['shoulders', 'strength'],
          steps: [
            'Stand upright with your feet hip-width apart, holding a water bottle or light weight in each hand.',
            'Extend your arms to the sides while keeping your back straight and engaging your core muscles.',
            'Make small forward circular movements with your arms extended, completing 8 circles.',
            'Reverse direction and make 8 backward circles. Maintain straight elbows throughout the exercise.'
          ]
        },
        {
          id: 'hamstring-stretch',
          title: 'Hamstring Stretch',
          description: 'Stretch the back of your thighs to improve flexibility and reduce tension',
          icon: 'child',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['stretch', 'legs'],
          steps: [
            'Stand upright and place your left foot forward with the heel on the ground and toes pointing up.',
            'Keep your left leg straight and slightly bend your right knee.',
            'Lean your upper body forward, bringing your chest toward your left knee while trying to touch your left toes with your left hand.',
            'Hold this position for a few seconds, then switch sides. Repeat twice for each side.'
          ]
        },
        {
          id: 'upper-back',
          title: 'Upper Back Strengthening',
          description: 'Strengthen the upper back muscles using a water bottle as a simple weight',
          icon: 'bottle-water',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['back', 'strength', 'posture'],
          steps: [
            'Stand with your feet hip-width apart and slightly bend your knees.',
            'Lean your upper body forward while keeping your back straight.',
            'Hold a water bottle or light weight and pass it around your back and in front of your head, keeping your elbows straight.',
            'Repeat this movement 4 times, then change direction.'
          ]
        },
        {
          id: 'chest-stretch',
          title: 'Chest Stretch',
          description: 'Open up the chest muscles to improve posture and reduce tension',
          icon: 'chair',
          duration: '1-2 min',
          difficulty: 'easy',
          tags: ['stretch', 'chest', 'posture'],
          steps: [
            'Find a chair with a high back and secure it so it will not slide.',
            'Stand about 1 meter behind the chair and place your wrists on the back of the chair.',
            'Lean forward with slightly bent knees and a straight back, feeling the stretch across your chest.',
            'Release briefly and repeat the stretch once more.'
          ]
        },
      ]
    },
    {
      title: 'Yoga Poses',
      icon: 'spa',
      description: 'Simple yoga poses to improve balance, strengthen muscles, and promote relaxation',
      exercises: [
        {
          id: 'yoga-mountain',
          title: 'Mountain Pose',
          description: 'A foundational standing pose that improves posture and body awareness',
          icon: 'mountain',
          duration: '1-2 min',
          difficulty: 'easy',
          tags: ['posture', 'balance', 'yoga'],
          steps: [
            'Stand with your feet together or hip-width apart, distributing weight evenly across both feet.',
            'Engage your thigh muscles and lift your kneecaps without locking your knees.',
            'Lengthen your spine and lift your chest, allowing your shoulders to relax down and back.',
            'Breathe deeply and hold the pose for 30-60 seconds, focusing on your alignment and breath.'
          ]
        },
        {
          id: 'yoga-tree',
          title: 'Tree Pose',
          description: 'A balancing pose that builds focus and stability',
          icon: 'tree',
          duration: '2-3 min',
          difficulty: 'medium',
          tags: ['balance', 'focus', 'yoga'],
          steps: [
            'Start in Mountain Pose, then shift your weight onto your left foot.',
            'Place the sole of your right foot on your inner left thigh or calf (avoid pressing on the knee).',
            'Bring your palms together at your heart center or extend your arms overhead like branches.',
            'Fix your gaze on a non-moving point and hold for 30 seconds. Repeat on the other side.'
          ]
        }
      ]
    },
    {
      title: 'Outdoor Activities',
      icon: 'cloud-sun',
      description: 'Movement activities in fresh air that can help reduce tinnitus awareness',
      exercises: [
        {
          id: 'walking',
          title: 'Mindful Walking',
          description: 'A simple walking practice with focus on each step and the environment',
          icon: 'person-walking',
          duration: '10-30 min',
          difficulty: 'easy',
          tags: ['outdoors', 'mindfulness', 'cardio'],
          steps: [
            'Find a quiet place to walk - a park, garden, or even a quiet street.',
            'Begin walking at a comfortable, moderate pace - not too slow or fast.',
            'Focus on the sensation of each step - your heel touching the ground, rolling to the ball of your foot, then pushing off with your toes.',
            'Notice the environment around you - sounds (besides your tinnitus), sights, smells, and how the air feels against your skin.'
          ]
        },
        {
          id: 'cycling',
          title: 'Leisurely Cycling',
          description: 'Gentle cycling to improve mood and provide distraction',
          icon: 'bicycle',
          duration: '15-45 min',
          difficulty: 'medium',
          tags: ['outdoors', 'cardio'],
          steps: [
            'Choose a safe, low-traffic route for your ride - perhaps a bike path or quiet neighborhood streets.',
            'Start with a comfortable pace that allows you to enjoy the surroundings without overexertion.',
            'Focus on the rhythm of pedaling and your steady breathing as you ride.',
            'Notice the changing scenery and the feeling of movement through space as a distraction from tinnitus.'
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
        <ThemedText style={styles.headerTitle} type="title">Movement</ThemedText>
        <ThemedText style={styles.subtitle}>Physical exercises that may help reduce tinnitus awareness</ThemedText>
        
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
  exerciseIllustration: {
    marginBottom: 30,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
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