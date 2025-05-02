
import React from 'react';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const PreviewModeToggle: React.FC = () => {
  const { isPreviewMode, setIsPreviewMode, previewAsUserId, setPreviewAsUserId } = usePreviewMode();
  const { students, courses } = useData();
  const navigate = useNavigate();

  const handleTogglePreviewMode = () => {
    if (isPreviewMode) {
      // Turn off preview mode
      setIsPreviewMode(false);
      setPreviewAsUserId(null);
    } else {
      // Turn on preview mode if a student is selected
      if (previewAsUserId) {
        setIsPreviewMode(true);
      }
    }
  };

  const handleStartPreview = (courseId?: string) => {
    if (!previewAsUserId) return;
    
    setIsPreviewMode(true);
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="mr-2 h-5 w-5" />
          Student View Preview
        </CardTitle>
        <CardDescription>
          Preview the application as a student to check their experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preview-student">Select Student</Label>
            <Select 
              value={previewAsUserId || ''} 
              onValueChange={setPreviewAsUserId}
              disabled={isPreviewMode}
            >
              <SelectTrigger id="preview-student">
                <SelectValue placeholder="Choose a student account" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {student.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="preview-mode"
              checked={isPreviewMode}
              onCheckedChange={handleTogglePreviewMode}
              disabled={!previewAsUserId || isPreviewMode}
            />
            <Label htmlFor="preview-mode">
              {isPreviewMode ? 'Currently in Preview Mode' : 'Enable Preview Mode'}
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleStartPreview()}
          disabled={!previewAsUserId || isPreviewMode}
          size="sm"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Dashboard
        </Button>
        
        {courses.slice(0, 3).map(course => (
          <Button
            key={course.id}
            onClick={() => handleStartPreview(course.id)}
            disabled={!previewAsUserId || isPreviewMode}
            variant="outline"
            size="sm"
          >
            Preview "{course.title.substring(0, 15)}{course.title.length > 15 ? '...' : ''}"
          </Button>
        ))}
        
        {courses.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={!previewAsUserId || isPreviewMode}
          >
            +{courses.length - 3} more
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PreviewModeToggle;
