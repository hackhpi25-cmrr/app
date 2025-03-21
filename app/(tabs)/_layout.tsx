import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { CenteredHapticTab } from '@/components/CenteredHapticTab';
import { TabIcon } from '@/components/ui/TabIcon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#AAAAAA',
        headerShown: false,
        tabBarButton: CenteredHapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 0,
            height: 85,
            borderRadius: 24,
            margin: 14,
            marginBottom: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            bottom: 5,
          },
          default: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderTopWidth: 0,
            height: 65,
            borderRadius: 24,
            margin: 14,
            marginBottom: 15,
            elevation: 8,
            bottom: 5,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon size={22} name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <TabIcon size={22} name="newspaper" color={color} />,
        }}
      />
      <Tabs.Screen
        name="treatments"
        options={{
          title: 'Treatments',
          tabBarIcon: ({ color }) => <TabIcon size={22} name="kit-medical" color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => <TabIcon size={22} name="chart-simple" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon size={22} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
