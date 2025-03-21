import React, { ReactNode } from 'react';
import { StyleSheet, ScrollView, Platform, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

interface HomeLayoutProps {
  children: ReactNode;
  headerComponent?: ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({ 
  children, 
  headerComponent 
}) => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {headerComponent && (
          <View style={styles.header}>
            {headerComponent}
          </View>
        )}
        {children}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
  },
  header: {
    marginBottom: 16,
  }
}); 