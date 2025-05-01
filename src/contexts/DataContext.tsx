import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  Course,
  Student,
  QuizSet,
  StudentProgress,
  QuizSettings,
  Lesson,
  QuizQuestion,
  DataContextType
} from './types/DataTypes';

// Import all services
import * as courseService from './services/courseService';
import * as studentService from './services/studentService';
import * as quizService from './services/quizService';
import * as progressService from './services/progressService';
import * as progressHelpers from './services/progressHelpers';

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for our data
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({ passMarkPercentage: 70, enforcePassMark: true });
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCourses(),
        fetchStudents(), 
        fetchQuizSets(),
        fetchProgress(),
        fetchQuizSettings()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Implementation of data fetching functions using services
  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.fetchCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsData = await studentService.fetchStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchQuizSets = async () => {
    try {
      const quizSetsData = await quizService.fetchQuizSets();
      setQuizSets(quizSetsData);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    }
  };

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

  const fetchQuizSettings = async () => {
    try {
      const settings = await quizService.fetchQuizSettings();
      setQuizSettings(settings);
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await fetchAllData();
  };

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Course functions
  const addCourse = async (course: Omit<Course, 'id' | 'lessons'>) => {
    const newCourse = await courseService.addCourse(course);
    if (newCourse) {
      setCourses(prev => [...prev, newCourse]);
    }
    return newCourse;
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    await courseService.updateCourse(courseId, updates);
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, ...updates } : course
    ));
  };

  const deleteCourse = async (courseId: string) => {
    await courseService.deleteCourse(courseId);
    setCourses(prev => prev.filter(course => course.id !== courseId));
    setProgress(prev => prev.filter(p => p.courseId !== courseId));
    setStudents(prev => prev.map(student => ({
      ...student,
      assignedCourses: student.assignedCourses.filter(id => id !== courseId)
    })));
  };

  // Lesson functions
  const addLesson = async (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const newLesson = await courseService.addLesson(courseId, lesson, course.lessons);
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          lessons: [...course.lessons, newLesson]
        };
      }
      return course;
    }));
  };

  const updateLesson = async (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    await courseService.updateLesson(courseId, lessonId, updates);
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === lessonId 
              ? { 
                  ...lesson, 
                  title: updates.title ?? lesson.title,
                  description: updates.description ?? lesson.description,
                  pdfUrl: updates.pdfUrl ?? lesson.pdfUrl,
                  instructorNotes: updates.instructorNotes ?? lesson.instructorNotes,
                  quizSetId: updates.quizSetId ?? lesson.quizSetId,
                  order: updates.order ?? lesson.order
                } 
              : lesson
          )
        };
      }
      return course;
    }));
  };

  const deleteLesson = async (courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    await courseService.deleteLesson(courseId, lessonId, course.lessons);
    
    // Update courses state with reordered lessons
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const filteredLessons = course.lessons.filter(lesson => lesson.id !== lessonId);
        const reorderedLessons = [...filteredLessons]
          .sort((a, b) => a.order - b.order)
          .map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
        
        return { ...course, lessons: reorderedLessons };
      }
      return course;
    }));
    
    // Clean up progress data for this lesson
    setProgress(prev => prev.filter(p => !(p.courseId === courseId && p.lessonId === lessonId)));
  };

  // Student functions
  const addStudent = async (student: Omit<Student, 'id' | 'assignedCourses' | 'role'>, password: string, role: string = 'student') => {
    await studentService.addStudent(student, password, role);
    await fetchStudents(); // Refetch the student list to get the new student with ID
  };

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    await studentService.updateStudent(studentId, updates);
    setStudents(prev => prev.map(student =>
      student.id === studentId ? { ...student, ...updates } : student
    ));
  };

  const deleteStudent = async (studentId: string) => {
    await studentService.deleteStudent(studentId);
    setStudents(prev => prev.filter(student => student.id !== studentId));
    setProgress(prev => prev.filter(p => p.userId !== studentId));
  };

  const assignCourse = async (studentId: string, courseId: string) => {
    await studentService.assignCourse(studentId, courseId);
    
    // Update local state
    setStudents(prev => prev.map(student => {
      if (student.id === studentId && !student.assignedCourses.includes(courseId)) {
        return {
          ...student,
          assignedCourses: [...student.assignedCourses, courseId]
        };
      }
      return student;
    }));
    
    // Refresh progress data
    await fetchProgress();
  };

  const removeCourseAssignment = async (studentId: string, courseId: string) => {
    await studentService.removeCourseAssignment(studentId, courseId);
    
    // Update local state
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          assignedCourses: student.assignedCourses.filter(id => id !== courseId)
        };
      }
      return student;
    }));
    
    // Clean up progress for this student-course combination
    setProgress(prev => prev.filter(p => !(p.userId === studentId && p.courseId === courseId)));
  };

  // Quiz functions
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
    
    // Update courses to remove references to this quiz set
    setCourses(prev => prev.map(course => ({
      ...course,
      lessons: course.lessons.map(lesson => {
        if (lesson.quizSetId === quizSetId) {
          return { ...lesson, quizSetId: null };
        }
        return lesson;
      })
    })));
    
    // Update progress to remove references to this quiz set
    setProgress(prev => prev.map(p => {
      if (p.quizSetId === quizSetId) {
        return { ...p, quizSetId: null, quizScore: null };
      }
      return p;
    }));
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

  // Progress tracking functions
  const toggleCourseLock = async (studentId: string, courseId: string) => {
    const newLockedStatus = await studentService.toggleCourseLock(studentId, courseId);
    
    // Update local state
    setProgress(prev => prev.map(p => {
      if (p.userId === studentId && p.courseId === courseId) {
        return { ...p, locked: newLockedStatus };
      }
      return p;
    }));
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

  // Helper functions using the progressHelpers
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
    if (!userId || !courseId) return false;
    
    // Find all progress entries for this user and course
    const userCourseAssignments = progress.filter(
      p => p.userId === userId && p.courseId === courseId
    );
    
    // First check from assignments if course is locked
    const assignmentMatch = progress.find(
      p => p.userId === userId && p.courseId === courseId && p.locked === true
    );
    
    if (assignmentMatch) {
      return true;
    }
    
    // If no specific lock found, check if the course is assigned to the user at all
    const student = students.find(s => s.id === userId);
    if (!student || !student.assignedCourses.includes(courseId)) {
      // No assignment means no access
      return false;
    }
    
    return false;
  };

  return (
    <DataContext.Provider value={{
      courses,
      students,
      quizSets,
      progress,
      quizSettings,
      addCourse,
      updateCourse,
      deleteCourse,
      addLesson,
      updateLesson,
      deleteLesson,
      addStudent,
      updateStudent,
      deleteStudent,
      assignCourse,
      removeCourseAssignment,
      addQuizSet,
      updateQuizSet,
      deleteQuizSet,
      addQuizQuestion,
      updateQuizQuestion,
      deleteQuizQuestion,
      updateQuizSettings,
      toggleCourseLock,
      markLessonComplete,
      updateTimeSpent,
      updatePdfViewed,
      getStudentProgress,
      getCompletedLessonsCount,
      isLessonAccessible,
      getTotalQuizScore,
      isLoading,
      refreshData,
      uploadPdf,
      isCourseLockedForUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export * from './types/DataTypes';
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
