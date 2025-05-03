
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { StudentProgress, Course, QuizSet, ProviderProps } from './types/SharedTypes';
import * as progressService from './services/progressService';
import * as progressHelpers from './services/progressHelpers';
import { useCourses } from './CourseContext';
import { useQuizzes } from './QuizContext';

interface ProgressContextType {
  progress: StudentProgress[];
  markLessonComplete: (userId: string, courseId: string, lessonId: string, quizScore?: number) => Promise<void>;
  updateTimeSpent: (userId: string, courseId: string, lessonId: string, seconds: number) => Promise<void>;
  updatePdfViewed: (userId: string, courseId: string, lessonId: string) => Promise<void>;
  getStudentProgress: (userId: string, courseId: string) => StudentProgress[];
  getCompletedLessonsCount: (userId: string, courseId: string) => number;
  isLessonAccessible: (userId: string, courseId: string, lessonOrder: number) => boolean;
  getTotalQuizScore: (userId: string, courseId: string) => { score: number; total: number };
  isCourseLockedForUser: (userId: string, courseId: string) => boolean;
  uploadPdf: (file: File, lessonId: string) => Promise<string>;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<ProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const { user } = useAuth();
  const { courses } = useCourses();
  const { quizSets } = useQuizzes();

  // Implementation of progress-related functions
  const fetchProgress = async () => {
    try {
      let progressData = await progressService.fetchProgress();
      
      // Add quiz set IDs from lessons
      progressData = progressData.map(p => {
        const course = courses.find(c => c.id === p.courseId);
        if (course) {
          const lesson = course.lessons.find(l => l.id === p.lessonId);
          if (lesson) {
            return { ...p, quizSetId: lesson.quizSetId };
          }
        }
        return p;
      });

      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const refreshProgress = async () => {
    await fetchProgress();
  };

  const markLessonComplete = async (userId: string, courseId: string, lessonId: string, quizScore?: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    await progressService.markLessonComplete(userId, courseId, lessonId, course.lessons, quizScore);
    
    // Update local state by refreshing progress data
    await fetchProgress();
  };

  const updateTimeSpent = async (userId: string, courseId: string, lessonId: string, seconds: number) => {
    await progressService.updateTimeSpent(userId, courseId, lessonId, seconds);
    
    setProgress(prev => {
      const existingIndex = prev.findIndex(
        p => p.userId === userId && p.courseId === courseId && p.lessonId === lessonId
      );

      if (existingIndex >= 0) {
        // Update existing progress
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timeSpent: updated[existingIndex].timeSpent + seconds
        };
        return updated;
      } else {
        // Add new progress
        return [...prev, {
          userId,
          courseId,
          lessonId,
          completed: false,
          timeSpent: seconds,
          pdfViewed: false,
          quizScore: null,
          quizAttempts: 0,
          quizSetId: null,
          locked: false
        }];
      }
    });
  };

  const updatePdfViewed = async (userId: string, courseId: string, lessonId: string) => {
    await progressService.updatePdfViewed(userId, courseId, lessonId);
    
    setProgress(prev => {
      const existingIndex = prev.findIndex(
        p => p.userId === userId && p.courseId === courseId && p.lessonId === lessonId
      );

      if (existingIndex >= 0) {
        // Update existing progress
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          pdfViewed: true
        };
        return updated;
      } else {
        // Add new progress
        return [...prev, {
          userId,
          courseId,
          lessonId,
          completed: false,
          timeSpent: 0,
          pdfViewed: true,
          quizScore: null,
          quizAttempts: 0,
          quizSetId: null,
          locked: false
        }];
      }
    });
  };

  // File upload function
  const uploadPdf = async (file: File, lessonId: string): Promise<string> => {
    return progressService.uploadPdf(file, lessonId);
  };

  // Helper functions
  const getStudentProgress = (userId: string, courseId: string) => {
    return progressHelpers.getStudentProgress(userId, courseId, progress);
  };

  const getCompletedLessonsCount = (userId: string, courseId: string) => {
    return progressHelpers.getCompletedLessonsCount(userId, courseId, progress);
  };

  const isLessonAccessible = (userId: string, courseId: string, lessonOrder: number) => {
    return progressHelpers.isLessonAccessible(userId, courseId, lessonOrder, courses, progress);
  };

  const getTotalQuizScore = (userId: string, courseId: string) => {
    return progressHelpers.getTotalQuizScore(userId, courseId, progress, courses, quizSets);
  };

  // Helper function to check if a course is locked for a user
  const isCourseLockedForUser = (userId: string, courseId: string) => {
    return progressService.isCourseLockedForUser(userId, courseId, progress);
  };

  // Initialize progress data when user changes
  React.useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  return (
    <ProgressContext.Provider value={{
      progress,
      markLessonComplete,
      updateTimeSpent,
      updatePdfViewed,
      getStudentProgress,
      getCompletedLessonsCount,
      isLessonAccessible,
      getTotalQuizScore,
      isCourseLockedForUser,
      uploadPdf,
      refreshProgress
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
