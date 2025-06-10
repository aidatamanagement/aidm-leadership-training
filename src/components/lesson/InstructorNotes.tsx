import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InstructorNotesProps {
  notes: string;
  required?: boolean;
  requiredClassName?: string;
}

const InstructorNotes: React.FC<InstructorNotesProps> = ({ 
  notes, 
  required = false,
  requiredClassName = "text-red-500 ml-1" 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasNotes = notes && notes.trim() !== '';
  
  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold flex items-center">
          Instructor's Notes
          {required && <span className={requiredClassName}>*</span>}
        </h2>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </Button>
      
      {isOpen && (
        <Card className="mt-2">
          <CardContent className="p-6">
            {hasNotes ? (
              <div 
                className="prose max-w-none rich-text-editor"
                dangerouslySetInnerHTML={{ __html: notes }}
              />
            ) : (
              <p className="text-gray-500 italic">
                {required ? 'Instructor notes are required.' : 'No instructor notes available.'}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstructorNotes;
