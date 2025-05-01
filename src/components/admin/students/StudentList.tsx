
import React from 'react';
import { Student, useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import AssignedCoursesList from './AssignedCoursesList';

interface StudentListProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAssignCourse: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onEditStudent,
  onDeleteStudent,
  onAssignCourse
}) => {
  // Filter only student role users
  const filteredStudents = students.filter(student => student.role === 'student');
  
  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-100 rounded-lg">
        <p className="text-gray-600 mb-4">No students available.</p>
        <Button onClick={() => document.getElementById('add-student-button')?.click()}>
          Add Your First Student
        </Button>
      </div>
    );
  }
  
  return (
    <Accordion type="single" collapsible className="space-y-4">
      {filteredStudents.map(student => (
        <AccordionItem key={student.id} value={student.id} className="border rounded-md overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
            <div className="flex justify-between items-center w-full">
              <div className="text-left">
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={e => {
                  e.stopPropagation();
                  onEditStudent(student);
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={e => {
                  e.stopPropagation();
                  onDeleteStudent(student.id);
                }}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="p-4">
            <AssignedCoursesList 
              student={student}
              onAssignCourse={() => onAssignCourse(student)}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default StudentList;
