import React, { useState, useCallback, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(144, 238, 144, 0.8), 
          rgba(34, 139, 34, 0.9))`
      }}
    >
      {children}
    </div>
  );
}; 