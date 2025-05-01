
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Pencil } from 'lucide-react';
import { QuizSet, QuizQuestion } from '@/contexts/types/DataTypes';
import QuizSetHeader from './QuizSetHeader';
import QuizQuestionItem from './QuizQuestionItem';
import AddQuestionForm from './AddQuestionForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface QuizCardProps {
  quizSet: QuizSet;
  onUpdateQuizSet: (quizSetId: string, updates: Partial<QuizSet>) => Promise<void>;
  onDeleteQuizSet: (quizSetId: string) => Promise<void>;
  onAddQuestion: (quizSetId: string, question: Omit<QuizQuestion, 'id'>) => Promise<void>;
  onUpdateQuestion: (quizSetId: string, questionId: string, updates: Partial<QuizQuestion>) => Promise<void>;
  onDeleteQuestion: (quizSetId: string, questionId: string) => Promise<void>;
  isLoading?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quizSet,
  onUpdateQuizSet,
  onDeleteQuizSet,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  isLoading = false
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(quizSet.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTitleUpdate = async () => {
    if (editTitle.trim() !== '') {
      try {
        setIsUpdating(true);
        await onUpdateQuizSet(quizSet.id, { title: editTitle });
        toast({
          title: "Success",
          description: "Quiz title updated successfully",
        });
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Error updating quiz title:", error);
        toast({
          title: "Error",
          description: "Failed to update quiz title",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const openEditDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    setEditTitle(quizSet.title);
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="mb-6">
      <QuizSetHeader 
        title={quizSet.title} 
        onEdit={openEditDialog}
      />
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {quizSet.questions.length} {quizSet.questions.length === 1 ? 'Question' : 'Questions'}
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteQuizSet(quizSet.id)}
            disabled={isLoading || isUpdating}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete Quiz
          </Button>
        </div>
        
        <div className="space-y-4 mt-4">
          {quizSet.questions.map((question) => (
            <QuizQuestionItem
              key={question.id}
              question={question}
              onUpdateQuestion={(updates) => onUpdateQuestion(quizSet.id, question.id, updates)}
              onDeleteQuestion={() => onDeleteQuestion(quizSet.id, question.id)}
              isLoading={isLoading}
            />
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <AddQuestionForm 
            onAddQuestion={(question) => onAddQuestion(quizSet.id, question)} 
            isLoading={isLoading}
          />
        </div>
      </CardContent>

      {/* Edit Quiz Title Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          // Reset to original title when dialog is closed without saving
          setEditTitle(quizSet.title);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz Title</DialogTitle>
            <DialogDescription>
              Update the title for this quiz set.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Quiz Title</Label>
              <Input 
                id="quizTitle" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter quiz title"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleTitleUpdate} 
              disabled={!editTitle.trim() || isLoading || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Quiz Title"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuizCard;
