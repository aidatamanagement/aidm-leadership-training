
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/AppLayout';

interface LessonErrorProps {
  message?: string;
}

const LessonError: React.FC<LessonErrorProps> = ({ 
  message = "The lesson you are looking for doesn't exist or you don't have access."
}) => {
  return (
    <AppLayout>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default LessonError;
