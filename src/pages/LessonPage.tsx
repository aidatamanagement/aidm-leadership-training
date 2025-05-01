
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { formatTimeSpent } from '@/lib/timeUtils';

// Import our components
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
  
  // Navigation state
  const [prevLesson, setPrevLesson] = useState<{ id: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);

  // Time tracking state with refs for more reliable tracking
  const [displayTime, setDisplayTime] = useState<number>(0);
  const timeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Track lesson progress
  const [progress, setProgress] = useState(
    user && courseId && lessonId 
      ? getStudentProgress(user.id, courseId).find(p => p.lessonId === lessonId)
      : null
  );

  // Initialize time tracker from saved progress
  useEffect(() => {
    if (progress?.timeSpent) {
      timeRef.current = progress.timeSpent;
      setDisplayTime(progress.timeSpent);
    }
  }, [progress]);

  useEffect(() => {
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
        
        // Load user progress for this lesson
        if (user) {
          const lessonProgress = getStudentProgress(user.id, courseId).find(p => p.lessonId === lessonId);
          setProgress(lessonProgress);
          
          if (lessonProgress?.quizScore !== null && lessonProgress?.quizSetId) {
            setQuizScore(lessonProgress.quizScore);
          }
          
          setIsPdfViewed(lessonProgress?.pdfViewed || false);
          
          // Reset time tracker for new lesson
          if (lessonProgress?.timeSpent) {
            timeRef.current = lessonProgress.timeSpent;
            setDisplayTime(lessonProgress.timeSpent);
          } else {
            timeRef.current = 0;
            setDisplayTime(0);
          }
        }
      }
    }
    
    // Clear any existing timer when params change
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Save current time spent if changing lesson
    saveTimeSpent();
    
    // Start a new timer for the current lesson
    startTimeTracking();
    
    return () => {
      // Clean up timer and save progress when unmounting
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      saveTimeSpent();
    };
  }, [courseId, lessonId, courses, quizSets, user, getStudentProgress]);

  // Time tracking functions
  const startTimeTracking = () => {
    if (timerRef.current) return; // Don't start if already running
    
    // Initialize the last update time
    lastUpdateRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      // Calculate elapsed time since last tick
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdateRef.current) / 1000);
      lastUpdateRef.current = now;
      
      // Update the time counter (both ref and state)
      timeRef.current += elapsed;
      setDisplayTime(timeRef.current);
      
      // Save time to backend every 30 seconds
      if (timeRef.current % 30 < elapsed && user && courseId && lessonId) {
        updateTimeSpent(user.id, courseId, lessonId, elapsed);
        console.log(`Time tracking: saved ${elapsed} seconds`);
      }
    }, 1000);
  };
  
  const saveTimeSpent = () => {
    // Calculate time to save
    const timeToSave = timeRef.current - (progress?.timeSpent || 0);
    
    // Only save if there's meaningful time to record
    if (user && courseId && lessonId && timeToSave > 0) {
      updateTimeSpent(user.id, courseId, lessonId, timeToSave);
      console.log(`Time tracking: saved ${timeToSave} seconds on unmount/change`);
    }
  };
  
  // Set up visibility change handler to pause/resume timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden, pause timer and save progress
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          saveTimeSpent();
        }
      } else {
        // Page is visible again, resume timer
        startTimeTracking();
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start time tracking when component mounts
    startTimeTracking();
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      saveTimeSpent();
    };
  }, [user, courseId, lessonId]);

  // Automatically mark PDF as viewed
  useEffect(() => {
    if (user && courseId && lessonId && !isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  }, [user, courseId, lessonId, isPdfViewed, updatePdfViewed]);

  // Error handling for missing data
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
    
    // Save current time before completing
    saveTimeSpent();
    
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

  // Format the display time
  const formattedTime = formatTimeSpent(displayTime);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <LessonHeader
          courseId={courseId!}
          lessonTitle={lesson.title}
          lessonDescription={lesson.description}
          timeSpent={displayTime}
          formattedTimeSpent={formattedTime}
        />
        
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
