
import React, { useState } from 'react';
import { useData, Student } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Pencil, Trash, Eye, Clock } from 'lucide-react';

// Student Management Component
const AdminStudentManagement: React.FC = () => {
  const {
    students,
    courses,
    addStudent,
    updateStudent,
    deleteStudent,
    assignCourse,
    removeCourseAssignment,
    toggleCourseLock,
    getStudentProgress,
    getTotalQuizScore
  } = useData();
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentRole, setStudentRole] = useState('student');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Handle add student
  const handleAddStudent = () => {
    addStudent({
      name: studentName,
      email: studentEmail,
    }, studentPassword, studentRole);
    resetStudentForm();
    setIsAddStudentOpen(false);
  };

  // Handle update student
  const handleUpdateStudent = () => {
    if (currentStudent) {
      updateStudent(currentStudent.id, {
        name: studentName,
        email: studentEmail,
        role: studentRole,
        assignedCourses: currentStudent.assignedCourses
      });
      setIsEditStudentOpen(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(studentId);
    }
  };

  // Open edit student dialog
  const openEditStudentDialog = (student: Student) => {
    setCurrentStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentRole(student.role);
    setIsEditStudentOpen(true);
  };

  // Handle assign course
  const handleAssignCourse = () => {
    if (currentStudent && selectedCourseId) {
      assignCourse(currentStudent.id, selectedCourseId);
      setSelectedCourseId('');
      setIsAssignCourseOpen(false);
    }
  };

  // Open assign course dialog
  const openAssignCourseDialog = (student: Student) => {
    setCurrentStudent(student);
    setSelectedCourseId('');
    setIsAssignCourseOpen(true);
  };

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  // Reset student form
  const resetStudentForm = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentPassword('');
    setStudentRole('student');
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Student Management</h2>
          <p className="text-gray-600">
            Manage students and their course assignments.
          </p>
        </div>
        
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Full Name</Label>
                <Input id="studentName" placeholder="Enter student name" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Email</Label>
                <Input id="studentEmail" type="email" placeholder="Enter student email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentPassword">Password</Label>
                <Input id="studentPassword" type="password" placeholder="Enter password" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentRole">Role</Label>
                <Select value={studentRole} onValueChange={setStudentRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddStudent} disabled={!studentName || !studentEmail || !studentPassword}>
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student's information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editStudentName">Full Name</Label>
                <Input id="editStudentName" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentEmail">Email</Label>
                <Input id="editStudentEmail" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentRole">Role</Label>
                <Select value={studentRole} onValueChange={setStudentRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateStudent} disabled={!studentName || !studentEmail}>
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAssignCourseOpen} onOpenChange={setIsAssignCourseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Course</DialogTitle>
              <DialogDescription>
                Assign a course to {currentStudent?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseSelect">Select Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter(course => !currentStudent?.assignedCourses.includes(course.id))
                      .map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAssignCourse} disabled={!selectedCourseId}>
                Assign Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {students.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No students available.</p>
          <Button onClick={() => setIsAddStudentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Student
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {students.map(student => (
            <AccordionItem key={student.id} value={student.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.email} - {student.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={e => {
                      e.stopPropagation();
                      openEditStudentDialog(student);
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={e => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium">Assigned Courses</h4>
                  <Button size="sm" variant="outline" onClick={() => openAssignCourseDialog(student)}>
                    <Plus className="mr-2 h-4 w-4" /> Assign Course
                  </Button>
                </div>
                
                {student.assignedCourses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No courses assigned yet.</p>
                    <Button variant="outline" onClick={() => openAssignCourseDialog(student)}>
                      <Plus className="mr-2 h-4 w-4" /> Assign First Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.assignedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      if (!course) return null;
                      
                      const studentProgress = getStudentProgress(student.id, courseId);
                      const completedLessons = studentProgress.filter(p => p.completed).length;
                      const totalLessons = course.lessons.length;
                      const totalTimeSpent = studentProgress.reduce((total, p) => total + p.timeSpent, 0);
                      const quizScore = getTotalQuizScore(student.id, courseId);
                      const isLocked = studentProgress.some(p => p.locked);
                      
                      return (
                        <div key={courseId} className="border rounded-md p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold">{course.title}</h5>
                              <p className="text-sm text-gray-600">
                                Progress: {completedLessons} / {totalLessons} lessons
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant={isLocked ? "default" : "outline"} 
                                className={isLocked ? "bg-red-600 hover:bg-red-700" : ""}
                                onClick={() => toggleCourseLock(student.id, courseId)}
                              >
                                <Lock className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeCourseAssignment(student.id, courseId)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                Time spent: {formatTimeSpent(totalTimeSpent)}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              <span>
                                {studentProgress.filter(p => p.pdfViewed).length} / {totalLessons} viewed
                              </span>
                            </div>
                          </div>
                          
                          {quizScore.total > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              Quiz Score: {quizScore.score} / {quizScore.total}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default AdminStudentManagement;
