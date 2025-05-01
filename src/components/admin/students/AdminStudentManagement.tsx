
import React, { useState } from 'react';
import { useData, Student } from '@/contexts/DataContext';

// Import the smaller components
import StudentList from './StudentList';
import AddStudentDialog from './AddStudentDialog';
import EditStudentDialog from './EditStudentDialog';
import AssignCourseDialog from './AssignCourseDialog';

const AdminStudentManagement: React.FC = () => {
  const {
    students,
    courses,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useData();
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Handle add student
  const handleAddStudent = (name: string, email: string, password: string) => {
    addStudent({
      name,
      email,
    }, password, 'student'); // Always set to 'student' role
    setIsAddStudentOpen(false);
  };

  // Handle update student
  const handleUpdateStudent = (name: string, email: string) => {
    if (currentStudent) {
      updateStudent(currentStudent.id, {
        name,
        email,
        role: 'student', // Ensure role remains 'student'
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
    setIsEditStudentOpen(true);
  };

  // Handle assign course
  const handleAssignCourse = (courseId: string) => {
    if (currentStudent && courseId) {
      useData().assignCourse(currentStudent.id, courseId);
      setIsAssignCourseOpen(false);
    }
  };

  // Open assign course dialog
  const openAssignCourseDialog = (student: Student) => {
    setCurrentStudent(student);
    setIsAssignCourseOpen(true);
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
        
        {/* Add Student Dialog */}
        <AddStudentDialog
          isOpen={isAddStudentOpen}
          onOpenChange={setIsAddStudentOpen}
          onAddStudent={handleAddStudent}
        />
      </div>
      
      {/* Student List */}
      <StudentList
        students={students}
        onEditStudent={openEditStudentDialog}
        onDeleteStudent={handleDeleteStudent}
        onAssignCourse={openAssignCourseDialog}
      />
      
      {/* Edit Student Dialog */}
      <EditStudentDialog
        student={currentStudent}
        isOpen={isEditStudentOpen}
        onOpenChange={setIsEditStudentOpen}
        onUpdateStudent={handleUpdateStudent}
      />
      
      {/* Assign Course Dialog */}
      <AssignCourseDialog
        student={currentStudent}
        availableCourses={courses}
        isOpen={isAssignCourseOpen}
        onOpenChange={setIsAssignCourseOpen}
        onAssignCourse={handleAssignCourse}
      />
    </div>
  );
};

export default AdminStudentManagement;
