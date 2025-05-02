
import React, { useState } from 'react';
import { Course, Lesson, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const { toggleCourseLock, progress } = useData();
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  
  const isLessonLocked = (lessonId: string) => {
    const lessonProgress = progress.find(p => 
      p.userId === studentId && 
      p.courseId === course.id &&
      p.lessonId === lessonId
    );
    return lessonProgress?.locked || false;
  };

  const handleToggleLock = async (lessonId: string) => {
    try {
      setLoadingLessonId(lessonId);
      // Note: We currently only have a course-level lock function
      // In a real implementation, this would be a lesson-level lock function
      await toggleCourseLock(studentId, course.id);
      toast({
        title: isLessonLocked(lessonId) ? "Lesson Unlocked" : "Lesson Locked",
        description: `The lesson has been ${isLessonLocked(lessonId) ? "unlocked" : "locked"} for this student.`,
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
  
  return (
    <Accordion type="single" collapsible className="mt-4 border-t pt-2">
      <AccordionItem value="lesson-lock">
        <AccordionTrigger className="text-sm font-medium">
          Lock a lesson
        </AccordionTrigger>
        <AccordionContent>
          {course.lessons.length === 0 ? (
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
                      variant={isLessonLocked(lesson.id) ? "destructive" : "outline"}
                      onClick={() => handleToggleLock(lesson.id)}
                      disabled={loadingLessonId === lesson.id}
                    >
                      {isLessonLocked(lesson.id) ? (
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
