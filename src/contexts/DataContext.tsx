
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

// Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSet {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  instructorNotes: string;
  quizSetId: string | null;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  timeSpent: number; // in seconds
  pdfViewed: boolean;
  quizScore: number | null;
  quizAttempts: number;
  quizSetId: string | null;
  locked: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password: string;
  assignedCourses: string[];
}

interface QuizSettings {
  passMarkPercentage: number;
  enforcePassMark: boolean;
}

interface DataContextType {
  courses: Course[];
  students: Student[];
  quizSets: QuizSet[];
  progress: StudentProgress[];
  quizSettings: QuizSettings;
  addCourse: (course: Omit<Course, 'id' | 'lessons'>) => Course;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => void;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  assignCourse: (studentId: string, courseId: string) => void;
  removeCourseAssignment: (studentId: string, courseId: string) => void;
  addQuizSet: (quizSet: Omit<QuizSet, 'id' | 'questions'>) => QuizSet;
  updateQuizSet: (quizSetId: string, updates: Partial<QuizSet>) => void;
  deleteQuizSet: (quizSetId: string) => void;
  addQuizQuestion: (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => void;
  updateQuizQuestion: (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuizQuestion: (quizSetId: string, questionId: string) => void;
  updateQuizSettings: (settings: Partial<QuizSettings>) => void;
  toggleCourseLock: (studentId: string, courseId: string) => void;
  markLessonComplete: (userId: string, courseId: string, lessonId: string, quizScore?: number) => void;
  updateTimeSpent: (userId: string, courseId: string, lessonId: string, seconds: number) => void;
  updatePdfViewed: (userId: string, courseId: string, lessonId: string) => void;
  getStudentProgress: (userId: string, courseId: string) => StudentProgress[];
  getCompletedLessonsCount: (userId: string, courseId: string) => number;
  isLessonAccessible: (userId: string, courseId: string, lessonOrder: number) => boolean;
  getTotalQuizScore: (userId: string, courseId: string) => { score: number; total: number };
}

// Generate some mock data
const generateMockData = () => {
  const quizSets: QuizSet[] = [
    {
      id: 'quiz1',
      title: 'Leadership Basics Quiz',
      questions: [
        {
          id: 'q1',
          question: 'What is the primary role of a leader?',
          options: [
            'To give orders',
            'To inspire and guide the team',
            'To do all the work',
            'To assign blame'
          ],
          correctAnswer: 1
        },
        {
          id: 'q2',
          question: 'Which leadership style involves making decisions collaboratively?',
          options: [
            'Autocratic',
            'Democratic',
            'Laissez-faire',
            'Transactional'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'quiz2',
      title: 'Communication Skills Quiz',
      questions: [
        {
          id: 'q1',
          question: 'Active listening involves:',
          options: [
            'Interrupting frequently',
            'Thinking about what to say next',
            'Providing verbal and nonverbal feedback',
            'Speaking loudly'
          ],
          correctAnswer: 2
        },
        {
          id: 'q2',
          question: 'Which communication channel is best for complex discussions?',
          options: [
            'Email',
            'Text message',
            'Face-to-face meeting',
            'Social media'
          ],
          correctAnswer: 2
        }
      ]
    }
  ];

  const courses: Course[] = [
    {
      id: 'course1',
      title: 'Foundations of Leadership',
      description: 'Learn the core principles of effective leadership in modern organizations.',
      lessons: [
        {
          id: 'lesson1',
          title: 'Introduction to Leadership',
          description: 'Understand what leadership means in today\'s world',
          pdfUrl: '/slides/intro-leadership.pdf',
          instructorNotes: '<p>This lesson covers the fundamental concepts of leadership. Pay special attention to the difference between leadership and management.</p>',
          quizSetId: 'quiz1',
          order: 1
        },
        {
          id: 'lesson2',
          title: 'Leadership Styles',
          description: 'Explore different leadership approaches and when to use them',
          pdfUrl: '/slides/leadership-styles.pdf',
          instructorNotes: '<p>In this lesson, we\'ll analyze various leadership styles and their effectiveness in different situations.</p>',
          quizSetId: null,
          order: 2
        }
      ]
    },
    {
      id: 'course2',
      title: 'Effective Communication',
      description: 'Master the art of clear and impactful communication',
      lessons: [
        {
          id: 'lesson1',
          title: 'Communication Fundamentals',
          description: 'Learn the basics of effective communication',
          pdfUrl: '/slides/comm-fundamentals.pdf',
          instructorNotes: '<p>This lesson introduces the communication model and common barriers to effective communication.</p>',
          quizSetId: 'quiz2',
          order: 1
        },
        {
          id: 'lesson2',
          title: 'Active Listening',
          description: 'Develop your active listening skills',
          pdfUrl: '/slides/active-listening.pdf',
          instructorNotes: '<p>Active listening is perhaps the most important communication skill. This lesson provides practical exercises to improve your listening abilities.</p>',
          quizSetId: null,
          order: 2
        }
      ]
    }
  ];

  const students: Student[] = [
    {
      id: '2',
      name: 'John Student',
      email: 'student@example.com',
      password: 'student123',
      assignedCourses: ['course1', 'course2']
    }
  ];

  const progress: StudentProgress[] = [
    {
      userId: '2',
      courseId: 'course1',
      lessonId: 'lesson1',
      completed: true,
      timeSpent: 450, // 7.5 minutes
      pdfViewed: true,
      quizScore: 1,
      quizAttempts: 1,
      quizSetId: 'quiz1',
      locked: false
    },
    {
      userId: '2',
      courseId: 'course1',
      lessonId: 'lesson2',
      completed: false,
      timeSpent: 0,
      pdfViewed: false,
      quizScore: null,
      quizAttempts: 0,
      quizSetId: null,
      locked: false
    },
    {
      userId: '2',
      courseId: 'course2',
      lessonId: 'lesson1',
      completed: false,
      timeSpent: 120, // 2 minutes
      pdfViewed: true,
      quizScore: null,
      quizAttempts: 0,
      quizSetId: 'quiz2',
      locked: false
    }
  ];

  return { quizSets, courses, students, progress };
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with mock data or load from localStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : generateMockData().courses;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : generateMockData().students;
  });

  const [quizSets, setQuizSets] = useState<QuizSet[]>(() => {
    const saved = localStorage.getItem('quizSets');
    return saved ? JSON.parse(saved) : generateMockData().quizSets;
  });

  const [progress, setProgress] = useState<StudentProgress[]>(() => {
    const saved = localStorage.getItem('progress');
    return saved ? JSON.parse(saved) : generateMockData().progress;
  });

  const [quizSettings, setQuizSettings] = useState<QuizSettings>(() => {
    const saved = localStorage.getItem('quizSettings');
    return saved ? JSON.parse(saved) : { passMarkPercentage: 70, enforcePassMark: true };
  });

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('quizSets', JSON.stringify(quizSets));
  }, [quizSets]);

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('quizSettings', JSON.stringify(quizSettings));
  }, [quizSettings]);

  // Helper function to generate a random ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Course functions
  const addCourse = (course: Omit<Course, 'id' | 'lessons'>) => {
    const newCourse: Course = {
      ...course,
      id: generateId(),
      lessons: []
    };
    setCourses(prev => [...prev, newCourse]);
    toast({
      title: 'Course Added',
      description: `${course.title} has been added successfully.`
    });
    return newCourse;
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, ...updates } : course
    ));
    toast({
      title: 'Course Updated',
      description: 'Course details have been updated successfully.'
    });
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    
    // Clean up related data
    setProgress(prev => prev.filter(p => p.courseId !== courseId));
    setStudents(prev => prev.map(student => ({
      ...student,
      assignedCourses: student.assignedCourses.filter(id => id !== courseId)
    })));
    
    toast({
      title: 'Course Deleted',
      description: 'The course and all associated data have been removed.'
    });
  };

  // Lesson functions
  const addLesson = (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const newOrder = course.lessons.length + 1;
        const newLesson: Lesson = {
          ...lesson,
          id: generateId(),
          order: newOrder
        };
        return {
          ...course,
          lessons: [...course.lessons, newLesson]
        };
      }
      return course;
    }));
    toast({
      title: 'Lesson Added',
      description: `${lesson.title} has been added to the course.`
    });
  };

  const updateLesson = (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          )
        };
      }
      return course;
    }));
    toast({
      title: 'Lesson Updated',
      description: 'Lesson content has been updated successfully.'
    });
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const filteredLessons = course.lessons.filter(lesson => lesson.id !== lessonId);
        // Re-order remaining lessons
        const reorderedLessons = filteredLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1
        }));
        return { ...course, lessons: reorderedLessons };
      }
      return course;
    }));
    
    // Clean up progress data for this lesson
    setProgress(prev => prev.filter(p => !(p.courseId === courseId && p.lessonId === lessonId)));
    
    toast({
      title: 'Lesson Deleted',
      description: 'The lesson has been removed from the course.'
    });
  };

  // Student functions
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: generateId()
    };
    setStudents(prev => [...prev, newStudent]);
    toast({
      title: 'Student Added',
      description: `${student.name} has been added successfully.`
    });
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student =>
      student.id === studentId ? { ...student, ...updates } : student
    ));
    toast({
      title: 'Student Updated',
      description: 'Student details have been updated successfully.'
    });
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
    
    // Clean up progress data for this student
    setProgress(prev => prev.filter(p => p.userId !== studentId));
    
    toast({
      title: 'Student Deleted',
      description: 'The student and all associated data have been removed.'
    });
  };

  const assignCourse = (studentId: string, courseId: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        if (student.assignedCourses.includes(courseId)) {
          return student; // Course already assigned
        }
        return {
          ...student,
          assignedCourses: [...student.assignedCourses, courseId]
        };
      }
      return student;
    }));
    
    // Initialize progress for the first lesson of the course
    const course = courses.find(c => c.id === courseId);
    if (course && course.lessons.length > 0) {
      const firstLesson = course.lessons.find(l => l.order === 1);
      if (firstLesson) {
        const newProgress: StudentProgress = {
          userId: studentId,
          courseId,
          lessonId: firstLesson.id,
          completed: false,
          timeSpent: 0,
          pdfViewed: false,
          quizScore: null,
          quizAttempts: 0,
          quizSetId: firstLesson.quizSetId,
          locked: false
        };
        setProgress(prev => [...prev, newProgress]);
      }
    }
    
    toast({
      title: 'Course Assigned',
      description: 'Course has been assigned to the student successfully.'
    });
  };

  const removeCourseAssignment = (studentId: string, courseId: string) => {
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
    
    toast({
      title: 'Course Removed',
      description: 'Course has been removed from the student\'s assignments.'
    });
  };

  // Quiz functions
  const addQuizSet = (quizSet: Omit<QuizSet, 'id' | 'questions'>) => {
    const newQuizSet: QuizSet = {
      ...quizSet,
      id: generateId(),
      questions: []
    };
    setQuizSets(prev => [...prev, newQuizSet]);
    toast({
      title: 'Quiz Set Added',
      description: `${quizSet.title} has been created successfully.`
    });
    return newQuizSet;
  };

  const updateQuizSet = (quizSetId: string, updates: Partial<QuizSet>) => {
    setQuizSets(prev => prev.map(quizSet =>
      quizSet.id === quizSetId ? { ...quizSet, ...updates } : quizSet
    ));
    toast({
      title: 'Quiz Set Updated',
      description: 'Quiz set details have been updated successfully.'
    });
  };

  const deleteQuizSet = (quizSetId: string) => {
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
    
    toast({
      title: 'Quiz Set Deleted',
      description: 'The quiz set has been removed.'
    });
  };

  const addQuizQuestion = (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => {
    setQuizSets(prev => prev.map(quizSet => {
      if (quizSet.id === quizSetId) {
        return {
          ...quizSet,
          questions: [...quizSet.questions, { ...question, id: generateId() }]
        };
      }
      return quizSet;
    }));
    toast({
      title: 'Question Added',
      description: 'New question has been added to the quiz set.'
    });
  };

  const updateQuizQuestion = (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => {
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
    toast({
      title: 'Question Updated',
      description: 'Quiz question has been updated successfully.'
    });
  };

  const deleteQuizQuestion = (quizSetId: string, questionId: string) => {
    setQuizSets(prev => prev.map(quizSet => {
      if (quizSet.id === quizSetId) {
        return {
          ...quizSet,
          questions: quizSet.questions.filter(question => question.id !== questionId)
        };
      }
      return quizSet;
    }));
    toast({
      title: 'Question Deleted',
      description: 'The question has been removed from the quiz set.'
    });
  };

  const updateQuizSettings = (settings: Partial<QuizSettings>) => {
    setQuizSettings(prev => ({ ...prev, ...settings }));
    toast({
      title: 'Quiz Settings Updated',
      description: 'Quiz settings have been updated successfully.'
    });
  };

  // Progress tracking functions
  const toggleCourseLock = (studentId: string, courseId: string) => {
    setProgress(prev => prev.map(p => {
      if (p.userId === studentId && p.courseId === courseId) {
        return { ...p, locked: !p.locked };
      }
      return p;
    }));
    
    const isLocked = progress.find(p => p.userId === studentId && p.courseId === courseId)?.locked;
    toast({
      title: isLocked ? 'Course Unlocked' : 'Course Locked',
      description: `Course access has been ${isLocked ? 'enabled' : 'disabled'} for the student.`
    });
  };

  const markLessonComplete = (userId: string, courseId: string, lessonId: string, quizScore?: number) => {
    // Mark the current lesson as completed
    let updated = false;
    
    setProgress(prev => prev.map(p => {
      if (p.userId === userId && p.courseId === courseId && p.lessonId === lessonId) {
        updated = true;
        return {
          ...p,
          completed: true,
          quizScore: quizScore !== undefined ? quizScore : p.quizScore
        };
      }
      return p;
    }));
    
    if (!updated) {
      // Create a new progress entry if one doesn't exist
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (lesson) {
          const newProgress: StudentProgress = {
            userId,
            courseId,
            lessonId,
            completed: true,
            timeSpent: 0,
            pdfViewed: true,
            quizScore: quizScore !== undefined ? quizScore : null,
            quizAttempts: quizScore !== undefined ? 1 : 0,
            quizSetId: lesson.quizSetId,
            locked: false
          };
          setProgress(prev => [...prev, newProgress]);
        }
      }
    }
    
    // Check if there's a next lesson to unlock
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const currentLesson = course.lessons.find(l => l.id === lessonId);
      if (currentLesson) {
        const nextLesson = course.lessons.find(l => l.order === currentLesson.order + 1);
        if (nextLesson) {
          // Check if a progress entry already exists for the next lesson
          const nextLessonProgress = progress.find(
            p => p.userId === userId && p.courseId === courseId && p.lessonId === nextLesson.id
          );
          
          if (!nextLessonProgress) {
            // Create a new progress entry for the next lesson
            const newProgress: StudentProgress = {
              userId,
              courseId,
              lessonId: nextLesson.id,
              completed: false,
              timeSpent: 0,
              pdfViewed: false,
              quizScore: null,
              quizAttempts: 0,
              quizSetId: nextLesson.quizSetId,
              locked: false
            };
            setProgress(prev => [...prev, newProgress]);
          }
        }
      }
    }
    
    toast({
      title: 'Lesson Completed',
      description: 'Your progress has been saved.'
    });
  };

  const updateTimeSpent = (userId: string, courseId: string, lessonId: string, seconds: number) => {
    let updated = false;
    
    setProgress(prev => prev.map(p => {
      if (p.userId === userId && p.courseId === courseId && p.lessonId === lessonId) {
        updated = true;
        return { ...p, timeSpent: p.timeSpent + seconds };
      }
      return p;
    }));
    
    if (!updated) {
      // Create a new progress entry
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (lesson) {
          const newProgress: StudentProgress = {
            userId,
            courseId,
            lessonId,
            completed: false,
            timeSpent: seconds,
            pdfViewed: false,
            quizScore: null,
            quizAttempts: 0,
            quizSetId: lesson.quizSetId,
            locked: false
          };
          setProgress(prev => [...prev, newProgress]);
        }
      }
    }
  };

  const updatePdfViewed = (userId: string, courseId: string, lessonId: string) => {
    let updated = false;
    
    setProgress(prev => prev.map(p => {
      if (p.userId === userId && p.courseId === courseId && p.lessonId === lessonId) {
        updated = true;
        return { ...p, pdfViewed: true };
      }
      return p;
    }));
    
    if (!updated) {
      // Create a new progress entry
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (lesson) {
          const newProgress: StudentProgress = {
            userId,
            courseId,
            lessonId,
            completed: false,
            timeSpent: 0,
            pdfViewed: true,
            quizScore: null,
            quizAttempts: 0,
            quizSetId: lesson.quizSetId,
            locked: false
          };
          setProgress(prev => [...prev, newProgress]);
        }
      }
    }
  };

  // Helper functions for accessing progress data
  const getStudentProgress = (userId: string, courseId: string) => {
    return progress.filter(p => p.userId === userId && p.courseId === courseId);
  };

  const getCompletedLessonsCount = (userId: string, courseId: string) => {
    return progress.filter(p => p.userId === userId && p.courseId === courseId && p.completed).length;
  };

  const isLessonAccessible = (userId: string, courseId: string, lessonOrder: number) => {
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

  const getTotalQuizScore = (userId: string, courseId: string) => {
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
      getTotalQuizScore
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
