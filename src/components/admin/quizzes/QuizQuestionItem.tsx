
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash, Check, X } from 'lucide-react';
import { QuizQuestion } from '@/contexts/types/DataTypes';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizQuestionItemProps {
  question: QuizQuestion;
  onUpdateQuestion: (updates: Partial<QuizQuestion>) => void;
  onDeleteQuestion: () => void;
  isLoading: boolean;
}

const QuizQuestionItem: React.FC<QuizQuestionItemProps> = ({
  question,
  onUpdateQuestion,
  onDeleteQuestion,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question.question);
  const [editedOptions, setEditedOptions] = useState<string[]>([...question.options]);
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(question.correctAnswer);

  const handleCancel = () => {
    setEditedQuestion(question.question);
    setEditedOptions([...question.options]);
    setEditedCorrectAnswer(question.correctAnswer);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedQuestion.trim() && editedOptions.every(opt => opt.trim())) {
      onUpdateQuestion({
        question: editedQuestion,
        options: editedOptions,
        correctAnswer: editedCorrectAnswer
      });
      setIsEditing(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = value;
    setEditedOptions(newOptions);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <Label>Answer Options</Label>
              <RadioGroup value={editedCorrectAnswer.toString()}>
                {editedOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      checked={editedCorrectAnswer === index}
                      onClick={() => setEditedCorrectAnswer(index)}
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h4 className="font-medium">{question.question}</h4>
              <div className="flex space-x-1 self-start">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={onDeleteQuestion}
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            <ul className="mt-2 space-y-1">
              {question.options.map((option, index) => (
                <li 
                  key={index} 
                  className={`text-sm px-2 py-1 rounded ${
                    index === question.correctAnswer 
                      ? 'bg-green-50 text-green-700 font-medium' 
                      : ''
                  }`}
                >
                  {index + 1}. {option} {index === question.correctAnswer && ' (Correct)'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestionItem;
