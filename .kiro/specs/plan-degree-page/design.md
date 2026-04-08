# Design Document: Plan Degree Page

## Overview

The Plan Degree Page is a full-page React component that enables students to configure their semester planning preferences and select courses for their next semester. The component provides real-time visual feedback through a donut chart visualization, validates credit hour limits, and manages both required and elective course selections. It integrates seamlessly with SmartAdvisor's existing design system and receives all data via props from the parent App component.

The component follows a single-page layout with multiple interactive sections: student progress display, semester configuration settings, credit hour selection, course picker with tabs, elective wishlist panel, and a live preview card. All state is managed locally within the component, and the final degree plan configuration is passed to the parent via callback.

## Architecture

### Component Structure

The Plan Degree Page follows a container-presentation pattern with the main component managing all state and rendering specialized sub-components for each functional area:

```
PlanDegreePage (Container)
├── NavBar (Presentation)
├── ProgressHeader (Presentation)
├── SettingsRow (Presentation)
│   ├── SeasonPills
│   ├── YearDropdown
│   └── SummerToggle
├── CreditHourPicker (Presentation)
├── PreviewCard (Presentation)
│   └── DonutChart (Presentation)
├── TwoColumnLayout
│   ├── WishlistPanel (Presentation)
│   └── CoursePicker (Presentation)
│       ├── RequiredTab
│       └── ElectiveTab
└── CTARow (Presentation)
```

### State Management Approach

The component uses React's `useState` hook for local state management. All state is colocated in the main component to simplify data flow and ensure consistency across all sub-components. State updates trigger immediate re-renders of dependent UI elements.

**State Variables:**
- `selectedCourseIds: Set<string>` - Tracks selected courses for next semester
- `wishlistCourseIds: Set<string>` - Tracks elective courses marked for future semesters
- `selectedSeason: 'Fall' | 'Spring' | 'Summer'` - Current semester season selection
- `selectedYear: string` - Current year selection
- `maxHoursPerSemester: number` - Credit hour limit (12-18)
- `includeSummer: boolean` - Whether to include summer semesters in planning
- `activeTab: 'required' | 'elective'` - Current tab in course picker

### Data Flow

```
Parent (App.tsx)
  ↓ props
PlanDegreePage
  ↓ derived state
Sub-components (read-only)
  ↓ callbacks
PlanDegreePage (state updates)
  ↓ onComplete callback
Parent (receives DegreePlan object)
```

All data flows unidirectionally from parent to child via props. User interactions trigger callbacks that update state in the main component, which then re-renders affected sub-components. The final submission calls `onComplete` with a structured DegreePlan object.

## Components and Interfaces

### Main Component: PlanDegreePage

**Props Interface:**
```typescript
interface PlanDegreePageProps {
  student: {
    name: string;
    completedCourses: number;
    completedHours: number;
    totalCourses: number;
    totalHours: number;
    estimatedSemesters: number;
  };
  requiredCourses: Course[];
  electiveCourses: ElectiveCourse[];
  onComplete: (plan: DegreePlan) => void;
  onBack: () => void;
}
```

**Output Interface:**
```typescript
interface DegreePlan {
  selectedCourseIds: string[];
  season: 'Fall' | 'Spring' | 'Summer';
  year: string;
  maxHoursPerSemester: number;
  includeSummer: boolean;
}
```

### Sub-Components

**SettingsRow**
```typescript
interface SettingsRowProps {
  selectedSeason: string;
  selectedYear: string;
  includeSummer: boolean;
  maxHoursPerSemester: number;
  onSeasonChange: (season: string) => void;
  onYearChange: (year: string) => void;
  onSummerToggle: () => void;
}
```

**CoursePicker**
```typescript
interface CoursePickerProps {
  requiredCourses: Course[];
  electiveCourses: ElectiveCourse[];
  selectedCourseIds: Set<string>;
  maxHoursPerSemester: number;
  currentTotalHours: number;
  activeTab: 'required' | 'elective';
  onTabChange: (tab: 'required' | 'elective') => void;
  onCourseToggle: (courseId: string, creditHours: number) => void;
}
```

**WishlistPanel**
```typescript
interface WishlistPanelProps {
  electiveCourses: ElectiveCourse[];
  wishlistCourseIds: Set<string>;
  onWishlistToggle: (courseId: string) => void;
}
```

