
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Pencil, Trash, Check } from 'lucide-react';

// Import types needed from DataContext
import type { QuizSet, QuizQuestion } from '@/contexts/DataContext';

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
  const [quizSetTitle, setQuizSetTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerOptions, setAnswerOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [passMarkPercentage, setPassMarkPercentage] = useState(quizSettings.passMarkPercentage);
  const [enforcePassMark, setEnforcePassMark] = useState(quizSettings.enforcePassMark);

  // Handle add quiz set
  const handleAddQuizSet = () => {
    addQuizSet({
      title: quizSetTitle
    });
    setQuizSetTitle('');
    setIsAddQuizSetOpen(false);
  };

  // Handle update quiz set
  const handleUpdateQuizSet = () => {
    if (currentQuizSet) {
      updateQuizSet(currentQuizSet.id, {
        title: quizSetTitle
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
  const openEditQuizSetDialog = (quizSet: QuizSet) => {
    setCurrentQuizSet(quizSet);
    setQuizSetTitle(quizSet.title);
    setIsEditQuizSetOpen(true);
  };

  // Handle add quiz question
  const handleAddQuizQuestion = () => {
    if (currentQuizSet) {
      addQuizQuestion(currentQuizSet.id, {
        question: questionText,
        options: answerOptions,
        correctAnswer: correctAnswer
      });
      resetQuizQuestionForm();
      setIsAddQuizQuestionOpen(false);
    }
  };

  // Handle update quiz question
  const handleUpdateQuizQuestion = () => {
    if (currentQuizSet && currentQuestionId) {
      updateQuizQuestion(currentQuizSet.id, currentQuestionId, {
        question: questionText,
        options: answerOptions,
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
  const openAddQuizQuestionDialog = (quizSet: QuizSet) => {
    setCurrentQuizSet(quizSet);
    resetQuizQuestionForm();
    setIsAddQuizQuestionOpen(true);
  };

  // Open edit quiz question dialog
  const openEditQuizQuestionDialog = (quizSet: QuizSet, questionId: string) => {
    setCurrentQuizSet(quizSet);
    setCurrentQuestionId(questionId);
    const question = quizSet.questions.find(q => q.id === questionId);
    if (question) {
      setQuestionText(question.question);
      setAnswerOptions([...question.options]);
      setCorrectAnswer(question.correctAnswer);
    }
    setIsEditQuizQuestionOpen(true);
  };

  // Reset quiz question form
  const resetQuizQuestionForm = () => {
    setQuestionText('');
    setAnswerOptions(['', '', '', '']);
    setCorrectAnswer(0);
  };

  // Handle updating answer option
  const updateAnswerOption = (index: number, value: string) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  // Handle save pass mark settings
  const handleSavePassMarkSettings = () => {
    updateQuizSettings({
      passMarkPercentage,
      enforcePassMark
    });
    setIsPassMarkModalOpen(false);
  };
  
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
          <Dialog open={isPassMarkModalOpen} onOpenChange={setIsPassMarkModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Set Pass Mark
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quiz Pass Mark Settings</DialogTitle>
                <DialogDescription>
                  Set the minimum pass mark for quizzes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="passMarkPercentage">Pass Mark Percentage</Label>
                  <div className="flex items-center">
                    <Input id="passMarkPercentage" type="number" min="0" max="100" value={passMarkPercentage} onChange={e => setPassMarkPercentage(Number(e.target.value))} className="w-20" />
                    <span className="ml-2">%</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input id="enforcePassMark" type="checkbox" checked={enforcePassMark} onChange={e => setEnforcePassMark(e.target.checked)} className="rounded" />
                  <Label htmlFor="enforcePassMark">
                    Enforce pass mark (prevents progress if quiz is failed)
                  </Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePassMarkSettings}>
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddQuizSetOpen} onOpenChange={setIsAddQuizSetOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Quiz Set
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Quiz Set</DialogTitle>
                <DialogDescription>
                  Create a new set of quiz questions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quizSetTitle">Quiz Set Title</Label>
                  <Input id="quizSetTitle" placeholder="Enter quiz set title" value={quizSetTitle} onChange={e => setQuizSetTitle(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddQuizSet} disabled={!quizSetTitle}>
                  Create Quiz Set
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditQuizSetOpen} onOpenChange={setIsEditQuizSetOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Quiz Set</DialogTitle>
                <DialogDescription>
                  Update the quiz set title.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editQuizSetTitle">Quiz Set Title</Label>
                  <Input 
                    id="editQuizSetTitle" 
                    placeholder="Enter quiz set title" 
                    value={quizSetTitle} 
                    onChange={e => setQuizSetTitle(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdateQuizSet} disabled={!quizSetTitle}>
                  Update Quiz Set
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {quizSets.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No quiz sets available.</p>
          <Button onClick={() => setIsAddQuizSetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Quiz Set
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {quizSets.map(quizSet => (
            <AccordionItem key={quizSet.id} value={quizSet.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{quizSet.title}</h3>
                    <p className="text-sm text-gray-600">{quizSet.questions.length} questions</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={e => {
                        e.stopPropagation();
                        openEditQuizSetDialog(quizSet);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteQuizSet(quizSet.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium">Questions</h4>
                  
                  <Dialog open={isAddQuizQuestionOpen} onOpenChange={setIsAddQuizQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => openAddQuizQuestionDialog(quizSet)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Question</DialogTitle>
                        <DialogDescription>
                          Add a new question to {currentQuizSet?.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="questionText">Question</Label>
                          <Input id="questionText" placeholder="Enter question text" value={questionText} onChange={e => setQuestionText(e.target.value)} />
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Answer Options</Label>
                          <RadioGroup value={String(correctAnswer)} onValueChange={v => setCorrectAnswer(Number(v))}>
                            {answerOptions.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                <Input placeholder={`Option ${index + 1}`} value={option} onChange={e => updateAnswerOption(index, e.target.value)} className="flex-grow" />
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleAddQuizQuestion} disabled={!questionText || answerOptions.some(option => !option)}>
                          Save Question
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isEditQuizQuestionOpen} onOpenChange={setIsEditQuizQuestionOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                        <DialogDescription>
                          Update the question details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="editQuestionText">Question</Label>
                          <Input id="editQuestionText" value={questionText} onChange={e => setQuestionText(e.target.value)} />
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Answer Options</Label>
                          <RadioGroup value={String(correctAnswer)} onValueChange={v => setCorrectAnswer(Number(v))}>
                            {answerOptions.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(index)} id={`edit-option-${index}`} />
                                <Input value={option} onChange={e => updateAnswerOption(index, e.target.value)} className="flex-grow" />
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleUpdateQuizQuestion} disabled={!questionText || answerOptions.some(option => !option)}>
                          Update Question
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {quizSet.questions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No questions in this quiz set yet.</p>
                    <Button variant="outline" onClick={() => openAddQuizQuestionDialog(quizSet)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Question
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizSet.questions.map(question => (
                      <div key={question.id} className="border rounded-md p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{question.question}</p>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditQuizQuestionDialog(quizSet, question.id)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteQuizQuestion(quizSet.id, question.id)}>
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default QuizManagementTab;
