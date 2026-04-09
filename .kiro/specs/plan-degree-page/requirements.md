# Requirements Document

## Introduction

The Plan Your Degree page is a full-page React component that enables students to build their next semester schedule by selecting courses from required and elective options. The component provides real-time feedback on credit load, eligibility validation, and semester planning settings. It integrates with SmartAdvisor's existing design system and receives all data via props from a parent component.

## Glossary

- **Plan_Degree_Page**: The full-page React component for semester planning
- **Course_Picker**: The panel displaying required and elective courses for selection
- **Wishlist_Panel**: The panel for managing elective course preferences with eligibility checking
- **Preview_Card**: The live preview component showing selected courses and credit load visualization
- **Settings_Row**: The configuration panel for semester selection and credit hour limits
- **Nav_Bar**: The fixed navigation header (56px height)
- **Donut_Chart**: The circular visualization showing credit load progress
- **Degree_Plan**: The output object containing selected courses and semester settings
- **Student**: The user object containing completion status and progress data
- **Course**: A course object with id, code, name, and credit hours
- **Elective_Course**: A course object that extends Course with prerequisite validation data

## Requirements

### Requirement 1: Display Student Progress

**User Story:** As a student, I want to see my degree progress at a glance, so that I understand how much work remains.

#### Acceptance Criteria

1. THE Plan_Degree_Page SHALL display the student name in the header
2. THE Plan_Degree_Page SHALL display three stat blocks showing completed courses, completed credit hours, and estimated semesters remaining
3. THE Plan_Degree_Page SHALL display the total courses required for the degree
4. THE Plan_Degree_Page SHALL display the total credit hours required for the degree
5. FOR ALL stat blocks, the displayed values SHALL match the student prop data exactly

### Requirement 2: Configure Semester Settings

**User Story:** As a student, I want to configure my semester planning preferences, so that the system generates a plan matching my schedule.

#### Acceptance Criteria

1. THE Settings_Row SHALL provide season selection pills for Fall, Spring, and Summer
2. THE Settings_Row SHALL provide a year dropdown for selecting the start year
3. THE Settings_Row SHALL provide a toggle for including or excluding summer semesters
4. THE Settings_Row SHALL provide credit hour limit pills ranging from 12 to 18 hours
5. WHEN a season pill is clicked, THE Settings_Row SHALL update the selected season
6. WHEN a year is selected, THE Settings_Row SHALL update the selected year
7. WHEN the summer toggle is changed, THE Settings_Row SHALL update the includeSummer setting
8. WHEN a credit hour pill is clicked, THE Settings_Row SHALL update the maxHoursPerSemester setting

### Requirement 3: Select Required Courses

**User Story:** As a student, I want to select required courses for my next semester, so that I can fulfill degree requirements.

#### Acceptance Criteria

1. THE Course_Picker SHALL display all required courses from the requiredCourses prop
2. THE Course_Picker SHALL display each course with its code, name, and credit hours
3. WHEN a required course is clicked, THE Course_Picker SHALL toggle its selection state using a radio button
4. THE Course_Picker SHALL use blue theme styling for required courses
5. WHEN the total selected credit hours would exceed maxHoursPerSemester, THE Course_Picker SHALL dim courses that cannot be added
6. THE Course_Picker SHALL prevent selection of courses that would cause the credit limit to be exceeded

### Requirement 4: Select Elective Courses

**User Story:** As a student, I want to select elective courses for my next semester, so that I can fulfill elective requirements.

#### Acceptance Criteria

1. THE Course_Picker SHALL display all elective courses from the electiveCourses prop in a separate tab
2. THE Course_Picker SHALL display each elective course with its code, name, and credit hours
3. WHEN an elective course is clicked, THE Course_Picker SHALL toggle its selection state using a radio button
4. THE Course_Picker SHALL use orange theme styling for elective courses
5. WHEN the total selected credit hours would exceed maxHoursPerSemester, THE Course_Picker SHALL dim elective courses that cannot be added
6. THE Course_Picker SHALL prevent selection of elective courses that would cause the credit limit to be exceeded

### Requirement 5: Manage Elective Wishlist

