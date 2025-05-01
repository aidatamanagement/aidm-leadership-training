
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface QuizSetHeaderProps {
  title: string;
  onTitleUpdate: (newTitle: string) => Promise<void>;
  onEditClick: (e: React.MouseEvent) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({ title, onTitleUpdate, onEditClick }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-xl font-bold">{title}</CardTitle>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={onEditClick}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

export default QuizSetHeader;
