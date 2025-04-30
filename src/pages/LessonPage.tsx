import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, QuizQuestion } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    courses, 
    quizSets, 
    quizSettings,
    markLessonComplete, 
    updateTimeSpent, 
    updatePdfViewed,
    isLessonAccessible,
    getStudentProgress
  } = useData();

  const [course, setCourse] = useState(courses.find(c => c.id === courseId));
  const [lesson, setLesson] = useState(
    course?.lessons.find(l => l.id === lessonId)
  );
  const [quizSet, setQuizSet] = useState(
    lesson?.quizSetId ? quizSets.find(q => q.id === lesson.quizSetId) : null
  );
  
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeTracker, setTimeTracker] = useState<number>(0);
  const [isPdfViewed, setIsPdfViewed] = useState(false);
  
  // For navigation between lessons
  const [prevLesson, setPrevLesson] = useState<{ id: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);

  // Keep track of lesson progress in local state
  const [progress, setProgress] = useState(
    user && courseId && lessonId 
      ? getStudentProgress(user.id, courseId).find(p => p.lessonId === lessonId)
      : null
  );

  useEffect(() => {
    // Update data when params change
    const currentCourse = courses.find(c => c.id === courseId);
    setCourse(currentCourse);
    
    if (currentCourse) {
      const currentLesson = currentCourse.lessons.find(l => l.id === lessonId);
      setLesson(currentLesson);
      
      if (currentLesson) {
        // Find quiz set if it exists
        setQuizSet(
          currentLesson.quizSetId 
            ? quizSets.find(q => q.id === currentLesson.quizSetId) 
            : null
        );
        
        // Reset quiz state
        setQuizAnswers([]);
        setQuizSubmitted(false);
        setQuizScore(0);
        
        // Calculate prev/next lessons for navigation
        const sortedLessons = [...currentCourse.lessons].sort((a, b) => a.order - b.order);
        const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
        
        setPrevLesson(
          currentIndex > 0 
            ? { id: sortedLessons[currentIndex - 1].id, title: sortedLessons[currentIndex - 1].title }
            : null
        );
        
        setNextLesson(
          currentIndex < sortedLessons.length - 1 
            ? { id: sortedLessons[currentIndex + 1].id, title: sortedLessons[currentIndex + 1].title }
            : null
        );
        
        // Check if this lesson is already completed
        if (user) {
          const lessonProgress = getStudentProgress(user.id, courseId).find(p => p.lessonId === lessonId);
          setProgress(lessonProgress);
          
          if (lessonProgress?.quizScore !== null && lessonProgress?.quizSetId) {
            setQuizSubmitted(true);
            setQuizScore(lessonProgress.quizScore);
          }
          
          setIsPdfViewed(lessonProgress?.pdfViewed || false);
        }
      }
    }
  }, [courseId, lessonId, courses, quizSets, user]);

  // Time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTracker(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      // Save time spent when component unmounts
      if (user && courseId && lessonId && timeTracker > 0) {
        updateTimeSpent(user.id, courseId, lessonId, timeTracker);
      }
    };
  }, [user, courseId, lessonId]);

  // Save time spent every 30 seconds
  useEffect(() => {
    if (timeTracker > 0 && timeTracker % 30 === 0 && user && courseId && lessonId) {
      updateTimeSpent(user.id, courseId, lessonId, 30);
    }
  }, [timeTracker, user, courseId, lessonId]);

  // Automatically mark PDF as viewed when component mounts
  useEffect(() => {
    if (user && courseId && lessonId && !isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  }, [user, courseId, lessonId, isPdfViewed]);

  if (!user || !course || !lesson) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">The lesson you are looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Handle when a user views the PDF
  const handlePdfView = () => {
    if (!isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  };

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

  // Handle completing the lesson and navigating to next
  const handleCompleteLesson = () => {
    // Check if this lesson has a required quiz
    if (quizSet && quizSettings.enforcePassMark) {
      const passPercentage = quizSettings.passMarkPercentage;
      const scorePercentage = quizScore / quizSet.questions.length * 100;
      
      if (scorePercentage < passPercentage) {
        toast({
          title: "Cannot Complete Lesson",
          description: "You need to pass the quiz before continuing.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Mark the lesson as completed
    markLessonComplete(user.id, courseId, lessonId, quizScore);
    
    // Navigate to next lesson or course completion page
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    } else {
      navigate(`/courses/${courseId}/completion`);
    }
  };

  // Handle retrying the quiz
  const handleRetryQuiz = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to={`/courses/${courseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </h1>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center text-gray-600">
              <Clock className="mr-2 h-4 w-4" />
              <span>Time spent: {formatTime(timeTracker + (progress?.timeSpent || 0))}</span>
            </div>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-gray-500">PDF Content</p>
              {/* PDF content would be displayed here */}
            </div>
          </CardContent>
        </Card>
        
        {/* Instructor Notes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Instructor's Notes</h2>
          <Card>
            <CardContent className="p-6">
              <div 
                className="rich-text-editor"
                dangerouslySetInnerHTML={{ __html: lesson.instructorNotes || 'No instructor notes available.' }}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Quiz Section (if applicable) */}
        {quizSet && (
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
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => {
                        let optionClass = 'quiz-option border rounded-md p-3 flex items-start';
                        
                        if (quizSubmitted) {
                          if (optionIndex === question.correctAnswer && quizAnswers[questionIndex] === optionIndex) {
                            optionClass += ' correct';
                          } else if (quizAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer) {
                            optionClass += ' incorrect';
                          }
                        }
                        
                        return (
                          <div 
                            key={optionIndex} 
                            className={optionClass}
                            onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                          >
                            <input 
                              type="radio" 
                              id={`q${questionIndex}-o${optionIndex}`}
                              name={`question-${question.id}`}
                              checked={quizAnswers[questionIndex] === optionIndex}
                              onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                              disabled={quizSubmitted}
                              className="mr-3 mt-1"
                            />
                            <label 
                              htmlFor={`q${questionIndex}-o${optionIndex}`}
                              className="flex-grow cursor-pointer"
                            >
                              {option}
                            </label>
                          </div>
                        );
                      })}
                    </div>
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
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {prevLesson ? (
            <Button asChild variant="outline">
              <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
              </Link>
            </Button>
          ) : (
            <div></div>
          )}
          
          <div className="flex gap-3">
            {nextLesson && (
              <Button 
                onClick={handleCompleteLesson}
                disabled={
                  quizSet && quizSettings.enforcePassMark && (
                    !quizSubmitted || 
                    (quizScore / quizSet.questions.length * 100) < quizSettings.passMarkPercentage
                  )
                }
              >
                Complete & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {!nextLesson && (
              <Button onClick={handleCompleteLesson}>
                Complete Course <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonPage;
