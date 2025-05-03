
import React, { useEffect, useState } from 'react';
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
  const [isLessonAccessBlocked, setIsLessonAccessBlocked] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    // Check role permissions
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.type) && user.type !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

  // Check for lesson lock status
  useEffect(() => {
    const checkLessonLock = async () => {
      if (!user || !courseId || !lessonId) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        setIsCheckingAccess(true);
        
        if (user.type === 'student') {
          const isLocked = await isLessonLocked(user.id, courseId, lessonId);
          
          if (isLocked) {
            toast({
              title: 'Lesson Locked',
              description: 'This lesson has been locked by your administrator.',
              variant: 'destructive',
            });
            setIsLessonAccessBlocked(true);
          } else {
            setIsLessonAccessBlocked(false);
          }
        }
      } catch (error) {
        console.error('Error checking lesson lock:', error);
        setIsLessonAccessBlocked(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };
    
    checkLessonLock();
  }, [user, courseId, lessonId, isLessonLocked]);

  // Show loading state while checking locks or auth
  if (isLoading || (user?.type === 'student' && courseId && lessonId && isCheckingAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle unauthenticated users
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

  // Check if the lesson is locked
  if (user.type === 'student' && courseId && lessonId && isLessonAccessBlocked) {
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
