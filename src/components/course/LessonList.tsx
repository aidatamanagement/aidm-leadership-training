
import React from 'react';
import LessonCard from './LessonCard';
import { useProgress } from '@/contexts/ProgressContext';
import { useStudents } from '@/contexts/StudentContext';

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
  lessonLocks: Record<string, boolean>;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  courseId,
  userId,
  isAdmin,
  isMobile,
  lessonLocks
}) => {
  const { getStudentProgress, isLessonAccessible } = useProgress();
  
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
