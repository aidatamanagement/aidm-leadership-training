
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { FileIcon, UploadIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'PDF files must be less than 10MB.',
        variant: 'destructive',
      });
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
      return;
    }
    
    try {
      setUploading(true);
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Upload to Supabase storage
      const fileName = `${lessonId}-${Date.now()}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      clearInterval(progressInterval);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('pdfs')
          .getPublicUrl(fileName);
          
        if (publicUrlData && publicUrlData.publicUrl) {
          setProgress(100);
          onUploadComplete(publicUrlData.publicUrl);
          toast({
            title: 'Upload Complete',
            description: 'PDF file has been uploaded successfully.'
          });
        }
      }
    } catch (error: any) {
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

  return (
    <div className="space-y-4">
      <Label htmlFor="pdf-upload">PDF Document</Label>
      
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
