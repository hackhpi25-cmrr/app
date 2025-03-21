import React from 'react';
import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface RadioOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  style?: StyleProp<ViewStyle>;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  selected,
  onSelect,
  style,
}) => {
  const colorScheme = useColorScheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? [
          styles.selected, 
          { 
            borderColor: Colors[colorScheme].tint, 
            backgroundColor: `${Colors[colorScheme].tint}10` 
          }
        ] : {},
        style
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[
          styles.radioCircle,
          selected ? 
            { borderColor: Colors[colorScheme].tint } : 
            { borderColor: '#d4d4d8' }
        ]}>
          {selected && (
            <View style={[
              styles.radioFill,
              { backgroundColor: Colors[colorScheme].tint }
            ]} />
          )}
        </View>
        <ThemedText 
          style={[
            styles.text,
            selected ? 
              [styles.selectedText, { color: Colors[colorScheme].text }] : 
              {}
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 12,
  },
  selected: {
    // Colors set dynamically
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: '500',
  },
}); 