
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Pencil } from 'lucide-react';
import { QuizSet, QuizQuestion } from '@/contexts/types/DataTypes';
import QuizSetHeader from './QuizSetHeader';
import QuizQuestionItem from './QuizQuestionItem';
import AddQuestionForm from './AddQuestionForm';
import EditQuizTitleDialog from './EditQuizTitleDialog';

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
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false);
  
  const handleTitleEdit = (e: React.MouseEvent) => {
    // Prevent the accordion from toggling when clicking the edit button
    e.stopPropagation();
    setIsEditTitleDialogOpen(true);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">{quizSet.title}</h3>
          <p className="text-sm text-gray-600">{quizSet.questions.length} questions</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleTitleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteQuizSet(quizSet.id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
      
      <EditQuizTitleDialog 
        quizSet={quizSet}
        isOpen={isEditTitleDialogOpen}
        onOpenChange={setIsEditTitleDialogOpen}
        onUpdateQuizSet={onUpdateQuizSet}
      />
    </Card>
  );
};

export default QuizCard;
