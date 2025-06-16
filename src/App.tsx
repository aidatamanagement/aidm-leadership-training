import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import RouteGuard from "@/components/RouteGuard";
import { DynamicBackground } from "@/components/DynamicBackground";
import { GlassCard } from "@/components/ui/glass-card";
import AppLayout from '@/components/AppLayout';
import AdminStudentManagement from '@/components/admin/students/AdminStudentManagement';
import ServiceManagement from '@/components/admin/ServiceManagement';

// Pages
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import CourseCompletion from "./pages/CourseCompletion";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Prompts from "./pages/Prompts";
import Courses from "./pages/Courses";
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import AddUserPage from './pages/AddUserPage';
import StudentFiles from './pages/StudentFiles';
import StudentDetails from './pages/StudentDetails'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <DynamicBackground>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RedirectIfAuthenticated />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              
              {/* Student routes */}
              <Route 
                path="/dashboard" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <StudentDashboard />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/courses" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <Courses />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/courses/:courseId" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <CourseDetails />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/courses/:courseId/lessons/:lessonId" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <LessonPage />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/courses/:courseId/completion" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <CourseCompletion />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/student/files" 
                element={
                  <RouteGuard allowedRoles={["student"]}>
                    <StudentFiles />
                  </RouteGuard>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <RouteGuard allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/admin/add-user" 
                element={
                  <RouteGuard allowedRoles={["admin"]}>
                    <AddUserPage />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/admin/students/:id" 
                element={
                  <RouteGuard allowedRoles={["admin"]}>
                    <StudentDetails />
                  </RouteGuard>
                } 
              />
              <Route path="/admin/student-services" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminStudentManagement />
                  </AdminRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/service-management" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <ServiceManagement />
                  </AdminRoute>
                </ProtectedRoute>
              } />

                {/* Profile route - accessible by both admin and student */}
                <Route 
                  path="/profile" 
                  element={
                    <RouteGuard allowedRoles={["admin", "student"]}>
                      <Profile />
                    </RouteGuard>
                  } 
                />

                {/* Prompts route - accessible by both admin and student */}
                <Route 
                  path="/admin/prompts" 
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <Prompts />
                      </AdminRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/prompts" 
                  element={
                    <ProtectedRoute>
                      <Prompts />
                    </ProtectedRoute>
                } 
              />
              
              {/* Services routes */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              
              {/* Not found route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
            </DynamicBackground>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Helper component to redirect if already logged in
const RedirectIfAuthenticated = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
        </GlassCard>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return <Navigate to={user.type === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <Login />;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user?.type !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default App;
