import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonLockAccordion from '@/components/admin/students/LessonLockAccordion';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('LessonLockAccordion', () => {
  const mockCourse = {
    id: 'course1',
    title: 'Test Course',
    lessons: [
      { id: 'lesson1', title: 'Lesson 1' },
      { id: 'lesson2', title: 'Lesson 2' }
    ]
  };

  const mockStudentId = 'student1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render lesson lock controls', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: [],
            error: null
          })
        })
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lesson Access Control')).toBeInTheDocument();
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    });
  });

  it('should fetch and display locked lessons', async () => {
    const mockLockedLessons = [
      { lesson_id: 'lesson1' }
    ];

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: mockLockedLessons,
            error: null
          })
        })
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Lesson 1 should be checked (locked)
      expect(checkboxes[1]).not.toBeChecked(); // Lesson 2 should not be checked
    });
  });

  it('should handle lock toggle', async () => {
    vi.mocked(supabase.from).mockImplementation((table) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: [],
            error: null
          })
        })
      }),
      insert: () => ({
        error: null
      }),
      delete: () => ({
        eq: () => ({
          error: null
        })
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    // Click the first lesson's checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_lesson_locks');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: mockStudentId,
        course_id: mockCourse.id,
        lesson_id: 'lesson1'
      });
    });
  });

  it('should handle unlock toggle', async () => {
    const mockLockedLessons = [
      { lesson_id: 'lesson1' }
    ];

    vi.mocked(supabase.from).mockImplementation((table) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: mockLockedLessons,
            error: null
          })
        })
      }),
      delete: () => ({
        eq: () => ({
          error: null
        })
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    // Click the first lesson's checkbox (which is already checked)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_lesson_locks');
      expect(supabase.from().delete).toHaveBeenCalled();
    });
  });

  it('should handle error when fetching locked lessons', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: null,
            error: new Error('Database error')
          })
        })
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch lesson lock status')).toBeInTheDocument();
    });
  });

  it('should handle error when toggling lock', async () => {
    vi.mocked(supabase.from).mockImplementation((table) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: [],
            error: null
          })
        })
      }),
      insert: () => ({
        error: new Error('Failed to lock lesson')
      })
    }));

    render(
      <LessonLockAccordion
        course={mockCourse}
        studentId={mockStudentId}
      />
    );

    // Click the first lesson's checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to update lesson lock status')).toBeInTheDocument();
    });
  });
}); 