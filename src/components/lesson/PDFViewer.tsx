
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PDFViewerProps {
  pdfUrl?: string;
  lessonId?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, lessonId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonPdfUrl, setLessonPdfUrl] = useState<string | null>(pdfUrl || null);

  // Fetch the lesson PDF URL if lessonId is provided but pdfUrl is not
  useEffect(() => {
    const fetchLessonPdf = async () => {
      if (!pdfUrl && lessonId) {
        try {
          const { data, error } = await supabase
            .from('lessons')
            .select('pdf_url')
            .eq('id', lessonId)
            .single();

          if (error) throw error;
          if (data && data.pdf_url) {
            setLessonPdfUrl(data.pdf_url);
          }
        } catch (err: any) {
          console.error('Error fetching PDF URL:', err);
          setError(`Could not load PDF: ${err.message}`);
          toast({
            title: 'Error',
            description: 'Failed to fetch the PDF for this lesson.',
            variant: 'destructive',
          });
        }
      }
    };

    fetchLessonPdf();
  }, [lessonId, pdfUrl]);

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

  const openInNewTab = () => {
    if (lessonPdfUrl) {
      window.open(lessonPdfUrl, '_blank', 'noopener,noreferrer');
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
        
        {lessonPdfUrl ? (
          <div className="flex flex-col">
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openInNewTab}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </Button>
            </div>
            <iframe 
              src={lessonPdfUrl}
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
