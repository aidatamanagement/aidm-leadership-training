
// Re-export all the existing types to maintain compatibility
export * from './DataTypes';

// Add shared provider interfaces
export interface ProviderProps {
  children: React.ReactNode;
}

// Add the missing toggleCourseLock type to accept boolean return value
export interface StudentContextWithBooleanReturn {
  toggleCourseLock: (studentId: string, courseId: string) => Promise<boolean>;
}
