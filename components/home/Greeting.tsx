import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabIcon } from '@/components/ui/TabIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GreetingProps {
  username?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ username }) => {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      <TabIcon size={32} name="hand" color={Colors[colorScheme].tint} />
      <ThemedText style={styles.text} type="title">
        {username ? `Hello, ${username}!` : 'Hello!'}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  text: {
    fontSize: 34,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: -0.5,
  },
}); 