
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { usePreview } from '@/contexts/PreviewContext';
import { useNavigate } from 'react-router-dom';
import { Student } from '@/contexts/DataContext';
import CourseCard from './CourseCard';

interface AssignedCoursesListProps {
  student: Student;
  onToggleLock: (courseId: string) => void;
  onRemoveCourse: (courseId: string) => void;
}

const AssignedCoursesList: React.FC<AssignedCoursesListProps> = ({
  student,
  onToggleLock,
  onRemoveCourse,
}) => {
  const {
    courses,
    getStudentProgress,
    getTotalQuizScore,
  } = useData();
  const { setPreviewMode, setPreviewAsStudentId } = usePreview();
  const navigate = useNavigate();

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };
  
  const handlePreviewCourse = (courseId: string) => {
    setPreviewMode(true);
    setPreviewAsStudentId(student.id);
    navigate(`/courses/${courseId}`);
  };

  if (student.assignedCourses.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-600">No courses assigned to this student yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {student.assignedCourses.map(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return null;
        
        const studentProgress = getStudentProgress(student.id, courseId);
        const completedLessons = studentProgress.filter(p => p.completed).length;
        const totalLessons = course.lessons.length;
        const viewedLessonsCount = studentProgress.filter(p => p.pdfViewed).length;
        const totalTimeSpent = studentProgress.reduce((total, p) => total + p.timeSpent, 0);
        const quizScore = getTotalQuizScore(student.id, courseId);
        const isLocked = studentProgress.some(p => p.locked);
        
        return (
          <CourseCard
            key={courseId}
            course={course}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            viewedLessonsCount={viewedLessonsCount}
            totalTimeSpent={totalTimeSpent}
            quizScore={quizScore}
            isLocked={isLocked}
            onToggleLock={() => onToggleLock(courseId)}
            onRemoveCourse={() => onRemoveCourse(courseId)}
            onPreviewCourse={() => handlePreviewCourse(courseId)}
            formatTimeSpent={formatTimeSpent}
          />
        );
      })}
    </div>
  );
};

export default AssignedCoursesList;
