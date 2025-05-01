
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'student')[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.type as 'admin' | 'student') && user.type !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

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
  if (!allowedRoles.includes(user.type as 'admin' | 'student')) {
    // Redirect to dashboard for non-admin users
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
