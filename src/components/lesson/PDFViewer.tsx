import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader, Maximize2, Minimize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Set height based on device type and expanded state
  const viewerHeight = isExpanded 
    ? (isMobile ? 'h-[80vh]' : 'h-[90vh]')
    : (isMobile ? 'h-[40vh]' : 'h-[60vh]');

  if (!pdfUrl) {
    return (
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="bg-gray-100 rounded-lg p-6 min-h-[40vh] sm:min-h-[80vh] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold">Lesson Content</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(pdfUrl, '_blank')}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Minimize
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>

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
