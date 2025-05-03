
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  onLoadStateChange?: (isLoading: boolean) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onLoadStateChange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Call the callback whenever the loading state changes
    if (onLoadStateChange) {
      onLoadStateChange(isLoading);
    }
  }, [isLoading, onLoadStateChange]);

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
  const viewerHeight = isMobile ? 'h-[40vh]' : 'h-[80vh]';

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
          <div className={`w-full ${viewerHeight} bg-gray-50 rounded-lg flex flex-col items-center justify-center`}>
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-gray-500 text-sm">Loading PDF document...</p>
              <div className="w-48">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error ? (
          <div className={`bg-gray-100 rounded-lg p-6 ${viewerHeight} flex flex-col items-center justify-center`}>
            <p className="text-red-500">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
          </div>
        ) : (
          <div className={isLoading ? 'hidden' : ''}>
            <iframe 
              src={pdfUrl}
              className={`w-full ${viewerHeight} border-0`}
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
