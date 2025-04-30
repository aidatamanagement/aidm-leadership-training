
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

const CourseCompletion: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { courses } = useData();
  const [course, setCourse] = useState(courses.find(c => c.id === courseId));

  useEffect(() => {
    setCourse(courses.find(c => c.id === courseId));
  }, [courses, courseId]);

  if (!user || !course) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you are looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-primary/10 p-8 rounded-lg mb-8">
          <div className="h-40 mb-6 flex items-center justify-center">
            {/* This is where you'd add a Lottie animation */}
            <div className="text-5xl text-primary">🎉</div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Congratulations! You've completed the {course.title}
          </h1>
          
          <p className="text-gray-600 mb-8">
            You have successfully completed all lessons in this course. Your achievement has been recorded.
            Keep up the great work on your leadership journey!
          </p>
          
          <Button asChild size="lg">
            <Link to="/dashboard">Go To Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseCompletion;
