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
  assignedCourses: string[];
  role: string;
}

export interface QuizSettings {
  passMarkPercentage: number;
  enforcePassMark: boolean;
}

export interface DataContextType {
  courses: Course[];
  students: Student[];
  quizSets: QuizSet[];
  progress: StudentProgress[];
  quizSettings: QuizSettings;
  addCourse: (course: Omit<Course, 'id' | 'lessons'>) => Promise<Course | null>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => Promise<void>;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'assignedCourses' | 'role'>, password: string, role?: string) => Promise<void>;
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  assignCourse: (studentId: string, courseId: string) => Promise<void>;
  removeCourseAssignment: (studentId: string, courseId: string) => Promise<void>;
  addQuizSet: (quizSet: Omit<QuizSet, 'id' | 'questions'>) => Promise<QuizSet | null>;
  updateQuizSet: (quizSetId: string, updates: Partial<QuizSet>) => Promise<void>;
  deleteQuizSet: (quizSetId: string) => Promise<void>;
  addQuizQuestion: (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => Promise<void>;
  updateQuizQuestion: (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => Promise<void>;
  deleteQuizQuestion: (quizSetId: string, questionId: string) => Promise<void>;
  updateQuizSettings: (settings: Partial<QuizSettings>) => Promise<void>;
  toggleCourseLock: (studentId: string, courseId: string) => Promise<void>;
  markLessonComplete: (userId: string, courseId: string, lessonId: string, quizScore?: number) => Promise<void>;
  updateTimeSpent: (userId: string, courseId: string, lessonId: string, seconds: number) => Promise<void>;
  updatePdfViewed: (userId: string, courseId: string, lessonId: string) => Promise<void>;
  getStudentProgress: (userId: string, courseId: string) => StudentProgress[];
  getCompletedLessonsCount: (userId: string, courseId: string) => number;
  isLessonAccessible: (userId: string, courseId: string, lessonOrder: number) => boolean;
  getTotalQuizScore: (userId: string, courseId: string) => { score: number; total: number };
  isLoading: boolean;
  refreshData: () => Promise<void>;
  uploadPdf: (file: File, lessonId: string) => Promise<string>;
  isCourseLockedForUser: (userId: string, courseId: string) => boolean;
  // Lesson-level locking functions with their correct return types
  isLessonLocked: (studentId: string, courseId: string, lessonId: string) => Promise<boolean>;
  toggleLessonLock: (studentId: string, courseId: string, lessonId: string) => Promise<boolean>;
  fetchLessonLocks: (studentId: string, courseId: string) => Promise<Record<string, boolean>>;
}

export interface FileType {
  id: string
  student_id: string
  uploader_id: string
  name: string
  path: string
  type: string
  uploaded_at: string
  uploader?: { id: string; name: string }
  description?: string
}
