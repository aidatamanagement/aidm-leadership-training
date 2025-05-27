import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useCourses } from '@/contexts/CourseContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useStudents } from '@/contexts/StudentContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import CourseHeader from '@/components/course/CourseHeader';
import LessonList from '@/components/course/LessonList';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { courses } = useCourses();
  const { isLessonLocked } = useStudents();
  const { 
    getStudentProgress, 
    getTotalQuizScore,
    isLessonAccessible,
    isCourseLockedForUser
  } = useProgress();
  const { isLoading } = useData();
  const isMobile = useIsMobile();

  const [course, setCourse] = useState(courses.find(c => c.id === courseId));
  const [lessonAccessibility, setLessonAccessibility] = useState<Record<string, boolean>>({});
  const [loadingAccessibility, setLoadingAccessibility] = useState(false);
  const isAdmin = user?.type === 'admin';

  useEffect(() => {
    setCourse(courses.find(c => c.id === courseId));
  }, [courses, courseId]);

  useEffect(() => {
    const checkLessonAccessibility = async () => {
      if (!course || !user) return;
      
      setLoadingAccessibility(true);
      try {
        const accessibility: Record<string, boolean> = {};
        
        // First, check all lesson locks
        for (const lesson of course.lessons) {
          const isLocked = await isLessonLocked(user.id, course.id, lesson.id);
          accessibility[lesson.id] = !isLocked;
        }
        
        // Then, check sequential access for unlocked lessons
        for (const lesson of course.lessons) {
          if (lesson.order === 1) {
            // First lesson is accessible unless explicitly locked
            continue;
          }
          
          // If the lesson is locked, skip checking sequential access
          if (!accessibility[lesson.id]) continue;
          
          // Check if previous lesson is completed
          const prevLesson = course.lessons.find(l => l.order === lesson.order - 1);
          if (!prevLesson) continue;
          
          const prevLessonProgress = getStudentProgress(user.id, course.id)
            .find(p => p.lessonId === prevLesson.id);
          
          // If previous lesson is not completed, mark current lesson as inaccessible
          if (!prevLessonProgress?.completed) {
            accessibility[lesson.id] = false;
          }
        }
        
        setLessonAccessibility(accessibility);
      } catch (error) {
        console.error('Error checking lesson accessibility:', error);
        toast({
          title: 'Error',
          description: 'Failed to check lesson accessibility',
          variant: 'destructive'
        });
      } finally {
        setLoadingAccessibility(false);
      }
    };

    checkLessonAccessibility();
  }, [course, user, courses, getStudentProgress, isLessonLocked]);

  if (!course) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
            <Button asChild className="mt-4">
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isCourseLocked = isCourseLockedForUser(user?.id || '', course.id);
  const quizScore = getTotalQuizScore(user?.id || '', course.id);

  if (isCourseLocked && !isAdmin) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Course Locked</h1>
            <p className="text-gray-600 mt-2">This course has been locked by your instructor.</p>
            <Button asChild className="mt-4">
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CourseHeader
          course={course}
          quizScore={quizScore}
          isMobile={isMobile}
        />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          <LessonList
            course={course}
            lessons={course.lessons}
            studentProgress={getStudentProgress(user?.id || '', course.id)}
            quizScores={quizScore}
            isAdmin={isAdmin}
            lessonAccessibility={lessonAccessibility}
            loadingAccessibility={loadingAccessibility}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetails;
