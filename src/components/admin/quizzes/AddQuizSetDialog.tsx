
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddQuizSetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuizSet: (title: string) => void;
}

const AddQuizSetDialog = ({ isOpen, onOpenChange, onAddQuizSet }: AddQuizSetDialogProps) => {
  const [quizSetTitle, setQuizSetTitle] = useState('');

  const handleSubmit = () => {
    onAddQuizSet(quizSetTitle);
    setQuizSetTitle('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Quiz Set
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Quiz Set</DialogTitle>
          <DialogDescription>
            Create a new set of quiz questions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quizSetTitle">Quiz Set Title</Label>
            <Input 
              id="quizSetTitle" 
              placeholder="Enter quiz set title" 
              value={quizSetTitle} 
              onChange={e => setQuizSetTitle(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!quizSetTitle}>
            Create Quiz Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizSetDialog;
