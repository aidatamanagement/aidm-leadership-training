
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

// Custom hook to manage lesson data
export function useLessonData() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const { 
    courses, 
    quizSets,
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
      }
    }
  }, [courseId, lessonId, courses, quizSets, user, isLessonLocked]);

  return {
    course,
    lesson,
    quizSet,
    prevLesson,
    nextLesson,
    isNextLessonLocked,
    progress
  };
}
