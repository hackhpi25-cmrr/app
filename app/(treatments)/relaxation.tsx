import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Platform, Dimensions, Modal, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Button } from '@/components/ui/Button';

// Define relaxation technique types
type Technique = {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  tags: string[];
  details?: string[];
};

// Define category type
type Category = {
  title: string;
  icon: string;
  description: string;
  techniques: Technique[];
};

// Component for technique card
const TechniqueCard: React.FC<{
  technique: Technique;
  onPress: (id: string) => void;
}> = ({ technique, onPress }) => {
  const colorScheme = useColorScheme();
  
  // Determine tag colors
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'breathing':
        return '#2A9D8F'; // Teal
      case 'meditation':
        return '#F4A261'; // Orange
      case 'physical':
        return '#E76F51'; // Coral
      case 'mindfulness':
        return '#457B9D'; // Blue
      case 'guided':
        return '#8a4fff'; // Purple
      default:
        return Colors[colorScheme].tint;
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.techniqueCardWrapper}
      onPress={() => onPress(technique.id)}
      activeOpacity={0.9}
    >
      <ThemedView 
        style={styles.techniqueCard}
        lightColor="#ffffff"
      >
        <View style={styles.techniqueHeader}>
          <View style={[
            styles.techniqueIconContainer, 
            { backgroundColor: `${Colors[colorScheme].tint}15` }
          ]}>
            <FontAwesome6 
              name={technique.icon} 
              size={22} 
              color={Colors[colorScheme].tint}
            />
          </View>
          <ThemedText style={styles.durationText}>{technique.duration}</ThemedText>
        </View>
        
        <ThemedText style={styles.techniqueTitle}>{technique.title}</ThemedText>
        <ThemedText style={styles.techniqueDescription}>{technique.description}</ThemedText>
        
        <View style={styles.tagsContainer}>
          {technique.tags.map((tag, index) => (
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

// BreathingExercise component
const BreathingExercise: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: Technique;
}> = ({ visible, onClose, exercise }) => {
  const colorScheme = useColorScheme();
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;
  
  const steps = exercise.details || [
    'Breathe in slowly through your nose for 4 seconds',
    'Hold your breath for 4 seconds',
    'Exhale slowly through your mouth for 6 seconds',
    'Pause for 2 seconds'
  ];
  
  const durations = [4, 4, 6, 2]; // in seconds
  
  useEffect(() => {
    if (!visible) {
      resetExercise();
    }
  }, [visible]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      // Animate the circle
      Animated.timing(animation, {
        toValue: 1,
        duration: durations[step] * 1000,
        useNativeDriver: false
      }).start(({ finished }) => {
        if (finished) {
          // Move to next step when animation finishes
          setStep((prev) => (prev + 1) % steps.length);
          animation.setValue(0);
        }
      });
      
      // Timer for seconds
      interval = setInterval(() => {
        setTimerCount(prev => {
          if (prev < durations[step] - 1) {
            return prev + 1;
          } else {
            return 0;
          }
        });
      }, 1000);
    } else {
      // Stop animation if paused
      Animated.timing(animation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false
      }).stop();
    }
    
    return () => {
      clearInterval(interval);
      Animated.timing(animation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false
      }).stop();
    };
  }, [isActive, step]);
  
  const resetExercise = () => {
    setStep(0);
    setIsActive(false);
    setTimerCount(0);
    animation.setValue(0);
  };
  
  const toggleExercise = () => {
    setIsActive(!isActive);
  };
  
  // Calculate the animated properties
  const circleSize = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [100, step === 0 ? 180 : (step === 1 ? 180 : 100), step === 2 ? 100 : 180]
  });
  
  const circleColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors[colorScheme].tint + '50', Colors[colorScheme].tint]
  });
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.exerciseModal} lightColor="#ffffff">
          <View style={styles.exerciseHeader}>
            <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.exerciseContent}>
              {/* Breathing Animation */}
              <View style={styles.animationContainer}>
                <Animated.View 
                  style={[
                    styles.breathCircle,
                    {
                      width: circleSize,
                      height: circleSize,
                      backgroundColor: circleColor
                    }
                  ]}
                />
                <ThemedText style={styles.timerText}>
                  {isActive ? (durations[step] - timerCount) : durations[step]}
                </ThemedText>
              </View>
              
              {/* Current instruction */}
              <ThemedText style={styles.instructionText}>
                {steps[step]}
              </ThemedText>
              
              {/* Controls */}
              <View style={styles.controlsContainer}>
                <Button
                  label={isActive ? "Pause" : "Start"}
                  onPress={toggleExercise}
                  size="medium"
                  style={{marginRight: 10, flex: 1}}
                />
                <Button
                  label="Reset"
                  onPress={resetExercise}
                  size="medium"
                  variant="outline"
                  style={{flex: 1}}
                  disabled={!isActive}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

