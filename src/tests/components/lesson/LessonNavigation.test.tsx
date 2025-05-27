import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LessonNavigation from '@/components/lesson/LessonNavigation';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LessonNavigation', () => {
  const mockProps = {
    courseId: 'course1',
    prevLesson: { id: 'lesson1', title: 'Previous Lesson' },
    nextLesson: { id: 'lesson2', title: 'Next Lesson' },
    onCompleteLesson: vi.fn(),
    disableCompletion: false,
    isNextLessonLocked: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navigation buttons correctly', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Previous: Previous Lesson')).toBeInTheDocument();
    expect(screen.getByText('Complete & Continue')).toBeInTheDocument();
  });

  it('should show Complete button when next lesson is locked', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} isNextLessonLocked={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Complete & Continue')).not.toBeInTheDocument();
  });

  it('should navigate to lesson list when Complete is clicked', async () => {
    mockProps.onCompleteLesson.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} isNextLessonLocked={true} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Complete'));

    await waitFor(() => {
      expect(mockProps.onCompleteLesson).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/courses/course1');
    });
  });

  it('should navigate to next lesson when Complete & Continue is clicked', async () => {
    mockProps.onCompleteLesson.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Complete & Continue'));

    await waitFor(() => {
      expect(mockProps.onCompleteLesson).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/courses/course1/lessons/lesson2');
    });
  });

  it('should handle completion errors gracefully', async () => {
    mockProps.onCompleteLesson.mockRejectedValue(new Error('Completion failed'));

    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Complete & Continue'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to complete lesson. Please try again.')).toBeInTheDocument();
    });
  });

  it('should disable buttons when completion is disabled', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} disableCompletion={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Complete all required activities to continue')).toBeInTheDocument();
    expect(screen.getByText('Complete & Continue')).toBeDisabled();
  });

  it('should show lock message when next lesson is locked', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} isNextLessonLocked={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Next lesson is locked')).toBeInTheDocument();
  });

  it('should handle no previous lesson', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} prevLesson={null} />
      </MemoryRouter>
    );

    expect(screen.getByText('No Previous Lesson')).toBeInTheDocument();
    expect(screen.getByText('No Previous Lesson')).toBeDisabled();
  });

  it('should handle no next lesson', () => {
    render(
      <MemoryRouter>
        <LessonNavigation {...mockProps} nextLesson={null} />
      </MemoryRouter>
    );

    expect(screen.getByText('Complete & Continue')).toBeInTheDocument();
    expect(screen.queryByText('Next:')).not.toBeInTheDocument();
  });
}); 