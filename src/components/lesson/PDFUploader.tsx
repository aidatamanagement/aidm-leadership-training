
import React, { useState, useEffect } from 'react';
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
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(currentPdfUrl);
  
  useEffect(() => {
    setPdfUrl(currentPdfUrl);
  }, [currentPdfUrl]);

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
      setProgress(10); // Start with some initial progress
      
      // First check if the "pdfs" bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }
      
      const pdfsBucketExists = buckets?.some(bucket => bucket.name === 'pdfs');
      
      if (!pdfsBucketExists) {
        throw new Error('Storage bucket "pdfs" not found. Please contact administrator.');
      }
      
      // Create a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${lessonId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      setProgress(30); // Update progress after bucket check
      
      // Upload file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('pdfs')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      setProgress(70); // Update progress after upload
      
      // Get the public URL
      const { data } = supabase.storage.from('pdfs').getPublicUrl(filePath);
      const url = data.publicUrl;
      
      setProgress(100); // Complete progress
      
      setPdfUrl(url);
      onUploadComplete(url);
      
      toast({
        title: 'Upload Complete',
        description: 'PDF file has been uploaded successfully.'
      });
    } catch (error: any) {
      console.error('PDF Upload Error:', error);
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
      <Label htmlFor="pdf-upload" className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
        PDF Document
      </Label>
      
      {!uploading && progress === 0 && (
        <div className="flex items-start gap-4">
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1"
            required={required && !pdfUrl}
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
      
      {pdfUrl && (
        <div className="bg-gray-50 p-3 rounded-md border flex items-center justify-between">
          <div className="flex items-center">
            <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {getPdfFilename(pdfUrl)}
            </span>
          </div>
          <a 
            href={pdfUrl} 
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
