
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const [pdfUrl, setPdfUrl] = useState<string>(currentPdfUrl || '');
  const [isValidating, setIsValidating] = useState(false);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfUrl(e.target.value);
  };
  
  const validateAndSavePdfUrl = async () => {
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
    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if URL ends with .pdf
    if (!pdfUrl.toLowerCase().endsWith('.pdf') && !pdfUrl.toLowerCase().includes('.pdf')) {
      toast({
        title: 'Not a PDF URL',
        description: 'URL does not appear to be a PDF. Make sure it links to a PDF file.',
        // Change from 'warning' to 'default' to fix the type error
        variant: 'default',
      });
      // Continue anyway, might be a dynamic URL
    }
    
    try {
      setIsValidating(true);
      
      // Just save the URL directly
      onUploadComplete(pdfUrl);
      
      toast({
        title: 'PDF Link Saved',
        description: 'The PDF URL has been successfully saved.'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Save URL',
        description: error.message || 'An error occurred while saving the PDF URL.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Label htmlFor="pdf-url">PDF Document URL</Label>
      
      <div className="flex items-start gap-4">
        <Input
          id="pdf-url"
          type="url"
          placeholder="https://example.com/document.pdf"
          value={pdfUrl}
          onChange={handleUrlChange}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={validateAndSavePdfUrl}
          disabled={isValidating || !pdfUrl}
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
              {currentPdfUrl}
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
