# Implementation Plan: Plan Degree Page

## Overview

This implementation plan breaks down the Plan Degree Page feature into discrete, sequential coding tasks. The component is a full-page React component built with TypeScript, using Framer Motion for animations and integrating with SmartAdvisor's existing design system. The implementation follows a bottom-up approach: defining types and interfaces first, then building presentational sub-components, followed by the main container component with state management, and finally integration and testing.

## Tasks

- [x] 1. Set up TypeScript interfaces and data models
  - Create `types/PlanDegreePage.ts` file with all interfaces
  - Define Course, ElectiveCourse, Student, DegreePlan interfaces
  - Define component prop interfaces for all sub-components
  - Export all types for use across components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 4.1, 4.2, 5.1, 6.1, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 2. Implement DonutChart component
  - [x] 2.1 Create DonutChart.tsx with SVG-based circular progress visualization
    - Implement SVG circle with stroke-dashoffset animation
    - Calculate circumference and stroke offset based on percentage
    - Display percentage text in center
    - Add color transitions based on percentage thresholds (blue < 80%, amber 80-100%, red > 100%)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ] 2.2 Write unit tests for DonutChart
    - Test percentage calculation and display
    - Test color transitions at thresholds
    - Test animation triggers on prop changes
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

- [ ] 3. Implement PreviewCard component
  - [x] 3.1 Create PreviewCard.tsx with selected courses display
    - Display list of selected courses with course code and name
    - Calculate and display total credit hours
    - Integrate DonutChart component
    - Distinguish required (blue) vs elective (orange) courses visually
    - Apply card styling with --s1 background and border
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 3.2 Write unit tests for PreviewCard
    - Test course list rendering
    - Test credit hour calculation
    - Test visual distinction between course types
    - Test immediate updates on selection changes
    - _Requirements: 6.1, 6.2, 6.4, 6.6_

- [ ] 4. Implement SettingsRow component
  - [x] 4.1 Create SettingsRow.tsx with semester configuration controls
    - Implement season selection pills (Fall, Spring, Summer)
    - Implement year dropdown with range of years
    - Implement summer toggle switch
    - Implement credit hour limit pills (12-18 hours)
    - Apply pill styling with --s2 background and transitions
    - Wire up onChange callbacks for all controls
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.7_

  - [ ] 4.2 Write unit tests for SettingsRow
    - Test season pill selection
    - Test year dropdown selection
    - Test summer toggle functionality
    - Test credit hour pill selection
    - Test callback invocations with correct values
    - _Requirements: 2.5, 2.6, 2.7, 2.8_

- [ ] 5. Implement CoursePicker component
  - [x] 5.1 Create CoursePicker.tsx with tabbed interface
    - Implement tab navigation (Required vs Elective)
    - Render course list for active tab
    - Display course code, name, and credit hours for each course
    - Implement radio button selection controls
    - Apply blue theme for required courses, orange for elective courses
    - Implement dimming logic for courses that exceed credit limit
    - Add shake animation on click when course cannot be added
    - Wire up onCourseToggle callback
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2, 8.3_

  - [ ] 5.2 Write unit tests for CoursePicker
    - Test tab switching functionality
    - Test course rendering for both tabs
    - Test selection toggle with radio buttons
    - Test dimming logic when credit limit reached
    - Test shake animation trigger
    - Test theme styling for required vs elective
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 4.3, 4.4, 4.5, 4.6, 8.2, 8.3_

- [ ] 6. Implement WishlistPanel component
  - [x] 6.1 Create WishlistPanel.tsx with elective wishlist management
    - Display all elective courses with checkbox controls
    - Display missing prerequisites for each course
    - Show eligibility warnings when prerequisites are missing
    - Apply purple theme styling
    - Wire up onWishlistToggle callback
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 6.2 Write unit tests for WishlistPanel
    - Test checkbox toggle functionality
    - Test prerequisite display
    - Test eligibility warning display
    - Test independent operation from course selection
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [ ] 7. Implement NavBar component
  - [x] 7.1 Create NavBar.tsx with navigation controls
    - Implement fixed positioning with 56px height
    - Add back button with onBack callback
    - Display SmartAdvisor logo with pulse animation
    - Display student avatar
    - Add sign out button
    - Apply background with backdrop blur and border
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.2_

  - [ ] 7.2 Write unit tests for NavBar
    - Test back button callback invocation
    - Test logo pulse animation
    - Test fixed positioning and height
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 8. Checkpoint - Ensure all sub-components render correctly
  - Verify all sub-components render without errors
  - Check that all prop interfaces are correctly typed
  - Ensure all tests pass, ask the user if questions arise

