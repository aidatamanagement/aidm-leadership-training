
import React, { useState, useEffect } from 'react';
import { Course, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const { toggleLessonLock, isLessonLocked, fetchLessonLocks } = useData();
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [lessonLockStates, setLessonLockStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load lesson lock states when accordion is first opened
  useEffect(() => {
    const loadLockStates = async () => {
      try {
        setIsLoading(true);
        const locks = await fetchLessonLocks(studentId, course.id);
        setLessonLockStates(locks);
      } catch (error) {
        console.error('Error loading lesson locks:', error);
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
  }, [studentId, course.id, fetchLessonLocks]);
  
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
  
  return (
    <Accordion type="single" collapsible className="mt-4 border-t pt-2">
      <AccordionItem value="lesson-lock">
        <AccordionTrigger className="text-sm font-medium">
          Lock individual lessons
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : course.lessons && course.lessons.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3 pr-3">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <Card key={lesson.id} className="flex items-center justify-between p-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-gray-500">Lesson {lesson.order}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={isLocked(lesson.id) ? "destructive" : "outline"}
                        onClick={() => handleToggleLock(lesson.id)}
                        disabled={loadingLessonId === lesson.id}
                        className="ml-2 min-w-[32px]"
                      >
                        {loadingLessonId === lesson.id ? (
                          <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-current rounded-full" />
                        ) : isLocked(lesson.id) ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <LockOpen className="h-3 w-3" />
                        )}
                      </Button>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-gray-500 py-2">No lessons available in this course.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LessonLockAccordion;
