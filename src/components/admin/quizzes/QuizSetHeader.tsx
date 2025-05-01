
import React, { useState } from 'react';
import { AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import EditQuizTitleDialog from './EditQuizTitleDialog';

interface QuizSetHeaderProps {
  quizSetId: string;
  title: string;
  onDelete: () => void;
  onTitleUpdate?: (newTitle: string) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({ 
  quizSetId, 
  title, 
  onDelete,
  onTitleUpdate 
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleTitleUpdated = () => {
    if (onTitleUpdate) {
      onTitleUpdate(title);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <AccordionTrigger className="flex-1 text-left">
        <span>{title}</span>
      </AccordionTrigger>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent accordion from toggling
            setEditDialogOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent accordion from toggling
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      
      <EditQuizTitleDialog
        quizSetId={quizSetId}
        currentTitle={title}
        isOpen={editDialogOpen}
        setIsOpen={setEditDialogOpen}
        onSuccess={handleTitleUpdated}
      />
    </div>
  );
};

export default QuizSetHeader;
