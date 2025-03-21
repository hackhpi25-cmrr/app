import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { faHome, faNewspaper, faKitMedical, faChartLine, faGear } from '@fortawesome/free-solid-svg-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faHome} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faNewspaper} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="treatments"
        options={{
          title: 'Treatments',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faKitMedical} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faChartLine} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faGear} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
