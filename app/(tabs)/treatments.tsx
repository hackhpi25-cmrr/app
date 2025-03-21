import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';

type TreatmentCardProps = {
  title: string;
  icon: string;
  onPress: () => void;
};

const TreatmentCard: React.FC<TreatmentCardProps> = ({ title, icon, onPress }) => {
  const colorScheme = useColorScheme();
  
  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <ThemedView 
        style={styles.card}
        lightColor="#ffffff"
      >
        <View style={[styles.iconContainer, { backgroundColor: `${Colors[colorScheme].tint}15` }]}>
          <FontAwesome6 
            name={icon} 
            size={24} 
            color={Colors[colorScheme].tint} 
            style={styles.icon} 
          />
        </View>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function TreatmentsScreen() {
  const router = useRouter();
  
  const treatmentCategories = [
    { 
      title: 'Sounds', 
      icon: 'volume-high', 
      onPress: () => router.push("/(treatments)/sounds")
    },
    { title: 'Distractions', icon: 'arrows-to-dot', onPress: () => console.log('Distractions pressed') },
    { title: 'Relaxation', icon: 'spa', onPress: () => console.log('Relaxation pressed') },
    { title: 'Movement', icon: 'person-walking', onPress: () => console.log('Movement pressed') },
    { title: 'Ear & Jaw Care', icon: 'ear-listen', onPress: () => console.log('Ear & Jaw Care pressed') },
    { title: 'Cognitive Techniques', icon: 'brain', onPress: () => console.log('Cognitive Techniques pressed') },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.headerTitle} type="title">Treatments</ThemedText>
        <ThemedText style={styles.subtitle}>Explore techniques that may help manage your tinnitus</ThemedText>
        
        <View style={styles.cardsGrid}>
          {treatmentCategories.map((category, index) => (
            <TreatmentCard 
              key={index}
              title={category.title}
              icon={category.icon}
              onPress={category.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
    height: 180,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    opacity: 0.9,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 24,
  },
}); 