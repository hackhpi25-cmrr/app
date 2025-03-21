import { useColorScheme as _useColorScheme } from 'react-native';

// Modified version of useColorScheme that always returns 'light'
export function useColorScheme(): 'light' | 'dark' {
  const colorScheme = _useColorScheme();
  
  // Always return 'light' to enforce light theme app-wide
  return 'light';
}
