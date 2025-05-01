
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QuizCard from './QuizCard';

const QuizManagement: React.FC = () => {
  const { 
    quizSets, 
    addQuizSet, 
    updateQuizSet, 
    deleteQuizSet,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    isLoading
  } = useData();
  
  const [newQuizTitle, setNewQuizTitle] = useState('');
  
  const handleCreateQuizSet = async () => {
    if (newQuizTitle.trim()) {
      await addQuizSet({ title: newQuizTitle.trim() });
      setNewQuizTitle('');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quiz Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz Set</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Quiz Title"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCreateQuizSet} 
              disabled={!newQuizTitle.trim() || isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {quizSets.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No quiz sets found. Create your first quiz set above.</p>
          </div>
        ) : (
          quizSets.map((quizSet) => (
            <QuizCard
              key={quizSet.id}
              quizSet={quizSet}
              onUpdateQuizSet={updateQuizSet}
              onDeleteQuizSet={deleteQuizSet}
              onAddQuestion={addQuizQuestion}
              onUpdateQuestion={updateQuizQuestion}
              onDeleteQuestion={deleteQuizQuestion}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManagement;
