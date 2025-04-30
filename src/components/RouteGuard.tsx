
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserType } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserType[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = []
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.type)) {
    // User is authenticated but doesn't have the required role
    return user.type === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default RouteGuard;
