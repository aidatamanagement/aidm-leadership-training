
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface QuizSetHeaderProps {
  title: string;
  description?: string;
  onEdit: (e: React.MouseEvent) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({ 
  title, 
  description,
  onEdit
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit quiz title</span>
        </Button>
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </CardHeader>
  );
};

export default QuizSetHeader;
