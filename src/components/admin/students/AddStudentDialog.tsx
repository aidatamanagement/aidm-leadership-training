import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useStudents } from '@/contexts/StudentContext';

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addStudent } = useStudents();
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddStudent = async () => {
    if (!studentName || !studentEmail || !studentPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await addStudent(
        { name: studentName, email: studentEmail },
        studentPassword,
        'student'
      );
      
      // Reset form
      setStudentName('');
      setStudentEmail('');
      setStudentPassword('');
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Student added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentPassword('');
    onOpenChange(false);
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
            <Input 
              id="studentName" 
              placeholder="Enter student name" 
              value={studentName} 
              onChange={e => setStudentName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentEmail">Email</Label>
            <Input 
              id="studentEmail" 
              type="email" 
              placeholder="Enter student email" 
              value={studentEmail} 
              onChange={e => setStudentEmail(e.target.value)} 
            />
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
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddStudent} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
