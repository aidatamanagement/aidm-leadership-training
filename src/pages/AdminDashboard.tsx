import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStudentManagement from '@/components/admin/students/AdminStudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseManagement from '@/components/admin/courses/CourseManagement';
import { useNavigate } from 'react-router-dom';

// Main Admin Dashboard
const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
  const [activeTab, setActiveTab] = useState('courses');
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
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full md:w-[200px]">
            <TabsTrigger value="courses" className="w-full">Course Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-4">
            <CourseManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
