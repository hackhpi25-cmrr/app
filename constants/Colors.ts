/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryPurple = '#8a4fff'; // Main purple for light mode
const lighterPurple = '#b088ff'; // Lighter purple for accents
const softPurple = '#f4f0ff';    // Very soft purple for backgrounds

export const Colors = {
  light: {
    text: '#424242',           // Softer than pure black
    background: '#ffffff',     // Pure white background
    tint: primaryPurple,       // Main purple for highlighting 
    icon: '#686d76',           // Darker gray for inactive icons
    tabIconDefault: '#8a8d94',  // Medium gray for tabs
    tabIconSelected: primaryPurple, // Purple for selected tabs
    cardBackground: softPurple, // Soft purple for card backgrounds
    border: '#e0e0e0',         // Light gray for borders
  },
  dark: {
    text: '#f0f0f0',           // Softer than pure white
    background: '#1e1e24',     // Dark purple-tinted background
    tint: lighterPurple,       // Lighter purple for dark mode
    icon: '#acaebf',           // Light purple-gray for better visibility
    tabIconDefault: '#acaebf',  // Light gray for tabs in dark mode
    tabIconSelected: lighterPurple, // Lighter purple for selected tabs in dark mode
    cardBackground: '#2a2a35',  // Darker purple for card backgrounds
    border: '#38383f',         // Dark gray for borders
  },
};
