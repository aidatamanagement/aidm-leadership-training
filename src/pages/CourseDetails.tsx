
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import CourseHeader from '@/components/course/CourseHeader';
import LessonList from '@/components/course/LessonList';
import { useIsMobile } from '@/hooks/use-mobile';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { 
    courses, 
    isLessonAccessible, 
    getStudentProgress,
    getTotalQuizScore,
    isCourseLockedForUser,
    isLessonLocked,
    isLoading
  } = useData();
  const isMobile = useIsMobile();

  const [course, setCourse] = useState(courses.find(c => c.id === courseId));
  const [lessonLocks, setLessonLocks] = useState<Record<string, boolean>>({});
  const [loadingLocks, setLoadingLocks] = useState(false);
  const isAdmin = user?.type === 'admin';

  useEffect(() => {
    setCourse(courses.find(c => c.id === courseId));
  }, [courses, courseId]);

  // Load lesson locks when component mounts
  useEffect(() => {
    if (!user || !courseId || isAdmin) return;

    const loadLessonLocks = async () => {
      try {
        setLoadingLocks(true);
        // For each lesson, check if it's locked
        if (course) {
          const lockPromises = course.lessons.map(async (lesson) => {
            const isLocked = await isLessonLocked(user.id, courseId, lesson.id);
            return { lessonId: lesson.id, isLocked };
          });
          
          const results = await Promise.all(lockPromises);
          
          const lockMap: Record<string, boolean> = {};
          results.forEach(({ lessonId, isLocked }) => {
            lockMap[lessonId] = isLocked;
          });
          
          setLessonLocks(lockMap);
        }
      } catch (error) {
        console.error('Error loading lesson locks:', error);
      } finally {
        setLoadingLocks(false);
      }
    };
    
    loadLessonLocks();
  }, [user, courseId, course, isAdmin, isLessonLocked]);

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const currentStudent = user;
  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you are looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const quizScore = getTotalQuizScore(user.id, course.id);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <CourseHeader 
          courseTitle={course.title}
          courseDescription={course.description}
          isAdmin={isAdmin}
          quizScore={quizScore}
          isMobile={isMobile}
        />
        
        <h2 className="text-xl font-bold mb-4">Course Content</h2>
        
        <LessonList
          lessons={course.lessons}
          courseId={course.id}
          userId={user.id}
          isAdmin={isAdmin}
          isMobile={isMobile}
          getStudentProgress={(userId, courseId) => getStudentProgress(userId, courseId)}
          isLessonAccessible={isLessonAccessible}
          lessonLocks={lessonLocks}
        />
      </div>
    </AppLayout>
  );
};

export default CourseDetails;
