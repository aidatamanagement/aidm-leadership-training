
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface EditQuizTitleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSave: (newTitle: string) => Promise<void>;
  isLoading?: boolean;
}

const EditQuizTitleDialog: React.FC<EditQuizTitleDialogProps> = ({
  isOpen,
  onOpenChange,
  initialTitle,
  onSave,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialTitle);

  // Reset title when dialog opens with new initialTitle
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
    }
  }, [initialTitle, isOpen]);

  const handleSave = async () => {
    try {
      if (title && title !== initialTitle) {
        await onSave(title);
        toast({
          title: "Success",
          description: "Quiz title has been updated",
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quiz title:", error);
      toast({
        title: "Error",
        description: "Failed to update quiz title",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz Set Title</DialogTitle>
          <DialogDescription>
            Update the title for this quiz set.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quizSetTitle">Quiz Set Title</Label>
            <Input 
              id="quizSetTitle" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter quiz set title"
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!title || title === initialTitle || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizTitleDialog;
