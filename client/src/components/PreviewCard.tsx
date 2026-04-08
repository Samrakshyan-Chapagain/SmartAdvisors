import React from 'react';
import { PreviewCardProps } from '../types/PlanDegreePage';
import DonutChart from './DonutChart';

/**
 * PreviewCard Component
 * 
 * Displays a live preview of selected courses with credit hour visualization.
 * Shows course list with color-coded badges (blue for required, orange for elective)
 * and integrates DonutChart for visual credit load feedback.
 * 
 * Validates Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 13.4, 13.5
 */
const PreviewCard: React.FC<PreviewCardProps> = ({ 
  selectedCourses, 
  totalHours, 
  maxHoursPerSemester,
  requiredCourseIds = new Set()
}) => {
  // Validate course data has required fields
  const isValidCourse = (course: any): boolean => {
    const hasRequiredFields = 
      course &&
      typeof course.id === 'string' && course.id.trim() !== '' &&
      typeof course.code === 'string' && course.code.trim() !== '' &&
      typeof course.name === 'string' && course.name.trim() !== '' &&
      typeof course.creditHours === 'number' && course.creditHours > 0;

    if (!hasRequiredFields) {
      console.error('Invalid course data in preview - missing required fields:', {
        id: course?.id,
        code: course?.code,
        name: course?.name,
        creditHours: course?.creditHours
      });
      return false;
    }

    return true;
  };

  // Filter valid courses
  const validSelectedCourses = selectedCourses.filter(isValidCourse);

  // Calculate percentage for donut chart
  const percentage = maxHoursPerSemester > 0 
    ? (totalHours / maxHoursPerSemester) * 100 
    : 0;

  return (
    <div 
      className="rounded-3xl border p-6"
      style={{
        background: 'var(--s1)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
        Course Preview
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Course List */}
        <div className="flex-1">
          {validSelectedCourses.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--sub)' }}>
              No courses selected yet
            </div>
          ) : (
            <div className="space-y-2">
              {validSelectedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Course type indicator badge */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: requiredCourseIds.has(course.id)
                          ? 'var(--blue)' 
                          : 'var(--orange)'
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {course.code}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--sub)' }}>
                        {course.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {course.creditHours} hrs
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Hours Display */}
          <div 
            className="mt-4 pt-4 flex justify-between items-center"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--sub)' }}>
              Total Credit Hours
            </span>
            <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {totalHours} hrs
            </span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="flex items-center justify-center md:min-w-[200px]">
          <div className="relative">
            <DonutChart
              percentage={percentage}
              maxHours={maxHoursPerSemester}
              currentHours={totalHours}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
