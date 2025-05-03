
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    console.log("PDF loaded successfully:", pdfUrl);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error("Failed to load PDF:", pdfUrl);
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL.');
  };

  if (!pdfUrl) {
    return (
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="bg-gray-100 rounded-lg p-6 min-h-[40vh] sm:min-h-[80vh] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        {isLoading && (
          <div className="w-full h-[80vh]">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        {error ? (
          <div className="bg-gray-100 rounded-lg p-6 h-[80vh] flex flex-col items-center justify-center">
            <p className="text-red-500">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
          </div>
        ) : (
          <iframe 
            src={pdfUrl}
            className="w-full h-[80vh] border-0"
            onLoad={handleLoad}
            onError={handleError}
            title="PDF Document"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
