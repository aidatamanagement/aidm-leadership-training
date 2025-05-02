
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface PreviewButtonProps {
  courseId: string;
  lessonId?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ 
  courseId, 
  lessonId, 
  variant = "outline", 
  size = "sm" 
}) => {
  const { setIsPreviewMode, previewAsUserId, setPreviewAsUserId } = usePreviewMode();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!previewAsUserId) {
      toast({
        title: "No student selected",
        description: "Please select a student to preview as from the Preview panel",
        variant: "destructive",
      });
      return;
    }

    setIsPreviewMode(true);
    
    if (lessonId) {
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      variant={variant} 
      size={size} 
      className="flex items-center"
    >
      <Eye className="h-4 w-4 mr-1" />
      Preview
    </Button>
  );
};

export default PreviewButton;
