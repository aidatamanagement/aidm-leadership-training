
import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionTrigger,
} from '@/components/ui/accordion';

interface QuizSetHeaderProps {
  title: string;
  onEdit: (e: React.MouseEvent) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({ title, onEdit }) => {
  return (
    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="opacity-70 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation(); // Prevent accordion from toggling
            onEdit(e);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </AccordionTrigger>
  );
};

export default QuizSetHeader;
