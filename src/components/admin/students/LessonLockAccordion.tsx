
import React, { useState, useEffect } from 'react';
import { Course, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const { toggleLessonLock, fetchLessonLocks } = useData();
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [lessonLockStates, setLessonLockStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Load lesson lock states when accordion is opened
  useEffect(() => {
    if (!isExpanded || !studentId || !course?.id) {
      return;
    }
    
    const loadLockStates = async () => {
      if (!studentId || !course?.id) {
        setError("Missing required data");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching lesson locks for student:", studentId, "and course:", course.id);
        // Fetch lock states from the database
        const locks = await fetchLessonLocks(studentId, course.id);
        console.log("Fetched lesson locks:", locks);
        setLessonLockStates(locks || {});
      } catch (error) {
        console.error('Error loading lesson locks:', error);
        setError("Failed to load lesson lock statuses");
        toast({
          title: "Error",
          description: "Failed to load lesson lock statuses",
          variant: "destructive",
        });
      } finally {
        setHasAttemptedLoad(true);
        setIsLoading(false);
      }
    };

    loadLockStates();
  }, [studentId, course?.id, fetchLessonLocks, isExpanded]);
  
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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <Card className="p-4 text-center">
        <p className="text-red-500 mb-2">{error || "An error occurred"}</p>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={() => {
            setIsLoading(true);
            setHasAttemptedLoad(false);
            fetchLessonLocks(studentId, course.id)
              .then(locks => {
                setLessonLockStates(locks || {});
                setError(null);
              })
              .catch((err) => {
                console.error("Error reloading locks:", err);
                setError("Failed to reload lesson locks");
              })
              .finally(() => {
                setHasAttemptedLoad(true);
                setIsLoading(false);
              });
          }}
        >
          Try Again
        </Button>
      </Card>
    );
  };
  
  // Render empty state
  const renderEmpty = () => {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-500 text-center">No lessons available in this course.</p>
      </Card>
    );
  };
  
  // Render lessons list
  const renderLessons = () => {
    if (!course?.lessons || course.lessons.length === 0) {
      return renderEmpty();
    }

    return (
      <ScrollArea className="max-h-60">
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
    <Accordion 
      type="single" 
      collapsible 
      className="mt-4 border-t pt-2"
      onValueChange={(value) => {
        setIsExpanded(!!value);
        if (!!value && !hasAttemptedLoad) {
          // Only trigger a load if we haven't attempted to load yet
          setHasAttemptedLoad(false);
        }
      }}
    >
      <AccordionItem value="lesson-lock">
        <AccordionTrigger className="text-sm font-medium">
          Lock a lesson
        </AccordionTrigger>
        <AccordionContent>
          <div className="min-h-[100px]">
            {isLoading ? renderLoading() : 
             error ? renderError() : 
             renderLessons()}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LessonLockAccordion;
