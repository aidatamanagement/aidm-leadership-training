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
import { Lock, Unlock, CheckCircle, Pencil, ChevronDown, Upload, UserIcon, UsersIcon, MailIcon, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useNavigate } from 'react-router-dom';

// Import the smaller components
import StudentList from './StudentList';
import AddStudentDialog from './AddStudentDialog';
import EditStudentDialog from './EditStudentDialog';
import AssignCourseDialog from './AssignCourseDialog';
import UploadFileModal from './UploadFileModal';
import AdminFileList from '@/components/admin/files/AdminFileList'

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
  const [showAddStudent, setShowAddStudent] = useState(false);
  const navigate = useNavigate();

  // Stats
  const totalStudents = students.length;
  const activeStudents = totalStudents;
  const avgCourses = totalStudents ? Math.round(students.reduce((sum, s) => sum + (s.assignedCourses?.length || 0), 0) / totalStudents) : 0;

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

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
  );
  });
  
  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Students</h1>
          <p className="text-gray-500">Manage and monitor student progress</p>
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
          onClick={() => setShowAddStudent(true)}
        >
          + Add New User
        </button>
      </div>
      <div className="mb-6">
        <Input
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow flex items-center justify-between">
        <div>
            <div className="text-gray-500 text-sm mb-1">Total Students</div>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </div>
          <UserIcon className="w-8 h-8 text-green-200 bg-green-50 rounded-full p-1" />
                </div>
        <div className="bg-white rounded-lg p-6 shadow flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm mb-1">Active Students</div>
            <div className="text-2xl font-bold">{activeStudents}</div>
            </div>
          <UsersIcon className="w-8 h-8 text-green-200 bg-green-50 rounded-full p-1" />
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm mb-1">Avg. Courses</div>
            <div className="text-2xl font-bold">{avgCourses}</div>
                  </div>
          <MailIcon className="w-8 h-8 text-green-200 bg-green-50 rounded-full p-1" />
              </div>
              </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow p-6 border border-green-100 flex flex-col gap-2 relative">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-green-100 transition"
              title="Upload file for student"
              onClick={() => setShowUpload(student.id)}
            >
              <Upload className="w-5 h-5 text-green-600" />
            </button>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {student.profile_image
                    ? <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover rounded-lg" />
                    : student.name.charAt(0).toUpperCase()
                  }
                </div>
                <span className={
                  `text-xs font-semibold px-3 py-1 rounded-full ` +
                  (student.role === 'admin'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-green-50 text-green-700')
                }>
                  {student.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>
            <div className="font-extrabold text-lg text-green-600 mb-1">{student.name}</div>
            <div className="flex items-center text-gray-600 text-sm gap-2 mb-1">
              <MailIcon className="w-4 h-4" /> {student.email}
            </div>
            <div className="flex items-center justify-between text-gray-500 text-sm mb-1">
              <span>{student.assignedCourses?.length || 0} course</span>
              {/* <div className="text-xs text-gray-400">Last active: {student.lastActive ? student.lastActive : '2 hours ago'}</div> */}
            </div>
            <div className="border-t my-2" />
            <Link
              to={`/admin/students/${student.id}`}
              className="flex items-center text-green-700 font-medium text-sm mt-1 hover:underline"
            >
              View Details <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ))}
      </div>
      <AddStudentDialog 
        isOpen={showAddStudent} 
        onOpenChange={setShowAddStudent}
      />
      {showUpload && (
        <UploadFileModal
          student={students.find(s => s.id === showUpload)}
          onClose={() => setShowUpload(null)}
        />
      )}
      {/* Details drawer/modal logic can be added here for selectedStudent */}
    </div>
  );
};

export default AdminStudentManagement;
