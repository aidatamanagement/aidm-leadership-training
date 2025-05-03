
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { Course, Lesson, ProviderProps } from './types/SharedTypes';
import * as courseService from './services/courseService';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'lessons'>) => Promise<Course | null>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => Promise<void>;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<ProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useAuth();

  // Implementation of course-related functions
  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.fetchCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const refreshCourses = async () => {
    await fetchCourses();
  };

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
  };

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
  };

  // Initialize courses when user changes
  React.useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  return (
    <CourseContext.Provider value={{
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      addLesson,
      updateLesson,
      deleteLesson,
      refreshCourses
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
