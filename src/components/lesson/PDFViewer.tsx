
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
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
            {pdfUrl && (
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Try opening in new tab
              </Button>
            )}
          </div>
        )}
        
        {pdfUrl ? (
          <div>
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </Button>
            </div>
            <iframe 
              src={pdfUrl}
              className="w-full min-h-[600px] border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
          </div>
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
