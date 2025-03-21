import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Override the system color scheme to always use light mode
export function useColorScheme(): 'light' {
  // Ignore the device color scheme and always return 'light'
  return 'light';
}
