import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonList from '@/components/course/LessonList';

describe('LessonList', () => {
  const mockCourse = {
    id: 'course1',
    title: 'Test Course',
    lessons: [
      {
        id: 'lesson1',
        title: 'Lesson 1',
        description: 'Description 1',
        order: 1
      },
      {
        id: 'lesson2',
        title: 'Lesson 2',
        description: 'Description 2',
        order: 2
      }
    ]
  };

  const mockStudentProgress = [
    {
      lessonId: 'lesson1',
      completed: true,
      lastAccessed: new Date().toISOString()
    }
  ];

  const mockQuizScores = {
    total: 80,
    lessons: {
      lesson1: 90,
      lesson2: 70
    }
  };

  it('should render lessons with correct accessibility states', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: false
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if lessons are rendered
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('Lesson 2')).toBeInTheDocument();

    // Check if descriptions are rendered
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();

    // Check if quiz scores are rendered
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={{}}
        loadingAccessibility={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show locked state for inaccessible lessons', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: false
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if locked lesson shows lock icon and message
    const lockedLesson = screen.getByText('Lesson 2').closest('div');
    expect(lockedLesson).toHaveClass('opacity-50');
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('should show completed state for completed lessons', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: true
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if completed lesson shows checkmark
    const completedLesson = screen.getByText('Lesson 1').closest('div');
    expect(completedLesson).toHaveClass('bg-green-50');
  });

  it('should show admin controls when isAdmin is true', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: true
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={true}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if admin controls are visible
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  it('should show correct button text based on lesson completion', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: true
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if completed lesson shows "Review" button
    expect(screen.getByText('Review')).toBeInTheDocument();

    // Check if incomplete lesson shows "Start" button
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should disable buttons for locked lessons', () => {
    const lessonAccessibility = {
      lesson1: true,
      lesson2: false
    };

    render(
      <LessonList
        course={mockCourse}
        lessons={mockCourse.lessons}
        studentProgress={mockStudentProgress}
        quizScores={mockQuizScores}
        isAdmin={false}
        lessonAccessibility={lessonAccessibility}
        loadingAccessibility={false}
      />
    );

    // Check if locked lesson's button is disabled
    const lockedButton = screen.getByText('Start').closest('button');
    expect(lockedButton).toBeDisabled();
  });
}); 