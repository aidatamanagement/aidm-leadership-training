
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { QuizQuestion } from '@/contexts/DataContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizSectionProps {
  quizSet: {
    id: string;
    questions: QuizQuestion[];
  } | null;
  quizSettings: {
    enforcePassMark: boolean;
    passMarkPercentage: number;
  };
  onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ 
  quizSet, 
  quizSettings,
  onQuizComplete
}) => {
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!quizSet) return null;

  // Handle quiz answer selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (!quizSet) return;
    
    // Calculate score
    let score = 0;
    quizSet.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    
    setQuizScore(score);
    setQuizSubmitted(true);
    onQuizComplete(score);
    
    // Determine if the quiz is passed
    const passPercentage = quizSettings.enforcePassMark ? quizSettings.passMarkPercentage : 0;
    const scorePercentage = (score / quizSet.questions.length) * 100;
    const isPassed = scorePercentage >= passPercentage;
    
    // Show toast with result
    if (isPassed) {
      toast({
        title: "Quiz Passed!",
        description: `You scored ${score} out of ${quizSet.questions.length}`,
      });
    } else {
      toast({
        title: "Quiz Not Passed",
        description: `You scored ${score} out of ${quizSet.questions.length}. Required: ${passPercentage}%`,
        variant: "destructive"
      });
    }
  };

  // Handle retrying the quiz
  const handleRetryQuiz = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Quiz</h2>
      <Card>
        <CardContent className="p-6">
          {quizSet.questions.map((question: QuizQuestion, questionIndex: number) => (
            <div 
              key={question.id} 
              className={`mb-6 pb-6 ${
                questionIndex < quizSet.questions.length - 1 ? 'border-b' : ''
              }`}
            >
              <h3 className="text-lg font-semibold mb-3">
                {questionIndex + 1}. {question.question}
              </h3>
              <RadioGroup
                value={quizAnswers[questionIndex]?.toString()}
                disabled={quizSubmitted}
                onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
                className="space-y-2"
              >
                {question.options.map((option: string, optionIndex: number) => {
                  let className = "border rounded-md p-3 flex items-start";
                  
                  if (quizSubmitted) {
                    if (optionIndex === question.correctAnswer && quizAnswers[questionIndex] === optionIndex) {
                      className += ' bg-green-50 border-green-300';
                    } else if (quizAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer) {
                      className += ' bg-red-50 border-red-300';
                    } else if (optionIndex === question.correctAnswer) {
                      className += ' bg-green-50 border-green-300 opacity-50';
                    }
                  }
                  
                  return (
                    <div key={optionIndex} className={className}>
                      <RadioGroupItem 
                        value={optionIndex.toString()} 
                        id={`q${questionIndex}-o${optionIndex}`} 
                        className="mr-3 mt-1" 
                      />
                      <Label 
                        htmlFor={`q${questionIndex}-o${optionIndex}`}
                        className="flex-grow cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
          
          {/* Quiz Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
            {quizSubmitted ? (
              <div className="w-full">
                <div 
                  className={`p-4 rounded-md mb-4 text-center ${
                    quizSettings.enforcePassMark &&
                    (quizScore / quizSet.questions.length * 100) < quizSettings.passMarkPercentage
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <p className="font-bold mb-1">
                    Score: {quizScore} out of {quizSet.questions.length}
                  </p>
                  <p>
                    Status: {
                      !quizSettings.enforcePassMark || 
                      (quizScore / quizSet.questions.length * 100) >= quizSettings.passMarkPercentage
                        ? 'Passed'
                        : 'Failed'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button 
                    onClick={handleRetryQuiz} 
                    variant="outline"
                  >
                    Retry Quiz
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleQuizSubmit}
                disabled={quizAnswers.length !== quizSet.questions.length || quizAnswers.includes(undefined as any)}
                className="w-full sm:w-auto"
              >
                See Result
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSection;