**PreviewCard**
```typescript
interface PreviewCardProps {
  selectedCourses: Course[];
  totalHours: number;
  maxHoursPerSemester: number;
}
```

**DonutChart**
```typescript
interface DonutChartProps {
  percentage: number;
  maxHours: number;
  currentHours: number;
}
```

## Data Models

### Course
```typescript
interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
}
```

### ElectiveCourse
```typescript
interface ElectiveCourse extends Course {
  missingPrereqs: string[];
}
```

### Student
```typescript
interface Student {
  name: string;
  completedCourses: number;
  completedHours: number;
  totalCourses: number;
  totalHours: number;
  estimatedSemesters: number;
}
```

### DegreePlan
```typescript
interface DegreePlan {
  selectedCourseIds: string[];
  season: 'Fall' | 'Spring' | 'Summer';
  year: string;
  maxHoursPerSemester: number;
  includeSummer: boolean;
}
```

## Error Handling

### Input Validation

**Credit Limit Validation:**
- Before allowing course selection, calculate: `newTotal = currentTotal + course.creditHours`
- If `newTotal > maxHoursPerSemester`, prevent selection and trigger shake animation
- Display visual feedback by dimming courses that cannot be added

**Missing Data Handling:**
- If `student` prop is undefined, render skeleton loading states
- If `requiredCourses` is empty, display "No required courses available" message
- If `electiveCourses` is empty, display "No elective courses available" message
- If course data is missing required fields (id, code, name, creditHours), skip rendering that course

**Submission Validation:**
- Disable "Plan My Degree" button when `selectedCourseIds.size === 0`
- Validate all required fields in DegreePlan object before calling `onComplete`

### User Feedback

**Visual Feedback:**
- Shake animation on course row when credit limit prevents selection
- Donut chart color changes: blue (normal), amber (near limit), red (over limit)
- Dimmed appearance for courses that cannot be added
- Toast notifications for validation errors (optional enhancement)

**Loading States:**
- Skeleton loaders for stat blocks when student data is loading
- Empty state messages for course lists
- Disabled button states during submission

### Error Boundaries

The component should be wrapped in an error boundary at the parent level to catch and handle rendering errors gracefully. Internal errors should log to console and display fallback UI where appropriate.

## Testing Strategy

### Unit Testing Approach

Since this is a UI-heavy React component with state management and user interactions, property-based testing is not applicable. Instead, the testing strategy focuses on:

**Component Unit Tests:**
- Test individual sub-components in isolation (SettingsRow, CoursePicker, PreviewCard, DonutChart)
- Verify correct rendering with various prop combinations
- Test user interaction handlers (clicks, toggles, selections)
- Verify state updates trigger correct re-renders

**State Management Tests:**
- Test credit hour calculation logic
- Test course selection/deselection logic
- Test validation rules (credit limits, empty selections)
- Test derived state calculations (total hours, percentage)

**Integration Tests:**
- Test full user flows (select courses → configure settings → submit)
- Test interaction between sub-components (course selection updates preview)
- Test validation prevents invalid submissions
- Test callback invocations with correct data structures

**Visual Regression Tests:**
- Snapshot tests for component rendering
- Visual regression tests for animations and transitions
- Responsive layout tests for different screen sizes

### Test Coverage Goals

- 80%+ code coverage for business logic
- 100% coverage for validation rules
- All user interaction paths tested
- All error states tested

### Testing Tools

- Jest for unit tests
- React Testing Library for component tests
- Mock Service Worker (MSW) for API mocking if needed
- Playwright or Cypress for E2E tests

## Animation and Interaction Patterns

### Page Load Animations

**Staggered Fade-In:**
- Each section animates with fade + slide-up effect
- Stagger delay: `index * 0.05s`
- Duration: `0.45s ease-out`
- Sections animate in order: Header → Stats → Settings → Preview → Course Picker → CTA

**Implementation:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.45 }}
>
```

### Donut Chart Animation

**Stroke Animation:**
- Use `stroke-dashoffset` for smooth arc transitions
- Transition duration: `0.6s ease-in-out`
- Animate percentage text with number counter effect
- Color transitions based on percentage thresholds

**Implementation:**
```typescript
<circle
  className="transition-all duration-600 ease-in-out"
  strokeDashoffset={circumference - (percentage / 100) * circumference}
