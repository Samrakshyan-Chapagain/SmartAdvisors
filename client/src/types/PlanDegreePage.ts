/**
 * Plan Degree Page — shared types (API-aligned course models).
 */

export interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
}

export interface ElectiveCourse extends Course {
  missingPrereqs: string[];
  group?: string;
}

export interface ElectiveGroup {
  group: string;
  hoursRequired: number;
  hoursCompleted: number;
  courses: ElectiveCourse[];
}

/** Progress + identity from backend / parent (no hardcoded demo data). */
export interface Student {
  name: string;
  completedCourses: string[];
  completedCreditHours: number;
  totalCreditHours: number;
  totalCoursesRequired: number;
  estimatedSemestersLeft: number;
}

export interface DegreePlan {
  selectedCourseIds: string[];
  season: 'Fall' | 'Spring' | 'Summer';
  year: string;
  maxHoursPerSemester: number;
  includeSummer: boolean;
}

export type Season = 'Fall' | 'Spring' | 'Summer';

export type CourseTab = 'required' | 'elective';

export interface PlanDegreePageProps {
  /** Undefined while loading initial payload. */
  student?: Student;
  requiredCourses?: Course[];
  electiveCourses?: ElectiveCourse[];
  electiveGroups?: ElectiveGroup[];
  /** When true, show layout skeleton (parent is fetching). */
  loading?: boolean;
  onComplete: (plan: DegreePlan) => void;
  onBack: () => void;
}

/** @deprecated Use Student — kept for any legacy imports */
export type LegacyStudent = Student;

export interface SettingsRowProps {
  selectedSeason: Season;
  selectedYear: string;
  includeSummer: boolean;
  maxHoursPerSemester: number;
  onSeasonChange: (season: Season) => void;
  onYearChange: (year: string) => void;
  onSummerToggle: () => void;
  onMaxHoursChange: (hours: number) => void;
}

export interface CoursePickerProps {
  requiredCourses: Course[];
  electiveCourses: ElectiveCourse[];
  selectedCourseIds: Set<string>;
  maxHoursPerSemester: number;
  currentTotalHours: number;
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
  onCourseToggle: (courseId: string, creditHours: number) => void;
}

export interface WishlistPanelProps {
  electiveCourses: ElectiveCourse[];
  wishlistCourseIds: Set<string>;
  onWishlistToggle: (courseId: string) => void;
}

export interface PreviewCardProps {
  selectedCourses: Course[];
  totalHours: number;
  maxHoursPerSemester: number;
  requiredCourseIds?: Set<string>;
}

export interface DonutChartProps {
  percentage: number;
  maxHours: number;
  currentHours: number;
}

export interface ProgressHeaderProps {
  student: Student;
}

export interface CTARowProps {
  selectedCourseCount: number;
  totalHours: number;
  maxHoursPerSemester: number;
  onSubmit: () => void;
}

export interface NavBarProps {
  studentName: string;
  onBack: () => void;
  onSignOut?: () => void;
}

export interface CreditHourPickerProps {
  maxHoursPerSemester: number;
  onMaxHoursChange: (hours: number) => void;
}
