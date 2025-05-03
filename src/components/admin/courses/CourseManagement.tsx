
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Eye, Check } from 'lucide-react';
import PDFUploader from '@/components/lesson/PDFUploader';
import RichTextEditor from '@/components/RichTextEditor';

// Import types needed from DataContext
import type { Course, Lesson } from '@/contexts/DataContext';

const CourseManagement: React.FC = () => {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addLesson,
    updateLesson,
    deleteLesson,
    quizSets
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
  const [pdfUrl, setPdfUrl] = useState<string>('');

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

  // Handle PDF upload completion
  const handlePdfUploadComplete = (url: string) => {
    setPdfUrl(url);
  };

  // Handle add lesson
  const handleAddLesson = () => {
    if (currentCourse) {
      addLesson(currentCourse.id, {
        title: lessonTitle,
        description: lessonDescription,
        pdfUrl: pdfUrl || '/placeholder.pdf',
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
        quizSetId: selectedQuizSetId,
        pdfUrl: pdfUrl || currentLesson.pdfUrl, // Use new URL if uploaded, otherwise keep existing
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
    setPdfUrl(lesson.pdfUrl);
    setIsEditLessonOpen(true);
  };

  // Reset lesson form
  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setInstructorNotes('');
    setSelectedQuizSetId(null);
    setPdfUrl('');
  };
  
  return (
    <div>
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
      
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">No courses available.</p>
          <Button onClick={() => setIsAddCourseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Course
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {courses.map(course => (
            <AccordionItem key={course.id} value={course.id} className="border rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                  <div className="text-left mb-2 md:mb-0">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      asChild 
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      <Link to={`/courses/${course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={e => {
                        e.stopPropagation();
                        openEditCourseDialog(course);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCourse(course);
                      }}
                    >
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
                          <PDFUploader 
                            lessonId={`new-lesson-${Date.now()}`} 
                            onUploadComplete={handlePdfUploadComplete} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instructorNotes">Instructor Notes</Label>
                          <RichTextEditor 
                            value={instructorNotes} 
                            onChange={setInstructorNotes}
                            
                            rows={6}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Attach Quiz Set (Optional)</Label>
                          <Select value={selectedQuizSetId || 'none'} onValueChange={value => setSelectedQuizSetId(value === 'none' ? null : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quiz set (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {quizSets.map(quizSet => (
                                <SelectItem key={quizSet.id} value={quizSet.id}>
                                  {quizSet.title} ({quizSet.questions.length} questions)
                                </SelectItem>
                              ))}
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
                          <PDFUploader 
                            lessonId={currentLesson?.id || `edit-lesson-${Date.now()}`}
                            onUploadComplete={handlePdfUploadComplete}
                            currentPdfUrl={currentLesson?.pdfUrl}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editInstructorNotes">Instructor Notes</Label>
                          <RichTextEditor 
                            value={instructorNotes} 
                            onChange={setInstructorNotes}
                            placeholder="Add instructor notes (supports HTML)"
                            rows={6}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Attach Quiz Set (Optional)</Label>
                          <Select value={selectedQuizSetId || 'none'} onValueChange={value => setSelectedQuizSetId(value === 'none' ? null : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quiz set (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {quizSets.map(quizSet => (
                                <SelectItem key={quizSet.id} value={quizSet.id}>
                                  {quizSet.title} ({quizSet.questions.length} questions)
                                </SelectItem>
                              ))}
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
                
                {course.lessons.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No lessons in this course yet.</p>
                    <Button variant="outline" onClick={() => openAddLessonDialog(course)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...course.lessons].sort((a, b) => a.order - b.order).map(lesson => (
                      <div key={lesson.id} className="border rounded-md p-4 bg-white">
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
                        {lesson.quizSetId && (
                          <div className="mt-2 text-xs inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded">
                            <Check className="mr-1 h-3 w-3" />
                            Has Quiz
                          </div>
                        )}
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

export default CourseManagement;
