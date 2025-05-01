
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QuizSet } from '@/contexts/types/DataTypes';

interface EditQuizTitleDialogProps {
  quizSet: QuizSet;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateQuizSet: (quizSetId: string, updates: Partial<QuizSet>) => Promise<void>;
}

const EditQuizTitleDialog: React.FC<EditQuizTitleDialogProps> = ({
  quizSet,
  isOpen,
  onOpenChange,
  onUpdateQuizSet
}) => {
  const [title, setTitle] = useState(quizSet.title);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset title when dialog opens with a new quiz set
  useEffect(() => {
    if (isOpen) {
      setTitle(quizSet.title);
    }
  }, [quizSet.title, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onUpdateQuizSet(quizSet.id, { title });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating quiz title:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz Title</DialogTitle>
          <DialogDescription>
            Update the title for this quiz set
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Quiz Title</Label>
              <Input 
                id="quizTitle" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizTitleDialog;
