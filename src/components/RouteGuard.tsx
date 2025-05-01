
import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { UserType } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserType[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isCourseLockedForUser } = useData();
  const params = useParams();
  const courseId = params.courseId;

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
    // Check if trying to access a course page
    if (courseId && isAuthenticated && user && user.type === 'student') {
      const isLocked = isCourseLockedForUser(user.id, courseId);
      if (isLocked) {
        toast({
          title: 'Course Locked',
          description: 'This course has been locked by your instructor.',
          variant: 'destructive',
        });
      }
    }
  }, [courseId, isAuthenticated, user, isCourseLockedForUser]);

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

  // Check if the course is locked for this student
  if (courseId && user.type === 'student' && isCourseLockedForUser(user.id, courseId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
