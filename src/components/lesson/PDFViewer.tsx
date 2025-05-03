
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleLoad = () => {
    console.log("PDF loaded successfully:", pdfUrl);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error("Failed to load PDF:", pdfUrl);
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL.');
  };

  // Set height based on device type
  const viewerHeight = isMobile ? 'h-[50vh]' : 'h-[80vh]';

  if (!pdfUrl) {
    return (
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center w-full min-h-[40vh] sm:min-h-[80vh]">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-0">
        <div className={`w-full ${viewerHeight} relative`}>
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="w-full h-full m-0 rounded-none" />
            </div>
          )}
          
          {error ? (
            <div className="bg-gray-100 w-full h-full flex flex-col items-center justify-center">
              <p className="text-red-500">Error loading PDF</p>
              <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
          ) : (
            <iframe 
              src={pdfUrl}
              className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
