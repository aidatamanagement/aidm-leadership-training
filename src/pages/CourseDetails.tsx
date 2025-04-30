import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Play, Eye, ArrowLeft } from 'lucide-react';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { 
    courses, 
    isLessonAccessible, 
    getStudentProgress,
    getTotalQuizScore
  } = useData();

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

  const quizScore = getTotalQuizScore(user.id, course.id);
  
  // Sort lessons by order
  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
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
            const isAccessible = isLessonAccessible(user.id, course.id, lesson.order);
            const progress = getStudentProgress(user.id, course.id).find(p => p.lessonId === lesson.id);
            const isCompleted = progress?.completed || false;
            
            return (
              <Card 
                key={lesson.id} 
                className={`${
                  isCompleted 
                    ? 'border-l-4 border-l-green-500' 
                    : isAccessible 
                    ? 'border-l-4 border-l-primary' 
                    : 'border-l-4 border-l-gray-300 opacity-75'
                }`}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {lesson.order}. {lesson.title}
                    {isCompleted && (
                      <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-500" />
                    )}
                  </CardTitle>
                  <div className="flex-shrink-0">
                    {isAccessible ? (
                      <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
                        <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                          {isCompleted ? (
                            <>View Lesson <Eye className="ml-2 h-4 w-4" /></>
                          ) : (
                            <>Start Lesson <Play className="ml-2 h-4 w-4" /></>
                          )}
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled size="sm" variant="outline">
                        <Lock className="mr-2 h-4 w-4" /> Complete Previous Lesson
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                      
                      {lesson.quizSetId && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Includes Quiz
                        </Badge>
                      )}
                      
                      {progress && progress.quizScore !== null && (
                        <div className="text-xs text-gray-600">
                          Quiz Score: {progress.quizScore} / {progress.quizScore !== null ? 'N/A' : '?'}
                        </div>
                      )}
                    </div>
                  </div>
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
