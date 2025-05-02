
import React from 'react';
import { Course, Lesson } from '@/contexts/DataContext';
import PreviewButton from './PreviewButton';

interface CoursePreviewButtonsProps {
  course: Course;
  lesson?: Lesson;
}

const CoursePreviewButtons: React.FC<CoursePreviewButtonsProps> = ({ course, lesson }) => {
  return (
    <div>
      {lesson ? (
        <PreviewButton courseId={course.id} lessonId={lesson.id} />
      ) : (
        <PreviewButton courseId={course.id} />
      )}
    </div>
  );
};

export default CoursePreviewButtons;
