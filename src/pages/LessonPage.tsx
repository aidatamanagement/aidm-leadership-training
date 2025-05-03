
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

// Import refactored components
import LessonHeader from '@/components/lesson/LessonHeader';
import LessonContent from '@/components/lesson/LessonContent';
import LessonError from '@/components/lesson/LessonError';
import LessonLoading from '@/components/lesson/LessonLoading';

// Import custom hooks
import { useLessonData } from '@/hooks/useLessonData';
import { useLessonTimer } from '@/hooks/useLessonTimer';
import { useData } from '@/contexts/DataContext';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { updateTimeSpent } = useData();
  
  // Get lesson data from our custom hook
  const { course, lesson, progress } = useLessonData();
  
  // Use our timer hook for the lesson - properly imported at the top
  const { totalTimeSpent } = (course && lesson && user) ? 
    useLessonTimer({
      userId: user.id,
      courseId: courseId!,
      lessonId: lessonId!,
      initialTimeSpent: progress?.timeSpent || 0,
      updateTimeSpent: updateTimeSpent,
      saveIntervalSeconds: 30
    }) : { totalTimeSpent: 0 };

  // Set initial loading state
  useEffect(() => {
    // Show loading state initially
    setIsLoading(true);
    
    // Check if we have all required data
    if (course && lesson && user) {
      // Add a small delay to prevent flickering for quick loads
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // When URL parameters change, reset loading state
  }, [courseId, lessonId, course, lesson, user]);

  // Show loading state if still loading
  if (isLoading) {
    return <LessonLoading />;
  }

  // Handle missing data or access errors
  if (!user || !course || !lesson) {
    return <LessonError />;
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <LessonHeader
          courseId={courseId!}
          lessonTitle={lesson.title}
          lessonDescription={lesson.description}
          timeSpent={totalTimeSpent}
        />
        
        <LessonContent 
          courseId={courseId!} 
          lessonId={lessonId!} 
        />
      </div>
    </AppLayout>
  );
};

export default LessonPage;