**User Story:** As a student, I want to maintain a wishlist of elective courses, so that I can track courses I'm interested in taking later.

#### Acceptance Criteria

1. THE Wishlist_Panel SHALL display all elective courses with checkbox controls
2. THE Wishlist_Panel SHALL use purple theme styling
3. WHEN an elective course checkbox is clicked, THE Wishlist_Panel SHALL toggle the course's wishlist status
4. THE Wishlist_Panel SHALL display missing prerequisites for each elective course from the missingPrereqs field
5. WHEN an elective course has missing prerequisites, THE Wishlist_Panel SHALL display an eligibility warning
6. THE Wishlist_Panel SHALL allow wishlist selection independent of course selection for the current semester

### Requirement 6: Display Live Preview

**User Story:** As a student, I want to see a live preview of my selected courses, so that I can verify my selections before submitting.

#### Acceptance Criteria

1. THE Preview_Card SHALL display all currently selected courses
2. THE Preview_Card SHALL display the total credit hours of selected courses
3. THE Preview_Card SHALL display a Donut_Chart visualizing credit load as a percentage of maxHoursPerSemester
4. WHEN a course is selected or deselected, THE Preview_Card SHALL update immediately
5. WHEN the total credit hours change, THE Donut_Chart SHALL animate to the new percentage
6. THE Preview_Card SHALL distinguish between required courses (blue) and elective courses (orange) in the display

### Requirement 7: Animate Donut Chart

**User Story:** As a student, I want visual feedback on my credit load, so that I can understand how full my semester is.

#### Acceptance Criteria

1. THE Donut_Chart SHALL display credit load as a circular arc
2. THE Donut_Chart SHALL use stroke-dashoffset transitions for smooth animation
3. WHEN credit hours increase, THE Donut_Chart SHALL animate the arc growing clockwise
4. WHEN credit hours decrease, THE Donut_Chart SHALL animate the arc shrinking counterclockwise
5. THE Donut_Chart SHALL display the percentage value in the center
6. WHEN credit hours equal maxHoursPerSemester, THE Donut_Chart SHALL display 100%
7. WHEN credit hours exceed maxHoursPerSemester, THE Donut_Chart SHALL display a warning state

### Requirement 8: Validate Credit Limits

**User Story:** As a student, I want the system to prevent me from over-enrolling, so that I don't exceed credit hour limits.

#### Acceptance Criteria

1. WHEN the total selected credit hours would exceed maxHoursPerSemester, THE Plan_Degree_Page SHALL prevent additional course selection
2. WHEN a course cannot be added due to credit limits, THE Course_Picker SHALL dim that course
3. WHEN a course cannot be added due to credit limits, THE Plan_Degree_Page SHALL display a shake animation on the course row when clicked
4. THE Plan_Degree_Page SHALL calculate total credit hours by summing creditHours from all selected courses
5. THE Plan_Degree_Page SHALL recalculate credit limits whenever a course is selected or deselected

### Requirement 9: Submit Degree Plan

**User Story:** As a student, I want to submit my completed degree plan, so that the system can generate my full semester schedule.

#### Acceptance Criteria

1. THE Plan_Degree_Page SHALL display a "Plan My Degree" button in the CTA row
2. WHEN the "Plan My Degree" button is clicked, THE Plan_Degree_Page SHALL call the onComplete callback with a Degree_Plan object
3. THE Degree_Plan object SHALL contain selectedCourseIds as an array of course id strings
4. THE Degree_Plan object SHALL contain the selected season (Fall, Spring, or Summer)
5. THE Degree_Plan object SHALL contain the selected year as a string
6. THE Degree_Plan object SHALL contain maxHoursPerSemester as a number
7. THE Degree_Plan object SHALL contain includeSummer as a boolean
8. WHEN no courses are selected, THE Plan_Degree_Page SHALL disable the "Plan My Degree" button

### Requirement 10: Navigate Back

**User Story:** As a student, I want to navigate back to the previous screen, so that I can review or change my transcript.

#### Acceptance Criteria

