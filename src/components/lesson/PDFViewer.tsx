
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import * as PDFJS from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Set the workerSrc to use the PDF.js worker from the CDN
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  
  // Set height based on device type
  const viewerHeight = isMobile ? 'h-[40vh]' : 'h-[80vh]';

  useEffect(() => {
    if (!pdfUrl) return;
    
    // Reset states when PDF URL changes
    setIsLoading(true);
    setError(null);
    setNumPages(null);
    setCurrentPage(1);
    
    const loadPDF = async () => {
      try {
        const loadingTask = PDFJS.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);
        
        // Load first page
        if (canvasRef.current) {
          renderPage(pdf, currentPage);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to load PDF:", err);
        setError('Failed to load PDF. Please check the file URL.');
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [pdfUrl, canvasRef]);
  
  // Effect to handle page changes
  useEffect(() => {
    if (!isLoading && !error && pdfUrl) {
      const loadPage = async () => {
        try {
          const loadingTask = PDFJS.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;
          renderPage(pdf, currentPage);
        } catch (err) {
          console.error("Error changing page:", err);
        }
      };
      
      loadPage();
    }
  }, [currentPage, isLoading, error, pdfUrl]);
  
  const renderPage = async (pdf: any, pageNumber: number) => {
    if (!canvasRef.current) return;
    
    // Get the page
    const page = await pdf.getPage(pageNumber);
    
    // Determine scale based on canvas size
    const canvas = canvasRef.current;
    const viewport = page.getViewport({ scale: 1 });
    
    // Adjust to fit width
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });
    
    // Update canvas dimensions
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    const renderContext = {
      canvasContext: canvas.getContext('2d')!,
      viewport: scaledViewport,
    };
    
    await page.render(renderContext).promise;
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
        <div className={`w-full ${viewerHeight} flex flex-col`}>
          {isLoading && (
            <div className="w-full flex-grow">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          {error ? (
            <div className={`bg-gray-100 rounded-lg p-6 flex-grow flex flex-col items-center justify-center`}>
              <p className="text-red-500">Error loading PDF</p>
              <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
          ) : (
            <div className={`flex flex-col w-full flex-grow ${isLoading ? 'hidden' : ''}`}>
              <div className="overflow-auto flex-grow flex justify-center bg-gray-50 rounded-md">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
              
              {numPages && (
                <div className="flex items-center justify-between mt-4">
                  <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <div className="text-sm">
                    Page {currentPage} of {numPages}
                  </div>
                  
                  <button 
                    onClick={handleNextPage}
                    disabled={!numPages || currentPage >= numPages}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
