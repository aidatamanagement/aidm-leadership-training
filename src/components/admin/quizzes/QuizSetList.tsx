
import React from 'react';
import { QuizSet } from '@/contexts/types/DataTypes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Plus } from 'lucide-react';
import QuizQuestionList from './QuizQuestionList';

interface QuizSetListProps {
  quizSets: QuizSet[];
  onEditQuizSet: (quizSet: QuizSet) => void;
  onDeleteQuizSet: (quizSetId: string) => void;
  onAddQuizQuestion: (quizSet: QuizSet) => void;
  onEditQuizQuestion: (quizSet: QuizSet, questionId: string) => void;
  onDeleteQuizQuestion: (quizSetId: string, questionId: string) => void;
}

const QuizSetList = ({
  quizSets,
  onEditQuizSet,
  onDeleteQuizSet,
  onAddQuizQuestion,
  onEditQuizQuestion,
  onDeleteQuizQuestion
}: QuizSetListProps) => {
  if (quizSets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-100 rounded-lg">
        <p className="text-gray-600 mb-4">No quiz sets available.</p>
        <Button onClick={() => onEditQuizSet({ id: '', title: '', questions: [] })}>
          <Plus className="mr-2 h-4 w-4" /> Add Your First Quiz Set
        </Button>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {quizSets.map(quizSet => (
        <AccordionItem key={quizSet.id} value={quizSet.id} className="border rounded-md overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
              <div className="text-left mb-2 md:mb-0">
                <h3 className="text-lg font-semibold">{quizSet.title}</h3>
                <p className="text-sm text-gray-600">{quizSet.questions.length} questions</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={e => {
                    e.stopPropagation();
                    onEditQuizSet(quizSet);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteQuizSet(quizSet.id);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
              <h4 className="text-sm font-medium">Questions</h4>
              
              <Button size="sm" variant="outline" onClick={() => onAddQuizQuestion(quizSet)}>
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
            
            <QuizQuestionList
              quizSet={quizSet}
              onEditQuestion={(questionId) => onEditQuizQuestion(quizSet, questionId)}
              onDeleteQuestion={(questionId) => onDeleteQuizQuestion(quizSet.id, questionId)}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default QuizSetList;
