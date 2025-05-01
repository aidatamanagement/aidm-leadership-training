
import React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

interface EditQuizTitleDialogProps {
  quizSetId: string;
  currentTitle: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditQuizTitleDialog: React.FC<EditQuizTitleDialogProps> = ({
  quizSetId,
  currentTitle,
  isOpen,
  setIsOpen,
  onSuccess,
}) => {
  const { updateQuizSet } = useData();
  const [title, setTitle] = useState<string>(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset title when dialog opens with new currentTitle
  React.useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await updateQuizSet(quizSetId, { title });
      toast({
        title: "Success",
        description: "Quiz title updated successfully",
      });
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update quiz title:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz title",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Quiz Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizTitleDialog;
