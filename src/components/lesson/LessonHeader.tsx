
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatTimeSpent } from '@/lib/timeUtils';

interface LessonHeaderProps {
  courseId: string;
  lessonTitle: string;
  lessonDescription: string;
  timeSpent: number;
  formattedTimeSpent?: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  courseId, 
  lessonTitle, 
  lessonDescription, 
  timeSpent,
  formattedTimeSpent 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Link to={`/courses/${courseId}`} className="hover:underline">
          Back to Course
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{lessonTitle}</h1>
      
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600">
          Time spent: {formattedTimeSpent || formatTimeSpent(timeSpent)}
        </span>
      </div>
      
      <p className="text-gray-700">{lessonDescription}</p>
    </div>
  );
};

export default LessonHeader;
