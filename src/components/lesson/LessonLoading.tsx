
import React from 'react';
import { Loader } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const LessonLoading: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        {/* PDF viewer skeleton */}
        <div className="mb-8">
          <div className="rounded-lg border shadow-sm bg-card">
            <div className="w-full h-[60vh] bg-gray-50 rounded-lg flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 text-sm">Loading lesson content...</p>
                <div className="w-48">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Instructor notes skeleton */}
        <div className="mb-8">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="rounded-lg border shadow-sm p-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        
        {/* Navigation skeleton */}
        <div className="flex justify-between mt-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonLoading;
