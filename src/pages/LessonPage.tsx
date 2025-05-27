import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

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
  
  // Navigation state
  const [prevLesson, setPrevLesson] = useState<{ id: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);
  const [isNextLessonLocked, setIsNextLessonLocked] = useState(false);
  const [isCurrentLessonLocked, setIsCurrentLessonLocked] = useState(false);

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
        
        const prevLessonData = currentIndex > 0 
          ? { id: sortedLessons[currentIndex - 1].id, title: sortedLessons[currentIndex - 1].title }
          : null;
        setPrevLesson(prevLessonData);
        
        const nextLessonData = currentIndex < sortedLessons.length - 1 
          ? { id: sortedLessons[currentIndex + 1].id, title: sortedLessons[currentIndex + 1].title }
          : null;
        setNextLesson(nextLessonData);
        
        // Check if current lesson is locked
        if (user) {
          isLessonLocked(user.id, courseId, currentLesson.id)
            .then(locked => {
              setIsCurrentLessonLocked(locked);
            })
            .catch(error => {
              console.error("Error checking if current lesson is locked:", error);
              setIsCurrentLessonLocked(false);
            });
        }
        
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
      }
    }
  }, [courseId, lessonId, courses, quizSets, user, progress, isLessonLocked]);

  // Automatically mark PDF as viewed (once)
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
          <Button onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  // If the current lesson is locked, show a locked message
  if (isCurrentLessonLocked && user.type !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Lesson Locked</h2>
          <p className="text-gray-600 mb-6">This lesson has been locked by your instructor.</p>
          <Button onClick={() => navigate(-1)}>
            Back to Course
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
  const handleCompleteLesson = async () => {
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
    await markLessonComplete(user.id, courseId, lessonId, quizScore);
    
    // Check if next lesson is locked before navigating
    if (nextLesson) {
      try {
        const isNextLocked = await isLessonLocked(user.id, courseId, nextLesson.id);
        
        if (isNextLocked && user.type !== 'admin') {
          toast({
            title: "Next Lesson Locked",
            description: "The next lesson is currently locked. Please contact your instructor for access.",
            variant: "destructive"
          });
          // Stay on current lesson
          return;
        }
        
        // If next lesson is not locked or user is admin, proceed with navigation
        navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
      } catch (error) {
        console.error("Error checking next lesson lock status:", error);
        toast({
          title: "Error",
          description: "Failed to check next lesson status. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // If there's no next lesson, go to course completion page
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
          timeSpent={totalTimeSpent}
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
          isNextLessonLocked={isNextLessonLocked}
        />
      </div>
    </AppLayout>
  );
};

export default LessonPage;
