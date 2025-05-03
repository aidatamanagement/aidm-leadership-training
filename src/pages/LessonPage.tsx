
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';

// Import our components
import LessonHeader from '@/components/lesson/LessonHeader';
import PDFViewer from '@/components/lesson/PDFViewer';
import InstructorNotes from '@/components/lesson/InstructorNotes';
import QuizSection from '@/components/lesson/QuizSection';
import LessonNavigation from '@/components/lesson/LessonNavigation';

// Import custom hook
import { useLessonTimer } from '@/hooks/useLessonTimer';

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
    getStudentProgress,
    isLessonLocked
  } = useData();

  // State for course and lesson data
  const [course, setCourse] = useState(courses.find(c => c.id === courseId));
  const [lesson, setLesson] = useState(
    course?.lessons.find(l => l.id === lessonId)
  );
  const [quizSet, setQuizSet] = useState(
    lesson?.quizSetId ? quizSets.find(q => q.id === lesson.quizSetId) : null
  );
  
  // State for user interaction
  const [quizScore, setQuizScore] = useState(0);
  const [isPdfViewed, setIsPdfViewed] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Navigation state
  const [prevLesson, setPrevLesson] = useState<{ id: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);
  const [isNextLessonLocked, setIsNextLessonLocked] = useState(false);

  // Memoize the progress data to prevent unnecessary re-renders
  const progress = useMemo(() => {
    if (!user || !courseId || !lessonId) return null;
    const studentProgress = getStudentProgress(user.id, courseId);
    return studentProgress.find(p => p.lessonId === lessonId);
  }, [user, courseId, lessonId, getStudentProgress]);
  
  // Use our refactored timer hook with the memoized progress
  const { totalTimeSpent } = useLessonTimer({
    userId: user?.id || null,
    courseId: courseId || '',
    lessonId: lessonId || '',
    initialTimeSpent: progress?.timeSpent || 0,
    updateTimeSpent,
    saveIntervalSeconds: 30
  });

  // Handle PDF loading state change
  const handlePdfLoadingChange = (loading: boolean) => {
    setIsPdfLoading(loading);
    if (!loading) {
      // Add a small delay before removing the page loading state 
      // to ensure smooth transition
      setTimeout(() => setIsPageLoading(false), 300);
    }
  };

  useEffect(() => {
    // Set initial loading state
    setIsPageLoading(true);
    setIsPdfLoading(true);
    
    // Update data when URL params change
    const currentCourse = courses.find(c => c.id === courseId);
    setCourse(currentCourse);
    
    if (currentCourse) {
      const currentLesson = currentCourse.lessons.find(l => l.id === lessonId);
      setLesson(currentLesson);
      
      if (currentLesson) {
        console.log("Lesson PDF URL:", currentLesson.pdfUrl);
        
        // Find quiz set if exists
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
        
        const prevLessonData = currentIndex > 0 
          ? { id: sortedLessons[currentIndex - 1].id, title: sortedLessons[currentIndex - 1].title }
          : null;
        setPrevLesson(prevLessonData);
        
        const nextLessonData = currentIndex < sortedLessons.length - 1 
          ? { id: sortedLessons[currentIndex + 1].id, title: sortedLessons[currentIndex + 1].title }
          : null;
        setNextLesson(nextLessonData);
        
        // Check if next lesson is locked
        if (nextLessonData && user) {
          isLessonLocked(user.id, courseId, nextLessonData.id)
            .then(locked => {
              setIsNextLessonLocked(locked);
            })
            .catch(error => {
              console.error("Error checking if next lesson is locked:", error);
              setIsNextLessonLocked(false);
            });
        }
        
        // Load quiz score from progress if available
        if (progress?.quizScore !== null && progress?.quizSetId) {
          setQuizScore(progress.quizScore);
        }
        
        setIsPdfViewed(progress?.pdfViewed || false);
      } else {
        // If lesson is not found, remove the loading state
        setIsPageLoading(false);
      }
    } else {
      // If course is not found, remove the loading state
      setIsPageLoading(false);
    }
  }, [courseId, lessonId, courses, quizSets, user, progress]);

  // Automatically mark PDF as viewed (once)
  useEffect(() => {
    if (user && courseId && lessonId && !isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  }, [user, courseId, lessonId, isPdfViewed, updatePdfViewed]);

  // Error handling for missing data
  if (!user || !course || !lesson) {
    // If we're still loading, show the loading screen instead of the error
    if (isPageLoading) {
      return (
        <AppLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Lesson...</h2>
            <p className="text-gray-600">Please wait while we prepare your learning materials</p>
          </div>
        </AppLayout>
      );
    }
    
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

  // Handle completing the lesson
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

  // If the page is still loading, show a loading screen
  if (isPageLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Lesson...</h2>
          <p className="text-gray-600">Please wait while we prepare your learning materials</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <LessonHeader
          courseId={courseId!}
          lessonTitle={lesson.title}
          lessonDescription={lesson.description}
          timeSpent={totalTimeSpent}
        />
        
        <PDFViewer 
          pdfUrl={lesson.pdfUrl} 
          onLoadStateChange={handlePdfLoadingChange} 
        />
        
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
          isNextLessonLocked={isNextLessonLocked}
        />
      </div>
    </AppLayout>
  );
};

export default LessonPage;
