import React from 'react';
import { StyleSheet, TouchableOpacity, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  labelStyle,
}) => {
  const colorScheme = useColorScheme();
  
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyle.push({
        backgroundColor: Colors[colorScheme].tint,
      });
    } else if (variant === 'secondary') {
      baseStyle.push({
        backgroundColor: `${Colors[colorScheme].tint}20`,
        borderWidth: 0,
      });
    } else if (variant === 'outline') {
      baseStyle.push({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors[colorScheme].tint,
      });
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };
  
  const getLabelStyle = () => {
    const baseLabelStyle = [styles.label];
    
    if (variant === 'primary') {
      baseLabelStyle.push({ color: 'white' });
    } else if (variant === 'secondary' || variant === 'outline') {
      baseLabelStyle.push({ color: Colors[colorScheme].tint });
    }
    
    if (size === 'small') {
      baseLabelStyle.push({ fontSize: 14 });
    } else if (size === 'large') {
      baseLabelStyle.push({ fontSize: 18 });
    }
    
    if (labelStyle) {
      baseLabelStyle.push(labelStyle);
    }
    
    return baseLabelStyle;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedText style={getLabelStyle()}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 