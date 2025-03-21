import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { StyleProp, TextStyle } from 'react-native';

type FAIconProps = {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}

/**
 * A wrapper component for Font Awesome icons that allows using strings for icon names
 */
export function FAIcon({
  name,
  size = 24,
  color,
  style
}: FAIconProps) {
  return (
    <FontAwesomeIcon 
      icon={name as IconProp} 
      size={size} 
      color={color} 
      style={style} 
    />
  );
} 