import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Platform, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Button } from '@/components/ui/Button';
import { useAudio } from '@/hooks/useAudio';
import { getSoundFile } from '@/services/soundFiles';
import { isAudioReady } from '@/services/AudioInit';

// Don't initialize audio here - it's already done in _layout.tsx

// Sound item type
type SoundItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  source: any;
  duration?: string;
};

// Sound category with items
type SoundCategory = {
  title: string;
  items: SoundItem[];
};

// Component for individual sound
const SoundCard: React.FC<{
  sound: SoundItem;
  onPress: (soundId: string) => void;
  isPlaying: boolean;
  audioAvailable: boolean;
  isLoaded: boolean;
}> = ({ sound, onPress, isPlaying, audioAvailable, isLoaded }) => {
  const colorScheme = useColorScheme();
  
  return (
    <ThemedView 
      style={[
        styles.soundCard,
        isPlaying ? styles.playingCard : {},
        !isLoaded ? styles.unavailableCard : {}
      ]}
      lightColor="#ffffff"
    >
      <View style={styles.soundCardContent}>
        <View style={[
          styles.soundIconContainer, 
          { backgroundColor: isPlaying 
            ? `${Colors[colorScheme].tint}30` 
            : `${Colors[colorScheme].tint}15` 
          },
          !isLoaded ? styles.unavailableIcon : {}
        ]}>
          <FontAwesome6 
            name={sound.icon} 
            size={22} 
            color={isLoaded ? Colors[colorScheme].tint : '#BBBBBB'} 
          />
        </View>
        <View style={styles.soundInfo}>
          <ThemedText style={[
            styles.soundTitle,
            isPlaying ? styles.playingText : {},
            !isLoaded ? styles.unavailableText : {}
          ]}>
            {sound.title}
          </ThemedText>
          <ThemedText style={[styles.soundDescription, !isLoaded ? styles.unavailableText : {}]}>
            {!isLoaded ? "Not available" : sound.description}
          </ThemedText>
          {sound.duration && isLoaded && (
            <ThemedText style={styles.duration}>{sound.duration}</ThemedText>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.playButton, 
          isPlaying ? styles.playingButton : {},
          (!audioAvailable || !isLoaded) ? styles.disabledButton : {}
        ]} 
        onPress={() => (audioAvailable && isLoaded) ? onPress(sound.id) : null}
        activeOpacity={(audioAvailable && isLoaded) ? 0.7 : 1}
        disabled={!audioAvailable || !isLoaded}
      >
        <FontAwesome6
          name={isPlaying ? "pause" : "play"}
          size={16}
          color={isPlaying ? "#ffffff" : (audioAvailable && isLoaded) ? Colors[colorScheme].tint : "#BBBBBB"}
        />
      </TouchableOpacity>
    </ThemedView>
  );
};

function SoundsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isAudioReady: hookAudioReady, loadSound, playSound, stopSound, isPlaying } = useAudio();
  const [loading, setLoading] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(isAudioReady());
  
  // Track successfully loaded sounds
  const [loadedSounds, setLoadedSounds] = useState<Set<string>>(new Set());
  
  // Sound categories with items and their file sources
  const [soundCategories] = useState<SoundCategory[]>([
    {
      title: "White Noise",
      items: [
        { 
          id: "wn1", 
          title: "Pure White Noise", 
          description: "Consistent frequency masking sound",
          icon: "wind",
          source: getSoundFile("wn1"),
          duration: "∞",
        },
        { 
          id: "wn2", 
          title: "Pink Noise", 
          description: "Softer high frequencies, more natural",
          icon: "cloud",
          source: getSoundFile("wn2"),
          duration: "∞",
        },
        { 
          id: "wn3", 
          title: "Brown Noise", 
          description: "Deep rumbling sound, like rain or waves",
          icon: "cloud-rain",
          source: getSoundFile("wn3"),
          duration: "∞",
        },
      ]
    },
    {
      title: "Nature Sounds",
      items: [
        { 
          id: "nt1", 
          title: "Ocean Waves", 
          description: "Gentle waves washing onto shore",
          icon: "water",
          source: getSoundFile("nt1"),
          duration: "30 min"
        },
        { 
          id: "nt2", 
          title: "Gentle Rain", 
          description: "Soft rainfall without thunder",
          icon: "droplet",
          source: getSoundFile("nt2"),
          duration: "45 min"
        },
      ]
    },
  ]);

  // Load all sounds when component mounts
  useEffect(() => {
    let mounted = true;
    
    async function loadSounds() {
      try {
        // First check if audio is available
        const audioReady = hookAudioReady || isAudioReady();
        
        if (mounted) {
          setAudioAvailable(audioReady);
          setLoading(false);
        }
        
        if (!audioReady) {
          console.log('Audio not available, skipping sound loading');
          return;
        }
        
        setLoading(true);
        
        // Track successfully loaded sounds
        const successfullyLoaded = new Set<string>();
        
        // Preload only sounds that exist
        for (const category of soundCategories) {
          for (const sound of category.items) {
            // Only load sound if source is not null (meaning it exists)
            if (sound.source) {
              try {
                const success = await loadSound(sound.id, sound.source);
                if (success) {
                  successfullyLoaded.add(sound.id);
                } else {
                  console.log(`Sound ${sound.id} failed to load properly`);
                }
              } catch (e) {
                console.log(`Exception loading sound ${sound.id}: ${e}`);
              }
            } else {
              // Skip sounds that don't exist (where source is null)
              console.log(`Skipping sound ${sound.id} as it doesn't exist`);
            }
          }
        }
        
        if (mounted) {
          setLoadedSounds(successfullyLoaded);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading sounds:', error);
        if (mounted) {
          setLoading(false);
          if (audioAvailable) {
            Alert.alert('Error', 'Could not load sounds. Please try again.');
          }
        }
      }
    }

    loadSounds();
    
    return () => {
      mounted = false;
    };
  }, [hookAudioReady, loadSound, soundCategories]);
  
  // Function to handle sound playback
  const handlePlaySound = async (id: string) => {
    if (loading || !audioAvailable) {
      console.log('Audio not available or still loading');
      return;
    }
    
    // Don't try to play sounds that weren't successfully loaded
    if (!loadedSounds.has(id)) {
      console.log(`Sound ${id} was not successfully loaded, skipping playback`);
      return;
    }
    
    try {
      // Find the sound item
      const allSounds = soundCategories.flatMap(category => category.items);
      const soundItem = allSounds.find(sound => sound.id === id);
      
      if (soundItem && soundItem.source) {
        // Check if we're toggling this sound
        const currentlyPlaying = isPlaying(id);
        
        if (currentlyPlaying) {
          console.log(`Stopping sound: ${id}`);
          await stopSound(id);
          return;
        }
        
        // Play the sound with infinite looping for sounds marked with "∞" duration
        const shouldLoop = soundItem.duration === "∞";
        console.log(`Attempting to play sound: ${id}, loop: ${shouldLoop}`);
        
        // Try to play up to 2 times in case of failure
        let success = await playSound(id, shouldLoop);
        
        if (!success) {
          console.log(`First attempt to play sound ${id} failed, trying again...`);
          // Short delay before retry
          await new Promise(resolve => setTimeout(resolve, 300));
          success = await playSound(id, shouldLoop);
          
          if (!success) {
            console.error(`Could not play sound ${id} after multiple attempts`);
            Alert.alert(
              'Playback Issue', 
              'Could not play the selected sound. Please try a different sound or restart the app.',
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        console.log(`Sound item not found or source missing for id: ${id}`);
      }
    } catch (error) {
      console.error(`Error playing sound ${id}:`, error);
      Alert.alert(
        'Playback Error', 
        'An error occurred while playing the sound. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Sounds',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: Colors[colorScheme].tint,
          headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
        }} 
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>
            Loading sound library...
          </ThemedText>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <FontAwesome6 
                name="volume-high" 
                size={50} 
                color={Colors[colorScheme].tint} 
              />
            </View>
            <ThemedText style={styles.headerTitle}>Sound Therapy</ThemedText>
            <ThemedText style={styles.headerDescription}>
              Sound therapy can help mask tinnitus and provide relief. Different types of sounds work for different people.
            </ThemedText>
            
            {!audioAvailable && (
              <View style={styles.audioUnavailableContainer}>
                <ThemedText style={styles.audioUnavailableText}>
                  Audio playback is not available on this device. 
                  Some features may be limited.
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <FontAwesome6 
              name="circle-info" 
              size={22} 
              color={Colors[colorScheme].tint} 
              style={styles.infoIcon}
            />
            <ThemedText style={styles.infoText}>
              Try different sounds at a volume just below your tinnitus level for the best masking effect.
            </ThemedText>
          </View>
          
          {soundCategories.map((category) => (
            <View key={category.title} style={styles.category}>
              <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
              {category.items.map((sound) => (
                <SoundCard 
                  key={sound.id}
                  sound={sound}
                  onPress={handlePlaySound}
                  isPlaying={audioAvailable && isPlaying(sound.id)}
                  audioAvailable={audioAvailable}
                  isLoaded={loadedSounds.has(sound.id)}
                />
              ))}
            </View>
          ))}
          
          <View style={styles.backButtonContainer}>
            <Button
              label="Back to Treatments"
              onPress={() => router.back()}
              variant="outline"
              size="medium"
            />
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

// Make sure to properly export the component as default
export default SoundsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `rgba(138, 79, 255, 0.1)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginHorizontal: 20,
  },
  audioUnavailableContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 166, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 166, 0, 0.3)',
  },
  audioUnavailableText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#D97706',
  },
  infoBox: {
    backgroundColor: '#f8f8fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  category: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  soundCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  soundCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  soundInfo: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  soundDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    opacity: 0.5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  backButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  playingCard: {
    borderColor: 'rgba(138, 79, 255, 0.2)',
    borderWidth: 1,
  },
  playingText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  playingButton: {
    backgroundColor: Colors.light.tint,
  },
  unavailableCard: {
    borderColor: 'rgba(180, 180, 180, 0.3)',
    borderWidth: 1,
    opacity: 0.8,
  },
  unavailableIcon: {
    backgroundColor: 'rgba(180, 180, 180, 0.2)',
  },
  unavailableText: {
    color: '#AAAAAA',
  },
}); 