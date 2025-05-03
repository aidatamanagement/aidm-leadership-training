
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
  // State only for display purposes - doesn't affect the timer's internal tracking
  const [displayedTime, setDisplayedTime] = useState(initialTimeSpent);
  
  // Use refs to prevent re-renders and dependency changes from affecting the timer
  const initialTimeRef = useRef(initialTimeSpent);
  const sessionTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const isPageVisibleRef = useRef(true);
  const hasInitializedRef = useRef(false);

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

  // Start the timer only once when component mounts
  useEffect(() => {
    // Prevent multiple initializations if dependencies change
    if (hasInitializedRef.current) {
      return;
    }
    
    // Mark as initialized
    hasInitializedRef.current = true;
    
    // Store the initial time in the ref
    initialTimeRef.current = initialTimeSpent;
    
    console.log(`Starting timer with initial time: ${initialTimeRef.current}s`);
    
    const incrementTime = () => {
      // Only increment if page is visible
      if (isPageVisibleRef.current) {
        sessionTimeRef.current += 1;
        setDisplayedTime(initialTimeRef.current + sessionTimeRef.current);
        
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
  }, [userId, courseId, lessonId]); // Remove initialTimeSpent and updateTimeSpent from dependencies

  return {
    totalTimeSpent: displayedTime,
    sessionTime: sessionTimeRef.current
  };
}
