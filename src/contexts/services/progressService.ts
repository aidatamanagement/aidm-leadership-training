
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { StudentProgress, Lesson } from '../types/DataTypes';

// Fetch user progress
export const fetchProgress = async (): Promise<StudentProgress[]> => {
  try {
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*');

    if (progressError) throw progressError;

    // Fetch course assignments to get locked status
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('user_course_assignments')
      .select('*');

    if (assignmentsError) throw assignmentsError;

    // Map progress data to our format
    const formattedProgress = progressData.map(p => {
      const assignment = assignmentsData.find(
        a => a.user_id === p.user_id && a.course_id === p.course_id
      );

      return {
        userId: p.user_id,
        courseId: p.course_id,
        lessonId: p.lesson_id,
        completed: p.completed,
        timeSpent: p.time_spent,
        pdfViewed: p.pdf_viewed,
        quizScore: p.quiz_score,
        quizAttempts: p.quiz_attempts,
        quizSetId: null, // We'll set this from the lessons
        locked: assignment ? assignment.locked : false
      };
    });

    return formattedProgress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

// Mark a lesson as complete
export const markLessonComplete = async (
  userId: string, 
  courseId: string, 
  lessonId: string, 
  lessons: Lesson[],
  quizScore?: number
): Promise<void> => {
  try {
    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          completed: true,
          quiz_score: quizScore !== undefined ? quizScore : existingProgress.quiz_score
        })
        .eq('id', existingProgress.id);

      if (error) throw error;
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          time_spent: 0,
          pdf_viewed: true,
          quiz_score: quizScore,
          quiz_attempts: quizScore !== undefined ? 1 : 0
        }]);

      if (error) throw error;
    }

    // Check if there's a next lesson to unlock
    const currentLesson = lessons.find(l => l.id === lessonId);
    if (currentLesson) {
      const nextLesson = lessons.find(l => l.order === currentLesson.order + 1);
      if (nextLesson) {
        // Check if a progress entry already exists for the next lesson
        const { data: nextLessonProgress, error: nextCheckError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('lesson_id', nextLesson.id)
          .maybeSingle();

        if (nextCheckError && nextCheckError.code !== 'PGRST116') throw nextCheckError;

        if (!nextLessonProgress) {
          // Create a new progress entry for the next lesson
          const { error } = await supabase
            .from('user_progress')
            .insert([{
              user_id: userId,
              course_id: courseId,
              lesson_id: nextLesson.id,
              completed: false,
              time_spent: 0,
              pdf_viewed: false,
              quiz_score: null,
              quiz_attempts: 0
            }]);

          if (error) throw error;
        }
      }
    }
    
    toast({
      title: 'Lesson Completed',
      description: 'Your progress has been saved.'
    });
  } catch (error: any) {
    console.error('Error marking lesson complete:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update lesson progress',
      variant: 'destructive',
    });
    throw error;
  }
};

// Update time spent on a lesson
export const updateTimeSpent = async (userId: string, courseId: string, lessonId: string, seconds: number): Promise<void> => {
  try {
    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          time_spent: existingProgress.time_spent + seconds
        })
        .eq('id', existingProgress.id);

      if (error) throw error;
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: false,
          time_spent: seconds,
          pdf_viewed: false,
          quiz_score: null,
          quiz_attempts: 0
        }]);

      if (error) throw error;
    }
  } catch (error: any) {
    console.error('Error updating time spent:', error);
    // Don't show toast for this one as it might be distracting
  }
};

// Update PDF viewed status
export const updatePdfViewed = async (userId: string, courseId: string, lessonId: string): Promise<void> => {
  try {
    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          pdf_viewed: true
        })
        .eq('id', existingProgress.id);

      if (error) throw error;
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: false,
          time_spent: 0,
          pdf_viewed: true,
          quiz_score: null,
          quiz_attempts: 0
        }]);

      if (error) throw error;
    }
  } catch (error: any) {
    console.error('Error updating PDF viewed status:', error);
    // Don't show toast for this one as it might be distracting
  }
};

// Helper function to check if a course is locked for a user
export const isCourseLockedForUser = (userId: string, courseId: string, progress: StudentProgress[]): boolean => {
  // Find if there's a lock status for this user-course combination
  const userProgress = progress.find(
    p => p.userId === userId && p.courseId === courseId
  );
  
  // If progress exists and it's locked, return true
  return userProgress ? userProgress.locked : false;
};

// Helper function for file uploads
export const uploadPdf = async (file: File, lessonId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lessonId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading PDF:', error);
    toast({
      title: 'Upload Failed',
      description: error.message || 'Failed to upload PDF',
      variant: 'destructive',
    });
    return null;
  }
};
