
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { QuizQuestion } from '@/contexts/types/DataTypes';

interface AddQuestionFormProps {
  onAddQuestion: (question: Omit<QuizQuestion, 'id'>) => void;
  isLoading: boolean;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onAddQuestion, isLoading }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questionText.trim() && options.every(opt => opt.trim())) {
      onAddQuestion({
        question: questionText.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer
      });
      
      // Reset form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Question
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="new-question">Question</Label>
        <Input
          id="new-question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          className="mt-1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Answer Options</Label>
        <RadioGroup value={correctAnswer.toString()}>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={index.toString()}
                id={`new-option-${index}`}
                checked={correctAnswer === index}
                onClick={() => setCorrectAnswer(index)}
              />
              <Label htmlFor={`new-option-${index}`} className="cursor-pointer flex-grow">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full"
                  required
                />
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !questionText.trim() || !options.every(opt => opt.trim())}
        >
          Add Question
        </Button>
      </div>
    </form>
  );
};

export default AddQuestionForm;
