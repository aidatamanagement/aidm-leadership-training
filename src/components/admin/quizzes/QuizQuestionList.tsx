
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import { QuizSet } from '@/contexts/types/DataTypes';

interface QuizQuestionListProps {
  quizSet: QuizSet;
  onEditQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const QuizQuestionList = ({
  quizSet,
  onEditQuestion,
  onDeleteQuestion
}: QuizQuestionListProps) => {
  if (quizSet.questions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">No questions in this quiz set yet.</p>
        <Button variant="outline" onClick={() => onEditQuestion('')}>
          <Plus className="mr-2 h-4 w-4" /> Add Your First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quizSet.questions.map(question => (
        <div key={question.id} className="border rounded-md p-4 bg-white">
          <div className="flex justify-between items-start">
            <p className="font-medium">{question.question}</p>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => onEditQuestion(question.id)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDeleteQuestion(question.id)}>
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizQuestionList;
