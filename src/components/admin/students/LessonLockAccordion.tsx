import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Course } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Lock, Unlock } from 'lucide-react';

interface LessonLockAccordionProps {
  course: Course;
  studentId: string;
}

const LessonLockAccordion: React.FC<LessonLockAccordionProps> = ({ course, studentId }) => {
  const [lockedLessons, setLockedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch locked lessons on component mount
  React.useEffect(() => {
    const fetchLockedLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('user_lesson_locks')
          .select('lesson_id')
          .eq('user_id', studentId)
          .eq('course_id', course.id);

        if (error) throw error;

        const lockedIds = new Set(data.map(item => item.lesson_id));
        setLockedLessons(lockedIds);
      } catch (error) {
        console.error('Error fetching locked lessons:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch lesson lock status',
          variant: 'destructive'
        });
      }
    };

    fetchLockedLessons();
  }, [course.id, studentId]);

  const toggleLessonLock = async (lessonId: string) => {
    setLoading(true);
    try {
      const isCurrentlyLocked = lockedLessons.has(lessonId);
      
      if (isCurrentlyLocked) {
        // Remove lock
        const { error } = await supabase
          .from('user_lesson_locks')
          .delete()
          .eq('user_id', studentId)
          .eq('course_id', course.id)
          .eq('lesson_id', lessonId);

        if (error) throw error;
        
        setLockedLessons(prev => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });

        toast({
          title: 'Lesson Unlocked',
          description: 'Student can now access this lesson'
        });
      } else {
        // Add lock
        const { error } = await supabase
          .from('user_lesson_locks')
          .insert({
            user_id: studentId,
            course_id: course.id,
            lesson_id: lessonId
          });

        if (error) throw error;
        
        setLockedLessons(prev => new Set([...prev, lessonId]));

        toast({
          title: 'Lesson Locked',
          description: 'Student cannot access this lesson'
        });
      }
    } catch (error) {
      console.error('Error toggling lesson lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lesson lock status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="mt-4">
      <AccordionItem value="lessons">
        <AccordionTrigger className="text-sm font-medium">
          Lesson Access Control
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lesson-${lesson.id}`}
                    checked={lockedLessons.has(lesson.id)}
                    onCheckedChange={() => toggleLessonLock(lesson.id)}
                    disabled={loading}
                  />
                  <label
                    htmlFor={`lesson-${lesson.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {lesson.title}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLessonLock(lesson.id)}
                  disabled={loading}
                >
                  {lockedLessons.has(lesson.id) ? (
                    <Lock className="h-4 w-4 text-red-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LessonLockAccordion;
