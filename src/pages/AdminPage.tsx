import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/contexts/StudentContext';
import { useCourses } from '@/contexts/CourseContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useData } from '@/contexts/DataContext';
import { useServices } from '@/contexts/ServiceContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, Search, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  services?: {
    id: string;
    name: string;
    description: string;
  }[];
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, fetchStudents, addStudent } = useStudents();
  const { courses } = useCourses();
  const { progress } = useProgress();
  const { quizScores } = useData();
  const { services } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [studentServices, setStudentServices] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchStudents(),
          fetchStudentServices()
        ]);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, navigate, fetchStudents]);

  const fetchStudentServices = async () => {
    try {
      const { data: studentServicesData, error } = await supabase
        .from('student_services')
        .select(`
          student_id,
          service_id,
          services (
            id,
            name,
            description
          )
        `);

      if (error) throw error;

      // Group services by student_id
      const servicesByStudent = studentServicesData.reduce((acc, curr) => {
        if (!acc[curr.student_id]) {
          acc[curr.student_id] = [];
        }
        acc[curr.student_id].push(curr.services);
        return acc;
      }, {} as Record<string, any[]>);

      setStudentServices(servicesByStudent);
    } catch (error) {
      console.error('Error fetching student services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch student services',
        variant: 'destructive'
      });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail) return;

    try {
      setIsAddingStudent(true);
      await addStudent(newStudentEmail);
      setNewStudentEmail('');
      toast({
        title: 'Success',
        description: 'Student added successfully'
      });
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      await fetchStudents();
      toast({
        title: 'Success',
        description: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/admin/courses')}>
          <Plus className="mr-2 h-4 w-4" />
          Manage Courses
        </Button>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.full_name || 'N/A'}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {studentServices[student.id]?.map((service) => (
                              <Badge key={service.id} variant="secondary">
                                {service.name}
                              </Badge>
                            )) || 'No services'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(student.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/students/${student.id}`)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{students.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{courses.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{services.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => {
                  const courseProgress = progress.filter(p => p.course_id === course.id);
                  const completedLessons = courseProgress.filter(p => p.completed).length;
                  const totalLessons = course.lessons.length;
                  const progressPercentage = totalLessons > 0 
                    ? (completedLessons / totalLessons) * 100 
                    : 0;

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{course.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {completedLessons}/{totalLessons} lessons completed
                        </span>
                      </div>
                      <Progress value={progressPercentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAddingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="Enter student email"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingStudent(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingStudent}>
                    {isAddingStudent ? 'Adding...' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 