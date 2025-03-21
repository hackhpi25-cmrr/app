import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HelloWorldScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/adaptive-icon.png')}
        style={styles.logo}
      />
      <ThemedText type="title" style={styles.title}>
        Hello World!
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Your app is working correctly!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 