// PMR Exercise component
const PMRExercise: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: Technique;
}> = ({ visible, onClose, exercise }) => {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);
  const pmrSteps = [
    { body: "Hands & Arms", instruction: "Tense your hands by making a fist, hold for 5-7 seconds, then release and feel the tension flow out." },
    { body: "Biceps & Triceps", instruction: "Flex your biceps, hold for 5-7 seconds, then release and notice the difference." },
    { body: "Shoulders", instruction: "Raise your shoulders to your ears, hold, then release, feeling the tension drop away." },
    { body: "Neck", instruction: "Gently tilt your head back, feeling the stretch, hold, then slowly relax." },
    { body: "Face", instruction: "Scrunch your facial muscles, hold tight, then release, letting your face feel smooth and relaxed." },
    { body: "Chest", instruction: "Take a deep breath, hold it while tensing your chest, then exhale slowly as you relax." },
    { body: "Stomach & Abdomen", instruction: "Tighten your stomach muscles, hold, then release, feeling your abdomen soften." },
    { body: "Back", instruction: "Gently arch your back, hold the position, then release, letting your spine relax." },
    { body: "Hips & Buttocks", instruction: "Squeeze your buttock muscles, hold, then release, feeling the tension dissolve." },
    { body: "Legs", instruction: "Extend your legs, tense the muscles, hold, then release, letting your legs feel heavy and relaxed." },
    { body: "Feet & Toes", instruction: "Curl your toes downward, hold the tension, then release, feeling relaxation spread through your feet." },
    { body: "Whole Body", instruction: "Focus on your entire body now feeling completely relaxed. Take a few deep breaths and enjoy this peaceful state." }
  ];

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const nextStep = () => {
    if (currentStep < pmrSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.exerciseModal} lightColor="#ffffff">
          <View style={styles.exerciseHeader}>
            <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.exerciseContent}>
              <View style={styles.pmrProgress}>
                <ThemedText style={styles.pmrProgressText}>
                  Step {currentStep + 1} of {pmrSteps.length}
                </ThemedText>
                <View style={styles.pmrProgressBar}>
                  <View 
                    style={[
                      styles.pmrProgressFill,
                      { 
                        width: `${((currentStep + 1) / pmrSteps.length) * 100}%`,
                        backgroundColor: Colors[colorScheme].tint
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.pmrBodyPart}>
                <FontAwesome6 
                  name="person" 
                  size={60} 
                  color={Colors[colorScheme].tint}
                  style={{opacity: 0.7, marginBottom: 20}}
                />
                <ThemedText style={styles.pmrBodyPartText}>
                  {pmrSteps[currentStep].body}
                </ThemedText>
              </View>

              <ThemedText style={styles.pmrInstructionText}>
                {pmrSteps[currentStep].instruction}
              </ThemedText>

              <View style={styles.pmrControls}>
                <Button
                  label="Previous"
                  onPress={prevStep}
                  size="medium"
                  variant="outline"
                  style={{flex: 1, marginRight: 10}}
                  disabled={currentStep === 0}
                />
                {currentStep < pmrSteps.length - 1 ? (
                  <Button
                    label="Next"
                    onPress={nextStep}
                    size="medium"
                    style={{flex: 1}}
                  />
                ) : (
                  <Button
                    label="Finish"
                    onPress={onClose}
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
  );
};

// Guided Visualization component
const GuidedVisualization: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: Technique;
}> = ({ visible, onClose, exercise }) => {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);
  
  const visualizationSteps = [
    "Find a comfortable position and close your eyes. Take three deep breaths, in through your nose and out through your mouth.",
    "Imagine yourself in a peaceful place - perhaps a beach, forest, or mountain retreat. Visualize the details of this place.",
    "Feel the sensations around you - the warmth of the sun, a gentle breeze, or the softness beneath you.",
    "Listen to the sounds in your peaceful place - maybe waves, rustling leaves, or birds singing.",
    "Focus on any pleasant scents in your visualization - like sea air, pine, or flowers.",
    "Allow yourself to feel completely safe and at peace in this place. Let go of any tension or worry.",
    "When you're ready, gradually bring your awareness back to the room. Wiggle your fingers and toes, and slowly open your eyes."
  ];
  
  const stepDuration = 30; // seconds per step
  const [timer, setTimer] = useState(stepDuration);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (!visible) {
      resetExercise();
    }
  }, [visible]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Move to next step when timer reaches 0
            if (currentStep < visualizationSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return stepDuration;
            } else {
              setIsActive(false);
              return 0;
            }
          }
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isActive, currentStep]);
  
  const resetExercise = () => {
    setCurrentStep(0);
    setTimer(stepDuration);
    setIsActive(false);
  };
  
  const toggleExercise = () => {
    setIsActive(!isActive);
  };
  
  const manualNextStep = () => {
    if (currentStep < visualizationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimer(stepDuration);
    } else {
      setIsActive(false);
    }
  };
  
  const manualPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimer(stepDuration);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.exerciseModal} lightColor="#ffffff">
          <View style={styles.exerciseHeader}>
            <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.exerciseContent}>
              <View style={styles.visualizationTimer}>
                <View style={styles.timerCircle}>
                  <ThemedText style={styles.timerNumber}>{timer}</ThemedText>
                  <ThemedText style={styles.timerLabel}>seconds</ThemedText>
                </View>
              </View>
              
              <View style={styles.visualizationProgress}>
                <ThemedText style={styles.visualizationProgressText}>
                  Step {currentStep + 1} of {visualizationSteps.length}
                </ThemedText>
              </View>
              
              <ThemedText style={styles.visualizationInstructionText}>
                {visualizationSteps[currentStep]}
              </ThemedText>
              
              <View style={styles.controlsContainer}>
                <Button
                  label={isActive ? "Pause" : "Start"}
                  onPress={toggleExercise}
                  size="medium"
                  style={{flex: 2, marginRight: 10}}
                />
                <Button
                  label="Reset"
                  onPress={resetExercise}
                  size="medium"
                  variant="outline"
                  style={{flex: 1}}
                />
              </View>
              
              <View style={styles.navigationControls}>
                <Button
                  label="Previous"
                  onPress={manualPrevStep}
                  size="small"
                  variant="outline"
                  style={{flex: 1, marginRight: 10}}
                  disabled={currentStep === 0}
                />
                <Button
                  label="Next"
                  onPress={manualNextStep}
                  size="small"
                  variant="outline"
                  style={{flex: 1}}
                  disabled={currentStep === visualizationSteps.length - 1}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

