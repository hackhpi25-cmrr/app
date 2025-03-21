// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'newspaper.fill': 'article',
  'bandage.fill': 'healing',
  'chart.bar.fill': 'bar_chart',
  'gearshape.fill': 'settings',
  'analytics': 'analytics',
} as const;

// Correctly map to valid MaterialIcons names
const MATERIAL_ICON_MAPPING: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'home': 'home',
  'send': 'send',
  'code': 'code',
  'chevron-right': 'chevron-right',
  'article': 'article',
  'healing': 'healing',
  'bar_chart': 'bar-chart', // Corrected from 'bar_chart' to 'bar-chart'
  'settings': 'settings',
  'analytics': 'analytics',
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MATERIAL_ICON_MAPPING[MAPPING[name]];
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
