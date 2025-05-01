
import { Course, Lesson, QuizSet, StudentProgress } from '../types/DataTypes';

// Helper functions for accessing progress data
export const getStudentProgress = (userId: string, courseId: string, progress: StudentProgress[]): StudentProgress[] => {
  return progress.filter(p => p.userId === userId && p.courseId === courseId);
};

export const getCompletedLessonsCount = (userId: string, courseId: string, progress: StudentProgress[]): number => {
  return progress.filter(p => p.userId === userId && p.courseId === courseId && p.completed).length;
};

export const isLessonAccessible = (userId: string, courseId: string, lessonOrder: number, courses: Course[], progress: StudentProgress[]): boolean => {
  if (lessonOrder === 1) return true; // First lesson is always accessible
  
  const course = courses.find(c => c.id === courseId);
  if (!course) return false;
  
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
