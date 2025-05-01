
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { QuizSet, QuizQuestion, QuizSettings } from '../types/DataTypes';

// Fetch quiz sets with their questions
export const fetchQuizSets = async (): Promise<QuizSet[]> => {
  try {
    // Fetch quiz sets
    const { data: quizSetsData, error: quizSetsError } = await supabase
      .from('quiz_sets')
      .select('*');

    if (quizSetsError) throw quizSetsError;

    // Fetch quiz questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*');

    if (questionsError) throw questionsError;

    // Map questions to quiz sets
    const quizSetsWithQuestions = quizSetsData.map(quizSet => {
      const quizQuestions = questionsData
        .filter(question => question.quiz_set_id === quizSet.id)
        .map(question => ({
          id: question.id,
          question: question.question,
          // Convert options from JSON to string array
          options: Array.isArray(question.options) ? question.options : JSON.parse(question.options as string),
          correctAnswer: question.correct_answer
        }));

      return {
        id: quizSet.id,
        title: quizSet.title,
        questions: quizQuestions
      };
    });

    return quizSetsWithQuestions;
  } catch (error) {
    console.error('Error fetching quiz sets:', error);
    throw error;
  }
};

// Fetch quiz settings
export const fetchQuizSettings = async (): Promise<QuizSettings> => {
  try {
    const { data, error } = await supabase
      .from('quiz_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          passMarkPercentage: 70,
          enforcePassMark: true
        };
      }
      throw error;
    }

    if (data) {
      return {
        passMarkPercentage: data.pass_mark_percentage,
        enforcePassMark: data.enforce_pass_mark
      };
    }

    return {
      passMarkPercentage: 70,
      enforcePassMark: true
    };
  } catch (error) {
    console.error('Error fetching quiz settings:', error);
    return {
      passMarkPercentage: 70,
      enforcePassMark: true
    };
  }
};

// Add a new quiz set
export const addQuizSet = async (quizSet: Omit<QuizSet, 'id' | 'questions'>): Promise<QuizSet | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sets')
      .insert([
        {
          title: quizSet.title
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const newQuizSet: QuizSet = {
      id: data.id,
      title: data.title,
      questions: []
    };
    
    toast({
      title: 'Quiz Set Added',
      description: `${quizSet.title} has been created successfully.`
    });
    
    return newQuizSet;
  } catch (error: any) {
    console.error('Error adding quiz set:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to add quiz set',
      variant: 'destructive',
    });
    return null;
  }
};

// Update a quiz set
export const updateQuizSet = async (quizSetId: string, updates: Partial<QuizSet>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('quiz_sets')
      .update({
        title: updates.title
      })
      .eq('id', quizSetId);

    if (error) throw error;
    
    toast({
      title: 'Quiz Set Updated',
      description: 'Quiz set details have been updated successfully.'
    });
  } catch (error: any) {
    console.error('Error updating quiz set:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update quiz set',
      variant: 'destructive',
    });
    throw error;
  }
};

// Delete a quiz set
export const deleteQuizSet = async (quizSetId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('quiz_sets')
      .delete()
      .eq('id', quizSetId);

    if (error) throw error;

    // Update lessons in the database to remove references to this quiz set
    await supabase
      .from('lessons')
      .update({ quiz_set_id: null })
      .eq('quiz_set_id', quizSetId);
    
    toast({
      title: 'Quiz Set Deleted',
      description: 'The quiz set has been removed.'
    });
  } catch (error: any) {
    console.error('Error deleting quiz set:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to delete quiz set',
      variant: 'destructive',
    });
    throw error;
  }
};

// Add a question to a quiz set
export const addQuizQuestion = async (quizSetId: string, question: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([
        {
          quiz_set_id: quizSetId,
          question: question.question,
          options: JSON.stringify(question.options),
          correct_answer: question.correctAnswer
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const newQuestion: QuizQuestion = {
      id: data.id,
      question: data.question,
      options: question.options,
      correctAnswer: data.correct_answer
    };
    
    toast({
      title: 'Question Added',
      description: 'New question has been added to the quiz set.'
    });
    
    return newQuestion;
  } catch (error: any) {
    console.error('Error adding quiz question:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to add quiz question',
      variant: 'destructive',
    });
    throw error;
  }
};

// Update a quiz question
export const updateQuizQuestion = async (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>): Promise<void> => {
  try {
    const updateData: any = {};
    if (updates.question !== undefined) updateData.question = updates.question;
    if (updates.options !== undefined) updateData.options = JSON.stringify(updates.options);
    if (updates.correctAnswer !== undefined) updateData.correct_answer = updates.correctAnswer;

    const { error } = await supabase
      .from('quiz_questions')
      .update(updateData)
      .eq('id', questionId);

    if (error) throw error;
    
    toast({
      title: 'Question Updated',
      description: 'Quiz question has been updated successfully.'
    });
  } catch (error: any) {
    console.error('Error updating quiz question:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update quiz question',
      variant: 'destructive',
    });
    throw error;
  }
};

// Delete a quiz question
export const deleteQuizQuestion = async (quizSetId: string, questionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    
    toast({
      title: 'Question Deleted',
      description: 'The question has been removed from the quiz set.'
    });
  } catch (error: any) {
    console.error('Error deleting quiz question:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to delete quiz question',
      variant: 'destructive',
    });
    throw error;
  }
};

// Update quiz settings
export const updateQuizSettings = async (settings: Partial<QuizSettings>): Promise<QuizSettings> => {
  try {
    // Get existing quiz settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from('quiz_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let updateError;
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('quiz_settings')
        .update({
          pass_mark_percentage: settings.passMarkPercentage,
          enforce_pass_mark: settings.enforcePassMark
        })
        .eq('id', existingSettings.id);
      
      updateError = error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('quiz_settings')
        .insert([{
          pass_mark_percentage: settings.passMarkPercentage || 70,
          enforce_pass_mark: settings.enforcePassMark !== undefined ? settings.enforcePassMark : true
        }]);
      
      updateError = error;
    }

    if (updateError) throw updateError;
    
    toast({
      title: 'Quiz Settings Updated',
      description: 'Quiz settings have been updated successfully.'
    });
    
    return {
      passMarkPercentage: settings.passMarkPercentage || 70,
      enforcePassMark: settings.enforcePassMark !== undefined ? settings.enforcePassMark : true
    };
  } catch (error: any) {
    console.error('Error updating quiz settings:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update quiz settings',
      variant: 'destructive',
    });
    throw error;
  }
};
