
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PDFViewer: React.FC = () => {
  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-gray-500">PDF Content</p>
          {/* PDF content would be displayed here */}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
