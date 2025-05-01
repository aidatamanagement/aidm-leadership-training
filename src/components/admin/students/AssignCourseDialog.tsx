
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Student } from '@/contexts/DataContext';

interface AssignCourseDialogProps {
  student: Student | null;
  availableCourses: Course[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignCourse: (courseId: string) => void;
}

const AssignCourseDialog: React.FC<AssignCourseDialogProps> = ({ 
  student, 
  availableCourses,
  isOpen, 
  onOpenChange, 
  onAssignCourse 
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  
  const handleAssignCourse = () => {
    if (selectedCourseId) {
      onAssignCourse(selectedCourseId);
      setSelectedCourseId('');
    }
  };
  
  // Reset the selected course when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedCourseId('');
    }
  }, [isOpen]);
  
  const filteredCourses = student 
    ? availableCourses.filter(course => !student.assignedCourses.includes(course.id))
    : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
          <DialogDescription>
            Assign a course to {student?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courseSelect">Select Course</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger id="courseSelect">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleAssignCourse} 
            disabled={!selectedCourseId}
          >
            Assign Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCourseDialog;
