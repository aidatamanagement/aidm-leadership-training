
import React, { useState, useEffect, useRef } from 'react';
import { Course, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const { toggleLessonLock, fetchLessonLocks } = useData();
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [lessonLockStates, setLessonLockStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  
  // Load lesson lock states when accordion is opened
  useEffect(() => {
    if (!isOpen) return;
    if (hasLoadedRef.current) return;
    
    const loadLockStates = async () => {
      try {
        setError(null);
        setIsLoading(true);
        console.log("Fetching lesson locks for student:", studentId, "course:", course.id);
        const locks = await fetchLessonLocks(studentId, course.id);
        console.log("Received locks:", locks);
        setLessonLockStates(locks);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading lesson locks:', error);
        setError('Failed to load lesson lock statuses');
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
  }, [studentId, course.id, fetchLessonLocks, isOpen]);
  
  const handleToggleLock = async (lessonId: string) => {
    try {
      setLoadingLessonId(lessonId);
      // Now we're using the lesson-level locking function
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

  const handleAccordionChange = (value: string) => {
    const newIsOpen = value === "lesson-lock";
    setIsOpen(newIsOpen);
  };
  
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="mt-4 border-t pt-2"
      onValueChange={handleAccordionChange}
    >
      <AccordionItem value="lesson-lock" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium">
          Lock a lesson
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div className="flex flex-col space-y-2 min-h-[100px]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
              <Button 
                onClick={() => {
                  hasLoadedRef.current = false;
                  setIsOpen(true);
                }} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : course.lessons.length === 0 ? (
            <p className="text-sm text-gray-500">No lessons available in this course.</p>
          ) : (
            <div className="space-y-2">
              {course.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lesson.title}</p>
                      <p className="text-xs text-gray-500">Lesson {lesson.order}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isLocked(lesson.id) ? "destructive" : "outline"}
                      onClick={() => handleToggleLock(lesson.id)}
                      disabled={loadingLessonId === lesson.id}
                    >
                      {loadingLessonId === lesson.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-b-transparent" />
                      ) : isLocked(lesson.id) ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <LockOpen className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LessonLockAccordion;
