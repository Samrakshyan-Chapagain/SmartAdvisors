# Data Validation Test Cases

This document describes manual test cases to verify the data validation and error handling implementation for Task 12.3.

## Test Case 1: Valid Course Data
**Input:**
```typescript
const validCourse = {
  id: "CSE1234",
  code: "CSE 1234",
  name: "Introduction to Programming",
  creditHours: 3
};
```
**Expected:** Course renders normally, no console errors

## Test Case 2: Missing Required Field - id
**Input:**
```typescript
const invalidCourse = {
  id: "",
  code: "CSE 1234",
  name: "Introduction to Programming",
  creditHours: 3
};
```
**Expected:** 
- Course is skipped (not rendered)
- Console error: "Invalid course data - missing required fields: { id: '', code: 'CSE 1234', name: 'Introduction to Programming', creditHours: 3 }"

## Test Case 3: Missing Required Field - code
**Input:**
```typescript
const invalidCourse = {
  id: "CSE1234",
  code: "",
  name: "Introduction to Programming",
  creditHours: 3
};
```
**Expected:** 
- Course is skipped (not rendered)
- Console error logged

## Test Case 4: Missing Required Field - name
**Input:**
```typescript
const invalidCourse = {
  id: "CSE1234",
  code: "CSE 1234",
  name: "",
  creditHours: 3
};
```
**Expected:** 
- Course is skipped (not rendered)
- Console error logged

## Test Case 5: Invalid Credit Hours (zero)
**Input:**
```typescript
const invalidCourse = {
  id: "CSE1234",
  code: "CSE 1234",
  name: "Introduction to Programming",
  creditHours: 0
};
```
**Expected:** 
- Course is skipped (not rendered)
- Console error logged

## Test Case 6: Invalid Credit Hours (negative)
**Input:**
```typescript
const invalidCourse = {
  id: "CSE1234",
  code: "CSE 1234",
  name: "Introduction to Programming",
  creditHours: -3
};
```
**Expected:** 
- Course is skipped (not rendered)
- Console error logged

## Test Case 7: Null/Undefined Course
**Input:**
```typescript
const invalidCourse = null;
```
**Expected:** 
- Course is skipped (not rendered)
- Console error logged

## Test Case 8: Missing Optional Field - missingPrereqs
**Input:**
```typescript
const electiveCourse = {
  id: "CSE4321",
  code: "CSE 4321",
  name: "Advanced Topics",
  creditHours: 3
  // missingPrereqs is undefined
};
```
**Expected:** 
- Course renders normally
- No prerequisites warning shown
- Fallback to empty array: `[]`

## Test Case 9: Invalid Array Props
**Input:**
```typescript
<PlanDegreePage
  requiredCourses={null}  // Not an array
  electiveCourses={undefined}  // Not an array
  ...
/>
```
**Expected:** 
- Console error: "requiredCourses prop is not an array: null"
- Console error: "electiveCourses prop is not an array: undefined"
- Empty state message displayed: "No required courses available"

## Test Case 10: Mixed Valid and Invalid Courses
**Input:**
```typescript
const courses = [
  { id: "CSE1234", code: "CSE 1234", name: "Valid Course", creditHours: 3 },
  { id: "", code: "CSE 2345", name: "Invalid Course", creditHours: 3 },
  { id: "CSE3456", code: "CSE 3456", name: "Another Valid", creditHours: 4 }
];
```
**Expected:** 
- Only valid courses (CSE1234 and CSE3456) are rendered
- Invalid course is skipped
- Console error logged for invalid course

## Validation Rules Implemented

### Required Fields:
1. `id` - must be a non-empty string
2. `code` - must be a non-empty string
3. `name` - must be a non-empty string
4. `creditHours` - must be a positive number (> 0)

### Optional Fields:
1. `missingPrereqs` - defaults to empty array `[]` if undefined or not an array

### Error Handling:
1. Invalid courses are filtered out and not rendered
2. Console errors are logged with detailed information about missing fields
3. Components gracefully handle null/undefined props
4. Empty state messages shown when no valid courses available

## Components Updated

1. **PlanDegreePage.tsx**
   - Validates requiredCourses and electiveCourses props
   - Filters invalid courses before passing to child components
   - Logs errors for invalid array props

2. **CoursePicker.tsx**
   - Validates each course before rendering
   - Filters out courses with missing required fields
   - Logs detailed error information

3. **WishlistPanel.tsx**
   - Validates elective courses
   - Provides fallback for optional missingPrereqs field
   - Filters invalid courses

4. **PreviewCard.tsx**
   - Validates selected courses before display
   - Filters out invalid courses from preview
   - Logs errors for malformed data
