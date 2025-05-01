
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { FileIcon } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfExists, setPdfExists] = useState(false);

  // Check if PDF exists when URL changes
  useEffect(() => {
    if (!pdfUrl) {
      setIsLoading(false);
      setError('No PDF available for this lesson.');
      setPdfExists(false);
      return;
    }

    // Reset states when URL changes
    setIsLoading(true);
    setError(null);
    
    // Verify PDF URL is valid
    const checkPdfUrl = async () => {
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (response.ok) {
          setPdfExists(true);
        } else {
          setError('PDF file not found. It may have been moved or deleted.');
          setPdfExists(false);
        }
      } catch (err) {
        console.error('Error checking PDF URL:', err);
        setError('Failed to verify PDF file existence.');
        setPdfExists(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPdfUrl();
  }, [pdfUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL.');
    setPdfExists(false);
    toast({
      title: 'PDF Error',
      description: 'Could not load the PDF file.',
      variant: 'destructive',
    });
  };

  const getPdfFilename = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
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
        
        {pdfUrl && pdfExists && (
          <div className="w-full">
            <div className="bg-gray-50 p-3 rounded-md border flex items-center mb-4">
              <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">{getPdfFilename(pdfUrl)}</span>
            </div>
            <iframe 
              src={pdfUrl}
              className="w-full min-h-[600px] border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
          </div>
        )}
        
        {!pdfUrl && !isLoading && (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
