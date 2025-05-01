
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import RouteGuard from "@/components/RouteGuard";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import CourseCompletion from "./pages/CourseCompletion";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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
              
              {/* Redirect to dashboard if logged in */}
              <Route 
                path="/" 
                element={<RedirectIfAuthenticated />} 
              />
              
              {/* Not found route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Helper component to redirect if already logged in
const RedirectIfAuthenticated = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to={user.type === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <Login />;
};

export default App;
