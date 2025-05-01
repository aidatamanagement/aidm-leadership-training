
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Course } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Eye } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    courses, 
    students, 
    getCompletedLessonsCount,
    getStudentProgress,
    getTotalQuizScore
  } = useData();

  if (!user) {
    return <div>Loading...</div>;
  }

  const currentStudent = students.find(s => s.id === user.id);
  if (!currentStudent) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
          <p>Your account is not set up properly. Please contact an administrator.</p>
        </div>
      </AppLayout>
    );
  }

  const assignedCourses = courses.filter(course => 
    currentStudent.assignedCourses.includes(course.id)
  );

  // Find the course with the most recent activity
  let lastActiveCourse: Course | null = null;
  let highestTimeSpent = 0;

  assignedCourses.forEach(course => {
    const progress = getStudentProgress(user.id, course.id);
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    
    if (totalTimeSpent > highestTimeSpent) {
      highestTimeSpent = totalTimeSpent;
      lastActiveCourse = course;
    }
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-600 max-w-lg">
              Continue your leadership development journey. Track your progress and access your assigned courses below.
            </p>
          </div>
        </div>

        {lastActiveCourse && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Continue where you left off</h2>
              <span className="text-sm text-gray-500">
                Last active: {new Date().toLocaleDateString()}
              </span>
            </div>
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle>{lastActiveCourse.title}</CardTitle>
                <CardDescription>{lastActiveCourse.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Your progress</p>
                  <div className="flex items-center">
                    <Progress 
                      value={
                        (getCompletedLessonsCount(user.id, lastActiveCourse.id) / 
                        lastActiveCourse.lessons.length) * 100
                      } 
                      className="h-2 flex-grow mr-2" 
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {getCompletedLessonsCount(user.id, lastActiveCourse.id)} / {lastActiveCourse.lessons.length} lessons
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full sm:w-auto">
                  <Link to={`/courses/${lastActiveCourse.id}`}>
                    Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Courses</h2>
          {assignedCourses.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <p className="text-gray-600">
                You don't have any courses assigned yet. Please contact your administrator.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {assignedCourses.map(course => {
                const completedLessons = getCompletedLessonsCount(user.id, course.id);
                const progress = (completedLessons / course.lessons.length) * 100;
                const quizScore = getTotalQuizScore(user.id, course.id);
                
                return (
                  <Card key={course.id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-gray-600">Your progress</p>
                          <span className="text-xs text-gray-600">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          <span>
                            {completedLessons} / {course.lessons.length} lessons completed
                          </span>
                        </div>
                        
                        {quizScore.total > 0 && (
                          <div className="flex items-center text-gray-600">
                            <Eye className="h-4 w-4 mr-1 text-primary" />
                            <span>
                              Quiz Score: {quizScore.score} / {quizScore.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" variant={completedLessons > 0 ? "outline" : "default"}>
                        <Link to={`/courses/${course.id}`}>
                          {completedLessons > 0 ? 'View Course' : 'Start Course'}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
