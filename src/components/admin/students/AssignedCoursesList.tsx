
import React from 'react';
import { Student, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CourseCard from './CourseCard';

interface AssignedCoursesListProps {
  student: Student;
  onAssignCourse: () => void;
}

const AssignedCoursesList: React.FC<AssignedCoursesListProps> = ({ student, onAssignCourse }) => {
  const { courses, getStudentProgress, getTotalQuizScore, toggleCourseLock, removeCourseAssignment, isCourseLockedForUser } = useData();

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
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
            
            return (
              <CourseCard 
                key={courseId}
                course={course}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                totalTimeSpent={totalTimeSpent}
                quizScore={quizScore}
                isLocked={isLocked}
                viewedLessonsCount={viewedLessonsCount}
                onToggleLock={() => toggleCourseLock(student.id, courseId)}
                onRemoveCourse={() => removeCourseAssignment(student.id, courseId)}
                formatTimeSpent={formatTimeSpent}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default AssignedCoursesList;
