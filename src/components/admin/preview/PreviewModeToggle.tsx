
import React, { useState } from 'react';
import { usePreview } from '@/contexts/PreviewContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const PreviewModeToggle: React.FC = () => {
  const { previewMode, setPreviewMode, previewAsStudentId, setPreviewAsStudentId } = usePreview();
  const { students } = useData();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(previewAsStudentId || undefined);

  const handleTogglePreview = (checked: boolean) => {
    if (checked && selectedStudentId) {
      setPreviewMode(true);
      setPreviewAsStudentId(selectedStudentId);
    } else {
      setPreviewMode(false);
      setPreviewAsStudentId(null);
    }
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    if (previewMode) {
      setPreviewAsStudentId(value);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 border">
      <h3 className="font-medium text-gray-900 mb-3">Preview Mode Settings</h3>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="student-select">Select Student to Preview As</Label>
          <Select 
            value={selectedStudentId} 
            onValueChange={handleStudentChange}
            disabled={students.length === 0}
          >
            <SelectTrigger id="student-select" className="w-full md:w-[250px]">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={handleTogglePreview}
              disabled={!selectedStudentId}
            />
            <Label htmlFor="preview-mode" className="cursor-pointer">
              {previewMode ? (
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4 text-green-600" /> Preview Mode Enabled
                </span>
              ) : (
                <span className="flex items-center">
                  <EyeOff className="mr-1 h-4 w-4" /> Preview Mode Disabled
                </span>
              )}
            </Label>
          </div>
          
          {previewMode && selectedStudentId && (
            <Button 
              size="sm" 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              className="ml-2"
            >
              <Eye className="mr-1 h-4 w-4" /> View Student Dashboard
            </Button>
          )}
        </div>
        
        {previewMode && !selectedStudentId && (
          <p className="text-sm text-amber-600">Please select a student to preview as.</p>
        )}
        
        {!previewMode && selectedStudentId && (
          <p className="text-sm text-gray-600">Enable preview mode to view the site as this student.</p>
        )}
      </div>
    </div>
  );
};

export default PreviewModeToggle;
