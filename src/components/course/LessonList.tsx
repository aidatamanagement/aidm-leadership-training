import React from 'react';
import { Link } from 'react-router-dom';
import { Lesson } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonListProps {
  course: {
    id: string;
    title: string;
  };
  lessons: Lesson[];
  studentProgress: any[];
  quizScores: { score: number; total: number };
  isAdmin: boolean;
  lessonAccessibility: Record<string, boolean>;
  loadingAccessibility: boolean;
}

const LessonList: React.FC<LessonListProps> = ({
  course,
  lessons,
  studentProgress,
  quizScores,
  isAdmin,
  lessonAccessibility,
  loadingAccessibility
}) => {
  const getLessonStatus = (lessonId: string) => {
    const progress = studentProgress.find(p => p.lessonId === lessonId);
    if (progress?.completed) return 'completed';
    if (progress?.started) return 'in-progress';
    return 'not-started';
  };

  const isLessonAccessible = (lessonId: string) => {
    if (isAdmin) return true;
    return lessonAccessibility[lessonId] ?? false;
  };

  if (loadingAccessibility) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => {
        const status = getLessonStatus(lesson.id);
        const accessible = isLessonAccessible(lesson.id);
        
        return (
          <Card key={lesson.id} className={`p-4 ${!accessible ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
                <div>
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="text-sm text-gray-500">{lesson.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!accessible && (
                  <div className="flex items-center text-red-500">
                    <Lock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Locked</span>
                  </div>
                )}
                <Button
                  asChild
                  variant={status === 'completed' ? 'outline' : 'default'}
                  disabled={!accessible && !isAdmin}
                >
                  <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                    {status === 'completed' ? 'Review' : 'Start'}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LessonList;
