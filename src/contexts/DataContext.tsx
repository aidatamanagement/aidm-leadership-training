import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
  assignedCourses: string[];
  role: string;
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
  uploadPdf: (file: File, lessonId: string) => Promise<string | null>;
}

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
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses with their lessons
  const fetchCourses = async () => {
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      if (coursesError) throw coursesError;

      // Fetch lessons for each course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Map lessons to courses
      const coursesWithLessons = coursesData.map(course => {
        const courseLessons = lessonsData
          .filter(lesson => lesson.course_id === course.id)
          .map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            pdfUrl: lesson.pdf_url,
            instructorNotes: lesson.instructor_notes,
            quizSetId: lesson.quiz_set_id,
            order: lesson.order
          }));

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          lessons: courseLessons
        };
      });

      setCourses(coursesWithLessons);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  // Fetch students with their assigned courses
  const fetchStudents = async () => {
    try {
      // Fetch profiles with role 'student'
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch course assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_course_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Map assignments to students
      const studentsWithCourses = profilesData.map(profile => {
        const studentAssignments = assignmentsData
          .filter(assignment => assignment.user_id === profile.id)
          .map(assignment => assignment.course_id);

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          assignedCourses: studentAssignments
        };
      });

      setStudents(studentsWithCourses);
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  // Fetch quiz sets with their questions
  const fetchQuizSets = async () => {
    try {
      // Fetch quiz sets
      const { data: quizSetsData, error: quizSetsError } = await supabase
        .from('quiz_sets')
        .select('*');

      if (quizSetsError) throw quizSetsError;

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*');

      if (questionsError) throw questionsError;

      // Map questions to quiz sets
      const quizSetsWithQuestions = quizSetsData.map(quizSet => {
        const quizQuestions = questionsData
          .filter(question => question.quiz_set_id === quizSet.id)
          .map(question => ({
            id: question.id,
            question: question.question,
            // Convert options from JSON to string array
            options: Array.isArray(question.options) ? question.options : JSON.parse(question.options as string),
            correctAnswer: question.correct_answer
          }));

        return {
          id: quizSet.id,
          title: quizSet.title,
          questions: quizQuestions
        };
      });

      setQuizSets(quizSetsWithQuestions);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
      throw error;
    }
  };

  // Fetch user progress
  const fetchProgress = async () => {
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

      // Add quiz set IDs from lessons
      const progressWithQuizSets = formattedProgress.map(p => {
        const course = courses.find(c => c.id === p.courseId);
        if (course) {
          const lesson = course.lessons.find(l => l.id === p.lessonId);
          if (lesson) {
            return { ...p, quizSetId: lesson.quizSetId };
          }
        }
        return p;
      });

      setProgress(progressWithQuizSets);
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  };

  // Fetch quiz settings
  const fetchQuizSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, use defaults
          return;
        }
        throw error;
      }

      if (data) {
        setQuizSettings({
          passMarkPercentage: data.pass_mark_percentage,
          enforcePassMark: data.enforce_pass_mark
        });
      }
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
      throw error;
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

  // Helper function to generate a random ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // PDF upload function
  const uploadPdf = async (file: File, lessonId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${lessonId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // First check if storage bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();
        
      if (bucketError) throw bucketError;
      
      const pdfsBucketExists = buckets.some(bucket => bucket.name === 'pdfs');
      if (!pdfsBucketExists) {
        throw new Error("Storage bucket 'pdfs' does not exist. Please contact an administrator.");
      }

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

      console.log("PDF successfully uploaded, public URL:", publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload PDF',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Course functions
  const addCourse = async (course: Omit<Course, 'id' | 'lessons'>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: course.title,
            description: course.description
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newCourse: Course = {
        ...data,
        lessons: []
      };

      setCourses(prev => [...prev, newCourse]);
      
      toast({
        title: 'Course Added',
        description: `${course.title} has been added successfully.`
      });

      return newCourse;
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add course',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      // Only update fields that are in the courses table
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: updates.title,
          description: updates.description
        })
        .eq('id', courseId)
        .select();

      if (error) throw error;

      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, ...updates } : course
      ));
      
      toast({
        title: 'Course Updated',
        description: 'Course details have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      // Clean up related data (RLS policies will handle this in the database)
      setProgress(prev => prev.filter(p => p.courseId !== courseId));
      setStudents(prev => prev.map(student => ({
        ...student,
        assignedCourses: student.assignedCourses.filter(id => id !== courseId)
      })));
      
      toast({
        title: 'Course Deleted',
        description: 'The course and all associated data have been removed.'
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  // Lesson functions
  const addLesson = async (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>) => {
    try {
      // Get the current max order for this course
      const currentCourse = courses.find(c => c.id === courseId);
      let newOrder = 1;
      
      if (currentCourse && currentCourse.lessons.length > 0) {
        newOrder = Math.max(...currentCourse.lessons.map(l => l.order)) + 1;
      }

      const { data, error } = await supabase
        .from('lessons')
        .insert([
          {
            course_id: courseId,
            title: lesson.title,
            description: lesson.description,
            pdf_url: lesson.pdfUrl || '/placeholder.pdf',
            instructor_notes: lesson.instructorNotes,
            quiz_set_id: lesson.quizSetId,
            order: newOrder
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newLesson: Lesson = {
        id: data.id,
        title: data.title,
        description: data.description,
        pdfUrl: data.pdf_url,
        instructorNotes: data.instructor_notes,
        quizSetId: data.quiz_set_id,
        order: data.order
      };

      setCourses(prev => prev.map(course => {
        if (course.id === courseId) {
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
    } catch (error: any) {
      console.error('Error adding lesson:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add lesson',
        variant: 'destructive',
      });
    }
  };

  const updateLesson = async (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: updates.title,
          description: updates.description,
          pdf_url: updates.pdfUrl,
          instructor_notes: updates.instructorNotes,
          quiz_set_id: updates.quizSetId,
          order: updates.order
        })
        .eq('id', lessonId)
        .select();

      if (error) throw error;

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
      
      toast({
        title: 'Lesson Updated',
        description: 'Lesson content has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lesson',
        variant: 'destructive',
      });
    }
  };

  const deleteLesson = async (courseId: string, lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      // Update courses state
      setCourses(prev => prev.map(course => {
        if (course.id === courseId) {
          const filteredLessons = course.lessons.filter(lesson => lesson.id !== lessonId);
          // Re-order remaining lessons
          const reorderedLessons = [...filteredLessons].sort((a, b) => a.order - b.order).map((lesson, index) => ({
            ...lesson,
            order: index + 1
          }));
          
          // Update the order in the database
          reorderedLessons.forEach(async lesson => {
            if (lesson.order !== course.lessons.find(l => l.id === lesson.id)?.order) {
              await supabase
                .from('lessons')
                .update({ order: lesson.order })
                .eq('id', lesson.id);
            }
          });
          
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
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  // Student functions
  const addStudent = async (student: Omit<Student, 'id' | 'assignedCourses' | 'role'>, password: string, role: string = 'student') => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: student.email,
        password: password,
        options: {
          data: {
            name: student.name,
            role: role
          }
        }
      });

      if (authError) throw authError;
      
      // The profile will be created automatically through the database trigger

      toast({
        title: 'Student Added',
        description: `${student.name} has been added successfully.`
      });
      
      // Refresh student list
      await fetchStudents();
      
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add student',
        variant: 'destructive',
      });
    }
  };

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role
        })
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev => prev.map(student =>
        student.id === studentId ? { ...student, ...updates } : student
      ));
      
      toast({
        title: 'Student Updated',
        description: 'Student details have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student',
        variant: 'destructive',
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      // In a real app, you'd want to confirm with the user before deleting
      // We can't delete from auth.users directly from client, we'd need a server function
      // For now, just delete the profile (this won't delete the auth user)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== studentId));
      
      // Clean up progress data for this student
      setProgress(prev => prev.filter(p => p.userId !== studentId));
      
      toast({
        title: 'Student Deleted',
        description: 'The student and all associated data have been removed.'
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete student',
        variant: 'destructive',
      });
    }
  };

  const assignCourse = async (studentId: string, courseId: string) => {
    try {
      // Check if assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('user_course_assignments')
        .select('*')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAssignment) {
        // Assignment already exists
        toast({
          title: 'Info',
          description: 'Course is already assigned to this student.'
        });
        return;
      }

      // Create assignment
      const { error: assignError } = await supabase
        .from('user_course_assignments')
        .insert([
          {
            user_id: studentId,
            course_id: courseId,
            locked: false
          }
        ]);

      if (assignError) throw assignError;

      // Initialize progress for the first lesson
      const course = courses.find(c => c.id === courseId);
      if (course && course.lessons.length > 0) {
        const firstLesson = course.lessons.find(l => l.order === 1);
        if (firstLesson) {
          await supabase
            .from('user_progress')
            .insert([
              {
                user_id: studentId,
                course_id: courseId,
                lesson_id: firstLesson.id,
                completed: false,
                time_spent: 0,
                pdf_viewed: false,
                quiz_score: null,
                quiz_attempts: 0
              }
            ]);
        }
      }

      // Update local state
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            assignedCourses: [...student.assignedCourses, courseId]
          };
        }
        return student;
      }));
      
      toast({
        title: 'Course Assigned',
        description: 'Course has been assigned to the student successfully.'
      });
      
      // Refresh progress data
      await fetchProgress();
      
    } catch (error: any) {
      console.error('Error assigning course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign course',
        variant: 'destructive',
      });
    }
  };

  const removeCourseAssignment = async (studentId: string, courseId: string) => {
    try {
      const { error } = await supabase
        .from('user_course_assignments')
        .delete()
        .eq('user_id', studentId)
        .eq('course_id', courseId);

      if (error) throw error;

      // Delete all progress for this course as well
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', studentId)
        .eq('course_id', courseId);

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
      
      toast({
        title: 'Course Removed',
        description: 'Course has been removed from the student\'s assignments.'
      });
    } catch (error: any) {
      console.error('Error removing course assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove course assignment',
        variant: 'destructive',
      });
    }
  };

  // Quiz functions
  const addQuizSet = async (quizSet: Omit<QuizSet, 'id' | 'questions'>) => {
    try {
      const { data, error } = await supabase
        .from('quiz_sets')
        .insert([
          {
            title: quizSet.title
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newQuizSet: QuizSet = {
        id: data.id,
        title: data.title,
        questions: []
      };

      setQuizSets(prev => [...prev, newQuizSet]);
      
      toast({
        title: 'Quiz Set Added',
        description: `${quizSet.title} has been created successfully.`
      });
      
      return newQuizSet;
    } catch (error: any) {
      console.error('Error adding quiz set:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add quiz set',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateQuizSet = async (quizSetId: string, updates: Partial<QuizSet>) => {
    try {
      const { error } = await supabase
        .from('quiz_sets')
        .update({
          title: updates.title
        })
        .eq('id', quizSetId);

      if (error) throw error;

      setQuizSets(prev => prev.map(quizSet =>
        quizSet.id === quizSetId ? { ...quizSet, ...updates } : quizSet
      ));
      
      toast({
        title: 'Quiz Set Updated',
        description: 'Quiz set details have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating quiz set:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quiz set',
        variant: 'destructive',
      });
    }
  };

  const deleteQuizSet = async (quizSetId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_sets')
        .delete()
        .eq('id', quizSetId);

      if (error) throw error;

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
      
      // Update lessons in the database
      await supabase
        .from('lessons')
        .update({ quiz_set_id: null })
        .eq('quiz_set_id', quizSetId);
      
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
    } catch (error: any) {
      console.error('Error deleting quiz set:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete quiz set',
        variant: 'destructive',
      });
    }
  };

  const addQuizQuestion = async (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([
          {
            quiz_set_id: quizSetId,
            question: question.question,
            options: JSON.stringify(question.options),
            correct_answer: question.correctAnswer
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newQuestion: QuizQuestion = {
        id: data.id,
        question: data.question,
        options: question.options,
        correctAnswer: data.correct_answer
      };

      setQuizSets(prev => prev.map(quizSet => {
        if (quizSet.id === quizSetId) {
          return {
            ...quizSet,
            questions: [...quizSet.questions, newQuestion]
          };
        }
        return quizSet;
      }));
      
      toast({
        title: 'Question Added',
        description: 'New question has been added to the quiz set.'
      });
    } catch (error: any) {
      console.error('Error adding quiz question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add quiz question',
        variant: 'destructive',
      });
    }
  };

  const updateQuizQuestion = async (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    try {
      const updateData: any = {};
      if (updates.question !== undefined) updateData.question = updates.question;
      if (updates.options !== undefined) updateData.options = JSON.stringify(updates.options);
      if (updates.correctAnswer !== undefined) updateData.correct_answer = updates.correctAnswer;

      const { error } = await supabase
        .from('quiz_questions')
        .update(updateData)
        .eq('id', questionId);

      if (error) throw error;

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
    } catch (error: any) {
      console.error('Error updating quiz question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quiz question',
        variant: 'destructive',
      });
    }
  };

  const deleteQuizQuestion = async (quizSetId: string, questionId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

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
    } catch (error: any) {
      console.error('Error deleting quiz question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete quiz question',
        variant: 'destructive',
      });
    }
  };

  const updateQuizSettings = async (settings: Partial<QuizSettings>) => {
    try {
      // Get existing quiz settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('quiz_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let updateError;
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('quiz_settings')
          .update({
            pass_mark_percentage: settings.passMarkPercentage,
            enforce_pass_mark: settings.enforcePassMark
          })
          .eq('id', existingSettings.id);
        
        updateError = error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('quiz_settings')
          .insert([{
            pass_mark_percentage: settings.passMarkPercentage || 70,
            enforce_pass_mark: settings.enforcePassMark !== undefined ? settings.enforcePassMark : true
          }]);
        
        updateError = error;
      }

      if (updateError) throw updateError;

      setQuizSettings(prev => ({ ...prev, ...settings }));
      
      toast({
        title: 'Quiz Settings Updated',
        description: 'Quiz settings have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating quiz settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quiz settings',
        variant: 'destructive',
      });
    }
  };

  // Progress tracking functions
  const toggleCourseLock = async (studentId: string, courseId: string) => {
    try {
      // Get current status
      const { data: assignment, error: fetchError } = await supabase
        .from('user_course_assignments')
        .select('locked')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .single();

      if (fetchError) throw fetchError;

      const newLockedStatus = !assignment.locked;

      // Update the lock status
      const { error: updateError } = await supabase
        .from('user_course_assignments')
        .update({ locked: newLockedStatus })
        .eq('user_id', studentId)
        .eq('course_id', courseId);

      if (updateError) throw updateError;

      // Update local state
      setProgress(prev => prev.map(p => {
        if (p.userId === studentId && p.courseId === courseId) {
          return { ...p, locked: newLockedStatus };
        }
        return p;
      }));
      
      toast({
        title: newLockedStatus ? 'Course Locked' : 'Course Unlocked',
        description: `Course access has been ${newLockedStatus ? 'disabled' : 'enabled'} for the student.`
      });
    } catch (error: any) {
      console.error('Error toggling course lock:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course lock status',
        variant: 'destructive',
      });
    }
  };

  const markLessonComplete = async (userId: string, courseId: string, lessonId: string, quizScore?: number) => {
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
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const lesson = course.lessons.find(l => l.id === lessonId);
          if (lesson) {
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
      }

      // Update local state
      await fetchProgress();
      
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
    }
  };

  const updateTimeSpent = async (userId: string, courseId: string, lessonId: string, seconds: number) => {
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
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const lesson = course.lessons.find(l => l.id === lessonId);
          if (lesson) {
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
        }
      }

      // Update local state
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
    } catch (error: any) {
      console.error('Error updating time spent:', error);
      // Don't show toast for this one as it might be distracting
    }
  };

  const updatePdfViewed = async (userId: string, courseId: string, lessonId: string) => {
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
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const lesson = course.lessons.find(l => l.id === lessonId);
          if (lesson) {
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
        }
      }

      // Update local state
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
    } catch (error: any) {
      console.error('Error updating PDF viewed status:', error);
      // Don't show toast for this one as it might be distracting
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
      getTotalQuizScore,
      isLoading,
      refreshData,
      uploadPdf
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
