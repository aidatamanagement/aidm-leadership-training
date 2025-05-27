import React, { useState, useEffect } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { useCourses } from '@/contexts/CourseContext';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lock, Unlock, CheckCircle } from 'lucide-react';

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
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [lockedLessons, setLockedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
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
          setSelectedServices([]);
          return;
        }

        const ids = Array.isArray(serviceData)
          ? serviceData.map((s: any) => String(s.service_id))
          : [];
        setSelectedServices(ids);
      };

      fetchAssignedServices();
    } else {
      setSelectedServices([]);
    }
  }, [selectedStudent, services.length]);

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      const fetchLockedLessons = async () => {
        try {
          const { data, error } = await supabase
            .from('user_lesson_locks')
            .select('lesson_id')
            .eq('user_id', selectedStudent.id)
            .eq('course_id', selectedCourse);

          if (error) throw error;

          const lockedIds = new Set(data.map(item => item.lesson_id));
          setLockedLessons(lockedIds);
        } catch (error) {
          console.error('Error fetching locked lessons:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch lesson lock status',
            variant: 'destructive'
          });
        }
      };

      fetchLockedLessons();
    } else {
      setLockedLessons(new Set());
    }
  }, [selectedStudent, selectedCourse]);

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

  const handleAssignCourse = async () => {
    if (!selectedStudent || !selectedCourse) return;

    try {
      const { error } = await supabase
        .from('user_course_assignments')
        .insert({
          user_id: selectedStudent.id,
          course_id: selectedCourse
        });

      if (error) throw error;

      toast({
        title: 'Course Assigned',
        description: 'Course has been assigned to the student successfully.'
      });

      refreshStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign course',
        variant: 'destructive',
      });
    }
  };

  const toggleLessonLock = async (lessonId: string) => {
    if (!selectedStudent || !selectedCourse) return;

    setLoading(true);
    try {
      const isCurrentlyLocked = lockedLessons.has(lessonId);
      
      if (isCurrentlyLocked) {
        // Remove lock
        const { error } = await supabase
          .from('user_lesson_locks')
          .delete()
          .eq('user_id', selectedStudent.id)
          .eq('course_id', selectedCourse)
          .eq('lesson_id', lessonId);

        if (error) throw error;
        
        setLockedLessons(prev => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });

        toast({
          title: 'Lesson Unlocked',
          description: 'Student can now access this lesson'
        });
      } else {
        // Add lock
        const { error } = await supabase
          .from('user_lesson_locks')
          .insert({
            user_id: selectedStudent.id,
            course_id: selectedCourse,
            lesson_id: lessonId
          });

        if (error) throw error;
        
        setLockedLessons(prev => new Set([...prev, lessonId]));

        toast({
          title: 'Lesson Locked',
          description: 'Student cannot access this lesson'
        });
      }
    } catch (error) {
      console.error('Error toggling lesson lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lesson lock status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isCourseAssigned = selectedStudent && selectedCourse && selectedStudent.assignedCourses?.includes(selectedCourse);

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
          <div className="space-y-6">
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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                    >
                      {service.title}
                      {selectedServices.includes(String(service.id)) && (
                        <CheckCircle className="ml-1 h-4 w-4 text-green-600" />
                      )}
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

            {/* Course Assignment Card */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Course Assignment for {selectedStudent.email}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={async () => {
                      if (!selectedStudent || !selectedCourse) return;
                      if (isCourseAssigned) {
                        // Remove course assignment
                        try {
                          const { error } = await supabase
                            .from('user_course_assignments')
                            .delete()
                            .eq('user_id', selectedStudent.id)
                            .eq('course_id', selectedCourse);
                          if (error) throw error;
                          toast({
                            title: 'Course Removed',
                            description: 'Course has been removed from the student.'
                          });
                          refreshStudents();
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to remove course assignment',
                            variant: 'destructive',
                          });
                        }
                      } else {
                        // Assign course
                        await handleAssignCourse();
                      }
                    }}
                    disabled={!selectedCourse}
                  >
                    {isCourseAssigned ? 'Remove Course' : 'Assign Course'}
                  </Button>
                </div>

                {selectedCourse && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="lessons">
                      <AccordionTrigger className="text-sm font-medium">
                        Lesson Access Control
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {courses
                            .find(c => c.id === selectedCourse)
                            ?.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`lesson-${lesson.id}`}
                                    checked={lockedLessons.has(lesson.id)}
                                    onCheckedChange={() => toggleLessonLock(lesson.id)}
                                    disabled={loading}
                                  />
                                  <label
                                    htmlFor={`lesson-${lesson.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {lesson.title}
                                  </label>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLessonLock(lesson.id)}
                                  disabled={loading}
                                >
                                  {lockedLessons.has(lesson.id) ? (
                                    <Lock className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <Unlock className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentManagement;
