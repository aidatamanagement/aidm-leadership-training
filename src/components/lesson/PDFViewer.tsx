
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { FileIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        {isLoading && pdfUrl && (
          <div className="min-h-[400px] w-full">
            <Skeleton className="w-full h-[400px]" />
          </div>
        )}
        
        {error && (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-red-500">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
            {pdfUrl && (
              <Button variant="outline" className="mt-4" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Open PDF in new tab
                </a>
              </Button>
            )}
          </div>
        )}
        
        {pdfUrl ? (
          <>
            <iframe 
              src={pdfUrl}
              className="w-full min-h-[600px] border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <FileIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