1. THE Nav_Bar SHALL display a back button
2. WHEN the back button is clicked, THE Plan_Degree_Page SHALL call the onBack callback
3. THE Nav_Bar SHALL display the SmartAdvisor logo
4. THE Nav_Bar SHALL display the student avatar
5. THE Nav_Bar SHALL display a sign out button

### Requirement 11: Apply Design System Styling

**User Story:** As a developer, I want the component to use the SmartAdvisor design system, so that it maintains visual consistency.

#### Acceptance Criteria

1. THE Plan_Degree_Page SHALL use Bricolage Grotesque font at 800 weight for headings
2. THE Plan_Degree_Page SHALL use Plus Jakarta Sans font at 400, 500, 600, and 700 weights for body text
3. THE Plan_Degree_Page SHALL load fonts from Google Fonts
4. THE Plan_Degree_Page SHALL use the color palette defined in CSS variables (--bg, --s1, --s2, --s3, --s4, --blue, --orange, --purple, --green, --red, --text)
5. THE Plan_Degree_Page SHALL display three fixed radial gradient blobs (blue top-left, orange bottom-right, purple center) at low opacity in the background
6. THE Plan_Degree_Page SHALL use --s1 (#0b1120) for card backgrounds
7. THE Plan_Degree_Page SHALL use --s2 (#0f1826) for input and pill backgrounds

### Requirement 12: Animate Page Elements

**User Story:** As a student, I want smooth animations when the page loads, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN the page mounts, THE Plan_Degree_Page SHALL animate sections with fade and slide-up effects
2. THE Plan_Degree_Page SHALL stagger section animations with increasing delays
3. THE Nav_Bar logo orange dot SHALL animate with a breathing box-shadow pulse effect
4. WHEN a course is selected, THE Course_Picker SHALL animate the course chip with a scale effect
5. WHEN a course row is hovered, THE Course_Picker SHALL animate the row with translateX
6. WHEN the CTA button is hovered, THE Plan_Degree_Page SHALL animate the button background-position

### Requirement 13: Handle Loading States

**User Story:** As a student, I want to see loading indicators when data is unavailable, so that I understand the system is working.

#### Acceptance Criteria

1. WHEN the student prop is undefined, THE Plan_Degree_Page SHALL display skeleton loading states
2. WHEN the requiredCourses prop is empty, THE Course_Picker SHALL display an empty state message
3. WHEN the electiveCourses prop is empty, THE Course_Picker SHALL display an empty state message
4. THE Plan_Degree_Page SHALL handle malformed course data without crashing
5. WHEN course data is missing required fields, THE Plan_Degree_Page SHALL display a fallback value or skip rendering that course

### Requirement 14: Display Dynamic CTA Information

**User Story:** As a student, I want to see contextual information about my plan, so that I know what will happen when I submit.

#### Acceptance Criteria

1. THE Plan_Degree_Page SHALL display dynamic info text in the CTA row
2. WHEN no courses are selected, THE Plan_Degree_Page SHALL display "Select courses to begin planning"
3. WHEN courses are selected but under the credit limit, THE Plan_Degree_Page SHALL display "X credit hours selected - add more courses"
4. WHEN courses are selected at or near the credit limit, THE Plan_Degree_Page SHALL display "Ready to plan - X credit hours selected"
5. THE Plan_Degree_Page SHALL update the info text immediately when selections change

### Requirement 15: Organize Layout Structure

**User Story:** As a student, I want a clear visual hierarchy, so that I can easily find and use all features.

#### Acceptance Criteria

1. THE Plan_Degree_Page SHALL display the Nav_Bar fixed at the top with 56px height
2. THE Plan_Degree_Page SHALL display the header section with title and stat blocks below the Nav_Bar
3. THE Plan_Degree_Page SHALL display the Settings_Row as a single card below the header
4. THE Plan_Degree_Page SHALL display the Preview_Card below the Settings_Row
5. THE Plan_Degree_Page SHALL display the Wishlist_Panel and Course_Picker in a two-column layout below the Preview_Card
6. THE Plan_Degree_Page SHALL display the Wishlist_Panel on the left with purple theme
7. THE Plan_Degree_Page SHALL display the Course_Picker on the right with tabbed interface
8. THE Plan_Degree_Page SHALL display the CTA row at the bottom with info text and submit button
