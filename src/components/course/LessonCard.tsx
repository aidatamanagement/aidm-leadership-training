import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Play, Eye } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    id: string;
    order: number;
    title: string;
    description: string;
    quizSetId: string | null;
  };
  courseId: string;
  isCompleted: boolean;
  isAccessible: boolean;
  isCurrentLessonLocked: boolean;
  isMobile: boolean;
  quizScore: number | null;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  courseId,
  isCompleted,
  isAccessible,
  isCurrentLessonLocked,
  isMobile,
  quizScore
}) => {
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
            <div className="text-lg flex items-center">
              {lesson.order}. {lesson.title}
              {isCompleted && !isCurrentLessonLocked && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
              {isCurrentLessonLocked && (
                <Lock className="ml-2 h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="space-y-2 mt-2">
              <p className="text-sm text-gray-600">{lesson.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {lesson.quizSetId && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Includes Quiz
                  </Badge>
                )}
                
                {quizScore !== null && (
                  <div className="text-xs text-gray-600">
                    Quiz Score: {quizScore}
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
                <Link to={`/courses/${courseId}/lessons/${lesson.id}`}>
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
};

export default LessonCard;
