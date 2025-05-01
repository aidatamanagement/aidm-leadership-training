
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

  const handleTitleUpdate = () => {
    if (editTitle.trim() !== '') {
      onUpdateQuizSet(quizSet.id, { title: editTitle });
      setIsEditDialogOpen(false);
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
            disabled={isLoading}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTitleUpdate} disabled={!editTitle.trim() || isLoading}>
              Update Quiz Title
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuizCard;
