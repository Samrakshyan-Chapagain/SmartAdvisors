import os
import sqlite3
from .parse_transcript import extract_all_courses 

def get_department_courses(department):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, '../../../data/classes.db'))
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database file not found at {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(f'SELECT * FROM ClassesFor{department}')
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    courses = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return courses

def normalize_code(course_code):
    return ' '.join(str(course_code).replace('\xa0', ' ').split()).strip()

def is_course_eligible(course, completed, course_map):
    course_id = normalize_code(course['Course_Num'])
    prereqs = course.get('Pre_Requisites', '').strip()
    if prereqs and prereqs.lower() != 'none':
        prereq_list = [normalize_code(p) for p in prereqs.split(',') if p.strip()]
        for p in prereq_list:
            if p not in completed:
                return False
    coreqs = course.get('Co_Requisites', '').strip()
    if coreqs and coreqs.lower() != 'none':
        coreq_list = [normalize_code(p) for p in coreqs.split(',') if p.strip()]
        for ccode in coreq_list:
            if ccode in completed:
                continue
            co_course = course_map.get(ccode)
            if not co_course:
                return False
            co_prereqs = co_course.get('Pre_Requisites', '').strip()
            if co_prereqs and co_prereqs.lower() != 'none':
                co_prereq_list = [normalize_code(p) for p in co_prereqs.split(',') if p.strip()]
                for p in co_prereq_list:
                    if p not in completed:
                        return False
    return True

def expand_completed_with_prereqs(normalized_completed, course_map):
    """
    Transitively expand the completed set: if you passed a course, you must have
    satisfied its prerequisites too (directly or transitively).

    Example: student has MATH 2425 (Calc II) on transcript.
      MATH 2425 requires MATH 1426 → add MATH 1426 as implied completed.
      MATH 1426 requires MATH 1402 → add MATH 1402 as implied completed.
      MATH 1402 requires MATH 1302 → add MATH 1302 as implied completed.
    Result: Pre-Calc and Algebra no longer appear as eligible recommendations.
    """
    expanded = set(normalized_completed)
    changed = True
    while changed:
        changed = False
        for code in list(expanded):
            course = course_map.get(code)
            if not course:
                continue
            prereqs = course.get('Pre_Requisites', '').strip()
            if prereqs and prereqs.lower() != 'none':
                for p in [normalize_code(x) for x in prereqs.split(',') if x.strip()]:
                    if p not in expanded:
                        expanded.add(p)
                        changed = True
    return expanded


def filter_eligible_courses_unique(all_courses, completed_courses):
    normalized_completed = set(normalize_code(c) for c in completed_courses)
    course_map = {normalize_code(c['Course_Num']): c for c in all_courses}

    # Expand completed set: infer all implied prerequisites from transcript courses
    normalized_completed = expand_completed_with_prereqs(normalized_completed, course_map)

    eligible = dict()
    for course in all_courses:
        c_id = normalize_code(course['Course_Num'])
        if c_id in normalized_completed or c_id in eligible:
            continue
        if is_course_eligible(course, normalized_completed, course_map):
            eligible[c_id] = course
            coreqs = course.get('Co_Requisites', '').strip()
            if coreqs and coreqs.lower() != 'none':
                coreq_list = [normalize_code(cc) for cc in coreqs.split(',') if cc.strip()]
                for ccode in coreq_list:
                    if ccode not in normalized_completed and ccode in course_map and ccode not in eligible:
                        co_course = course_map[ccode]
                        if is_course_eligible(co_course, normalized_completed, course_map):
                            eligible[ccode] = co_course
    return eligible

def get_professor_offerings_for_course(course_code):
    # Looks in all tables for offerings of the given course code (subject_id + course_number)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, '../../../data/grades.sqlite'))
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Grades DB file not found at {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cur.fetchall() if not row[0].startswith('sqlite')] # skip any sqlite internal tables
    offerings = []
    parts = course_code.split()
    if len(parts) != 2:
        return []  # skip elective placeholders like "CE 43XX", "HIST 13XX", "LPC XXXX"
    subj, num = parts
    for tbl in tables:
        safe_tbl = f'"{tbl}"' if ('-' in tbl or ' ' in tbl) else tbl
        try:
            cur.execute(f'SELECT subject_id, course_number, course_title, year, semester, instructor1, instructor2, instructor3, instructor4, instructor5, course_gpa FROM {safe_tbl} WHERE subject_id=? AND course_number=?', (subj, num))
            for row in cur.fetchall():
                offerings.append({
                    'subject_id': row[0],
                    'course_number': row[1],
                    'course_title': row[2],
                    'year': row[3],
                    'semester': row[4],
                    'course_gpa': row[9],
                    'instructors': [iname for iname in row[5:10] if iname and str(iname).strip() and str(iname).strip().lower() != 'none']
                })
        except Exception:
            continue
    conn.close()
    return offerings

def print_prof_recs_for_course(course_code, course_name, completed):
    offerings = get_professor_offerings_for_course(course_code)
    seen = set()
    if not offerings:
        print("    No professor data available (was this course not offered recently?)")
        return
    print(f"    Professors (from recent terms):")
    for offer in offerings:
        for prof in offer['instructors']:
            if prof in seen:
                continue
            seen.add(prof)
            gpa = offer['course_gpa']
            year = offer['year']
            sem = offer['semester']
            sem_label = f"{year} {sem}" if year and sem else "n/a"
            print(f"        - {prof} | Recent GPA: {gpa} | Term: {sem_label}")

def run_local_demo():
    """Run this for local testing with sample_transcript.pdf"""
    dept = 'CE'
    all_courses = get_department_courses(dept)
    print(f"Loaded {len(all_courses)} course/professor offerings for {dept} department.")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.abspath(os.path.join(script_dir, '../../../data/sample_transcript.pdf'))
    
    if not os.path.exists(pdf_path):
        print(f"PDF transcript not found at: {pdf_path}")
        completed = []
    else:
        completed = extract_all_courses(pdf_path)
    
    print(f"Completed courses from transcript: {completed}")
    
    eligible = filter_eligible_courses_unique(all_courses, completed)
    print(f"Eligible courses (not yet taken, prereqs/coreqs satisfied): {len(eligible)})")
    
    for code, e in list(eligible.items()):
        print(f"{code}: {e['Course_Name']}")
        co_req = e.get('Co_Requisites', '').strip()
        if co_req and co_req.lower() != 'none':
            co_req_list = [normalize_code(c) for c in co_req.split(',') if c.strip()]
            remaining_coreqs = [c for c in co_req_list if c not in completed]
            if remaining_coreqs:
                print(f"    Co-requisite(s): {', '.join(remaining_coreqs)}")
        print_prof_recs_for_course(code, e['Course_Name'], completed)

if __name__ == "__main__":
    run_local_demo()

# Export functions for API use
__all__ = [
    'get_department_courses',
    'filter_eligible_courses_unique', 
    'get_professor_offerings_for_course',
    'extract_all_courses',
    'normalize_code'
]

