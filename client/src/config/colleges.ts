/**
 * College and degree configuration — single source of truth.
 *
 * To add a new college or degree:
 *   1. Add the entry here
 *   2. Create a CSV in server/data/ and run load_degree_plan.py
 *   3. The rest of the app picks it up automatically
 */

export interface DegreeInfo {
  code: string; // e.g. 'CSE' — maps to ClassesFor{code} DB table
  name: string; // e.g. 'Computer Science'
}

export interface CollegeInfo {
  name: string; // e.g. 'College of Engineering'
  degrees: DegreeInfo[];
}

export const COLLEGES: Record<string, CollegeInfo> = {
  engineering: {
    name: 'College of Engineering',
    degrees: [
      { code: 'AREN', name: 'Architectural Engineering' },
      { code: 'BE', name: 'Bioengineering' },
      { code: 'CE', name: 'Civil Engineering' },
      { code: 'CM', name: 'Construction Management' },
      { code: 'CSE', name: 'Computer Science' },
      { code: 'EE', name: 'Electrical Engineering' },
      { code: 'IE', name: 'Industrial Engineering' },
      { code: 'MAE', name: 'Mechanical & Aerospace Engineering' },
    ],
  },
  // ── Future colleges ──────────────────────────────────────────
  // business: {
  //   name: 'College of Business',
  //   degrees: [
  //     { code: 'ACCT', name: 'Accounting' },
  //     { code: 'FIN',  name: 'Finance' },
  //     { code: 'MIS',  name: 'Information Systems' },
  //     { code: 'MKTG', name: 'Marketing' },
  //     { code: 'MGMT', name: 'Management' },
  //   ],
  // },
  // science: {
  //   name: 'College of Science',
  //   degrees: [
  //     { code: 'BIO',  name: 'Biology' },
  //     { code: 'CHEM', name: 'Chemistry' },
  //     { code: 'MATH', name: 'Mathematics' },
  //     { code: 'PHYS', name: 'Physics' },
  //   ],
  // },
  // nursing: {
  //   name: 'College of Nursing and Health Innovation',
  //   degrees: [],
  // },
  // liberal_arts: {
  //   name: 'College of Liberal Arts',
  //   degrees: [],
  // },
};

/** Get display name for a degree code (e.g. 'CSE' → 'Computer Science') */
export function getDegreeName(code: string): string {
  for (const college of Object.values(COLLEGES)) {
    const degree = college.degrees.find((d) => d.code === code);
    if (degree) return degree.name;
  }
  return code;
}

/** Get college name for a degree code (e.g. 'CSE' → 'College of Engineering') */
export function getCollegeName(code: string): string {
  for (const college of Object.values(COLLEGES)) {
    if (college.degrees.some((d) => d.code === code)) return college.name;
  }
  return '';
}

/** Find which college key a degree belongs to */
export function getCollegeKeyForDegree(code: string): string {
  for (const [key, college] of Object.entries(COLLEGES)) {
    if (college.degrees.some((d) => d.code === code)) return key;
  }
  return '';
}
