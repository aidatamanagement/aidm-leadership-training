
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import type { QuizSet } from '@/contexts/types/DataTypes';
import AddQuizSetDialog from './AddQuizSetDialog';
import EditQuizSetDialog from './EditQuizSetDialog';
import PassMarkSettingsDialog from './PassMarkSettingsDialog';
import QuizQuestionDialog from './QuizQuestionDialog';
import QuizSetList from './QuizSetList';

const QuizManagementTab: React.FC = () => {
  const {
    quizSets,
    quizSettings,
    addQuizSet,
    updateQuizSet,
    deleteQuizSet,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    updateQuizSettings
  } = useData();
  
  const [isAddQuizSetOpen, setIsAddQuizSetOpen] = useState(false);
  const [isEditQuizSetOpen, setIsEditQuizSetOpen] = useState(false);
  const [isAddQuizQuestionOpen, setIsAddQuizQuestionOpen] = useState(false);
  const [isEditQuizQuestionOpen, setIsEditQuizQuestionOpen] = useState(false);
  const [isPassMarkModalOpen, setIsPassMarkModalOpen] = useState(false);
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

  // Form states
  const [passMarkPercentage, setPassMarkPercentage] = useState(quizSettings.passMarkPercentage);
  const [enforcePassMark, setEnforcePassMark] = useState(quizSettings.enforcePassMark);

  // Reset quiz question form
  const resetQuizQuestionForm = () => {
    setCurrentQuestionId(null);
  };

  // Handle add quiz set
  const handleAddQuizSet = (title: string) => {
    addQuizSet({
      title: title
    });
    setIsAddQuizSetOpen(false);
  };

  // Handle update quiz set
  const handleUpdateQuizSet = (title: string) => {
    if (currentQuizSet) {
      updateQuizSet(currentQuizSet.id, {
        title: title
      });
      setIsEditQuizSetOpen(false);
    }
  };

  // Handle delete quiz set
  const handleDeleteQuizSet = (quizSetId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz set?')) {
      deleteQuizSet(quizSetId);
    }
  };

  // Open edit quiz set dialog
  const handleOpenEditQuizSetDialog = (quizSet: QuizSet) => {
    setCurrentQuizSet(quizSet);
    setIsEditQuizSetOpen(true);
  };

  // Handle add quiz question
  const handleAddQuizQuestion = (question: string, options: string[], correctAnswer: number) => {
    if (currentQuizSet) {
      addQuizQuestion(currentQuizSet.id, {
        question: question,
        options: options,
        correctAnswer: correctAnswer
      });
      resetQuizQuestionForm();
      setIsAddQuizQuestionOpen(false);
    }
  };

  // Handle update quiz question
  const handleUpdateQuizQuestion = (question: string, options: string[], correctAnswer: number) => {
    if (currentQuizSet && currentQuestionId) {
      updateQuizQuestion(currentQuizSet.id, currentQuestionId, {
        question: question,
        options: options,
        correctAnswer: correctAnswer
      });
      resetQuizQuestionForm();
      setIsEditQuizQuestionOpen(false);
    }
  };

  // Handle delete quiz question
  const handleDeleteQuizQuestion = (quizSetId: string, questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuizQuestion(quizSetId, questionId);
    }
  };

  // Open add quiz question dialog
  const handleOpenAddQuizQuestionDialog = (quizSet: QuizSet) => {
    // Handle the case where quizSet has an empty id (from the empty state)
    if (!quizSet.id) {
      setIsAddQuizSetOpen(true);
      return;
    }
    
    setCurrentQuizSet(quizSet);
    resetQuizQuestionForm();
    setIsAddQuizQuestionOpen(true);
  };

  // Open edit quiz question dialog
  const handleOpenEditQuizQuestionDialog = (quizSet: QuizSet, questionId: string) => {
    setCurrentQuizSet(quizSet);
    setCurrentQuestionId(questionId);
    setIsEditQuizQuestionOpen(true);
  };

  // Handle save pass mark settings
  const handleSavePassMarkSettings = () => {
    updateQuizSettings({
      passMarkPercentage,
      enforcePassMark
    });
    setIsPassMarkModalOpen(false);
  };

  // Get the current question being edited
  const getCurrentQuestion = () => {
    if (currentQuizSet && currentQuestionId) {
      return currentQuizSet.questions.find(q => q.id === currentQuestionId);
    }
    return null;
  };
  
  const currentQuestion = getCurrentQuestion();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Quiz Management</h2>
          <p className="text-gray-600">
            Create and manage quiz sets and questions.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <PassMarkSettingsDialog
            isOpen={isPassMarkModalOpen}
            onOpenChange={setIsPassMarkModalOpen}
            passMarkPercentage={passMarkPercentage}
            setPassMarkPercentage={setPassMarkPercentage}
            enforcePassMark={enforcePassMark}
            setEnforcePassMark={setEnforcePassMark}
            onSave={handleSavePassMarkSettings}
          />
          
          <AddQuizSetDialog
            isOpen={isAddQuizSetOpen}
            onOpenChange={setIsAddQuizSetOpen}
            onAddQuizSet={handleAddQuizSet}
          />
          
          <EditQuizSetDialog
            isOpen={isEditQuizSetOpen}
            onOpenChange={setIsEditQuizSetOpen}
            initialTitle={currentQuizSet?.title || ''}
            onUpdateQuizSet={handleUpdateQuizSet}
          />
        </div>
      </div>
      
      <QuizSetList
        quizSets={quizSets}
        onEditQuizSet={handleOpenEditQuizSetDialog}
        onDeleteQuizSet={handleDeleteQuizSet}
        onAddQuizQuestion={handleOpenAddQuizQuestionDialog}
        onEditQuizQuestion={handleOpenEditQuizQuestionDialog}
        onDeleteQuizQuestion={handleDeleteQuizQuestion}
      />

      {/* Add Question Dialog */}
      <QuizQuestionDialog
        isOpen={isAddQuizQuestionOpen}
        onOpenChange={setIsAddQuizQuestionOpen}
        isEditing={false}
        initialQuestion=""
        initialOptions={['', '', '', '']}
        initialCorrectAnswer={0}
        onSave={handleAddQuizQuestion}
      />

      {/* Edit Question Dialog */}
      <QuizQuestionDialog
        isOpen={isEditQuizQuestionOpen}
        onOpenChange={setIsEditQuizQuestionOpen}
        isEditing={true}
        initialQuestion={currentQuestion?.question || ''}
        initialOptions={currentQuestion?.options || ['', '', '', '']}
        initialCorrectAnswer={currentQuestion?.correctAnswer || 0}
        onSave={handleUpdateQuizQuestion}
      />
    </div>
  );
};

export default QuizManagementTab;
