
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface PDFViewerProps {
  pdfUrl: string | undefined;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validUrl, setValidUrl] = useState<string | null>(null);

  // Validate and set PDF URL
  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setError(null);

    if (!pdfUrl) {
      setValidUrl(null);
      setIsLoading(false);
      return;
    }

    // Check if URL is valid
    const isPdfUrl = pdfUrl.toLowerCase().endsWith('.pdf') || 
                     pdfUrl.toLowerCase().includes('/pdfs/') ||
                     pdfUrl.toLowerCase().includes('application/pdf');

    if (!isPdfUrl) {
      setError('Invalid PDF URL format');
      setValidUrl(null);
      setIsLoading(false);
      return;
    }

    // Set valid URL
    setValidUrl(pdfUrl);
  }, [pdfUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL.');
    toast({
      title: 'PDF Error',
      description: 'Could not load the PDF file.',
      variant: 'destructive',
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        {isLoading && validUrl && (
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
        
        {validUrl ? (
          <iframe 
            src={validUrl}
            className="w-full min-h-[600px] border-0"
            onLoad={handleLoad}
            onError={handleError}
            title="PDF Document"
          />
        ) : (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
