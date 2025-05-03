
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye } from 'lucide-react';

interface CourseHeaderProps {
  courseTitle: string;
  courseDescription: string;
  isAdmin: boolean;
  quizScore: { score: number; total: number };
  isMobile: boolean;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  courseTitle,
  courseDescription,
  isAdmin,
  quizScore,
  isMobile
}) => {
  return (
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
            {courseTitle}
            {isAdmin && (
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700">
                Preview Mode
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 max-w-2xl">{courseDescription}</p>
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
  );
};

export default CourseHeader;
