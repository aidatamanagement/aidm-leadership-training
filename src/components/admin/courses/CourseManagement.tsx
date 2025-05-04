
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Eye, Check, FileIcon, ExternalLink } from 'lucide-react';
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

  // Define a more subtle required field indicator style
  const requiredFieldIndicator = "";
  const requiredHelpText = "text-xs text-gray-500";

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
        pdfUrl: pdfUrl,
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
        pdfUrl: pdfUrl
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

  // Helper function to validate URL
  const isValidUrl = (urlString: string): boolean => {
    try { 
      new URL(urlString); 
      return true;
    }
    catch(e){ 
      return false;
    }
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                  <div className="text-left mb-2 md:mb-0">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" asChild onClick={e => {
                e.stopPropagation();
              }}>
                      <Link to={`/courses/${course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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
                        <div className="grid grid-cols-1 gap-4">
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
                          <Label htmlFor="pdfUrl" className="flex items-center">
                            PDF URL
                          </Label>
                          <div className="flex gap-2">
                            <Input 
                              id="pdfUrl" 
                              placeholder="Enter URL to PDF document" 
                              value={pdfUrl} 
                              onChange={e => setPdfUrl(e.target.value)} 
                              className={pdfUrl && !isValidUrl(pdfUrl) ? "border-red-500" : ""}
                              required
                            />
                            {pdfUrl && isValidUrl(pdfUrl) && (
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(pdfUrl, '_blank')}
                                title="Open PDF in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {!pdfUrl && (
                            <p className={requiredHelpText}>Please enter a URL to a PDF document</p>
                          )}
                          {pdfUrl && !isValidUrl(pdfUrl) && (
                            <p className="text-xs text-amber-600">Please enter a valid URL</p>
                          )}
                          <p className="text-xs text-gray-500">Enter the full URL to a PDF document (e.g., https://drive.google.com/file/d/FILE_ID/preview)</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instructorNotes" className="flex items-center">
                            Instructor Notes
                          </Label>
                          <RichTextEditor value={instructorNotes} onChange={setInstructorNotes} rows={6} />
                          {!instructorNotes && (
                            <p className={requiredHelpText}>Please add instructions for this lesson</p>
                          )}
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
                        <Button 
                          onClick={handleAddLesson} 
                          disabled={!lessonTitle || !lessonDescription || !pdfUrl || !isValidUrl(pdfUrl) || !instructorNotes}
                        >
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
                        <div className="grid grid-cols-1 gap-4">
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
                          <Label htmlFor="editPdfUrl" className="flex items-center">
                            PDF URL
                          </Label>
                          <div className="flex gap-2">
                            <Input 
                              id="editPdfUrl" 
                              placeholder="Enter URL to PDF document" 
                              value={pdfUrl} 
                              onChange={e => setPdfUrl(e.target.value)} 
                              className={pdfUrl && !isValidUrl(pdfUrl) ? "border-red-500" : ""}
                              required
                            />
                            {pdfUrl && isValidUrl(pdfUrl) && (
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(pdfUrl, '_blank')}
                                title="Open PDF in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {!pdfUrl && (
                            <p className={requiredHelpText}>Please enter a URL to a PDF document</p>
                          )}
                          {currentLesson?.pdfUrl && (
                            <div className="bg-gray-50 p-3 rounded-md border flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  Current PDF
                                </span>
                              </div>
                              <a 
                                href={currentLesson.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center"
                              >
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editInstructorNotes" className="flex items-center">
                            Instructor Notes
                          </Label>
                          <RichTextEditor value={instructorNotes} onChange={setInstructorNotes} placeholder="" rows={6} />
                          {!instructorNotes && (
                            <p className={requiredHelpText}>Please add instructions for this lesson</p>
                          )}
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
                        <Button 
                          onClick={handleUpdateLesson} 
                          disabled={!lessonTitle || !lessonDescription || !pdfUrl || !isValidUrl(pdfUrl) || !instructorNotes}
                        >
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
                        <div className="flex justify-between items-start mb-2 sm:flex-wrap">
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
                        <div className="flex flex-wrap gap-2">
                          {lesson.quizSetId && <div className="mt-2 text-xs inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded">
                              <Check className="mr-1 h-3 w-3" />
                              Has Quiz
                            </div>}
                          {lesson.pdfUrl && <div className="mt-2 text-xs inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              <FileIcon className="mr-1 h-3 w-3" />
                              PDF
                            </div>}
                        </div>
                      </div>)}
                  </div>}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>}
    </div>;
};
export default CourseManagement;
