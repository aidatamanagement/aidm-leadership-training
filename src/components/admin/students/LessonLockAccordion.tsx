
import React, { useState, useEffect } from 'react';
import { Course, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const { toggleLessonLock, isLessonLocked, fetchLessonLocks } = useData();
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [lessonLockStates, setLessonLockStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load lesson lock states when accordion is first opened
  useEffect(() => {
    const loadLockStates = async () => {
      if (!studentId || !course || !course.id) {
        setError("Missing required data");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch lock states from the database
        const locks = await fetchLessonLocks(studentId, course.id);
        setLessonLockStates(locks);
      } catch (error) {
        console.error('Error loading lesson locks:', error);
        setError("Failed to load lesson lock statuses");
        toast({
          title: "Error",
          description: "Failed to load lesson lock statuses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLockStates();
  }, [studentId, course?.id, fetchLessonLocks]);
  
  const handleToggleLock = async (lessonId: string) => {
    try {
      setLoadingLessonId(lessonId);
      
      // Toggle the lesson lock
      const newLockStatus = await toggleLessonLock(studentId, course.id, lessonId);
      
      // Update the local state
      setLessonLockStates(prev => ({
        ...prev,
        [lessonId]: newLockStatus
      }));
      
      toast({
        title: newLockStatus ? "Lesson Locked" : "Lesson Unlocked",
        description: `The lesson has been ${newLockStatus ? "locked" : "unlocked"} for this student.`,
      });
    } catch (error) {
      console.error('Error toggling lesson lock:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson lock status.",
        variant: "destructive",
      });
    } finally {
      setLoadingLessonId(null);
    }
  };

  const isLocked = (lessonId: string) => {
    return lessonLockStates[lessonId] || false;
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error || "An error occurred"}</p>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={() => {
            setIsLoading(true);
            fetchLessonLocks(studentId, course.id)
              .then(locks => {
                setLessonLockStates(locks);
                setError(null);
              })
              .catch(() => {
                setError("Failed to reload lesson locks");
              })
              .finally(() => setIsLoading(false));
          }}
        >
          Try Again
        </Button>
      </div>
    );
  };
  
  // Render empty state
  const renderEmpty = () => {
    return (
      <p className="text-sm text-gray-500 text-center py-4">No lessons available in this course.</p>
    );
  };
  
  // Render lessons list
  const renderLessons = () => {
    return (
      <ScrollArea className="max-h-60 pr-4">
        <div className="space-y-2 pb-2">
          {course.lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                  <p className="text-xs text-gray-500">Lesson {lesson.order}</p>
                </div>
                <Button
                  size="sm"
                  variant={isLocked(lesson.id) ? "destructive" : "outline"}
                  onClick={() => handleToggleLock(lesson.id)}
                  disabled={loadingLessonId === lesson.id}
                  className="shrink-0"
                >
                  {loadingLessonId === lesson.id ? (
                    <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-current rounded-full" />
                  ) : isLocked(lesson.id) ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <LockOpen className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
    );
  };
  
  // Main render method
  return (
    <Accordion type="single" collapsible className="mt-4 border-t pt-2">
      <AccordionItem value="lesson-lock">
        <AccordionTrigger className="text-sm font-medium">
          Lock a lesson
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? renderLoading() : 
           error ? renderError() : 
           !course || !course.lessons || course.lessons.length === 0 ? renderEmpty() : 
           renderLessons()}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LessonLockAccordion;
