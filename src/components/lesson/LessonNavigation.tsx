
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LessonNavigationProps {
  courseId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  onCompleteLesson: () => void;
  disableCompletion: boolean;
  isNextLessonLocked?: boolean;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({ 
  courseId, 
  prevLesson, 
  nextLesson,
  onCompleteLesson,
  disableCompletion,
  isNextLessonLocked = false
}) => {
  const isMobile = useIsMobile();

  const nextLessonLockMessage = isNextLessonLocked 
    ? "The next lesson is locked by your administrator" 
    : "";
  
  const buttonDisabled = disableCompletion || isNextLessonLocked;
  const buttonTitle = isNextLessonLocked 
    ? nextLessonLockMessage
    : disableCompletion 
      ? "Complete all requirements before continuing" 
      : "Complete and continue to next lesson";

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} mt-8`}>
      {prevLesson ? (
        <Button 
          asChild 
          variant="outline"
          className={`${isMobile ? 'w-full justify-center' : ''}`}
        >
          <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
          </Link>
        </Button>
      ) : (
        <div className={isMobile ? 'hidden' : ''}></div>
      )}
      
      <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
        {nextLesson && (
          <Button 
            onClick={onCompleteLesson}
            disabled={buttonDisabled}
            title={buttonTitle}
            className={`${isMobile ? 'w-full justify-center' : ''}`}
          >
            {isNextLessonLocked ? (
              <>Complete <Lock className="ml-2 h-4 w-4" /></>
            ) : (
              <>Complete & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        )}
        
        {!nextLesson && (
          <Button 
            onClick={onCompleteLesson}
            disabled={disableCompletion}
            title={disableCompletion ? "Complete all requirements before finishing" : "Complete the course"}
            className={`${isMobile ? 'w-full justify-center' : ''}`}
          >
            Complete Course <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;
