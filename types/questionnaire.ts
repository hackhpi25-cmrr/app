// Types for the questionnaire functionality

export type QuestionId = 'stress' | 'loudness' | 'location' | 'sleep';

export interface Question {
  id: QuestionId;
  question: string;
  options: string[];
}

export interface SelectedAnswers {
  [key: string]: number;
} 