
import React from 'react';
import LessonCard from './LessonCard';

interface LessonListProps {
  lessons: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
    quizSetId: string | null;
  }>;
  courseId: string;
  userId: string;
  isAdmin: boolean;
  isMobile: boolean;
  getStudentProgress: (userId: string, courseId: string) => any[];
  isLessonAccessible: (userId: string, courseId: string, lessonOrder: number) => boolean;
  lessonLocks: Record<string, boolean>;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  courseId,
  userId,
  isAdmin,
  isMobile,
  getStudentProgress,
  isLessonAccessible,
  lessonLocks
}) => {
  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedLessons.map((lesson) => {
        // For admins, all lessons are accessible in preview mode
        const isAccessible = isAdmin || isLessonAccessible(userId, courseId, lesson.order);
        const progress = getStudentProgress(userId, courseId).find(p => p.lessonId === lesson.id);
        const isCompleted = progress?.completed || false;
        const isCurrentLessonLocked = isAdmin ? false : lessonLocks[lesson.id] || false;
        
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            courseId={courseId}
            isCompleted={isCompleted}
            isAccessible={isAccessible}
            isCurrentLessonLocked={isCurrentLessonLocked}
            isMobile={isMobile}
            quizScore={progress?.quizScore}
          />
        );
      })}
    </div>
  );
};

export default LessonList;
