
import React, { createContext, useContext, useState } from 'react';
import { CourseProvider, useCourses } from './CourseContext';
import { StudentProvider, useStudents } from './StudentContext';
import { QuizProvider, useQuizzes } from './QuizContext';
import { ProgressProvider, useProgress } from './ProgressContext';
import { DataContextType, ProviderProps } from './types/SharedTypes';

// Create the main data context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Main DataProvider component that composes all the specific providers
export const DataProvider: React.FC<ProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh all data
  const refreshData = async () => {
    // The actual implementation will be handled by the composed DataProvider below
    console.log("Refresh data called in outer provider");
  };

  return (
    <CourseProvider>
      <StudentProvider>
        <QuizProvider>
          <ProgressProvider>
            <ComposedDataProvider isLoading={isLoading} setIsLoading={setIsLoading}>
              {children}
            </ComposedDataProvider>
          </ProgressProvider>
        </QuizProvider>
      </StudentProvider>
    </CourseProvider>
  );
};

// Internal component that composes all the hooks and provides the unified DataContext
interface ComposedDataProviderProps extends ProviderProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ComposedDataProvider: React.FC<ComposedDataProviderProps> = ({ 
  children, 
  isLoading,
  setIsLoading
}) => {
  const courseContext = useCourses();
  const studentContext = useStudents();
  const quizContext = useQuizzes();
  const progressContext = useProgress();

  // Combined refresh function that calls all individual refresh functions
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        courseContext.refreshCourses(),
        studentContext.refreshStudents(),
        quizContext.refreshQuizzes(),
        progressContext.refreshProgress()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set loading state to false once initial data is loaded
  React.useEffect(() => {
    const checkDataLoaded = () => {
      if (
        courseContext.courses.length > 0 ||
        studentContext.students.length > 0 ||
        quizContext.quizSets.length > 0
      ) {
        setIsLoading(false);
      }
    };
    
    checkDataLoaded();
    
    // Create a timeout to ensure loading state is eventually turned off
    // even if there's no data
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [
    courseContext.courses, 
    studentContext.students, 
    quizContext.quizSets,
    setIsLoading
  ]);

  // Combine all context values into a single object
  const contextValue: DataContextType = {
    // Course methods
    courses: courseContext.courses,
    addCourse: courseContext.addCourse,
    updateCourse: courseContext.updateCourse,
    deleteCourse: courseContext.deleteCourse,
    addLesson: courseContext.addLesson,
    updateLesson: courseContext.updateLesson,
    deleteLesson: courseContext.deleteLesson,

    // Student methods
    students: studentContext.students,
    addStudent: studentContext.addStudent,
    updateStudent: studentContext.updateStudent,
    deleteStudent: studentContext.deleteStudent,
    assignCourse: studentContext.assignCourse,
    removeCourseAssignment: studentContext.removeCourseAssignment,

    // Quiz methods
    quizSets: quizContext.quizSets,
    quizSettings: quizContext.quizSettings,
    addQuizSet: quizContext.addQuizSet,
    updateQuizSet: quizContext.updateQuizSet,
    deleteQuizSet: quizContext.deleteQuizSet,
    addQuizQuestion: quizContext.addQuizQuestion,
    updateQuizQuestion: quizContext.updateQuizQuestion,
    deleteQuizQuestion: quizContext.deleteQuizQuestion,
    updateQuizSettings: quizContext.updateQuizSettings,

    // Progress methods
    progress: progressContext.progress,
    markLessonComplete: progressContext.markLessonComplete,
    updateTimeSpent: progressContext.updateTimeSpent,
    updatePdfViewed: progressContext.updatePdfViewed,
    getStudentProgress: progressContext.getStudentProgress,
    getCompletedLessonsCount: progressContext.getCompletedLessonsCount,
    isLessonAccessible: progressContext.isLessonAccessible,
    getTotalQuizScore: progressContext.getTotalQuizScore,
    uploadPdf: progressContext.uploadPdf,
    
    // Lock functionality
    toggleCourseLock: studentContext.toggleCourseLock,
    isCourseLockedForUser: progressContext.isCourseLockedForUser,
    isLessonLocked: studentContext.isLessonLocked,
    toggleLessonLock: studentContext.toggleLessonLock,
    fetchLessonLocks: studentContext.fetchLessonLocks,
    
    // App state
    isLoading,
    refreshData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Export the useData hook
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Re-export types for compatibility
export * from './types/SharedTypes';
