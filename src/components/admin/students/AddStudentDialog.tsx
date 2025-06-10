
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Eye, EyeOff } from 'lucide-react';

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStudent: (name: string, email: string, password: string) => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ isOpen, onOpenChange, onAddStudent }) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleAddStudent = () => {
    onAddStudent(studentName, studentEmail, studentPassword);
    setStudentName('');
    setStudentEmail('');
    setStudentPassword('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <div className="relative">
              <Input 
                id="studentPassword" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter password" 
                value={studentPassword} 
                onChange={e => setStudentPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
