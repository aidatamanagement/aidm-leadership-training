
import React from 'react';
import { Student, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CourseCard from './CourseCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssignedCoursesListProps {
  student: Student;
  onAssignCourse: () => void;
}

const AssignedCoursesList: React.FC<AssignedCoursesListProps> = ({ student, onAssignCourse }) => {
  const { courses, getStudentProgress, getTotalQuizScore, toggleCourseLock, removeCourseAssignment, isCourseLockedForUser } = useData();
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4 gap-2 w-full">
        <h4 className="text-sm font-medium">Assigned Courses</h4>
        <Button size="sm" variant="outline" onClick={onAssignCourse} className={isMobile ? "w-auto" : "w-auto"}>
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
        <div className="grid grid-cols-1 gap-4">
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
                studentId={student.id}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                totalTimeSpent={totalTimeSpent}
                quizScore={quizScore}
                isLocked={isLocked}
                viewedLessonsCount={viewedLessonsCount}
                onToggleLock={() => toggleCourseLock(student.id, courseId)}
                onRemoveCourse={() => removeCourseAssignment(student.id, courseId)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default AssignedCoursesList;
