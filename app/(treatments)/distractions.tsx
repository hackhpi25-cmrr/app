import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Platform, Dimensions, Modal, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Button } from '@/components/ui/Button';

// Define distraction activity types
type Activity = {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'challenging';
  duration: string;
  tags: string[];
};

// Define category type
type Category = {
  title: string;
  icon: string;
  description: string;
  activities: Activity[];
};

// Component for distraction activity card
const ActivityCard: React.FC<{
  activity: Activity;
  onPress: (id: string) => void;
}> = ({ activity, onPress }) => {
  const colorScheme = useColorScheme();
  
  // Determine tag colors
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'visual':
        return '#2A9D8F'; // Teal
      case 'auditory':
        return '#F4A261'; // Orange
      case 'mental':
        return '#E76F51'; // Coral
      case 'physical':
        return '#457B9D'; // Blue
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
      style={styles.activityCardWrapper}
      onPress={() => onPress(activity.id)}
      activeOpacity={0.9}
    >
      <ThemedView 
        style={styles.activityCard}
        lightColor="#ffffff"
      >
        <View style={styles.activityHeader}>
          <View style={[
            styles.activityIconContainer, 
            { backgroundColor: `${Colors[colorScheme].tint}15` }
          ]}>
            <FontAwesome6 
              name={activity.icon} 
              size={22} 
              color={Colors[colorScheme].tint}
            />
          </View>
          <View style={styles.activityMeta}>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: `${getDifficultyColor(activity.difficulty)}20`, 
                borderColor: getDifficultyColor(activity.difficulty) 
              }
            ]}>
              <ThemedText style={[
                styles.difficultyText, 
                { color: getDifficultyColor(activity.difficulty) }
              ]}>
                {activity.difficulty}
              </ThemedText>
            </View>
            <ThemedText style={styles.durationText}>{activity.duration}</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
        <ThemedText style={styles.activityDescription}>{activity.description}</ThemedText>
        
        <View style={styles.tagsContainer}>
          {activity.tags.map((tag, index) => (
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

// New component for the Rapid Tapper game
const RapidTapperGame: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset game when closed
  useEffect(() => {
    if (!visible) {
      setScore(0);
      setTimeLeft(30);
      setGameState('ready');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [visible]);

  // Handle countdown timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const handleStartGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
  };

  const handleTap = () => {
    if (gameState === 'playing') {
      setScore(prev => prev + 1);
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
        <ThemedView style={styles.gameModal} lightColor="#ffffff">
          <View style={styles.gameHeader}>
            <ThemedText style={styles.gameTitle}>Rapid Tapper</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableGameContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gameContent}>
              {gameState === 'ready' && (
                <>
                  <FontAwesome6 
                    name="hand-point-up" 
                    size={60} 
                    color={Colors[colorScheme].tint}
                    style={styles.gameIcon}
                  />
                  <ThemedText style={styles.gameInstructions}>
                    Tap the button as many times as you can in 30 seconds!
                  </ThemedText>
                  <Button
                    label="Start Game"
                    onPress={handleStartGame}
                    size="large"
                  />
                </>
              )}

              {gameState === 'playing' && (
                <>
                  <View style={styles.gameStats}>
                    <ThemedText style={styles.timeLeft}>{timeLeft}s</ThemedText>
                    <ThemedText style={styles.scoreLable}>Score: {score}</ThemedText>
                  </View>
                  
                  <Pressable
                    onPress={handleTap}
                    style={({pressed}) => [
                      styles.tapButton,
                      {
                        backgroundColor: pressed ? `${Colors[colorScheme].tint}80` : Colors[colorScheme].tint,
                        transform: [{scale: pressed ? 0.98 : 1}]
                      }
                    ]}
                  >
                    <ThemedText style={styles.tapButtonText}>TAP!</ThemedText>
                  </Pressable>
                </>
              )}

              {gameState === 'finished' && (
                <>
                  <FontAwesome6 
                    name="trophy" 
                    size={60} 
                    color="#fbbc04"
                    style={styles.gameIcon}
                  />
                  <ThemedText style={styles.gameFinishedText}>
                    Game Over!
                  </ThemedText>
                  <ThemedText style={styles.finalScore}>
                    Your Score: {score}
                  </ThemedText>
                  <ThemedText style={styles.tapRate}>
                    ({(score / 30).toFixed(2)} taps per second)
                  </ThemedText>
                  
                  <View style={styles.gameButtonsRow}>
                    <Button
                      label="Play Again"
                      onPress={handleStartGame}
                      size="medium"
                      style={{marginRight: 10, flex: 1}}
                    />
                    <Button
                      label="Close"
                      onPress={onClose}
                      size="medium"
                      variant="outline"
                      style={{flex: 1}}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

// New component for the Color Memory game
const ColorMemoryGame: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'finished'>('ready');
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  
  // Available colors for the game
  const colors = [
    {id: 'red', color: '#ea4335', lightColor: '#ffcdd2'},
    {id: 'blue', color: '#4285f4', lightColor: '#bbdefb'},
    {id: 'green', color: '#34a853', lightColor: '#c8e6c9'},
    {id: 'yellow', color: '#fbbc04', lightColor: '#fff9c4'}
  ];

  // Reset game when closed
  useEffect(() => {
    if (!visible) {
      resetGame();
    }
  }, [visible]);

  const resetGame = () => {
    setGameState('ready');
    setSequence([]);
    setUserSequence([]);
    setCurrentStep(0);
    setLevel(1);
    setShowingIndex(-1);
  };

  // Start new game
  const handleStartGame = () => {
    const initialSequence = generateSequence(3); // Start with 3 colors
    setSequence(initialSequence);
    setLevel(1);
    setGameState('showing');
    showSequence(initialSequence);
  };

  // Generate a random sequence of colors
  const generateSequence = (length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      newSequence.push(colors[randomIndex].id);
    }
    return newSequence;
  };

  // Show the sequence to the user
  const showSequence = (sequenceToShow: string[]) => {
    setShowingIndex(-1);
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      if (currentIndex < sequenceToShow.length) {
        setShowingIndex(currentIndex);
        
        // Hide after a brief display
        setTimeout(() => {
          setShowingIndex(-1);
        }, 500);
        
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setUserSequence([]);
        setCurrentStep(0);
        setGameState('input');
      }
    }, 800);
  };

  // Handle user color selection
  const handleColorPress = (colorId: string) => {
    if (gameState !== 'input') return;
    
    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);
    
    // Check if correct
    if (colorId !== sequence[currentStep]) {
      // Wrong selection
      setGameState('finished');
      return;
    }
    
    // Update step
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    
    // Check if sequence complete
    if (newStep === sequence.length) {
      // Level completed
      const newLevel = level + 1;
      setLevel(newLevel);
      
      // Generate a slightly longer sequence for next level
      const newSequence = [...sequence, ...generateSequence(1)];
      setSequence(newSequence);
      
      // Show new sequence after a short delay
      setTimeout(() => {
        setGameState('showing');
        showSequence(newSequence);
      }, 1000);
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
        <ThemedView style={styles.gameModal} lightColor="#ffffff">
          <View style={styles.gameHeader}>
            <ThemedText style={styles.gameTitle}>Color Memory</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollableGameContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gameContent}>
              {gameState === 'ready' && (
                <>
                  <FontAwesome6 
                    name="palette" 
                    size={60} 
                    color={Colors[colorScheme].tint}
                    style={styles.gameIcon}
                  />
                  <ThemedText style={styles.gameInstructions}>
                    Watch the sequence of colors, then repeat it in the same order. The sequence gets longer each round!
                  </ThemedText>
                  <Button
                    label="Start Game"
                    onPress={handleStartGame}
                    size="large"
                  />
                </>
              )}

              {(gameState === 'showing' || gameState === 'input') && (
                <>
                  <View style={styles.gameStats}>
                    <ThemedText style={styles.levelText}>Level: {level}</ThemedText>
                    {gameState === 'showing' && (
                      <ThemedText style={styles.watchText}>Watch carefully...</ThemedText>
                    )}
                    {gameState === 'input' && (
                      <ThemedText style={styles.watchText}>Your turn! ({currentStep}/{sequence.length})</ThemedText>
                    )}
                  </View>
                  
                  <View style={styles.colorGridContainer}>
                    <View style={styles.colorGrid}>
                      {colors.map((color, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.colorButton,
                            {
                              backgroundColor: showingIndex >= 0 && sequence[showingIndex] === color.id 
                                ? color.color 
                                : color.lightColor
                            },
                            gameState === 'showing' && { opacity: 0.8 }
                          ]}
                          disabled={gameState !== 'input'}
                          onPress={() => handleColorPress(color.id)}
                          activeOpacity={gameState === 'input' ? 0.6 : 1}
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {gameState === 'finished' && (
                <>
                  <FontAwesome6 
                    name="medal" 
                    size={60} 
                    color="#fbbc04"
                    style={styles.gameIcon}
                  />
                  <ThemedText style={styles.gameFinishedText}>
                    Game Over!
                  </ThemedText>
                  <ThemedText style={styles.finalScore}>
                    You reached Level {level}
                  </ThemedText>
                  <ThemedText style={styles.sequenceLength}>
                    (Sequence length: {sequence.length})
                  </ThemedText>
                  
                  <View style={styles.gameButtonsRow}>
                    <Button
                      label="Play Again"
                      onPress={handleStartGame}
                      size="medium"
                      style={{marginRight: 10, flex: 1}}
                    />
                    <Button
                      label="Close"
                      onPress={onClose}
                      size="medium"
                      variant="outline"
                      style={{flex: 1}}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

// Main component
export default function DistractionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [activeCategory, setActiveCategory] = useState<string>('quick');
  const [gameModalVisible, setGameModalVisible] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');

  // Define distraction categories
  const categories: Category[] = [
    {
      title: 'Quick Distractions',
      icon: 'bolt',
      description: 'Fast and simple activities to shift your focus away from tinnitus',
      activities: [
        {
          id: 'count-backwards',
          title: 'Count Backwards',
          description: 'Count backwards from 100 by 7s (100, 93, 86...)',
          icon: 'calculator',
          difficulty: 'medium',
          duration: '1-2 min',
          tags: ['mental']
        },
        {
          id: 'name-items',
          title: 'Name Items',
          description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste',
          icon: 'list-check',
          difficulty: 'easy',
          duration: '2-3 min',
          tags: ['mental', 'sensory']
        },
        {
          id: 'breathe-box',
          title: 'Box Breathing',
          description: 'Breathe in for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat.',
          icon: 'wind',
          difficulty: 'easy',
          duration: '1-5 min',
          tags: ['physical', 'relaxation']
        },
      ]
    },
    {
      title: 'Mini Games',
      icon: 'gamepad',
      description: 'Quick and simple games to play right in the app',
      activities: [
        {
          id: 'color-memory',
          title: 'Color Memory',
          description: 'Remember and repeat a sequence of colors that gets longer each round',
          icon: 'palette',
          difficulty: 'medium',
          duration: '2-5 min',
          tags: ['game', 'memory']
        },
        {
          id: 'tap-counter',
          title: 'Rapid Tapper',
          description: 'Tap as many times as you can in 30 seconds to beat your high score',
          icon: 'hand-point-up',
          difficulty: 'easy',
          duration: '30 sec',
          tags: ['game', 'reflex']
        }
      ]
    },
    {
      title: 'Visual Exercises',
      icon: 'eye',
      description: 'Activities that engage your visual attention',
      activities: [
        {
          id: 'scan-surroundings',
          title: 'Environmental Scan',
          description: 'Slowly scan your surroundings and notice details you normally miss',
          icon: 'magnifying-glass',
          difficulty: 'easy',
          duration: '3-5 min',
          tags: ['visual', 'mindfulness']
        },
        {
          id: 'focus-shift',
          title: 'Focus Shifting',
          description: 'Focus on a distant object for 30s, then shift to a close one. Repeat 5 times.',
          icon: 'arrow-right-arrow-left',
          difficulty: 'easy',
          duration: '3-4 min',
          tags: ['visual', 'physical']
        },
        {
          id: 'visual-detail',
          title: 'Detail Challenge',
          description: 'Choose an object and try to observe all its visual details and characteristics',
          icon: 'glasses',
          difficulty: 'medium',
          duration: '3-5 min',
          tags: ['visual', 'mental']
        },
      ]
    },
    {
      title: 'Mental Challenges',
      icon: 'brain',
      description: 'Brain-engaging activities that require focus and concentration',
      activities: [
        {
          id: 'alphabet-categories',
          title: 'Alphabet Categories',
          description: 'Pick a category (animals, countries, food) and name one for each letter of the alphabet',
          icon: 'font',
          difficulty: 'medium',
          duration: '5-10 min',
          tags: ['mental']
        },
        {
          id: 'math-problems',
          title: 'Mental Math',
          description: 'Solve increasingly difficult math problems in your head',
          icon: 'calculator',
          difficulty: 'challenging',
          duration: '3-5 min',
          tags: ['mental']
        },
        {
          id: 'word-association',
          title: 'Word Association',
          description: 'Start with a word and create a chain of associated words',
          icon: 'link',
          difficulty: 'easy',
          duration: '3-5 min',
          tags: ['mental', 'creative']
        },
      ]
    }
  ];

  // Get the active category's activities
  const activeActivities = categories.find(cat => cat.title.toLowerCase().includes(activeCategory))?.activities || [];

  // Handle activity selection
  const handleActivitySelect = (id: string) => {
    setSelectedActivityId(id);
    
    // Handle mini-games
    if (id === 'tap-counter' || id === 'color-memory') {
      setGameModalVisible(true);
      return;
    }
    
    // For other activities
    console.log(`Activity selected: ${id}`);
    // In the future, you could implement other games or:
    // router.push(`/(activities)/${id}`);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Game modals */}
      <RapidTapperGame 
        visible={gameModalVisible && selectedActivityId === 'tap-counter'} 
        onClose={() => setGameModalVisible(false)}
      />
      
      <ColorMemoryGame 
        visible={gameModalVisible && selectedActivityId === 'color-memory'} 
        onClose={() => setGameModalVisible(false)}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.headerTitle} type="title">Distractions</ThemedText>
        <ThemedText style={styles.subtitle}>Quick activities to help shift your focus away from tinnitus</ThemedText>
        
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
        
        {/* Activity cards */}
        <View style={styles.activitiesContainer}>
          {activeActivities.map((activity, index) => (
            <ActivityCard 
              key={index}
              activity={activity}
              onPress={handleActivitySelect}
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
  activitiesContainer: {
    marginBottom: 20,
  },
  activityCardWrapper: {
    marginBottom: 20,
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityMeta: {
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
  activityTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDescription: {
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
  gameModal: {
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
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  gameTitle: {
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
  scrollableGameContent: {
    flexGrow: 1,
  },
  gameContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  gameIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  gameInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  gameStats: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  timeLeft: {
    padding: 14,
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLable: {
    fontSize: 24,
    fontWeight: '600',
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tapButtonText: {
    padding: 16,
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
  },
  gameFinishedText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  finalScore: {
    padding: 14,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 5,
  },
  tapRate: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
  },
  gameButtonsRow: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  // Additional game styles for Color Memory
  colorGridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  colorGrid: {
    width: width * 0.7,
    height: width * 0.7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: '48%',
    height: '48%',
    margin: '1%',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
  },
  watchText: {
    fontSize: 16,
    opacity: 0.8,
  },
  sequenceLength: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
  },
}); 