import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

export function CenteredHapticTab(props: BottomTabBarButtonProps) {
  // Add animation for press effect
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  
  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const isActive = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      style={[
        // Apply the existing style
        props.style,
        // Add our centering styles
        styles.container,
        // Adjust for iOS home indicator area
        Platform.OS === 'ios' ? { paddingBottom: 10 } : {},
      ]}
      onPressIn={(ev) => {
        animateIn();
        
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        animateOut();
        props.onPressOut?.(ev);
      }}
    >
      <Animated.View 
        style={[
          styles.centered,
          isActive ? styles.activeTab : null,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Pass the original children through to render the icon */}
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center children vertically
    alignItems: 'center',
  },
  centered: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  activeTab: {
    backgroundColor: 'rgba(138, 79, 255, 0.08)', // Very subtle purple background
  },
}); 