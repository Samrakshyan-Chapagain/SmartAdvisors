import React from 'react';
import { WishlistPanelProps } from '../types/PlanDegreePage';

/**
 * WishlistPanel Component
 * 
 * Displays all elective courses with checkbox controls for wishlist management.
 * Shows missing prerequisites and eligibility warnings for each course.
 * Uses purple theme styling to distinguish from course selection.
 * Operates independently from current semester course selection.
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 13.4, 13.5
 */
const WishlistPanel: React.FC<WishlistPanelProps> = ({
  electiveCourses,
  wishlistCourseIds,
  onWishlistToggle
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
      console.error('Invalid elective course data - missing required fields:', {
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
  const validElectiveCourses = electiveCourses.filter(isValidCourse);

  // Handle checkbox toggle
  const handleToggle = (courseId: string) => {
    onWishlistToggle(courseId);
  };

  return (
    <div
      className="rounded-3xl border p-6"
      style={{
        background: 'var(--s1)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Elective Wishlist
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--sub)' }}>
          Track courses you're interested in taking later
        </p>
      </div>

      {/* Course list */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-themed pr-2">
        {validElectiveCourses.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--sub)' }}>
            No elective courses available
          </div>
        ) : (
          <div className="space-y-3">
            {validElectiveCourses.map((course) => {
              const isWishlisted = wishlistCourseIds.has(course.id);
              // Provide fallback for optional missingPrereqs field
              const missingPrereqs = Array.isArray(course.missingPrereqs) ? course.missingPrereqs : [];
              const hasMissingPrereqs = missingPrereqs.length > 0;

              return (
                <div
                  key={course.id}
                  className="rounded-xl p-4 transition-all duration-200 ease-in-out"
                  style={{
                    background: isWishlisted 
                      ? 'rgba(147, 51, 234, 0.1)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isWishlisted ? 'var(--purple)' : 'rgba(255, 255, 255, 0.05)'}`
                  }}
                >
                  {/* Course header with checkbox */}
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                      onClick={() => handleToggle(course.id)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 mt-0.5"
                      style={{
                        borderColor: isWishlisted ? 'var(--purple)' : 'rgba(255, 255, 255, 0.2)',
                        background: isWishlisted ? 'var(--purple)' : 'transparent'
                      }}
                    >
                      {isWishlisted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text)' }}
                        >
                          {course.code}
                        </span>
                        <span 
                          className="text-sm font-semibold flex-shrink-0"
                          style={{ color: 'var(--text)' }}
                        >
                          {course.creditHours} hrs
                        </span>
                      </div>
                      <div 
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--sub)' }}
                      >
                        {course.name}
                      </div>

                      {/* Missing prerequisites warning */}
                      {hasMissingPrereqs && (
                        <div 
                          className="mt-3 p-2.5 rounded-lg"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 flex-shrink-0 mt-0.5"
                              style={{ color: 'var(--red)' }}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <div 
                                className="text-xs font-medium"
                                style={{ color: 'var(--red)' }}
                              >
                                Missing Prerequisites
                              </div>
                              <div 
                                className="text-xs mt-1"
                                style={{ color: 'rgba(239, 68, 68, 0.8)' }}
                              >
                                {missingPrereqs.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPanel;
