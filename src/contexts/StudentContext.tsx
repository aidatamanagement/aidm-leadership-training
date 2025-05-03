import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { Student, ProviderProps, StudentContextWithBooleanReturn } from './types/SharedTypes';
import * as studentService from './services/studentService';

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'assignedCourses' | 'role'>, password: string, role?: string) => Promise<void>;
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  assignCourse: (studentId: string, courseId: string) => Promise<void>;
  removeCourseAssignment: (studentId: string, courseId: string) => Promise<void>;
  toggleCourseLock: (studentId: string, courseId: string) => Promise<boolean>;
  isLessonLocked: (studentId: string, courseId: string, lessonId: string) => Promise<boolean>;
  toggleLessonLock: (studentId: string, courseId: string, lessonId: string) => Promise<boolean>;
  fetchLessonLocks: (studentId: string, courseId: string) => Promise<Record<string, boolean>>;
  refreshStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<ProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonLocks, setLessonLocks] = useState<Record<string, Record<string, boolean>>>({});
  const { user } = useAuth();

  // Implementation of student-related functions
  const fetchStudents = async () => {
    try {
      const studentsData = await studentService.fetchStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const refreshStudents = async () => {
    await fetchStudents();
  };

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
  };

  const toggleCourseLock = async (studentId: string, courseId: string): Promise<boolean> => {
    const newLockedStatus = await studentService.toggleCourseLock(studentId, courseId);
    return newLockedStatus;
  };

  // Functions for lesson-level locking
  const isLessonLocked = async (studentId: string, courseId: string, lessonId: string): Promise<boolean> => {
    // Check in local state first
    if (lessonLocks[studentId]?.[lessonId] !== undefined) {
      return lessonLocks[studentId][lessonId];
    }

    // Otherwise fetch from database
    const isLocked = await studentService.isLessonLocked(studentId, courseId, lessonId);
    
    // Update local state
    setLessonLocks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [lessonId]: isLocked
      }
    }));
    
    return isLocked;
  };

  const toggleLessonLock = async (studentId: string, courseId: string, lessonId: string): Promise<boolean> => {
    const newLockStatus = await studentService.toggleLessonLock(studentId, courseId, lessonId);
    
    // Update local state
    setLessonLocks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [lessonId]: newLockStatus
      }
    }));
    
    return newLockStatus;
  };

  const fetchLessonLocks = async (studentId: string, courseId: string) => {
    const locks = await studentService.getLessonLocks(studentId, courseId);
    
    // Update local state
    setLessonLocks(prev => ({
      ...prev,
      [studentId]: locks
    }));
    
    return locks;
  };

  // Initialize students when user changes
  React.useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  return (
    <StudentContext.Provider value={{
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      assignCourse,
      removeCourseAssignment,
      toggleCourseLock,
      isLessonLocked,
      toggleLessonLock,
      fetchLessonLocks,
      refreshStudents
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
