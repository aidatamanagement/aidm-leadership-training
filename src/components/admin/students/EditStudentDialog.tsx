
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student } from '@/contexts/DataContext';

interface EditStudentDialogProps {
  student: Student | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStudent: (name: string, email: string) => void;
}

const EditStudentDialog: React.FC<EditStudentDialogProps> = ({ 
  student, 
  isOpen, 
  onOpenChange, 
  onUpdateStudent 
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  
  useEffect(() => {
    if (student) {
      setStudentName(student.name);
      setStudentEmail(student.email);
    }
  }, [student]);
  
  const handleUpdateStudent = () => {
    onUpdateStudent(studentName, studentEmail);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        </div>
        <div className="flex justify-end">
          <Button onClick={handleUpdateStudent} disabled={!studentName || !studentEmail}>
            Update Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;
