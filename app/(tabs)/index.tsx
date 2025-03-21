import { StyleSheet } from 'react-native';
import React from 'react';
import { HomeLayout } from '@/components/layouts/HomeLayout';
import { Greeting } from '@/components/home/Greeting';
import { DailyCheckin } from '@/components/questionnaire/DailyCheckin';
import { SelectedAnswers } from '@/types/questionnaire';

export default function HomeScreen() {
  const handleSubmit = (answers: SelectedAnswers) => {
    console.log('Answers submitted:', answers);
    // Here you would typically send data to backend or process it
    alert('Thank you for your responses!');
  };
  
  return (
    <HomeLayout
      headerComponent={<Greeting />}
    >
      <DailyCheckin onSubmit={handleSubmit} />
    </HomeLayout>
  );
}
