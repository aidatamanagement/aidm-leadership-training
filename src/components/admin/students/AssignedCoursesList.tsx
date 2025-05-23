
import React, { useState } from 'react';
import { Student, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CourseCard from './CourseCard';
import { formatTimeSpent } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

interface AssignedCoursesListProps {
  student: Student;
  onAssignCourse: () => void;
}

const AssignedCoursesList: React.FC<AssignedCoursesListProps> = ({ student, onAssignCourse }) => {
  const { courses, getStudentProgress, getTotalQuizScore, toggleCourseLock, removeCourseAssignment, isCourseLockedForUser } = useData();
  const isMobile = useIsMobile();
  const [loadingCourseIds, setLoadingCourseIds] = useState<Set<string>>(new Set());

  const handleToggleLock = async (studentId: string, courseId: string) => {
    setLoadingCourseIds(prev => new Set([...prev, courseId]));
    
    try {
      await toggleCourseLock(studentId, courseId);
    } catch (error) {
      console.error('Error toggling course lock:', error);
      toast({
        title: "Error",
        description: "Failed to update course lock status",
        variant: "destructive"
      });
    } finally {
      setLoadingCourseIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleRemoveCourse = async (studentId: string, courseId: string) => {
    if (confirm('Are you sure you want to remove this course from the student?')) {
      setLoadingCourseIds(prev => new Set([...prev, courseId]));
      
      try {
        await removeCourseAssignment(studentId, courseId);
      } catch (error) {
        console.error('Error removing course assignment:', error);
        toast({
          title: "Error",
          description: "Failed to remove course assignment",
          variant: "destructive"
        });
      } finally {
        setLoadingCourseIds(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(courseId);
          return newSet;
        });
      }
    }
  };

  return (
    <>
      <div className={`flex justify-between items-center mb-4`}>
        <h4 className="text-sm font-medium">Assigned Courses</h4>
        <Button size="sm" variant="outline" onClick={onAssignCourse}>
          <Plus className="mr-2 h-4 w-4" /> Assign Course
        </Button>
      </div>
      
      {student.assignedCourses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No courses assigned yet.</p>
          <Button variant="outline" onClick={onAssignCourse}>
            <Plus className="mr-2 h-4 w-4" /> Assign First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.assignedCourses.map(courseId => {
            const course = courses.find(c => c.id === courseId);
            if (!course) return null;
            
            const studentProgress = getStudentProgress(student.id, courseId);
            const completedLessons = studentProgress.filter(p => p.completed).length;
            const totalLessons = course.lessons.length;
            const totalTimeSpent = studentProgress.reduce((total, p) => total + p.timeSpent, 0);
            const quizScore = getTotalQuizScore(student.id, courseId);
            const isLocked = isCourseLockedForUser(student.id, courseId);
            const viewedLessonsCount = studentProgress.filter(p => p.pdfViewed).length;
            const isLoading = loadingCourseIds.has(courseId);
            
            return (
              <CourseCard 
                key={courseId}
                course={course}
                studentId={student.id}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                totalTimeSpent={totalTimeSpent}
                quizScore={quizScore}
                isLocked={isLocked}
                viewedLessonsCount={viewedLessonsCount}
                onToggleLock={() => handleToggleLock(student.id, courseId)}
                onRemoveCourse={() => handleRemoveCourse(student.id, courseId)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default AssignedCoursesList;