/>
```

### Course Selection Interactions

**Selection Feedback:**
- Scale animation on course chip: `scale(0.98)` on tap
- Radio button check animation: scale from 0 to 1
- Background color transition: `0.2s ease`
- Border color transition: `0.2s ease`

**Hover Effects:**
- Course row: `translateX(2px)` + border color change
- Duration: `0.2s ease`
- Cursor changes to pointer on interactive elements

**Shake Animation (Credit Limit):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

### Button Interactions

**CTA Button:**
- Hover: `scale(1.02)` + background gradient shift
- Tap: `scale(0.98)`
- Disabled: `opacity(0.5)` + no hover effects
- Loading: spinner animation + disabled state

**Pill Buttons (Settings):**
- Selected: background color + border + shadow
- Hover: background lightens + border brightens
- Transition: `0.2s ease-in-out`

### Logo Pulse Animation

**Breathing Effect:**
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
  50% { box-shadow: 0 0 0 6px rgba(255, 107, 53, 0); }
}
```

## Design System Integration

### Typography

**Headings:**
- Font: Bricolage Grotesque, weight 800
- Loaded from Google Fonts
- Usage: Page title, section headers

**Body Text:**
- Font: Plus Jakarta Sans
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Loaded from Google Fonts
- Usage: All body text, labels, buttons

**Font Loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Color Palette

**CSS Variables:**
```css
:root {
  --bg: #07080f;
  --s1: #0b1120;
  --s2: #0f1826;
  --s3: #131d2e;
  --s4: #1a2538;
  --blue: #0046FF;
  --orange: #FF8040;
  --purple: #9333EA;
  --green: #10B981;
  --red: #EF4444;
  --text: #FFFFFF;
  --border: #1c2035;
  --border2: #242840;
}
```

**Theme Application:**
- Required courses: `--blue` (#0046FF)
- Elective courses: `--orange` (#FF8040)
- Wishlist panel: `--purple` (#9333EA)
- Success states: `--green` (#10B981)
- Error states: `--red` (#EF4444)
- Card backgrounds: `--s1` (#0b1120)
- Input backgrounds: `--s2` (#0f1826)

### Background Gradients

**Fixed Radial Blobs:**
```css
.sa-page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 100% 70% at 15% 5%, rgba(91, 124, 250, 0.18), transparent 52%),
    radial-gradient(ellipse 80% 50% at 85% 95%, rgba(255, 107, 53, 0.12), transparent 48%),
    radial-gradient(ellipse 60% 60% at 50% 50%, rgba(147, 51, 234, 0.08), transparent 50%),
    var(--bg);
}
```

**Positioning:**
- Blue blob: top-left (15%, 5%)
- Orange blob: bottom-right (85%, 95%)
- Purple blob: center (50%, 50%)
- Opacity: 18%, 12%, 8% respectively

### Layout Structure

**Nav Bar:**
- Height: 56px
- Position: fixed top
- Background: `rgba(7, 8, 15, 0.97)` with backdrop blur
- Border bottom: `1px solid var(--border)`
- Z-index: 50

**Content Area:**
- Max width: 1280px (7xl)
- Padding top: 56px (nav bar offset)
- Horizontal padding: 24px (6)
- Vertical spacing: 32px (8) between sections

**Card Styling:**
- Background: `var(--s1)` with 5% white overlay
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border radius: 24px (3xl)
- Backdrop blur: xl
- Shadow: subtle on hover

### Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (two columns where appropriate)
- Desktop: > 1024px (full layout)

**Mobile Adaptations:**
- Two-column layout becomes single column
- Stat blocks stack vertically
- Course picker tabs remain horizontal
- Preview card moves below course picker
- Font sizes scale down slightly

## Implementation Notes

### Performance Considerations

- Use `React.memo` for sub-components that receive stable props
- Memoize expensive calculations with `useMemo` (credit totals, filtered lists)
- Use `useCallback` for event handlers passed to child components
- Avoid inline function definitions in render
- Use CSS transforms for animations (GPU-accelerated)

### Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation support for all controls
- Focus indicators visible on all interactive elements
- Screen reader announcements for state changes
- Color contrast ratios meet WCAG AA standards
- Semantic HTML structure

### Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox for layout
- CSS custom properties for theming
- Framer Motion for animations (with fallbacks)
- No IE11 support required

