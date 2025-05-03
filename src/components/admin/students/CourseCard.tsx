
import React from 'react';
import { Course } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { LockOpen, Lock, Trash, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import LessonLockAccordion from './LessonLockAccordion';
import { formatTimeSpent } from '@/lib/utils';
interface CourseCardProps {
  course: Course;
  studentId: string;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  viewedLessonsCount: number;
  quizScore: {
    score: number;
    total: number;
  };
  isLocked: boolean;
  onToggleLock: () => void;
  onRemoveCourse: () => void;
  formatTimeSpent?: (seconds: number) => string;
}
const CourseCard: React.FC<CourseCardProps> = ({
  course,
  studentId,
  completedLessons,
  totalLessons,
  totalTimeSpent,
  viewedLessonsCount,
  quizScore,
  isLocked,
  onToggleLock,
  onRemoveCourse,
  formatTimeSpent: customFormatTimeSpent
}) => {
  // Use the global utility function if no custom formatter is provided
  const displayTimeSpent = (seconds: number) => {
    return customFormatTimeSpent?.(seconds) || formatTimeSpent(seconds);
  };
  return <div className="border rounded-md p-4 bg-white">
      <div className="flex  justify-between items-start mb-3 sm: flex-wrap sm: gap-3">
        <div>
          <h5 className="font-semibold mb-2">{course.title}</h5>
          <p className="text-sm text-gray-600">
            Progress: {completedLessons} / {totalLessons} lessons
          </p>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="outline" asChild title="Preview Course" onClick={e => e.stopPropagation()}>
            <Link to={`/courses/${course.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant={isLocked ? "destructive" : "outline"} 
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }} 
            title={isLocked ? "Unlock Course" : "Lock Course"}
          >
            {isLocked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={e => {
          e.stopPropagation();
          onRemoveCourse();
        }}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          <span>
            Time spent: {displayTimeSpent(totalTimeSpent)}
          </span>
        </div>
        
        <div className="flex items-center">
          <Eye className="mr-1 h-3 w-3" />
          <span>
            {viewedLessonsCount} / {totalLessons} viewed
          </span>
        </div>
      </div>
      
      {quizScore.total > 0 && <div className="mt-2 text-xs text-gray-600">
          Quiz Score: {quizScore.score} / {quizScore.total}
        </div>}
      
      {/* Add the new lesson lock accordion */}
      <LessonLockAccordion course={course} studentId={studentId} />
    </div>;
};
export default CourseCard;
