
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InstructorNotesProps {
  notes: string;
}

const InstructorNotes: React.FC<InstructorNotesProps> = ({ notes }) => {
  const hasNotes = notes && notes.trim() !== '';
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Instructor's Notes</h2>
      <Card>
        <CardContent className="p-6">
          {hasNotes ? (
            <div 
              className="prose max-w-none rich-text-editor"
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          ) : (
            <p className="text-gray-500 italic">No instructor notes available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorNotes;
