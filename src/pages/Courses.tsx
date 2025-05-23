import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { useProgress } from '@/contexts/ProgressContext';
import { BookOpen, ArrowRight } from 'lucide-react';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { getStudentProgress, getCompletedLessonsCount } = useProgress();
  const isAdmin = user?.type === 'admin';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Services</h1>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => {
            const studentProgress = getStudentProgress(user?.id || '', course.id);
            const completedLessons = getCompletedLessonsCount(user?.id || '', course.id);
            const totalLessons = course.lessons.length;
            const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            const hasStarted = studentProgress.length > 0;
            
            return (
              <GlassCard key={course.id} className="p-6 flex flex-col space-y-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-gray-400 ml-4" />
                </div>
                
                {hasStarted && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-600">
                    {hasStarted ? (
                      <span>{Math.round(progress)}% Complete</span>
                    ) : (
                      <span>{course.lessons.length} Lessons</span>
                    )}
                  </div>
                  <Button asChild variant="success" className="gap-2">
                    <Link to={`/courses/${course.id}`}>
                      {hasStarted ? 'Continue Service' : 'Start Service'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Courses; 