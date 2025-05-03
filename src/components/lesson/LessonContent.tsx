
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

// Import our components
import PDFViewer from '@/components/lesson/PDFViewer';
import InstructorNotes from '@/components/lesson/InstructorNotes';
import QuizSection from '@/components/lesson/QuizSection';
import LessonNavigation from '@/components/lesson/LessonNavigation';

// Import custom hook
import { useLessonTimer } from '@/hooks/useLessonTimer';
import { useLessonData } from '@/hooks/useLessonData';

interface LessonContentProps {
  courseId: string;
  lessonId: string;
}

const LessonContent: React.FC<LessonContentProps> = ({ courseId, lessonId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    quizSettings,
    markLessonComplete, 
    updateTimeSpent, 
    updatePdfViewed
  } = useData();

  // Get lesson data from our custom hook
  const {
    lesson,
    quizSet,
    prevLesson,
    nextLesson,
    isNextLessonLocked,
    progress
  } = useLessonData();

  // State for user interaction
  const [quizScore, setQuizScore] = useState(0);
  const [isPdfViewed, setIsPdfViewed] = useState(false);
  
  // Use our timer hook with the memoized progress
  const { totalTimeSpent } = useLessonTimer({
    userId: user?.id || null,
    courseId,
    lessonId,
    initialTimeSpent: progress?.timeSpent || 0,
    updateTimeSpent,
    saveIntervalSeconds: 30
  });

  // Automatically mark PDF as viewed (once)
  useEffect(() => {
    if (user && courseId && lessonId && !isPdfViewed) {
      setIsPdfViewed(true);
      updatePdfViewed(user.id, courseId, lessonId);
    }
  }, [user, courseId, lessonId, isPdfViewed, updatePdfViewed]);

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
    markLessonComplete(user!.id, courseId, lessonId, quizScore);
    
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

  if (!lesson) return null;

  return (
    <div className="max-w-5xl mx-auto">
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
        courseId={courseId}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        onCompleteLesson={handleCompleteLesson}
        disableCompletion={isCompletionDisabled}
        isNextLessonLocked={isNextLessonLocked}
      />
    </div>
  );
};

export default LessonContent;
