
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStudentManagement from '@/components/admin/students/AdminStudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseManagement from '@/components/admin/courses/CourseManagement';
import QuizManagementTab from '@/components/admin/quizzes/QuizManagementTab';

// Main Admin Dashboard
const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
  const [activeTab, setActiveTab] = useState("courses");
  const isMobile = useIsMobile();
  
  if (isLoading || dataLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full md:w-fit flex-wrap">
            <TabsTrigger value="courses" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Course Management</TabsTrigger>
            <TabsTrigger value="students" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Student Management</TabsTrigger>
            <TabsTrigger value="quizzes" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Quiz Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>
          
          <TabsContent value="students">
            <AdminStudentManagement />
          </TabsContent>
          
          <TabsContent value="quizzes">
            <QuizManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
