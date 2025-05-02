
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InstructorNotesProps {
  notes: string;
}

const InstructorNotes: React.FC<InstructorNotesProps> = ({ notes }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Instructor's Notes</h2>
      <Card>
        <CardContent className="p-6">
          <div 
            className="prose max-w-none rich-text-editor"
            dangerouslySetInnerHTML={{ __html: notes || 'No instructor notes available.' }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorNotes;
