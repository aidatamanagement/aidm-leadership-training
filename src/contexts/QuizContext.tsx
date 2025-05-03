
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { QuizSet, QuizQuestion, QuizSettings, ProviderProps } from './types/SharedTypes';
import * as quizService from './services/quizService';

interface QuizContextType {
  quizSets: QuizSet[];
  quizSettings: QuizSettings;
  addQuizSet: (quizSet: Omit<QuizSet, 'id' | 'questions'>) => Promise<QuizSet | null>;
  updateQuizSet: (quizSetId: string, updates: Partial<QuizSet>) => Promise<void>;
  deleteQuizSet: (quizSetId: string) => Promise<void>;
  addQuizQuestion: (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => Promise<void>;
  updateQuizQuestion: (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => Promise<void>;
  deleteQuizQuestion: (quizSetId: string, questionId: string) => Promise<void>;
  updateQuizSettings: (settings: Partial<QuizSettings>) => Promise<void>;
  refreshQuizzes: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<ProviderProps> = ({ children }) => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({ passMarkPercentage: 70, enforcePassMark: true });
  const { user } = useAuth();

  // Implementation of quiz-related functions
  const fetchQuizSets = async () => {
    try {
      const quizSetsData = await quizService.fetchQuizSets();
      setQuizSets(quizSetsData);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    }
  };

  const fetchQuizSettings = async () => {
    try {
      const settings = await quizService.fetchQuizSettings();
      setQuizSettings(settings);
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
    }
  };

  const refreshQuizzes = async () => {
    await Promise.all([fetchQuizSets(), fetchQuizSettings()]);
  };

  const addQuizSet = async (quizSet: Omit<QuizSet, 'id' | 'questions'>) => {
    const newQuizSet = await quizService.addQuizSet(quizSet);
    if (newQuizSet) {
      setQuizSets(prev => [...prev, newQuizSet]);
    }
    return newQuizSet;
  };

  const updateQuizSet = async (quizSetId: string, updates: Partial<QuizSet>) => {
    await quizService.updateQuizSet(quizSetId, updates);
    setQuizSets(prev => prev.map(quizSet =>
      quizSet.id === quizSetId ? { ...quizSet, ...updates } : quizSet
    ));
  };

  const deleteQuizSet = async (quizSetId: string) => {
    await quizService.deleteQuizSet(quizSetId);
    setQuizSets(prev => prev.filter(quizSet => quizSet.id !== quizSetId));
  };

  const addQuizQuestion = async (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => {
    const newQuestion = await quizService.addQuizQuestion(quizSetId, question);
    
    setQuizSets(prev => prev.map(quizSet => {
      if (quizSet.id === quizSetId) {
        return {
          ...quizSet,
          questions: [...quizSet.questions, newQuestion]
        };
      }
      return quizSet;
    }));
  };

  const updateQuizQuestion = async (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    await quizService.updateQuizQuestion(quizSetId, questionId, updates);
    
    setQuizSets(prev => prev.map(quizSet => {
      if (quizSet.id === quizSetId) {
        return {
          ...quizSet,
          questions: quizSet.questions.map(question =>
            question.id === questionId ? { ...question, ...updates } : question
          )
        };
      }
      return quizSet;
    }));
  };

  const deleteQuizQuestion = async (quizSetId: string, questionId: string) => {
    await quizService.deleteQuizQuestion(quizSetId, questionId);
    
    setQuizSets(prev => prev.map(quizSet => {
      if (quizSet.id === quizSetId) {
        return {
          ...quizSet,
          questions: quizSet.questions.filter(question => question.id !== questionId)
        };
      }
      return quizSet;
    }));
  };

  const updateQuizSettings = async (settings: Partial<QuizSettings>) => {
    const updatedSettings = await quizService.updateQuizSettings(settings);
    setQuizSettings(prev => ({ ...prev, ...updatedSettings }));
  };

  // Initialize quiz data when user changes
  React.useEffect(() => {
    if (user) {
      refreshQuizzes();
    }
  }, [user]);

  return (
    <QuizContext.Provider value={{
      quizSets,
      quizSettings,
      addQuizSet,
      updateQuizSet,
      deleteQuizSet,
      addQuizQuestion,
      updateQuizQuestion,
      deleteQuizQuestion,
      updateQuizSettings,
      refreshQuizzes
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizzes = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizzes must be used within a QuizProvider');
  }
  return context;
};
