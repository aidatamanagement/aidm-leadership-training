import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LessonNavigationProps {
  courseId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  onCompleteLesson: () => Promise<void>;
  disableCompletion?: boolean;
  isNextLessonLocked?: boolean;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  courseId,
  prevLesson,
  nextLesson,
  onCompleteLesson,
  disableCompletion = false,
  isNextLessonLocked = false
}) => {
  const navigate = useNavigate();

  const handleComplete = async () => {
    try {
      await onCompleteLesson();
      // Navigate back to lesson list
      navigate(`/courses/${courseId}`);
      toast({
        title: 'Lesson Completed',
        description: 'You have successfully completed this lesson.'
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete lesson. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteAndContinue = async () => {
    try {
      await onCompleteLesson();
      if (nextLesson) {
        navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete lesson. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getDisableReason = () => {
    if (disableCompletion) {
      return 'Complete all required activities to continue';
    }
    if (isNextLessonLocked) {
      return 'Next lesson is locked';
    }
    return '';
  };

  const disableReason = getDisableReason();

  return (
    <div className="flex items-center justify-between mt-8">
      <Button
        variant="outline"
        onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson?.id}`)}
        disabled={!prevLesson}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {prevLesson ? `Previous: ${prevLesson.title}` : 'No Previous Lesson'}
      </Button>

      <div className="flex items-center gap-4">
        {disableReason && (
          <span className="text-sm text-muted-foreground">{disableReason}</span>
        )}
        
        {isNextLessonLocked ? (
          <Button
            onClick={handleComplete}
            disabled={disableCompletion}
          >
            Complete
          </Button>
        ) : (
          <Button
            onClick={handleCompleteAndContinue}
            disabled={disableCompletion}
          >
            Complete & Continue
            {nextLesson && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;
