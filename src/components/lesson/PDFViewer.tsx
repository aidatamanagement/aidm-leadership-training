
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();

  // Check if PDF URL is valid and accessible
  useEffect(() => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    setError(null);
  }, [pdfUrl]);

  const handleLoad = () => {
    console.log("PDF loaded successfully:", pdfUrl);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error("Failed to load PDF:", pdfUrl);
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL.');
    
    // Show toast notification for better user experience
    toast({
      title: "PDF Load Failed",
      description: "The PDF file could not be loaded. Please check the file URL.",
      variant: "destructive",
    });
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setIsLoading(true);
      setError(null);
      setRetryCount(prevCount => prevCount + 1);
    }
  };

  // Set height based on device type with improved proportions
  const viewerHeight = isMobile ? 'h-[50vh]' : 'h-[75vh]';

  if (!pdfUrl) {
    return (
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="bg-gray-100 rounded-lg p-6 min-h-[40vh] sm:min-h-[75vh] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-md">
      <CardContent className="p-4">
        {isLoading && (
          <div className={`w-full ${viewerHeight} flex items-center justify-center bg-gray-50 rounded-lg`}>
            <div className="text-center">
              <Skeleton className="w-full h-full min-h-[300px]" />
              <p className="text-sm text-gray-400 mt-2">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className={`bg-gray-50 rounded-lg p-6 ${viewerHeight} flex flex-col items-center justify-center`}>
            <p className="text-red-500 font-medium">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={handleRetry}
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? "Too many retries" : "Retry"}
            </button>
          </div>
        ) : (
          <div className="w-full rounded-lg overflow-hidden border border-gray-100">
            <iframe 
              src={pdfUrl}
              className={`w-full ${viewerHeight} border-0`}
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
              style={{ display: isLoading ? 'none' : 'block' }}
              key={`pdf-${retryCount}`} // Force iframe reload on retry
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
