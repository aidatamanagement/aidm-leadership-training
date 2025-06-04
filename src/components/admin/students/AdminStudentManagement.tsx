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
import { Lock, Unlock, CheckCircle, Pencil, ChevronDown, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import the smaller components
import StudentList from './StudentList';
import AddStudentDialog from './AddStudentDialog';
import EditStudentDialog from './EditStudentDialog';
import AssignCourseDialog from './AssignCourseDialog';
import UploadFileModal from './UploadFileModal';
import StudentFileList from '@/components/student/files/StudentFileList'

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
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);
  const [showUpload, setShowUpload] = useState<string | null>(null);

  const fetchAssignedServices = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_services')
          .select('service_id')
        .eq('user_id', studentId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching assigned services:', error);
          setSelectedServices([]);
          return;
        }

      const ids = Array.isArray(data) ? data.map(row => String(row.service_id).trim()) : [];
  
      console.log('Fetched service_id list:', ids);
      console.log('Service IDs in useServices context:', services.map(s => s.id));
  
        setSelectedServices(ids);
    } catch (err) {
      console.error('Unexpected error fetching assigned services:', err);
      setSelectedServices([]);
    }
      };


  useEffect(() => {
    if (selectedStudent && !servicesLoading) {
      fetchAssignedServices(selectedStudent.id);
    } else {
      setSelectedServices([]);
    }
  }, [selectedStudent, servicesLoading]);

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      const fetchLockedLessons = async () => {
        try {
          const { data, error } = await supabase
            .from('user_lesson_locks')
            .select('lesson_id')
            .eq('user_id', selectedStudent.id)
            .eq('course_id', selectedCourse);
          console.log('selected student id:', selectedStudent.id);
          // console.log('selected course id:', user_services.user_id);
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

  const startEditStudent = (student: any) => {
    setEditingStudentId(student.id);
    setEditDraft({ name: student.name, email: student.email, role: student.role });
  };

  const cancelEditStudent = () => {
    setEditingStudentId(null);
    setEditDraft(null);
  };

  const isEditChanged = (student: any) => {
    return (
      editDraft && (
        editDraft.name !== student.name ||
        editDraft.email !== student.email ||
        editDraft.role !== student.role
      )
    );
  };

  const handleToggleService = async (serviceId: string, checked: boolean) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_services')
        .select('id')
        .eq('user_id', selectedStudent.id)
        .eq('service_id', serviceId)
        .maybeSingle();

      if (fetchError) {
        toast({ title: 'Error', description: fetchError.message, variant: 'destructive' });
        return;
      }

      let error;
      if (checked) {
        if (existing) {
          ({ error } = await supabase
            .from('user_services')
            .update({ status: 'active' })
            .eq('id', existing.id));
        } else {
          ({ error } = await supabase
            .from('user_services')
            .insert({ user_id: selectedStudent.id, service_id: serviceId, status: 'active' }));
        }
      } else if (existing) {
        ({ error } = await supabase
          .from('user_services')
          .update({ status: 'inactive' })
          .eq('id', existing.id));
      }

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      await fetchAssignedServices(selectedStudent.id);
      refreshStudents();
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' });
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
          <GlassCard className="p-6 h-[420px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Students</h3>
            <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                    title={`User ID: ${student.id}`}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedStudent?.id === student.id ? 'bg-gray-100' : ''
                    } flex flex-col relative`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col" onClick={() => setSelectedStudent(student)}>
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-gray-500">{student.email}</span>
                      </div>
                      <div className="flex flex-row items-center gap-1 absolute right-2 top-2">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={e => { e.stopPropagation(); setShowUpload(student.id) }}
                          title="Upload File"
                        >
                          <Upload className="h-4 w-4 text-blue-600" />
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            if (editingStudentId === student.id) cancelEditStudent()
                            else startEditStudent(student)
                          }}
                          title="Edit Profile"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      {editingStudentId === student.id && <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-10 top-3" />}
                    </div>
                    {showUpload === student.id && (
                      <UploadFileModal
                        student={student}
                        onClose={() => setShowUpload(null)}
                      />
                    )}
                    {editingStudentId === student.id && (
                      <div className="mt-3 bg-gray-50 rounded p-3 border flex flex-col gap-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            value={editDraft?.name || ''}
                            onChange={e => setEditDraft((d: any) => ({ ...d, name: e.target.value }))}
                            placeholder="Full Name"
                          />
                          <Input
                            value={editDraft?.email || ''}
                            onChange={e => setEditDraft((d: any) => ({ ...d, email: e.target.value }))}
                            placeholder="Email"
                            type="email"
                          />
                          <Input
                            value={editDraft?.role || ''}
                            onChange={e => setEditDraft((d: any) => ({ ...d, role: e.target.value }))}
                            placeholder="Role"
                          />
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <Button
                            variant="outline"
                            onClick={cancelEditStudent}
                          >
                            Discard
                          </Button>
                          <Button
                            onClick={async () => {
                              const { error } = await supabase
                                .from('profiles')
                                .update({
                                  name: editDraft.name,
                                  email: editDraft.email,
                                  role: editDraft.role,
                                })
                                .eq('id', student.id)
                              if (error) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' })
                                return
                              }
                              toast({ title: 'Success', description: 'Profile updated.' })
                              refreshStudents()
                              cancelEditStudent()
                            }}
                            disabled={!editDraft.name || !editDraft.email || !editDraft.role || !isEditChanged(student)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
            </ScrollArea>
          </GlassCard>
        </div>
        
        {selectedStudent && servicesLoading ? (
          <div className="p-6 text-center">Loading services...</div>
        ) : selectedStudent && (
          <div className="space-y-6">
            {/* Service Assignments Card */}
            <GlassCard className="p-4">
              <h3 className="text-base font-semibold mb-2">Service Assignments</h3>
              <div className="grid grid-cols-1 gap-2">
                {services.map((service) => {
                  const isAssigned = selectedServices.some(id => id.trim() === String(service.id).trim());
                  return (
                    <label key={`${selectedStudent.id}-${service.id}`} className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                        checked={isAssigned}
                        onCheckedChange={(checked) => handleToggleService(service.id, Boolean(checked))}
                        id={`service-checkbox-${service.id}`}
                        className="h-4 w-4"
                      />
                      <span>{service.title}</span>
                    </label>
                  );
                })}
              </div>
            </GlassCard>
            {/* Course Assignment Card */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Course Assignment for {selectedStudent.name}
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
      {/* Move Student Files Card below the grid for full width */}
      {selectedStudent && (
        <GlassCard className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Files Shared with {selectedStudent.name}
          </h3>
          <StudentFileList studentId={selectedStudent.id} />
        </GlassCard>
      )}
    </div>
  );
};

export default AdminStudentManagement;
