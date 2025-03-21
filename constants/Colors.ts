/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#8a4fff'; // Purple
const tintColorDark = '#8a4fff'; // Same purple for consistency

export const Colors = {
  light: {
    text: '#4a4a4a',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#7d6b9e',
    tabIconDefault: '#9e9e9e',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#4a4a4a',
    background: '#f5f5f7', // Light grey background for "dark" mode
    tint: tintColorDark,
    icon: '#7d6b9e',
    tabIconDefault: '#9e9e9e',
    tabIconSelected: tintColorDark,
  },
};
