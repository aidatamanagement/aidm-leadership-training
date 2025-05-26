import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStudentManagement from '@/components/admin/students/AdminStudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseManagement from '@/components/admin/courses/CourseManagement';
import QuizManagementTab from '@/components/admin/quizzes/QuizManagementTab';
import ServiceManagement from '@/components/admin/ServiceManagement';
import { useNavigate } from 'react-router-dom';

// Main Admin Dashboard
const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
  const [activeTab, setActiveTab] = useState("courses");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
            onClick={() => navigate('/admin/add-user')}
          >
            + Add New User
          </button>
        </div>
        
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full md:w-fit flex-wrap">
            <TabsTrigger value="courses" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Course Management</TabsTrigger>
            <TabsTrigger value="students" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Student Services</TabsTrigger>
            <TabsTrigger value="quizzes" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Quiz Management</TabsTrigger>
            <TabsTrigger value="services" className="flex-grow md:flex-grow-0 mb-2 md:mb-0">Service Management</TabsTrigger>
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
          
          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
