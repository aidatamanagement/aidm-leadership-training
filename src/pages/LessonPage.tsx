import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Import our new components
import LessonHeader from '@/components/lesson/LessonHeader';
import PDFViewer from '@/components/lesson/PDFViewer';
import InstructorNotes from '@/components/lesson/InstructorNotes';
import QuizSection from '@/components/lesson/QuizSection';
import LessonNavigation from '@/components/lesson/LessonNavigation';

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
        console.log("Current lesson data:", currentLesson);
        console.log("PDF URL from lesson:", currentLesson.pdfUrl);
        
        // Find quiz set if it exists
        setQuizSet(
          currentLesson.quizSetId 
            ? quizSets.find(q => q.id === currentLesson.quizSetId) 
            : null
        );
        
        // Reset quiz state
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
            setQuizScore(lessonProgress.quizScore);
          }
          
          setIsPdfViewed(lessonProgress?.pdfViewed || false);
        }
      }
    }
  }, [courseId, lessonId, courses, quizSets, user, getStudentProgress]);

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
  }, [user, courseId, lessonId, updateTimeSpent]);

  // Save time spent every 30 seconds
  useEffect(() => {
    if (timeTracker > 0 && timeTracker % 30 === 0 && user && courseId && lessonId) {
      updateTimeSpent(user.id, courseId, lessonId, 30);
    }
  }, [timeTracker, user, courseId, lessonId, updateTimeSpent]);

  // Automatically mark PDF as viewed when component mounts
  useEffect(() => {
    if (user && courseId && lessonId && !isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  }, [user, courseId, lessonId, isPdfViewed, updatePdfViewed]);

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

  // Handle quiz completion
  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
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

  // Check if completion should be disabled
  const isCompletionDisabled = quizSet && quizSettings.enforcePassMark && (
    quizScore === 0 || 
    (quizScore / quizSet.questions.length * 100) < quizSettings.passMarkPercentage
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <LessonHeader
          courseId={courseId!}
          lessonTitle={lesson.title}
          lessonDescription={lesson.description}
          timeSpent={timeTracker + (progress?.timeSpent || 0)}
        />
        
        {/* Pass the PDF URL explicitly and log it */}
        {console.log("Rendering PDFViewer with URL:", lesson.pdfUrl)}
        <PDFViewer pdfUrl={lesson.pdfUrl} />
        
        <InstructorNotes notes={lesson.instructorNotes} />
        
        {quizSet && (
          <QuizSection 
            quizSet={quizSet} 
            quizSettings={quizSettings}
            onQuizComplete={handleQuizComplete}
          />
        )}
        
        <LessonNavigation 
          courseId={courseId!}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          onCompleteLesson={handleCompleteLesson}
          disableCompletion={isCompletionDisabled}
        />
      </div>
    </AppLayout>
  );
};

export default LessonPage;
