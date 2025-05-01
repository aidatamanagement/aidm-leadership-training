
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { formatTimeSpent } from '@/lib/utils';

interface LessonHeaderProps {
  courseId: string;
  lessonTitle: string;
  lessonDescription: string;
  timeSpent: number;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  courseId, 
  lessonTitle, 
  lessonDescription,
  timeSpent 
}) => {
  return (
    <div className="mb-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={`/courses/${courseId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lessonTitle}
          </h1>
          <p className="text-gray-600">{lessonDescription}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          <span>Time spent: {formatTimeSpent(timeSpent)}</span>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
