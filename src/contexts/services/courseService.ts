
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Course, Lesson } from '../types/DataTypes';

// Fetch courses with their lessons
export const fetchCourses = async (): Promise<Course[]> => {
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

    return coursesWithLessons;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Add a new course
export const addCourse = async (course: Omit<Course, 'id' | 'lessons'>): Promise<Course | null> => {
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

// Update an existing course
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<void> => {
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
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    
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
    throw error;
  }
};

// Add a lesson to a course
export const addLesson = async (courseId: string, lesson: Omit<Lesson, 'id' | 'order'>, currentLessons: Lesson[]): Promise<Lesson> => {
  try {
    // Get the current max order for this course
    let newOrder = 1;
    
    if (currentLessons.length > 0) {
      newOrder = Math.max(...currentLessons.map(l => l.order)) + 1;
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
    
    toast({
      title: 'Lesson Added',
      description: `${lesson.title} has been added to the course.`
    });
    
    return newLesson;
  } catch (error: any) {
    console.error('Error adding lesson:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to add lesson',
      variant: 'destructive',
    });
    throw error;
  }
};

// Update a lesson
export const updateLesson = async (courseId: string, lessonId: string, updates: Partial<Lesson>): Promise<void> => {
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
    throw error;
  }
};

// Delete a lesson
export const deleteLesson = async (courseId: string, lessonId: string, allLessons: Lesson[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;

    // Re-order remaining lessons
    const filteredLessons = allLessons.filter(lesson => lesson.id !== lessonId);
    const reorderedLessons = [...filteredLessons].sort((a, b) => a.order - b.order).map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));
    
    // Update the order in the database
    for (const lesson of reorderedLessons) {
      if (lesson.order !== allLessons.find(l => l.id === lesson.id)?.order) {
        await supabase
          .from('lessons')
          .update({ order: lesson.order })
          .eq('id', lesson.id);
      }
    }
    
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
    throw error;
  }
};
