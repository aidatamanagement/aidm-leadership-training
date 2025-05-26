import React, { useState, useEffect } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { useCourses } from '@/contexts/CourseContext';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the smaller components
import StudentList from './StudentList';
import AddStudentDialog from './AddStudentDialog';
import EditStudentDialog from './EditStudentDialog';
import AssignCourseDialog from './AssignCourseDialog';

const AdminStudentManagement: React.FC = () => {
  const { students, refreshStudents } = useStudents();
  const { courses } = useCourses();
  const { services, isLoading: servicesLoading } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    if (selectedStudent) {
      const fetchAssignedServices = async () => {
        const { data: serviceData, error: serviceError } = await supabase
          .from<any, any>('user_services')
          .select('service_id')
          .eq('user_id', selectedStudent.id);

        if (serviceError) {
          console.error('Error fetching assigned services:', serviceError);
          setSelectedServices([]); // Clear on error
          return;
        }

        const ids = Array.isArray(serviceData)
          ? serviceData.map((s: any) => String(s.service_id))
          : [];
        setSelectedServices(ids);
        console.log('Fetched service IDs:', ids, 'All services:', services);
      };

      fetchAssignedServices();
    } else {
      setSelectedServices([]); // Clear when no student is selected
    }
  }, [selectedStudent, services.length]);

  const handleSaveAssignments = async () => {
    if (!selectedStudent) return;

    try {
      // Handle service assignments
      const { error: serviceError } = await supabase
        .from<any, any>('user_services')
        .delete()
        .eq('user_id', selectedStudent.id);

      if (serviceError) throw serviceError;

      if (selectedServices.length > 0) {
        const { error: insertServiceError } = await supabase
          .from<any, any>('user_services')
          .insert(
            selectedServices.map(serviceId => ({
              user_id: selectedStudent.id,
              service_id: serviceId
            }))
          );

        if (insertServiceError) throw insertServiceError;
      }

      toast({
        title: 'Assignments Updated',
        description: 'Service assignments have been updated successfully.'
      });

      refreshStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update assignments',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Services</h2>
        <div className="w-64">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Students</h3>
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedStudent?.id === student.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {selectedStudent && servicesLoading ? (
          <div className="p-6 text-center">Loading services...</div>
        ) : selectedStudent && (
          <div>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Service Assignments for {selectedStudent.email}
              </h3>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(String(service.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedServices([...selectedServices, String(service.id)]);
                        } else {
                          setSelectedServices(selectedServices.filter(id => id !== String(service.id)));
                        }
                      }}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {service.title}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button onClick={handleSaveAssignments}>
                  Save Service Assignments
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentManagement;
