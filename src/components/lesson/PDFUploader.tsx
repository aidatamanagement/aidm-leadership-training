
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { FileIcon, LinkIcon } from 'lucide-react';

interface PDFUploaderProps {
  lessonId?: string;
  onUploadComplete: (url: string) => void;
  currentPdfUrl?: string;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ 
  lessonId = 'new-lesson', 
  onUploadComplete,
  currentPdfUrl
}) => {
  const [pdfUrl, setPdfUrl] = useState(currentPdfUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveUrl = () => {
    if (!pdfUrl) {
      toast({
        title: 'URL Required',
        description: 'Please enter a PDF URL.',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(pdfUrl);
    } catch (e) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if URL ends with .pdf (basic check)
    if (!pdfUrl.toLowerCase().endsWith('.pdf') && !pdfUrl.toLowerCase().includes('.pdf?')) {
      toast({
        title: 'Invalid PDF URL',
        description: 'The URL should point to a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Just pass the URL directly instead of uploading
      onUploadComplete(pdfUrl);
      toast({
        title: 'URL Saved',
        description: 'PDF URL has been saved successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving URL',
        description: error.message || 'Failed to save PDF URL.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPdfFilename = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="pdf-url">PDF Document URL</Label>
      
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Input
            id="pdf-url"
            type="url"
            placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="flex-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the URL of a PDF document from an internal source
          </p>
        </div>
        <Button 
          type="button" 
          onClick={handleSaveUrl}
          disabled={isSubmitting || !pdfUrl}
          size="sm"
        >
          <LinkIcon className="h-4 w-4 mr-1" /> Save URL
        </Button>
      </div>
      
      {currentPdfUrl && (
        <div className="bg-gray-50 p-3 rounded-md border flex items-center justify-between">
          <div className="flex items-center">
            <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {getPdfFilename(currentPdfUrl)}
            </span>
          </div>
          <a 
            href={currentPdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View
          </a>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
