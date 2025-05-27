import React from 'react';
import { Course } from '@/contexts/DataContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import LessonLockAccordion from './LessonLockAccordion';

interface CourseCardProps {
  course: Course;
  studentId: string;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  quizScore: number;
  isLocked: boolean;
  viewedLessonsCount: number;
  onToggleLock: () => void;
  onRemoveCourse: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  studentId,
  completedLessons,
  totalLessons,
  totalTimeSpent,
  quizScore,
  isLocked,
  viewedLessonsCount,
  onToggleLock,
  onRemoveCourse
}) => {
  return (
    <GlassCard className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLock}
            className={isLocked ? 'text-red-500' : 'text-green-500'}
          >
            {isLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveCourse}
            className="text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-lg font-semibold">
            {completedLessons}/{totalLessons} lessons
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Time Spent</p>
          <p className="text-lg font-semibold">
            {formatDuration(totalTimeSpent)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quiz Score</p>
          <p className="text-lg font-semibold">{quizScore}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Lessons Viewed</p>
          <p className="text-lg font-semibold">
            {viewedLessonsCount}/{totalLessons}
          </p>
        </div>
      </div>

      {/* Add the lesson lock accordion */}
      <LessonLockAccordion course={course} studentId={studentId} />
    </GlassCard>
  );
};

export default CourseCard;
