import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { isLessonAccessible } from '@/contexts/services/progressHelpers';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('Progress Helpers', () => {
  const mockCourse = {
    id: 'course1',
    lessons: [
      { id: 'lesson1', order: 1 },
      { id: 'lesson2', order: 2 },
      { id: 'lesson3', order: 3 }
    ]
  };

  const mockUserId = 'user1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isLessonAccessible', () => {
    it('should return true for first lesson if not locked', async () => {
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

      const result = await isLessonAccessible(mockUserId, mockCourse, 'lesson1');
      expect(result).toBe(true);
    });

    it('should return false for locked lesson', async () => {
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

      const result = await isLessonAccessible(mockUserId, mockCourse, 'lesson2');
      expect(result).toBe(false);
    });

    it('should check previous lesson completion for non-first lessons', async () => {
      // Mock lesson lock check to return false (not locked)
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'user_lesson_locks') {
          return {
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
          };
        }
        // Mock progress check
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  data: [{ completed: true }],
                  error: null
                })
              })
            })
          })
        };
      });

      const result = await isLessonAccessible(mockUserId, mockCourse, 'lesson2');
      expect(result).toBe(true);
    });

    it('should return false if previous lesson is not completed', async () => {
      // Mock lesson lock check to return false (not locked)
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'user_lesson_locks') {
          return {
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
          };
        }
        // Mock progress check to return not completed
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  data: [{ completed: false }],
                  error: null
                })
              })
            })
          })
        };
      });

      const result = await isLessonAccessible(mockUserId, mockCourse, 'lesson2');
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => ({
                  data: null,
                  error: new Error('Database error')
                })
              })
            })
          })
        })
      }));

      const result = await isLessonAccessible(mockUserId, mockCourse, 'lesson1');
      expect(result).toBe(false);
    });

    it('should handle missing lesson gracefully', async () => {
      const result = await isLessonAccessible(mockUserId, mockCourse, 'nonexistent-lesson');
      expect(result).toBe(false);
    });
  });
}); 