
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuizQuestionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  initialQuestion: string;
  initialOptions: string[];
  initialCorrectAnswer: number;
  onSave: (question: string, options: string[], correctAnswer: number) => void;
}

const QuizQuestionDialog = ({
  isOpen,
  onOpenChange,
  isEditing,
  initialQuestion,
  initialOptions,
  initialCorrectAnswer,
  onSave
}: QuizQuestionDialogProps) => {
  const [questionText, setQuestionText] = useState(initialQuestion);
  const [answerOptions, setAnswerOptions] = useState(initialOptions);
  const [correctAnswer, setCorrectAnswer] = useState(initialCorrectAnswer);

  useEffect(() => {
    if (isOpen) {
      setQuestionText(initialQuestion);
      setAnswerOptions(initialOptions);
      setCorrectAnswer(initialCorrectAnswer);
    }
  }, [isOpen, initialQuestion, initialOptions, initialCorrectAnswer]);

  const updateAnswerOption = (index: number, value: string) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  const handleSave = () => {
    onSave(questionText, answerOptions, correctAnswer);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the question details.' : 'Add a new question to the quiz set.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="questionText">Question</Label>
            <Input 
              id="questionText" 
              placeholder="Enter question text" 
              value={questionText} 
              onChange={e => setQuestionText(e.target.value)} 
            />
          </div>
          
          <div className="space-y-3">
            <Label>Answer Options</Label>
            <RadioGroup value={String(correctAnswer)} onValueChange={v => setCorrectAnswer(Number(v))}>
              {answerOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <Input 
                    placeholder={`Option ${index + 1}`} 
                    value={option} 
                    onChange={e => updateAnswerOption(index, e.target.value)} 
                    className="flex-grow" 
                  />
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!questionText || answerOptions.some(option => !option)}
          >
            {isEditing ? 'Update Question' : 'Save Question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizQuestionDialog;
