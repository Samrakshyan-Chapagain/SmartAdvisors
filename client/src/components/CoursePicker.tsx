import React, { useState } from 'react';
import { CoursePickerProps, Course, ElectiveCourse } from '../types/PlanDegreePage';

/**
 * CoursePicker Component
 * 
 * Displays required and elective courses in a tabbed interface with selection controls.
 * Implements credit limit validation, dimming logic, and shake animations.
 * Uses blue theme for required courses and orange theme for elective courses.
 * 
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2, 8.3
 */
const CoursePicker: React.FC<CoursePickerProps> = ({
  requiredCourses,
  electiveCourses,
  selectedCourseIds,
  maxHoursPerSemester,
  currentTotalHours,
  activeTab,
  onTabChange,
  onCourseToggle
}) => {
  const [shakingCourseId, setShakingCourseId] = useState<string | null>(null);

  // Determine if a course can be added based on credit limits
  const canAddCourse = (course: Course | ElectiveCourse): boolean => {
    // If already selected, can always deselect
    if (selectedCourseIds.has(course.id)) {
      return true;
    }
    // Check if adding this course would exceed the limit
    return currentTotalHours + course.creditHours <= maxHoursPerSemester;
  };

  // Handle course click with validation and animation
  const handleCourseClick = (course: Course | ElectiveCourse) => {
    const canAdd = canAddCourse(course);
    
    if (!canAdd && !selectedCourseIds.has(course.id)) {
      // Trigger shake animation
      setShakingCourseId(course.id);
      setTimeout(() => setShakingCourseId(null), 500);
      return;
    }

    // Toggle course selection
    onCourseToggle(course.id, course.creditHours);
  };

  // Validate course data has required fields
  const isValidCourse = (course: Course | ElectiveCourse): boolean => {
    const hasRequiredFields = 
      course &&
      typeof course.id === 'string' && course.id.trim() !== '' &&
      typeof course.code === 'string' && course.code.trim() !== '' &&
      typeof course.name === 'string' && course.name.trim() !== '' &&
      typeof course.creditHours === 'number' && course.creditHours > 0;

    if (!hasRequiredFields) {
      console.error('Invalid course data - missing required fields:', {
        id: course?.id,
        code: course?.code,
        name: course?.name,
        creditHours: course?.creditHours
      });
      return false;
    }

    return true;
  };

  // Render course list for the active tab
  const renderCourseList = () => {
    const courses = activeTab === 'required' ? requiredCourses : electiveCourses;
    const themeColor = activeTab === 'required' ? 'var(--blue)' : 'var(--orange)';

    // Filter out invalid courses
    const validCourses = courses.filter(isValidCourse);

    if (validCourses.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--sub)' }}>
          No {activeTab} courses available
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {validCourses.map((course) => {
          const isSelected = selectedCourseIds.has(course.id);
          const canAdd = canAddCourse(course);
          const isDimmed = !canAdd && !isSelected;
          const isShaking = shakingCourseId === course.id;

          return (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course)}
              className={`
                flex items-center justify-between p-4 rounded-xl cursor-pointer
                transition-all duration-200 ease-in-out
                ${isShaking ? 'animate-shake' : ''}
                ${isDimmed ? 'opacity-40' : 'opacity-100'}
                ${!isDimmed ? 'hover:translate-x-0.5' : ''}
              `}
              style={{
                background: isSelected 
                  ? `${themeColor}15` 
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isSelected ? themeColor : 'rgba(255, 255, 255, 0.05)'}`,
                cursor: isDimmed ? 'not-allowed' : 'pointer'
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Radio button */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    borderColor: isSelected ? themeColor : 'rgba(255, 255, 255, 0.2)',
                    background: isSelected ? themeColor : 'transparent'
                  }}
                >
                  {isSelected && (
                    <div
                      className="w-2 h-2 rounded-full bg-white transition-transform duration-200"
                      style={{
                        transform: 'scale(1)',
                        animation: isSelected ? 'scaleIn 0.2s ease-out' : 'none'
                      }}
                    />
                  )}
                </div>

                {/* Course info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {course.code}
                    </span>
                  </div>
                  <div 
                    className="text-xs mt-0.5 truncate"
                    style={{ color: 'var(--sub)' }}
                  >
                    {course.name}
                  </div>
                </div>

                {/* Credit hours */}
                <div 
                  className="text-sm font-semibold flex-shrink-0"
                  style={{ color: 'var(--text)' }}
                >
                  {course.creditHours} hrs
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="rounded-3xl border p-6"
      style={{
        background: 'var(--s1)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Tab navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => onTabChange('required')}
          className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200"
          style={{
            background: activeTab === 'required' 
              ? 'var(--blue)' 
              : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'required' 
              ? '#ffffff' 
              : 'var(--sub)',
            border: `1px solid ${activeTab === 'required' ? 'var(--blue)' : 'transparent'}`
          }}
        >
          Required Courses
        </button>
        <button
          onClick={() => onTabChange('elective')}
          className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200"
          style={{
            background: activeTab === 'elective' 
              ? 'var(--orange)' 
              : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'elective' 
              ? '#ffffff' 
              : 'var(--sub)',
            border: `1px solid ${activeTab === 'elective' ? 'var(--orange)' : 'transparent'}`
          }}
        >
          Elective Courses
        </button>
      </div>

      {/* Course list */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-themed pr-2">
        {renderCourseList()}
      </div>

      {/* Add shake animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CoursePicker;
