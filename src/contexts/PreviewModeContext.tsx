
import React, { createContext, useContext, useState } from 'react';

interface PreviewModeContextType {
  isPreviewMode: boolean;
  setIsPreviewMode: (value: boolean) => void;
  previewAsUserId: string | null;
  setPreviewAsUserId: (id: string | null) => void;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

export const PreviewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewAsUserId, setPreviewAsUserId] = useState<string | null>(null);

  return (
    <PreviewModeContext.Provider 
      value={{ isPreviewMode, setIsPreviewMode, previewAsUserId, setPreviewAsUserId }}
    >
      {children}
    </PreviewModeContext.Provider>
  );
};

export const usePreviewMode = () => {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error('usePreviewMode must be used within a PreviewModeProvider');
  }
  return context;
};
