
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Student } from '../types/DataTypes';

// Fetch students with their assigned courses
export const fetchStudents = async (): Promise<Student[]> => {
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

    return studentsWithCourses;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Add a new student
export const addStudent = async (
  student: Omit<Student, 'id' | 'assignedCourses' | 'role'>, 
  password: string, 
  role: string = 'student'
): Promise<void> => {
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
  } catch (error: any) {
    console.error('Error adding student:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to add student',
      variant: 'destructive',
    });
    throw error;
  }
};

// Update a student
export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<void> => {
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
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
    
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
    throw error;
  }
};

// Assign a course to a student
export const assignCourse = async (studentId: string, courseId: string): Promise<void> => {
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
    
    toast({
      title: 'Course Assigned',
      description: 'Course has been assigned to the student successfully.'
    });
  } catch (error: any) {
    console.error('Error assigning course:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to assign course',
      variant: 'destructive',
    });
    throw error;
  }
};

// Remove a course assignment from a student
export const removeCourseAssignment = async (studentId: string, courseId: string): Promise<void> => {
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
    throw error;
  }
};

// Toggle the lock status of a course for a student
export const toggleCourseLock = async (studentId: string, courseId: string): Promise<boolean> => {
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
    
    toast({
      title: newLockedStatus ? 'Course Locked' : 'Course Unlocked',
      description: `Course access has been ${newLockedStatus ? 'disabled' : 'enabled'} for the student.`
    });
    
    return newLockedStatus;
  } catch (error: any) {
    console.error('Error toggling course lock:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update course lock status',
      variant: 'destructive',
    });
    throw error;
  }
};

// Get lesson lock status
export const isLessonLocked = async (studentId: string, courseId: string, lessonId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_locks')
      .select('locked')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no record exists, lesson is not locked
    return data?.locked || false;
  } catch (error) {
    console.error('Error checking lesson lock status:', error);
    return false;
  }
};

// Toggle lesson lock status
export const toggleLessonLock = async (studentId: string, courseId: string, lessonId: string): Promise<boolean> => {
  try {
    // Check if a lock record exists
    const { data: existingLock, error: checkError } = await supabase
      .from('user_lesson_locks')
      .select('*')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    let newLockStatus: boolean;
    
    if (existingLock) {
      // Toggle existing lock
      newLockStatus = !existingLock.locked;
      
      const { error: updateError } = await supabase
        .from('user_lesson_locks')
        .update({ locked: newLockStatus })
        .eq('id', existingLock.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new lock record (default to locked=true)
      newLockStatus = true;
      
      const { error: insertError } = await supabase
        .from('user_lesson_locks')
        .insert([{
          user_id: studentId,
          course_id: courseId,
          lesson_id: lessonId,
          locked: true
        }]);
        
      if (insertError) throw insertError;
    }
    
    toast({
      title: newLockStatus ? 'Lesson Locked' : 'Lesson Unlocked',
      description: `Lesson access has been ${newLockStatus ? 'disabled' : 'enabled'} for the student.`
    });
    
    return newLockStatus;
  } catch (error: any) {
    console.error('Error toggling lesson lock:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update lesson lock status',
      variant: 'destructive',
    });
    throw error;
  }
};

// Get all lesson locks for a student course
export const getLessonLocks = async (studentId: string, courseId: string): Promise<Record<string, boolean>> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_locks')
      .select('lesson_id, locked')
      .eq('user_id', studentId)
      .eq('course_id', courseId);
      
    if (error) throw error;
    
    // Convert to record format for easy lookup
    const lockMap: Record<string, boolean> = {};
    data.forEach(lock => {
      lockMap[lock.lesson_id] = lock.locked;
    });
    
    return lockMap;
  } catch (error) {
    console.error('Error fetching lesson locks:', error);
    return {};
  }
};
