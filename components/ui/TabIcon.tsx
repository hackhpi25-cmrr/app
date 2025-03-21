import React from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';

interface TabIconProps {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}

/**
 * A component for displaying FontAwesome6 icons in the tab bar.
 * Optimized for a modern, minimalist tab bar design.
 */
export function TabIcon({
  name,
  size = 22, // Slightly smaller size for a more modern look
  color,
  style,
}: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <FontAwesome6 
        name={name} 
        size={size} 
        color={color} 
        style={[style, styles.icon]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // The solid weight gives a more contemporary feel
    fontWeight: '600', // FontAwesome6 supports weights
  }
}); 