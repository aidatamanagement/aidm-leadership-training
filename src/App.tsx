
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { PreviewProvider } from "@/contexts/PreviewContext";
import RouteGuard from "@/components/RouteGuard";

// Pages
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import CourseCompletion from "./pages/CourseCompletion";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

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
            <PreviewProvider>
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
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <RouteGuard allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </RouteGuard>
                  } 
                />
                
                {/* Not found route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </PreviewProvider>
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return <Navigate to={user.type === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <Login />;
};

export default App;
