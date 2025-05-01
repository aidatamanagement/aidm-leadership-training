
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please check the URL.');
    toast({
      title: 'PDF Error',
      description: 'Could not load the PDF file.',
      variant: 'destructive',
    });
  };

  // Check if the URL is valid
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return url.toLowerCase().endsWith('.pdf');
    } catch (e) {
      return false;
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        {isLoading && (
          <div className="min-h-[400px] w-full">
            <Skeleton className="w-full h-[400px]" />
          </div>
        )}
        
        {error && (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-red-500">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
          </div>
        )}
        
        {pdfUrl && isValidUrl(pdfUrl) ? (
          <iframe 
            src={pdfUrl}
            className="w-full min-h-[600px] border-0"
            onLoad={handleLoad}
            onError={handleError}
            title="PDF Document"
          />
        ) : (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
            {pdfUrl && !isValidUrl(pdfUrl) && (
              <p className="text-red-500 text-sm mt-2">Invalid PDF URL format.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
