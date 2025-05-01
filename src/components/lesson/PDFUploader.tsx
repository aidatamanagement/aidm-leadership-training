
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { FileIcon, UploadIcon, AlertCircle } from 'lucide-react';

interface PDFUploaderProps {
  lessonId?: string;
  onUploadComplete: (url: string) => void;
  currentPdfUrl?: string;
  required?: boolean;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ 
  lessonId = 'new-lesson', 
  onUploadComplete,
  currentPdfUrl,
  required = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { uploadPdf } = useData();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      setError('Please select a PDF file.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'PDF files must be less than 10MB.',
        variant: 'destructive',
      });
      setError('PDF files must be less than 10MB.');
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a PDF file to upload.',
        variant: 'destructive',
      });
      setError('Please select a PDF file to upload.');
      return;
    }
    
    try {
      setUploading(true);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const url = await uploadPdf(selectedFile, lessonId);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (url) {
        onUploadComplete(url);
        toast({
          title: 'Upload Complete',
          description: 'PDF file has been uploaded successfully.'
        });
        setError(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload PDF file.');
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload PDF file.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    }
  };
  
  const getPdfFilename = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  const validateForm = () => {
    if (required && !currentPdfUrl && !selectedFile) {
      setError('A PDF document is required for this lesson.');
      return false;
    }
    setError(null);
    return true;
  };

  // Expose validation method to parent components
  React.useEffect(() => {
    if (required && !currentPdfUrl && !selectedFile) {
      setError('A PDF document is required for this lesson.');
    } else {
      setError(null);
    }
  }, [required, currentPdfUrl, selectedFile]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="pdf-upload" className="flex items-center">
          PDF Document {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {error && (
          <div className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> {error}
          </div>
        )}
      </div>
      
      {!uploading && progress === 0 && (
        <div className="flex items-start gap-4">
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!selectedFile}
            size="sm"
          >
            <UploadIcon className="h-4 w-4 mr-1" /> Upload
          </Button>
        </div>
      )}
      
      {uploading && progress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Uploading {selectedFile?.name}...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {currentPdfUrl && (
        <div className="bg-gray-50 p-3 rounded-md border flex items-center justify-between">
          <div className="flex items-center">
            <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {getPdfFilename(currentPdfUrl)}
            </span>
          </div>
          <div className="flex space-x-2">
            <a 
              href={currentPdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View
            </a>
            {!required && (
              <button
                onClick={() => onUploadComplete('')}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
