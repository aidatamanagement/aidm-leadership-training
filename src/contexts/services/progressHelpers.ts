import { Course, Lesson, QuizSet, StudentProgress } from '../types/DataTypes';
import { supabase } from '@/integrations/supabase/client';

// Helper functions for accessing progress data
export const getStudentProgress = (userId: string, courseId: string, progress: StudentProgress[]): StudentProgress[] => {
  return progress.filter(p => p.userId === userId && p.courseId === courseId);
};

export const getCompletedLessonsCount = (userId: string, courseId: string, progress: StudentProgress[]): number => {
  return progress.filter(p => p.userId === userId && p.courseId === courseId && p.completed).length;
};

export const isLessonAccessible = async (userId: string, courseId: string, lessonOrder: number, courses: Course[], progress: StudentProgress[]): Promise<boolean> => {
  const course = courses.find(c => c.id === courseId);
  if (!course) return false;
  
  // Find the current lesson
  const currentLesson = course.lessons.find(l => l.order === lessonOrder);
  if (!currentLesson) return false;
  
  // Check if the lesson is locked
  const { data: lockData, error } = await supabase
    .from('user_lesson_locks')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('lesson_id', currentLesson.id)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error checking lesson lock:', error);
    return false;
  }
  
  // If there's a lock record, the lesson is locked
  if (lockData) {
    return false;
  }
  
  // If it's the first lesson, it's accessible
  if (lessonOrder === 1) return true;
  
  // Find the previous lesson
  const prevLesson = course.lessons.find(l => l.order === lessonOrder - 1);
  if (!prevLesson) return true; // If can't find previous lesson, allow access
  
  // Check if previous lesson is completed
  const prevLessonProgress = progress.find(
    p => p.userId === userId && p.courseId === courseId && p.lessonId === prevLesson.id
  );
  
  return prevLessonProgress?.completed || false;
};

export const getTotalQuizScore = (userId: string, courseId: string, progress: StudentProgress[], courses: Course[], quizSets: QuizSet[]): { score: number; total: number } => {
  const studentProgress = progress.filter(p => 
    p.userId === userId && p.courseId === courseId && p.quizScore !== null
  );
  
  const totalScore = studentProgress.reduce((sum, p) => sum + (p.quizScore || 0), 0);
  
  // Calculate total possible points
  let totalPossible = 0;
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.lessons.forEach(lesson => {
      if (lesson.quizSetId) {
        const quizSet = quizSets.find(qs => qs.id === lesson.quizSetId);
        if (quizSet) {
          totalPossible += quizSet.questions.length;
        }
      }
    });
  }
  
  return { score: totalScore, total: totalPossible };
};
