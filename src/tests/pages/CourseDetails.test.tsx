import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseDetails from '@/pages/CourseDetails';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useStudents } from '@/contexts/StudentContext';
import { useData } from '@/contexts/DataContext';

// Mock the contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/contexts/CourseContext', () => ({
  useCourses: vi.fn()
}));

vi.mock('@/contexts/ProgressContext', () => ({
  useProgress: vi.fn()
}));

vi.mock('@/contexts/StudentContext', () => ({
  useStudents: vi.fn()
}));

vi.mock('@/contexts/DataContext', () => ({
  useData: vi.fn()
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

describe('CourseDetails', () => {
  const mockCourse = {
    id: 'course1',
    title: 'Test Course',
    description: 'Test Description',
    lessons: [
      { id: 'lesson1', title: 'Lesson 1', order: 1 },
      { id: 'lesson2', title: 'Lesson 2', order: 2 }
    ]
  };

  const mockUser = {
    id: 'user1',
    type: 'student'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock context values
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false
    });

    vi.mocked(useCourses).mockReturnValue({
      courses: [mockCourse],
      loading: false,
      error: null
    });

    vi.mocked(useProgress).mockReturnValue({
      getStudentProgress: vi.fn().mockReturnValue([]),
      getTotalQuizScore: vi.fn().mockReturnValue(0),
      isLessonAccessible: vi.fn(),
      isCourseLockedForUser: vi.fn().mockReturnValue(false)
    });

    vi.mocked(useStudents).mockReturnValue({
      isLessonLocked: vi.fn().mockResolvedValue(false)
    });

    vi.mocked(useData).mockReturnValue({
      isLoading: false
    });
  });

  it('should render course details for a student', async () => {
    render(
      <MemoryRouter initialEntries={['/courses/course1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Lessons')).toBeInTheDocument();
    });
  });

  it('should show locked message when course is locked', async () => {
    vi.mocked(useProgress).mockReturnValue({
      getStudentProgress: vi.fn().mockReturnValue([]),
      getTotalQuizScore: vi.fn().mockReturnValue(0),
      isLessonAccessible: vi.fn(),
      isCourseLockedForUser: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter initialEntries={['/courses/course1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Course Locked')).toBeInTheDocument();
      expect(screen.getByText('This course has been locked by your instructor.')).toBeInTheDocument();
    });
  });

  it('should show not found message for invalid course', async () => {
    vi.mocked(useCourses).mockReturnValue({
      courses: [],
      loading: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/courses/invalid-course']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Course not found')).toBeInTheDocument();
    });
  });

  it('should check lesson accessibility on mount', async () => {
    const mockIsLessonLocked = vi.fn().mockResolvedValue(false);
    vi.mocked(useStudents).mockReturnValue({
      isLessonLocked: mockIsLessonLocked
    });

    render(
      <MemoryRouter initialEntries={['/courses/course1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockIsLessonLocked).toHaveBeenCalledTimes(2); // Once for each lesson
      expect(mockIsLessonLocked).toHaveBeenCalledWith('user1', 'course1', 'lesson1');
      expect(mockIsLessonLocked).toHaveBeenCalledWith('user1', 'course1', 'lesson2');
    });
  });

  it('should show loading state while checking accessibility', async () => {
    const mockIsLessonLocked = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(false), 100)));
    vi.mocked(useStudents).mockReturnValue({
      isLessonLocked: mockIsLessonLocked
    });

    render(
      <MemoryRouter initialEntries={['/courses/course1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Loading state should be shown initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
}); 