// Main component
export default function RelaxationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [activeCategory, setActiveCategory] = useState<string>('breathing');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  // Define relaxation categories
  const categories: Category[] = [
    {
      title: 'Breathing Exercises',
      icon: 'wind',
      description: 'Breathing techniques to promote relaxation and reduce stress',
      techniques: [
        {
          id: 'box-breathing',
          title: 'Box Breathing',
          description: 'A simple technique to reduce stress and improve focus with a 4-4-4-4 pattern',
          icon: 'square',
          duration: '3-5 min',
          tags: ['breathing', 'stress-relief']
        },
        {
          id: '4-7-8-breathing',
          title: '4-7-8 Breathing',
          description: 'Breathe in for 4, hold for 7, exhale for 8. Helps with sleep and anxiety',
          icon: 'wind',
          duration: '3-5 min',
          tags: ['breathing', 'anxiety-relief']
        },
        {
          id: 'diaphragmatic',
          title: 'Diaphragmatic Breathing',
          description: 'Deep belly breathing to engage the diaphragm and activate the relaxation response',
          icon: 'lungs',
          duration: '5-10 min',
          tags: ['breathing', 'physical']
        },
      ]
    },
    {
      title: 'Progressive Relaxation',
      icon: 'person',
      description: 'Techniques to progressively relax different muscle groups to release tension',
      techniques: [
        {
          id: 'body-scan',
          title: 'Body Scan',
          description: 'Move your awareness through your body, noticing sensations without judgment',
          icon: 'person-rays',
          duration: '10-15 min',
          tags: ['physical', 'mindfulness']
        },
        {
          id: 'pmr',
          title: 'Progressive Muscle Relaxation',
          description: 'Tense and release muscle groups to promote physical relaxation',
          icon: 'dumbbell',
          duration: '10-15 min',
          tags: ['physical', 'stress-relief']
        },
        {
          id: 'passive-relaxation',
          title: 'Passive Relaxation',
          description: 'Focus on relaxing muscles without tensing them first',
          icon: 'bed',
          duration: '7-10 min',
          tags: ['physical', 'mindfulness']
        },
      ]
    },
    {
      title: 'Mindfulness & Meditation',
      icon: 'brain',
      description: 'Practices to cultivate present-moment awareness and calm the mind',
      techniques: [
        {
          id: 'body-grounding',
          title: '5-4-3-2-1 Grounding Exercise',
          description: 'Use your senses to ground yourself in the present moment',
          icon: 'hand',
          duration: '3-5 min',
          tags: ['mindfulness', 'anxiety-relief']
        },
        {
          id: 'visualization',
          title: 'Peaceful Place Visualization',
          description: 'Imagine yourself in a calm, peaceful location using all your senses',
          icon: 'mountain-sun',
          duration: '10 min',
          tags: ['meditation', 'guided']
        },
        {
          id: 'loving-kindness',
          title: 'Loving-Kindness Meditation',
          description: 'Generate feelings of goodwill toward yourself and others',
          icon: 'heart',
          duration: '10 min',
          tags: ['meditation', 'emotional']
        },
      ]
    }
  ];

  // Get the active category's techniques
  const activeTechniques = categories.find(cat => cat.title.toLowerCase().includes(activeCategory))?.techniques || [];

  // Handle technique selection
  const handleTechniqueSelect = (id: string) => {
    setSelectedTechniqueId(id);
    
    // Find the selected technique
    const allTechniques = categories.flatMap(cat => cat.techniques);
    const technique = allTechniques.find(tech => tech.id === id);
    
    if (technique) {
      setSelectedTechnique(technique);
      setModalVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Exercise modals */}
      {selectedTechnique && (
        <>
          <BreathingExercise 
            visible={modalVisible && 
              (selectedTechniqueId === 'box-breathing' || 
               selectedTechniqueId === '4-7-8-breathing' || 
               selectedTechniqueId === 'diaphragmatic')} 
            onClose={() => setModalVisible(false)}
            exercise={selectedTechnique}
          />
          
          <PMRExercise 
            visible={modalVisible && 
              (selectedTechniqueId === 'pmr' || 
               selectedTechniqueId === 'body-scan' ||
               selectedTechniqueId === 'passive-relaxation')} 
            onClose={() => setModalVisible(false)}
            exercise={selectedTechnique}
          />
          
          <GuidedVisualization 
            visible={modalVisible && 
              (selectedTechniqueId === 'visualization' || 
               selectedTechniqueId === 'loving-kindness' ||
               selectedTechniqueId === 'body-grounding')} 
            onClose={() => setModalVisible(false)}
            exercise={selectedTechnique}
          />
        </>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.headerTitle} type="title">Relaxation</ThemedText>
        <ThemedText style={styles.subtitle}>Techniques to help you relax and shift focus away from tinnitus</ThemedText>
        
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
              <FontAwesome6 
                name={category.icon} 
                size={16} 
                color={activeCategory === category.title.toLowerCase().split(' ')[0] 
                  ? Colors[colorScheme].tint 
                  : '#777'} 
              />
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
        
        {/* Technique cards */}
        <View style={styles.techniquesContainer}>
          {activeTechniques.map((technique, index) => (
            <TechniqueCard 
              key={index}
              technique={technique}
              onPress={handleTechniqueSelect}
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
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  activeTab: {
    backgroundColor: `${Colors.light.tint}15`, 
  },
  categoryTitle: {
    fontSize: 14,
    marginLeft: 6,
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
  techniquesContainer: {
    marginBottom: 20,
  },
  techniqueCardWrapper: {
    marginBottom: 20,
  },
  techniqueCard: {
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
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  techniqueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    opacity: 0.6,
  },
  techniqueTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  techniqueDescription: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 16,
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  exerciseTitle: {
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
  animationContainer: {
    height: 200,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  breathCircle: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    position: 'absolute',
    padding: 16,
    fontSize: 40,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  controlsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  // PMR Exercise specific styles
  pmrProgress: {
    width: '100%',
    marginBottom: 30,
  },
  pmrProgressText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  pmrProgressBar: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pmrProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pmrBodyPart: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pmrBodyPartText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  pmrInstructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  pmrControls: {
    flexDirection: 'row',
    width: '100%',
  },
  // Visualization specific styles
  visualizationTimer: {
    marginBottom: 20,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerNumber: {
    padding: 12,
    fontSize: 36,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  visualizationProgress: {
    marginBottom: 20,
  },
  visualizationProgressText: {
    fontSize: 16,
    opacity: 0.7,
  },
  visualizationInstructionText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  navigationControls: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
  },
}); 