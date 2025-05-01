import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStudentManagement from '@/components/AdminStudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { 
  Plus, 
  Pencil, 
  Trash, 
  Upload, 
  Check, 
  LockIcon, 
  ClockIcon, 
  Eye 
} from 'lucide-react';

// Import types needed from DataContext
import type { Student, Course, Lesson, QuizSet, QuizQuestion } from '@/contexts/DataContext';

// Course Management Components
const CourseManagement: React.FC = () => {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addLesson,
    updateLesson,
    deleteLesson
  } = useData();
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Form states
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [instructorNotes, setInstructorNotes] = useState('');
  const [selectedQuizSetId, setSelectedQuizSetId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const {
    quizSets
  } = useData();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (isEdit) {
        setEditPdfFile(files[0]);
      } else {
        setPdfFile(files[0]);
      }
    }
  };

  // Handle add course
  const handleAddCourse = () => {
    addCourse({
      title: courseTitle,
      description: courseDescription
    });
    setCourseTitle('');
    setCourseDescription('');
    setIsAddCourseOpen(false);
  };

  // Handle update course
  const handleUpdateCourse = () => {
    if (currentCourse) {
      updateCourse(currentCourse.id, {
        title: courseTitle,
        description: courseDescription
      });
      setIsEditCourseOpen(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete ${course.title}?`)) {
      deleteCourse(course.id);
    }
  };

  // Open edit course dialog
  const openEditCourseDialog = (course: Course) => {
    setCurrentCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description);
    setIsEditCourseOpen(true);
  };

  // Handle add lesson
  const handleAddLesson = () => {
    if (currentCourse) {
      addLesson(currentCourse.id, {
        title: lessonTitle,
        description: lessonDescription,
        pdfUrl: '/placeholder.pdf',
        // In a real app, this would be the uploaded PDF URL
        instructorNotes: instructorNotes,
        quizSetId: selectedQuizSetId
      });
      resetLessonForm();
      setIsAddLessonOpen(false);
    }
  };

  // Handle update lesson
  const handleUpdateLesson = () => {
    if (currentCourse && currentLesson) {
      updateLesson(currentCourse.id, currentLesson.id, {
        title: lessonTitle,
        description: lessonDescription,
        instructorNotes: instructorNotes,
        quizSetId: selectedQuizSetId
      });
      resetLessonForm();
      setIsEditLessonOpen(false);
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLesson(courseId, lessonId);
    }
  };

  // Open add lesson dialog
  const openAddLessonDialog = (course: Course) => {
    setCurrentCourse(course);
    resetLessonForm();
    setIsAddLessonOpen(true);
  };

  // Open edit lesson dialog
  const openEditLessonDialog = (course: Course, lesson: Lesson) => {
    setCurrentCourse(course);
    setCurrentLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description);
    setInstructorNotes(lesson.instructorNotes);
    setSelectedQuizSetId(lesson.quizSetId);
    setIsEditLessonOpen(true);
  };

  // Reset lesson form
  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setInstructorNotes('');
    setSelectedQuizSetId(null);
    setPdfFile(null);
    setEditPdfFile(null);
  };
  return <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Management</h2>
          <p className="text-gray-600">
            Create, edit, and manage courses and their lessons.
          </p>
        </div>
        
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input id="courseTitle" placeholder="Enter course title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseDescription">Course Description</Label>
                <Textarea id="courseDescription" placeholder="Enter course description" value={courseDescription} onChange={e => setCourseDescription(e.target.value)} rows={4} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddCourse} disabled={!courseTitle || !courseDescription}>
                Save Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCourseTitle">Course Title</Label>
                <Input id="editCourseTitle" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCourseDescription">Course Description</Label>
                <Textarea id="editCourseDescription" value={courseDescription} onChange={e => setCourseDescription(e.target.value)} rows={4} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateCourse} disabled={!courseTitle || !courseDescription}>
                Update Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {courses.length === 0 ? <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No courses available.</p>
          <Button onClick={() => setIsAddCourseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Course
          </Button>
        </div> : <Accordion type="single" collapsible className="space-y-4">
          {courses.map(course => <AccordionItem key={course.id} value={course.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                openEditCourseDialog(course);
              }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                handleDeleteCourse(course);
              }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium">Lessons ({course.lessons.length})</h4>
                  
                  <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => openAddLessonDialog(course)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>
                          Add a new lesson to {currentCourse?.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1  gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lessonTitle">Lesson Title</Label>
                            <Input id="lessonTitle" placeholder="Enter lesson title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lessonDescription">Lesson Description</Label>
                            <Textarea id="lessonDescription" placeholder="Enter a short description" value={lessonDescription} onChange={e => setLessonDescription(e.target.value)} rows={3} />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pdfUpload">Upload PDF Slides</Label>
                          <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Drag and drop your PDF here, or click to select a file
                            </p>
                            <Input id="pdfUpload" type="file" accept=".pdf" onChange={e => handleFileChange(e, false)} className="hidden" />
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('pdfUpload')?.click()}>
                              Choose File
                            </Button>
                            {pdfFile && <p className="mt-2 text-sm text-green-600">
                                Selected: {pdfFile.name}
                              </p>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instructorNotes">Instructor Notes</Label>
                          <Textarea id="instructorNotes" placeholder="Add instructor notes (supports HTML)" value={instructorNotes} onChange={e => setInstructorNotes(e.target.value)} rows={6} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Attach Quiz Set (Optional)</Label>
                          <Select value={selectedQuizSetId || 'none'} onValueChange={value => setSelectedQuizSetId(value === 'none' ? null : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quiz set (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {quizSets.map(quizSet => <SelectItem key={quizSet.id} value={quizSet.id}>
                                  {quizSet.title} ({quizSet.questions.length} questions)
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleAddLesson} disabled={!lessonTitle || !lessonDescription}>
                          Save Lesson
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Lesson</DialogTitle>
                        <DialogDescription>
                          Update the lesson details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1  gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editLessonTitle">Lesson Title</Label>
                            <Input id="editLessonTitle" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editLessonDescription">Lesson Description</Label>
                            <Textarea id="editLessonDescription" value={lessonDescription} onChange={e => setLessonDescription(e.target.value)} rows={3} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="editPdfUpload">Update PDF Slides (Optional)</Label>
                          <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {currentLesson?.pdfUrl ? "Current PDF will be kept unless you select a new one" : "No PDF currently, upload one"}
                            </p>
                            <Input id="editPdfUpload" type="file" accept=".pdf" onChange={e => handleFileChange(e, true)} className="hidden" />
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('editPdfUpload')?.click()}>
                              Choose File
                            </Button>
                            {editPdfFile && <p className="mt-2 text-sm text-green-600">
                                Selected: {editPdfFile.name}
                              </p>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editInstructorNotes">Instructor Notes</Label>
                          <Textarea id="editInstructorNotes" value={instructorNotes} onChange={e => setInstructorNotes(e.target.value)} rows={6} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Attach Quiz Set (Optional)</Label>
                          <Select value={selectedQuizSetId || 'none'} onValueChange={value => setSelectedQuizSetId(value === 'none' ? null : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quiz set (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {quizSets.map(quizSet => <SelectItem key={quizSet.id} value={quizSet.id}>
                                  {quizSet.title} ({quizSet.questions.length} questions)
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleUpdateLesson} disabled={!lessonTitle || !lessonDescription}>
                          Update Lesson
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {course.lessons.length === 0 ? <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No lessons in this course yet.</p>
                    <Button variant="outline" onClick={() => openAddLessonDialog(course)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Lesson
                    </Button>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...course.lessons].sort((a, b) => a.order - b.order).map(lesson => <div key={lesson.id} className="border rounded-md p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold">{lesson.order}. {lesson.title}</h5>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => openEditLessonDialog(course, lesson)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(course.id, lesson.id)}>
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {lesson.quizSetId && <div className="mt-2 text-xs inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded">
                              <Check className="mr-1 h-3 w-3" />
                              Has Quiz
                            </div>}
                        </div>)}
                  </div>}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>}
    </div>;
};

// Quiz Management Components
const QuizManagement: React.FC = () => {
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
  return <div>
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
        </div>
      </div>
      
      {quizSets.length === 0 ? <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No quiz sets available.</p>
          <Button onClick={() => setIsAddQuizSetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Quiz Set
          </Button>
        </div> : <Accordion type="single" collapsible className="space-y-4">
          {quizSets.map(quizSet => <AccordionItem key={quizSet.id} value={quizSet.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{quizSet.title}</h3>
                    <p className="text-sm text-gray-600">{quizSet.questions.length} questions</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                openEditQuizSetDialog(quizSet);
              }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                handleDeleteQuizSet(quizSet.id);
              }}>
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
                            {answerOptions.map((option, index) => <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                <Input placeholder={`Option ${index + 1}`} value={option} onChange={e => updateAnswerOption(index, e.target.value)} className="flex-grow" />
                              </div>)}
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
                            {answerOptions.map((option, index) => <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(index)} id={`edit-option-${index}`} />
                                <Input value={option} onChange={e => updateAnswerOption(index, e.target.value)} className="flex-grow" />
                              </div>)}
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
                
                {quizSet.questions.length === 0 ? <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No questions in this quiz set yet.</p>
                    <Button variant="outline" onClick={() => openAddQuizQuestionDialog(quizSet)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Question
                    </Button>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizSet.questions.map(question => <div key={question.id} className="border rounded-md p-4 bg-white">
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
                      </div>)}
                  </div>}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>}
    </div>;
};

// Student Management Components
const StudentManagement: React.FC = () => {
  const {
    students,
    courses,
    progress,
    addStudent,
    updateStudent,
    deleteStudent,
    assignCourse,
    removeCourseAssignment,
    toggleCourseLock,
    getStudentProgress,
    getTotalQuizScore
  } = useData();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Handle add student
  const handleAddStudent = () => {
    addStudent({
      name: studentName,
      email: studentEmail,
      assignedCourses: []
    }, '', 'student');  // Add empty password and default role 'student'
    resetStudentForm();
    setIsAddStudentOpen(false);
  };

  // Handle update student
  const handleUpdateStudent = () => {
    if (currentStudent) {
      updateStudent(currentStudent.id, {
        name: studentName,
        email: studentEmail
      });
      setIsEditStudentOpen(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(studentId);
    }
  };

  // Open edit student dialog
  const openEditStudentDialog = (student: Student) => {
    setCurrentStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setIsEditStudentOpen(true);
  };

  // Handle assign course
  const handleAssignCourse = () => {
    if (currentStudent && selectedCourseId) {
      assignCourse(currentStudent.id, selectedCourseId);
      setSelectedCourseId('');
      setIsAssignCourseOpen(false);
    }
  };

  // Open assign course dialog
  const openAssignCourseDialog = (student: Student) => {
    setCurrentStudent(student);
    setSelectedCourseId('');
    setIsAssignCourseOpen(true);
  };

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  // Reset student form
  const resetStudentForm = () => {
    setStudentName('');
    setStudentEmail('');
  };
  return <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Student Management</h2>
          <p className="text-gray-600">
            Manage students and their course assignments.
          </p>
        </div>
        
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Full Name</Label>
                <Input id="studentName" placeholder="Enter student name" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Email</Label>
                <Input id="studentEmail" type="email" placeholder="Enter student email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddStudent} disabled={!studentName || !studentEmail}>
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student's information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editStudentName">Full Name</Label>
                <Input id="editStudentName" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentEmail">Email</Label>
                <Input id="editStudentEmail" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateStudent} disabled={!studentName || !studentEmail}>
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAssignCourseOpen} onOpenChange={setIsAssignCourseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Course</DialogTitle>
              <DialogDescription>
                Assign a course to {currentStudent?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseSelect">Select Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.filter(course => !currentStudent?.assignedCourses.includes(course.id)).map(course => <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAssignCourse} disabled={!selectedCourseId}>
                Assign Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {students.length === 0 ? <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No students available.</p>
          <Button onClick={() => setIsAddStudentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Student
          </Button>
        </div> : <Accordion type="single" collapsible className="space-y-4">
          {students.map(student => <AccordionItem key={student.id} value={student.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                openEditStudentDialog(student);
              }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                handleDeleteStudent(student.id);
              }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium">Assigned Courses</h4>
                  <Button size="sm" variant="outline" onClick={() => openAssignCourseDialog(student)}>
                    <Plus className="mr-2 h-4 w-4" /> Assign Course
                  </Button>
                </div>
                
                {student.assignedCourses.length === 0 ? <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No courses assigned yet.</p>
                    <Button variant="outline" onClick={() => openAssignCourseDialog(student)}>
                      <Plus className="mr-2 h-4 w-4" /> Assign First Course
                    </Button>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.assignedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      if (!course) return null;
                      const studentProgress = getStudentProgress(student.id, courseId);
                      const completedLessons = studentProgress.filter(p => p.completed).length;
                      const totalLessons = course.lessons.length;
                      const totalTimeSpent = studentProgress.reduce((total, p) => total + p.timeSpent, 0);
                      const quizScore = getTotalQuizScore(student.id, courseId);
                      const isLocked = studentProgress.some(p => p.locked);
                      return <div key={courseId} className="border rounded-md p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                              <div>
                                  <h5 className="font-semibold">{course.title}</h5>
                                  <p className="text-sm text-gray-600">
                                    Progress: {completedLessons} / {totalLessons} lessons
                                  </p>
                              </div>
                              <div className="flex space-x-1">
                                  <Button size="sm" variant={isLocked ? "default" : "outline"} className={isLocked ? "bg-red-600 hover:bg-red-700" : ""} onClick={() => toggleCourseLock(student.id, courseId)}>
                                      <LockIcon className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => removeCourseAssignment(student.id, courseId)}>
                                      <Trash className="h-3 w-3" />
                                  </Button>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center">
                                  <ClockIcon className="mr-1 h-3 w-3" />
                                  <span>
                                      Time spent: {formatTimeSpent(totalTimeSpent)}
                                  </span>
                              </div>
                              
                              <div className="flex items-center">
                                  <Eye className="mr-1 h-3 w-3" />
                                  <span>
                                      {studentProgress.filter(p => p.pdfViewed).length} / {totalLessons} viewed
                                  </span>
                              </div>
                          </div>
                          
                          {quizScore.total > 0 && <div className="mt-2 text-xs text-gray-600">
                              Quiz Score: {quizScore.score} / {quizScore.total}
                            </div>}
                      </div>;
                  })}
                </div>}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>}
    </div>;
};

// Main Admin Dashboard
const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
  const [activeTab, setActiveTab] = useState("courses");
  const isMobile = useIsMobile();
  
  if (isLoading || dataLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-fit inline-block">
            <TabsTrigger value="courses" className="mb-2 md:mb-0">Course Management</TabsTrigger>
            <TabsTrigger value="students" className="mb-2 md:mb-0">Student Management</TabsTrigger>
            <TabsTrigger value="quizzes" className="mb-2 md:mb-0">Quiz Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>
          
          <TabsContent value="students">
            <AdminStudentManagement />
          </TabsContent>
          
          <TabsContent value="quizzes">
            <QuizManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
