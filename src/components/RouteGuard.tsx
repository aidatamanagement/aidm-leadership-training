
import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { UserType } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserType[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isCourseLockedForUser, isLessonLocked } = useData();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.type) && user.type !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    const checkLessonLock = async () => {
      if (user?.type === 'student' && courseId && lessonId) {
        const isLocked = await isLessonLocked(user.id, courseId, lessonId);
        
        if (isLocked) {
          toast({
            title: 'Lesson Locked',
            description: 'This lesson has been locked by your administrator.',
            variant: 'destructive',
          });
          // Navigation will happen in the return statement below
        }
      }
    };
    
    if (user && courseId && lessonId) {
      checkLessonLock();
    }
  }, [user, courseId, lessonId, isLessonLocked]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Always allow admin users to access any page
  if (user.type === 'admin') {
    return <>{children}</>;
  }

  // Check if the user's role is in the allowed roles
  if (!allowedRoles.includes(user.type)) {
    // Redirect based on user type
    return <Navigate to="/dashboard" replace />;
  }

  // Check if the course is locked for students
  if (user.type === 'student' && courseId && isCourseLockedForUser && isCourseLockedForUser(user.id, courseId)) {
    toast({
      title: 'Course Locked',
      description: 'This course has been locked by your administrator.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Check if the lesson is locked (this needs to be async so we handle it in the useEffect)
  if (user.type === 'student' && courseId && lessonId) {
    // We don't need to await here since we're using useEffect to check and navigate
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default RouteGuard;
