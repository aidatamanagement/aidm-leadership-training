
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface LessonNavigationProps {
  courseId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  onCompleteLesson: () => void;
  disableCompletion: boolean;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({ 
  courseId, 
  prevLesson, 
  nextLesson,
  onCompleteLesson,
  disableCompletion
}) => {
  return (
    <div className="flex justify-between mt-8">
      {prevLesson ? (
        <Button asChild variant="outline">
          <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
          </Link>
        </Button>
      ) : (
        <div></div>
      )}
      
      <div className="flex gap-3">
        {nextLesson && (
          <Button 
            onClick={onCompleteLesson}
            disabled={disableCompletion}
            title={disableCompletion ? "Complete all requirements before continuing" : "Complete and continue to next lesson"}
          >
            Complete & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {!nextLesson && (
          <Button 
            onClick={onCompleteLesson}
            disabled={disableCompletion}
            title={disableCompletion ? "Complete all requirements before finishing" : "Complete the course"}
          >
            Complete Course <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;
