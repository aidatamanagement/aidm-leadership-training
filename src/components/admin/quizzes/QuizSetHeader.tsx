
import React, { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check, X } from 'lucide-react';

interface QuizSetHeaderProps {
  title: string;
  onTitleUpdate: (newTitle: string) => void;
}

const QuizSetHeader: React.FC<QuizSetHeaderProps> = ({ 
  title, 
  onTitleUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSubmit = () => {
    if (editedTitle.trim()) {
      onTitleUpdate(editedTitle);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  return (
    <CardHeader>
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="font-semibold text-lg"
              placeholder="Enter quiz title"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSubmit}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit quiz title</span>
          </Button>
        </div>
      )}
    </CardHeader>
  );
};

export default QuizSetHeader;