- [ ] 9. Implement main PlanDegreePage container component
  - [x] 9.1 Create PlanDegreePage.tsx with state management
    - Initialize all state variables (selectedCourseIds, wishlistCourseIds, selectedSeason, selectedYear, maxHoursPerSemester, includeSummer, activeTab)
    - Implement credit hour calculation logic
    - Implement course selection validation (credit limit checking)
    - Implement derived state calculations (currentTotalHours, percentage)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.4, 8.5_

  - [x] 9.2 Wire up all sub-components with state and callbacks
    - Render NavBar with onBack callback
    - Render header section with student progress stats
    - Render SettingsRow with state and change handlers
    - Render PreviewCard with selected courses and totals
    - Render two-column layout with WishlistPanel and CoursePicker
    - Render CTA row with dynamic info text and submit button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [x] 9.3 Implement course selection logic
    - Handle course toggle with credit limit validation
    - Update selectedCourseIds Set on valid selections
    - Prevent selection when credit limit would be exceeded
    - Trigger shake animation on invalid selection attempts
    - Recalculate totals on every selection change
    - _Requirements: 3.3, 4.3, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 9.4 Implement wishlist management logic
    - Handle wishlist toggle independently from course selection
    - Update wishlistCourseIds Set on toggle
    - _Requirements: 5.3, 5.6_

  - [x] 9.5 Implement DegreePlan submission logic
    - Create DegreePlan object from current state
    - Validate that at least one course is selected
    - Call onComplete callback with DegreePlan object
    - Disable submit button when no courses selected
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ] 9.6 Write unit tests for PlanDegreePage state management
    - Test state initialization
    - Test credit hour calculation
    - Test course selection validation
    - Test derived state calculations
    - Test DegreePlan object creation
    - _Requirements: 8.1, 8.4, 8.5, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 10. Implement design system styling
  - [x] 10.1 Add Google Fonts imports to index.html
    - Import Bricolage Grotesque (weight 800)
    - Import Plus Jakarta Sans (weights 400, 500, 600, 700)
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 10.2 Apply CSS variables and color palette
    - Verify CSS variables are defined in global styles
    - Apply --s1 for card backgrounds
    - Apply --s2 for input and pill backgrounds
    - Apply --blue for required courses
    - Apply --orange for elective courses
    - Apply --purple for wishlist panel
    - _Requirements: 11.4, 11.6, 11.7_

  - [x] 10.3 Implement background gradient blobs
    - Add fixed radial gradient background layer
    - Position blue blob at top-left (15%, 5%)
    - Position orange blob at bottom-right (85%, 95%)
    - Position purple blob at center (50%, 50%)
    - Set appropriate opacity levels (18%, 12%, 8%)
    - _Requirements: 11.5_

- [ ] 11. Implement animations and interactions
  - [x] 11.1 Add page load staggered fade-in animations
    - Use Framer Motion for section animations
    - Implement fade + slide-up effect with stagger delays
    - Apply to all major sections in sequence
    - _Requirements: 12.1, 12.2_

  - [x] 11.2 Add logo pulse animation
    - Implement breathing box-shadow effect on logo dot
    - Use CSS keyframes for continuous animation
    - _Requirements: 12.3_

  - [x] 11.3 Add course selection interaction animations
    - Implement scale animation on course chip tap
    - Add hover translateX effect on course rows
    - Add background and border color transitions
    - _Requirements: 12.4, 12.5_

  - [x] 11.4 Add CTA button hover animation
    - Implement scale and background gradient shift on hover
    - Add tap scale-down effect
    - Handle disabled state styling
    - _Requirements: 12.6_

  - [ ] 11.5 Write visual regression tests for animations
    - Test staggered fade-in sequence
    - Test logo pulse animation
    - Test course selection animations
    - Test button hover effects
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 12. Implement loading and error states
  - [x] 12.1 Add skeleton loading states
    - Create skeleton components for stat blocks
    - Display skeletons when student prop is undefined
    - _Requirements: 13.1_

  - [x] 12.2 Add empty state messages
    - Display "No required courses available" when requiredCourses is empty
    - Display "No elective courses available" when electiveCourses is empty
    - _Requirements: 13.2, 13.3_

  - [x] 12.3 Add data validation and error handling
    - Validate course data has required fields before rendering
    - Skip rendering courses with missing required fields
    - Add fallback values for optional fields
    - Log errors to console for debugging
    - _Requirements: 13.4, 13.5_

  - [ ] 12.4 Write unit tests for error handling
    - Test skeleton display when data is undefined
    - Test empty state messages
    - Test handling of malformed course data
    - Test fallback rendering
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 13. Implement dynamic CTA information
  - [x] 13.1 Add dynamic info text logic
    - Display "Select courses to begin planning" when no courses selected
    - Display "X credit hours selected - add more courses" when under limit
    - Display "Ready to plan - X credit hours selected" when at/near limit
    - Update text immediately on selection changes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 13.2 Write unit tests for dynamic CTA text
    - Test text display for each state
    - Test immediate updates on selection changes
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

- [x] 14. Checkpoint - Ensure all features work end-to-end
  - Test complete user flow from page load to submission
  - Verify all animations play correctly
  - Verify all validation rules work as expected
  - Ensure all tests pass, ask the user if questions arise

- [ ] 15. Integration with parent component
  - [x] 15.1 Update App.tsx to integrate PlanDegreePage
    - Import PlanDegreePage component
    - Pass student, requiredCourses, electiveCourses props
    - Implement onComplete handler to receive DegreePlan
    - Implement onBack handler for navigation
    - Add routing logic if needed
    - _Requirements: 9.2, 10.2_

  - [ ] 15.2 Write integration tests for parent-child communication
    - Test prop passing from App to PlanDegreePage
    - Test onComplete callback with DegreePlan object
    - Test onBack callback for navigation
    - _Requirements: 9.2, 10.2_

- [x] 16. Final checkpoint and polish
  - Run all tests and ensure 100% pass rate
  - Verify responsive behavior on mobile, tablet, and desktop
  - Check accessibility with keyboard navigation
  - Verify color contrast ratios meet WCAG AA
  - Test in multiple browsers (Chrome, Firefox, Safari, Edge)
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation follows a bottom-up approach: types → sub-components → main component → integration
- All animations use CSS transforms for GPU acceleration
- State management is colocated in the main component for simplicity
- The component is designed to be fully controlled via props from the parent
