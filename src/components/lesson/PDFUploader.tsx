
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileIcon, ExternalLinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfUrl(e.target.value);
  };
  
  const handleUrlSubmit = () => {
    if (!pdfUrl) {
      toast({
        title: 'No URL Entered',
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
    
    // Check if it's potentially a PDF URL (very basic check)
    if (!pdfUrl.toLowerCase().endsWith('.pdf') && !pdfUrl.toLowerCase().includes('/pdf')) {
      toast({
        title: 'URL May Not Be a PDF',
        description: 'The URL does not appear to be a PDF file. Continue anyway?',
        variant: 'default',
      });
    }
    
    onUploadComplete(pdfUrl);
    toast({
      title: 'PDF URL Added',
      description: 'PDF URL has been successfully saved.'
    });
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
        <Input
          id="pdf-url"
          type="url"
          placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
          value={pdfUrl}
          onChange={handleUrlChange}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={handleUrlSubmit}
          size="sm"
        >
          Save URL
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
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            View
            <ExternalLinkIcon className="h-4 w-4 ml-1" />
          </a>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
