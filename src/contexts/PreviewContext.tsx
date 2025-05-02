
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PreviewContextType = {
  previewMode: boolean;
  previewAsStudentId: string | null;
  setPreviewMode: (value: boolean) => void;
  setPreviewAsStudentId: (studentId: string | null) => void;
  exitPreview: () => void;
};

const PreviewContext = createContext<PreviewContextType>({
  previewMode: false,
  previewAsStudentId: null,
  setPreviewMode: () => {},
  setPreviewAsStudentId: () => {},
  exitPreview: () => {},
});

export const usePreview = () => useContext(PreviewContext);

export const PreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [previewAsStudentId, setPreviewAsStudentId] = useState<string | null>(null);

  const exitPreview = () => {
    setPreviewMode(false);
    setPreviewAsStudentId(null);
  };

  return (
    <PreviewContext.Provider
      value={{
        previewMode,
        previewAsStudentId,
        setPreviewMode,
        setPreviewAsStudentId,
        exitPreview
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
};
