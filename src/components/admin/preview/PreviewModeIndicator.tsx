
import React from 'react';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { useData } from '@/contexts/DataContext';
import { Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PreviewModeIndicator: React.FC = () => {
  const { isPreviewMode, setIsPreviewMode, previewAsUserId, setPreviewAsUserId } = usePreviewMode();
  const { students } = useData();
  const navigate = useNavigate();

  if (!isPreviewMode) return null;

  const currentStudent = students.find(s => s.id === previewAsUserId);

  const handleExitPreview = () => {
    setIsPreviewMode(false);
    setPreviewAsUserId(null);
    navigate('/admin');
  };

  const handleStudentChange = (studentId: string) => {
    setPreviewAsUserId(studentId);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg shadow-lg flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Eye className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-medium">Preview Mode</span>
      </div>
      
      {currentStudent && (
        <div className="text-xs flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span>Viewing as: {currentStudent.name}</span>
        </div>
      )}

      <Select 
        value={previewAsUserId || ''} 
        onValueChange={handleStudentChange}
      >
        <SelectTrigger className="bg-transparent border-white/20 text-white text-xs h-8">
          <SelectValue placeholder="Select student" />
        </SelectTrigger>
        <SelectContent>
          {students.map(student => (
            <SelectItem key={student.id} value={student.id}>
              {student.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={handleExitPreview}>
        <EyeOff className="h-3 w-3 mr-1" />
        Exit Preview
      </Button>
    </div>
  );
};

export default PreviewModeIndicator;
