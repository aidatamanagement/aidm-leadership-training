
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import PDFUploader from './PDFUploader';

interface PDFUploaderFieldProps {
  control: Control<any>;
  name: string;
  currentPdfUrl?: string;
}

const PDFUploaderField: React.FC<PDFUploaderFieldProps> = ({ control, name, currentPdfUrl }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>PDF Document</FormLabel>
          <FormControl>
            <PDFUploader 
              onUploadComplete={(url) => field.onChange(url)}
              currentPdfUrl={field.value || currentPdfUrl || ''}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PDFUploaderField;
