import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Play, Eye, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { 
    courses, 
    isLessonAccessible, 
    getStudentProgress,
    getTotalQuizScore,
    isCourseLockedForUser,
    isLessonLocked,
    isLoading
  } = useData();
  const isMobile = useIsMobile();

  const [course, setCourse] = useState(courses.find(c => c.id === courseId));
  const [lessonLocks, setLessonLocks] = useState<Record<string, boolean>>({});
  const [loadingLocks, setLoadingLocks] = useState(false);
  const isAdmin = user?.type === 'admin';

  useEffect(() => {
    setCourse(courses.find(c => c.id === courseId));
  }, [courses, courseId]);

  // Load lesson locks when component mounts
  useEffect(() => {
    if (!user || !courseId || isAdmin) return;

    const loadLessonLocks = async () => {
      try {
        setLoadingLocks(true);
        // For each lesson, check if it's locked
        if (course) {
          const lockPromises = course.lessons.map(async (lesson) => {
            const isLocked = await isLessonLocked(user.id, courseId, lesson.id);
            return { lessonId: lesson.id, isLocked };
          });
          
          const results = await Promise.all(lockPromises);
          
          const lockMap: Record<string, boolean> = {};
          results.forEach(({ lessonId, isLocked }) => {
            lockMap[lessonId] = isLocked;
          });
          
          setLessonLocks(lockMap);
        }
      } catch (error) {
        console.error('Error loading lesson locks:', error);
      } finally {
        setLoadingLocks(false);
      }
    };
    
    loadLessonLocks();
  }, [user, courseId, course, isAdmin, isLessonLocked]);

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const currentStudent = user;
  if (!course) {
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

  const quizScore = getTotalQuizScore(user.id, course.id);
  
  // Sort lessons by order
  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  // Function to check if a specific lesson is locked
  const isLessonLockedForStudent = (lessonId: string) => {
    return lessonLocks[lessonId] || false;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to={isAdmin ? "/admin" : "/dashboard"}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              {isAdmin ? "Back to Admin Dashboard" : "Back to Dashboard"}
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
                {isAdmin && (
                  <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700">
                    Preview Mode
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 max-w-2xl">{course.description}</p>
            </div>
            
            {quizScore.total > 0 && (
              <div className="mt-4 md:mt-0 p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Quiz Score</div>
                <div className="text-lg font-semibold flex items-center">
                  {quizScore.score} <span className="mx-1">out of</span> {quizScore.total}
                  <Eye className="ml-2 h-4 w-4 text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Course Content</h2>
        <div className="space-y-4">
          {sortedLessons.map((lesson) => {
            // For admins, all lessons are accessible in preview mode
            const isAccessible = isAdmin || isLessonAccessible(user.id, course.id, lesson.order);
            const progress = getStudentProgress(user.id, course.id).find(p => p.lessonId === lesson.id);
            const isCompleted = progress?.completed || false;
            const isCurrentLessonLocked = isAdmin ? false : isLessonLockedForStudent(lesson.id);
            
            return (
              <Card 
                key={lesson.id} 
                className={`${
                  isCompleted 
                    ? 'border-l-4 border-l-green-500' 
                    : isAccessible 
                    ? 'border-l-4 border-l-primary' 
                    : 'border-l-4 border-l-gray-300 opacity-75'
                } ${isCurrentLessonLocked ? 'bg-gray-50' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row items-center justify-between'}`}>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {lesson.order}. {lesson.title}
                        {isCompleted && !isCurrentLessonLocked && (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        )}
                        {isCurrentLessonLocked && (
                          <Lock className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </CardTitle>
                      <div className="space-y-2 mt-2">
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {lesson.quizSetId && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              Includes Quiz
                            </Badge>
                          )}
                          
                          {progress && progress.quizScore !== null && (
                            <div className="text-xs text-gray-600">
                              Quiz Score: {progress.quizScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                      {isCurrentLessonLocked ? (
                        <Button 
                          disabled 
                          size="sm" 
                          variant="outline" 
                          className={isMobile ? 'w-full justify-center' : ''}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Lesson Locked
                        </Button>
                      ) : isAccessible ? (
                        <Button 
                          asChild 
                          size="sm" 
                          variant={isCompleted ? "outline" : "default"}
                          className={isMobile ? 'w-full justify-center' : ''}
                        >
                          <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                            {isCompleted ? (
                              <>View Lesson <Eye className="ml-2 h-4 w-4" /></>
                            ) : (
                              <>Start Lesson <Play className="ml-2 h-4 w-4" /></>
                            )}
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          disabled 
                          size="sm" 
                          variant="outline"
                          className={isMobile ? 'w-full justify-center' : ''}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Complete Previous Lesson
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Any additional content we want to keep */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetails;
