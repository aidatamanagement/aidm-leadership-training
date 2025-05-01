
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface QuizSetHeaderProps {
  title: string;
  onEditClick: (e: React.MouseEvent) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({
  title,
  onEditClick,
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between p-4">
      <CardTitle className="text-xl">{title}</CardTitle>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={onEditClick}
        className="p-2 h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

export default QuizSetHeader;
