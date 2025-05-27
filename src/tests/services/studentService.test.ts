import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  fetchStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent,
  assignCourse,
  removeCourseAssignment,
  toggleCourseLock,
  isLessonLocked,
  toggleLessonLock,
  getLessonLocks
} from '@/contexts/services/studentService';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn()
    }
  }
}));

describe('Student Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchStudents', () => {
    it('should fetch students with their assigned courses', async () => {
      const mockProfiles = [
        { id: '1', name: 'John', email: 'john@test.com', role: 'student' },
        { id: '2', name: 'Jane', email: 'jane@test.com', role: 'student' }
      ];

      const mockAssignments = [
        { user_id: '1', course_id: 'course1' },
        { user_id: '1', course_id: 'course2' },
        { user_id: '2', course_id: 'course1' }
      ];

      vi.mocked(supabase.from).mockImplementation((table) => ({
        select: () => ({
          data: table === 'profiles' ? mockProfiles : mockAssignments,
          error: null
        })
      }));

      const result = await fetchStudents();

      expect(result).toHaveLength(2);
      expect(result[0].assignedCourses).toHaveLength(2);
      expect(result[1].assignedCourses).toHaveLength(1);
    });

    it('should handle errors when fetching students', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          data: null,
          error: new Error('Database error')
        })
      }));

      await expect(fetchStudents()).rejects.toThrow('Database error');
    });
  });

  describe('addStudent', () => {
    it('should add a new student successfully', async () => {
      const mockStudent = {
        name: 'New Student',
        email: 'new@test.com'
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: 'new-id' } },
        error: null
      });

      await addStudent(mockStudent, 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: mockStudent.email,
        password: 'password123',
        options: {
          data: {
            name: mockStudent.name,
            role: 'student'
          }
        }
      });
    });
  });

  describe('isLessonLocked', () => {
    it('should return true when lesson is locked', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => ({
                  data: { id: 'lock1' },
                  error: null
                })
              })
            })
          })
        })
      }));

      const result = await isLessonLocked('student1', 'course1', 'lesson1');
      expect(result).toBe(true);
    });

    it('should return false when lesson is not locked', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => ({
                  data: null,
                  error: { code: 'PGRST116' }
                })
              })
            })
          })
        })
      }));

      const result = await isLessonLocked('student1', 'course1', 'lesson1');
      expect(result).toBe(false);
    });
  });

  describe('toggleLessonLock', () => {
    it('should lock a lesson when it is not locked', async () => {
      vi.mocked(supabase.from).mockImplementation((table) => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => ({
                  data: null,
                  error: { code: 'PGRST116' }
                })
              })
            })
          })
        }),
        insert: () => ({
          error: null
        })
      }));

      const result = await toggleLessonLock('student1', 'course1', 'lesson1');
      expect(result).toBe(true);
    });

    it('should unlock a lesson when it is locked', async () => {
      vi.mocked(supabase.from).mockImplementation((table) => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => ({
                  data: { id: 'lock1' },
                  error: null
                })
              })
            })
          })
        }),
        delete: () => ({
          eq: () => ({
            error: null
          })
        })
      }));

      const result = await toggleLessonLock('student1', 'course1', 'lesson1');
      expect(result).toBe(false);
    });
  });

  describe('getLessonLocks', () => {
    it('should return a map of lesson locks', async () => {
      const mockLocks = [
        { lesson_id: 'lesson1', locked: true },
        { lesson_id: 'lesson2', locked: false }
      ];

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              data: mockLocks,
              error: null
            })
          })
        })
      }));

      const result = await getLessonLocks('student1', 'course1');
      expect(result).toEqual({
        lesson1: true,
        lesson2: false
      });
    });
  });
}); 