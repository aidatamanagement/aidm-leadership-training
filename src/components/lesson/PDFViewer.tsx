
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { ExternalLink, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface PDFViewerProps {
  pdfUrl?: string; // Make pdfUrl optional since we'll fetch it if not provided
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl: propsPdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(propsPdfUrl || null);
  const { lessonId } = useParams<{ lessonId: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch the PDF URL from the database if not provided as prop
  useEffect(() => {
    if (propsPdfUrl) {
      console.log("PDF URL provided via props:", propsPdfUrl);
      setPdfUrl(propsPdfUrl);
      return;
    }
    
    if (lessonId) {
      const fetchPdfUrl = async () => {
        try {
          console.log("Fetching PDF URL for lesson:", lessonId);
          const { data, error } = await supabase
            .from('lessons')
            .select('pdf_url')
            .eq('id', lessonId)
            .maybeSingle();
          
          if (error) {
            throw error;
          }
          
          if (data?.pdf_url) {
            console.log("Retrieved PDF URL:", data.pdf_url);
            setPdfUrl(data.pdf_url);
          } else {
            console.log("No PDF URL found for lesson");
            setError('No PDF available for this lesson');
            setIsLoading(false);
          }
        } catch (err: any) {
          console.error('Error fetching PDF URL:', err);
          setError('Failed to load PDF information from database');
          toast({
            title: 'Error',
            description: 'Could not load PDF information',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      };
      
      fetchPdfUrl();
    }
  }, [lessonId, propsPdfUrl]);

  const handleLoad = () => {
    console.log("PDF loaded successfully");
    setIsLoading(false);
  };

  const handleError = () => {
    console.error("PDF failed to load:", pdfUrl);
    setIsLoading(false);
    setError('Failed to load PDF. Please check the file URL or try opening in a new tab.');
    toast({
      title: 'PDF Error',
      description: 'Could not load the PDF directly in the viewer. Try opening in a new tab.',
      variant: 'destructive',
    });
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = "lesson-material.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Check if URL is absolute or relative
  const getFullPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative URL, assume it's from Supabase storage
    return url;
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
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-red-500">Error loading PDF</p>
            <p className="text-gray-500 text-sm mt-2 mb-4">{error}</p>
            {pdfUrl && (
              <Button 
                variant="default"
                onClick={openInNewTab}
                className="mt-2"
              >
                Try opening in new tab
              </Button>
            )}
          </div>
        )}
        
        {pdfUrl && !error ? (
          <div className="flex flex-col">
            <div className="flex justify-end mb-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadPdf}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
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
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <iframe 
                    src={getFullPdfUrl(pdfUrl)}
                    className="w-full min-h-[600px] border-0"
                    onLoad={handleLoad}
                    onError={handleError}
                    title="PDF Document"
                    ref={iframeRef}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh]">
                <iframe 
                  src={getFullPdfUrl(pdfUrl)}
                  className="w-full h-full border-0"
                  title="PDF Document Full View"
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : !error ? (
          <div className="bg-gray-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">No PDF available for this lesson.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
