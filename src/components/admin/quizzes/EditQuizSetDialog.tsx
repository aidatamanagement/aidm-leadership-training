
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditQuizSetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onUpdateQuizSet: (title: string) => void;
}

const EditQuizSetDialog = ({ 
  isOpen, 
  onOpenChange, 
  initialTitle,
  onUpdateQuizSet 
}: EditQuizSetDialogProps) => {
  const [quizSetTitle, setQuizSetTitle] = useState(initialTitle);

  useEffect(() => {
    if (isOpen) {
      setQuizSetTitle(initialTitle);
    }
  }, [isOpen, initialTitle]);

  const handleSubmit = () => {
    onUpdateQuizSet(quizSetTitle);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz Set</DialogTitle>
          <DialogDescription>
            Update the quiz set title.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editQuizSetTitle">Quiz Set Title</Label>
            <Input 
              id="editQuizSetTitle" 
              placeholder="Enter quiz set title" 
              value={quizSetTitle} 
              onChange={e => setQuizSetTitle(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!quizSetTitle}>
            Update Quiz Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizSetDialog;
