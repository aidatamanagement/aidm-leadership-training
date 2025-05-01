
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

interface PDFUrlInputProps {
  name?: string;
}

const PDFUrlInput: React.FC<PDFUrlInputProps> = ({ name = 'pdfUrl' }) => {
  const form = useFormContext();

  const validatePdfUrl = (url: string) => {
    if (!url) return true; // Optional field

    // Basic URL validation
    try {
      const parsedUrl = new URL(url);
      // Check if it's a PDF
      if (!url.toLowerCase().endsWith('.pdf')) {
        return "URL must point to a PDF file";
      }
      return true;
    } catch (e) {
      return "Please enter a valid URL";
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        validate: validatePdfUrl
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>PDF URL</FormLabel>
          <FormControl>
            <Input
              placeholder="https://example.com/lesson.pdf"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PDFUrlInput;
