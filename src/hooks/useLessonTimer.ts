
import { useState, useEffect, useRef } from 'react';

interface UseLessonTimerProps {
  userId: string | null;
  courseId: string;
  lessonId: string;
  initialTimeSpent: number;
  updateTimeSpent: (userId: string, courseId: string, lessonId: string, seconds: number) => void;
  saveIntervalSeconds?: number;
}

export function useLessonTimer({
  userId,
  courseId,
  lessonId,
  initialTimeSpent,
  updateTimeSpent,
  saveIntervalSeconds = 30
}: UseLessonTimerProps) {
  // Use useState for the displayed total time (initial + current session)
  const [totalTimeSpent, setTotalTimeSpent] = useState(initialTimeSpent);
  
  // Use refs for tracking the current session time to avoid re-render issues
  const sessionTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  
  // Track if the page is visible
  const isPageVisibleRef = useRef(true);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === 'visible';
      console.log(`Lesson page visibility changed: ${isPageVisibleRef.current ? 'visible' : 'hidden'}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Start the timer
  useEffect(() => {
    console.log(`Starting timer with initial time: ${initialTimeSpent}s`);
    
    const incrementTime = () => {
      // Only increment if page is visible
      if (isPageVisibleRef.current) {
        sessionTimeRef.current += 1;
        setTotalTimeSpent(initialTimeSpent + sessionTimeRef.current);
        
        // Save periodically
        if (userId && sessionTimeRef.current - lastSaveTimeRef.current >= saveIntervalSeconds) {
          const timeToSave = sessionTimeRef.current - lastSaveTimeRef.current;
          console.log(`Saving ${timeToSave}s of time (periodic)`);
          updateTimeSpent(userId, courseId, lessonId, timeToSave);
          lastSaveTimeRef.current = sessionTimeRef.current;
        }
      }
    };

    // Set up the timer
    timerIdRef.current = window.setInterval(incrementTime, 1000);
    
    // Cleanup function
    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
      
      // Save remaining time on unmount if needed
      if (userId && sessionTimeRef.current > lastSaveTimeRef.current) {
        const remainingTime = sessionTimeRef.current - lastSaveTimeRef.current;
        console.log(`Saving ${remainingTime}s of time (unmount)`);
        updateTimeSpent(userId, courseId, lessonId, remainingTime);
      }
    };
  }, [userId, courseId, lessonId, initialTimeSpent, updateTimeSpent, saveIntervalSeconds]);

  return {
    totalTimeSpent,
    sessionTime: sessionTimeRef.current
  };
}
