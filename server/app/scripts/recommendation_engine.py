import os
import sqlite3
from .parse_transcript import extract_all_courses


def _get_db_path():
    """Return the path to smart_advisors.db."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(script_dir, '../../data_new/smart_advisors.db'))


# Client major codes that differ from degree_id used in degree_courses / degrees.total_hours
_DEGREE_CATALOG_ALIASES = {
    'CSE': 'CS',  # UI "Computer Science" → BS CS catalog
    'MAE': 'ME',  # UI Mechanical Engineering → ME catalog
}


def catalog_degree_id(department):
    """Map UI department code to the degree_id rows are stored under in smart_advisors.db."""
    if not department:
        return department
    return _DEGREE_CATALOG_ALIASES.get(department, department)


def parse_prereq_string(raw):
    """
    Parse a prerequisites/corequisites string into a list of prerequisite entries.

    Each entry is either:
      - A single normalized course code: 'CSE 1310'
      - An OR-group string: 'CSE 3380 or MATH 3330'  (any one satisfies the requirement)

    Handles:
      - '' or None or 'None'          → []
      - 'EE 2310, PHYS 1444'          → ['EE 2310', 'PHYS 1444']
      - "['CSE 1310', 'CSE 1320']"    → ['CSE 1310', 'CSE 1320']
      - "['IE 3301 or MATH 3313', 'CSE 3318']" → ['IE 3301 or MATH 3313', 'CSE 3318']
    """
    if not raw:
        return []
    stripped = raw.strip()
    if stripped.lower() in ('none', '[none]', "['none']", '[]'):
        return []
    # Handle Python list literal format
    if stripped.startswith('[') and stripped.endswith(']'):
        inner = stripped[1:-1]
        codes = [c.strip().strip("'\"") for c in inner.split(',') if c.strip()]
        codes = [c for c in codes if c.lower() != 'none' and c]
        # Normalize each entry — but preserve OR groups as-is (just normalize spacing)
        result = []
        for c in codes:
            if ' or ' in c.lower():
                # OR group — normalize each alternative inside
                alts = [normalize_code(a.strip()) for a in c.split(' or ')]
                result.append(' or '.join(alts))
            else:
                result.append(normalize_code(c))
        return result
    # Plain comma-separated
    return [normalize_code(p) for p in stripped.split(',') if p.strip()]


def _is_prereq_met(prereq_entry, completed, course_map):
    """
    Check if a single prerequisite entry is satisfied.

    prereq_entry can be:
      - 'CSE 1310'                    → must be in completed
      - 'IE 3301 or MATH 3313'       → any one must be in completed

    Returns True if satisfied, False if not.
    Stale/unknown course codes (not in course_map) are treated as satisfied.
    """
    if ' or ' in prereq_entry:
        alternatives = [a.strip() for a in prereq_entry.split(' or ')]
        # Satisfied if ANY alternative is completed
        any_in_map = False
        for alt in alternatives:
            if alt in completed:
                return True
            if alt in course_map:
                any_in_map = True
        # If none of the alternatives exist in the course map, treat as satisfied
        # (stale data — can't block the student on unknown courses)
        return not any_in_map
    else:
        # Single course
        if prereq_entry in completed:
            return True
        if prereq_entry not in course_map:
            return True  # stale/unknown — skip
        return False


def get_department_courses(department):
    """
    Fetch all courses for a degree program from smart_advisors.db.

    Returns list of dicts with keys:
      course_id, course_name, pre_requisites, co_requisites, description,
      credit_hours, dept_prefix, requirement_type, elective_group,
      elective_hours, professional
    """
    db_path = _get_db_path()
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database file not found at {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    degree_id = catalog_degree_id(department)
    cur.execute('''
        SELECT c.course_id, c.course_name, c.pre_requisites, c.co_requisites,
               c.description, c.credit_hours, c.dept_prefix,
               dc.requirement_type, dc.elective_group, dc.elective_hours, dc.professional
        FROM degree_courses dc
        JOIN courses c ON dc.course_id = c.course_id
        WHERE dc.degree_id = ?
    ''', (degree_id,))
    courses = [dict(row) for row in cur.fetchall()]
    conn.close()
    return courses


def get_core_curriculum():
    """Fetch core curriculum requirements grouped by category."""
    db_path = _get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute('SELECT category, category_hours, course_id, course_hours, notes FROM core_curriculum')
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()

    # Group by category
    categories = {}
    for row in rows:
        cat = row['category']
        if cat not in categories:
            categories[cat] = {
                'category': cat,
                'hours_required': row['category_hours'],
                'courses': [],
            }
        categories[cat]['courses'].append({
            'course_id': row['course_id'],
            'course_hours': row['course_hours'],
            'notes': row['notes'],
        })
    return categories


def get_degree_info(department):
    """Get degree metadata (name, college, total_hours)."""
    db_path = _get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    degree_id = catalog_degree_id(department)
    cur.execute('SELECT degree_id, degree_name, college, total_hours FROM degrees WHERE degree_id = ?', (degree_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def normalize_code(course_code):
    return ' '.join(str(course_code).replace('\xa0', ' ').split()).strip()


def is_course_eligible(course, completed, course_map):
    course_id = normalize_code(course['course_id'])
    prereqs = course.get('pre_requisites', '') or ''
    prereq_list = parse_prereq_string(prereqs)
    for p in prereq_list:
        if not _is_prereq_met(p, completed, course_map):
            return False
    coreqs = course.get('co_requisites', '') or ''
    coreq_list = parse_prereq_string(coreqs)
    for ccode in coreq_list:
        if ccode in completed:
            continue
        co_course = course_map.get(ccode)
        if not co_course:
            continue  # coreq not in DB — skip stale reference
        co_prereqs = co_course.get('pre_requisites', '') or ''
        co_prereq_list = parse_prereq_string(co_prereqs)
        for p in co_prereq_list:
            if not _is_prereq_met(p, completed, course_map):
                return False
    return True

# Courses that satisfy the same requirement (either/or options across departments).
# Completing one implies the other for prerequisite checking purposes.
COURSE_EQUIVALENCES = {
    'MATH 3313': 'IE 3301',    # Probability: either satisfies
    'IE 3301':   'MATH 3313',
    'MATH 3330': 'CSE 3380',   # Linear Algebra: either satisfies
    'CSE 3380':  'MATH 3330',
}


def expand_completed_with_prereqs(normalized_completed, course_map):
    """
    Transitively expand the completed set: if you passed a course, you must have
    satisfied its prerequisites too (directly or transitively).

    Also applies course equivalences (e.g. MATH 3313 <-> IE 3301) so that
    completing one version of a course satisfies prereqs requiring the other.
    """
    expanded = set(normalized_completed)
    changed = True
    while changed:
        changed = False
        for code in list(expanded):
            # Transitive prereq expansion
            course = course_map.get(code)
            if course:
                prereqs = course.get('pre_requisites', '') or ''
                for p in parse_prereq_string(prereqs):
                    # Skip OR-groups in transitive expansion — we can't know
                    # which alternative was taken, so don't infer anything.
                    if ' or ' in p:
                        continue
                    if p not in expanded:
                        expanded.add(p)
                        changed = True
            # Equivalence expansion
            equiv = COURSE_EQUIVALENCES.get(code)
            if equiv and equiv not in expanded:
                expanded.add(equiv)
                changed = True
    return expanded


def _build_global_course_map():
    """Load all courses from the courses table for prereq expansion."""
    db_path = _get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute('SELECT course_id, course_name, pre_requisites, co_requisites, credit_hours FROM courses')
    course_map = {}
    for row in cur.fetchall():
        d = dict(row)
        course_map[normalize_code(d['course_id'])] = d
    conn.close()
    return course_map


def filter_eligible_courses_unique(all_courses, completed_courses, in_progress_courses=None):
    normalized_completed = set(normalize_code(c) for c in completed_courses)
    normalized_in_progress = set(normalize_code(c) for c in (in_progress_courses or []))

    # Build course map from degree courses + global courses for prereq expansion
    course_map = {normalize_code(c['course_id']): c for c in all_courses}
    global_map = _build_global_course_map()
    merged_map = {**global_map, **course_map}  # degree courses take priority

    # For prereq checking, treat in-progress courses as done (they'll be
    # completed by next semester).  For the eligible list, exclude both
    # completed AND in-progress (student already has them).
    prereq_check_set = normalized_completed | normalized_in_progress
    prereq_check_set = expand_completed_with_prereqs(prereq_check_set, merged_map)

    # Also expand the plain completed set (for ENGR/UNIV either-or below)
    expanded_completed = expand_completed_with_prereqs(normalized_completed, merged_map)

    eligible = dict()
    for course in all_courses:
        c_id = normalize_code(course['course_id'])
        if c_id in expanded_completed or c_id in normalized_in_progress or c_id in eligible:
            continue
        if is_course_eligible(course, prereq_check_set, merged_map):
            eligible[c_id] = course
            coreqs = course.get('co_requisites', '') or ''
            coreq_list = parse_prereq_string(coreqs)
            for ccode in coreq_list:
                if ccode not in expanded_completed and ccode not in normalized_in_progress and ccode in merged_map and ccode not in eligible:
                    co_course = merged_map[ccode]
                    if is_course_eligible(co_course, prereq_check_set, merged_map):
                        eligible[ccode] = co_course

    # Either/or rules: ENGR 1101 and UNIV are alternatives -- only need one
    all_done = expanded_completed | normalized_in_progress
    completed_univ = any(c.startswith('UNIV') for c in all_done)
    completed_engr1101 = 'ENGR 1101' in all_done
    if completed_univ:
        eligible.pop('ENGR 1101', None)
    if completed_engr1101:
        for code in list(eligible):
            if code.startswith('UNIV'):
                eligible.pop(code, None)

    return eligible


def get_elective_budgets(all_courses):
    """
    Build elective budget dict from degree courses.
    Returns {group_name: hours_required} — e.g. {'technical': 15, 'security': 3}
    """
    budgets = {}
    for c in all_courses:
        if c.get('requirement_type') == 'elective' and c.get('elective_group'):
            group = c['elective_group']
            hrs = c.get('elective_hours') or 0
            budgets[group] = hrs  # all courses in same group have same target
    return budgets


def elective_group_label(group_name):
    """Return a user-facing elective group label from DB group value."""
    raw = normalize_code(group_name or "")
    if not raw:
        return "Elective"
    words = raw.replace("_", "-").split("-")
    titled = " ".join(w.capitalize() for w in words if w)
    return f"{titled} Elective"


def generate_degree_plan(
    all_courses,
    completed_courses,
    credits_per_semester,
    selected_next=None,
    start_semester=None,
    start_year=None,
    include_summer=False,
    chosen_electives=None,
    in_progress_courses=None,
):
    """
    Generate a semester-by-semester degree plan and planning warnings.
    Semester 1 honors selected_next exactly (plus required co-reqs).
    Later semesters use a constrained scheduler optimized for correctness and
    chosen-elective consistency, not simply fullest credit-hour packing.
    """

    # --- Semester label generator ---
    def _make_label_generator(start_sem, start_yr, with_summer):
        order = ['Fall', 'Spring', 'Summer'] if with_summer else ['Fall', 'Spring']
        try:
            idx = order.index(start_sem)
        except ValueError:
            idx = 0

        state = {'idx': idx, 'year': start_yr}

        def next_label_stateful():
            sem = order[state['idx']]
            label = f"{sem} {state['year']}"
            next_idx = (state['idx'] + 1) % len(order)
            if sem == 'Fall':
                state['year'] += 1
            state['idx'] = next_idx
            return label

        return next_label_stateful

    _effective_start_sem = start_semester or 'Fall'
    _effective_start_year = start_year or 2026
    get_next_label = _make_label_generator(_effective_start_sem, _effective_start_year, include_summer)

    course_map = {normalize_code(c['course_id']): c for c in all_courses}
    global_map = _build_global_course_map()
    merged_map = {**global_map, **course_map}

    normalized_completed = set(normalize_code(c) for c in completed_courses)
    normalized_in_progress = set(normalize_code(c) for c in (in_progress_courses or []))
    # Combine completed + in-progress for prereq checking
    all_done = normalized_completed | normalized_in_progress
    all_done = expand_completed_with_prereqs(all_done, merged_map)
    normalized_completed = expand_completed_with_prereqs(normalized_completed, merged_map)

    # Apply ENGR 1101 / UNIV either-or rule
    completed_univ = any(c.startswith('UNIV') for c in all_done)
    completed_engr1101 = 'ENGR 1101' in all_done

    # Build remaining courses set (not yet completed and not in-progress)
    remaining = {}
    for course in all_courses:
        code = normalize_code(course['course_id'])
        if code not in all_done:
            remaining[code] = course

    # Apply either-or: remove the alternative if one is completed
    if completed_univ:
        remaining.pop('ENGR 1101', None)
    if completed_engr1101:
        for code in list(remaining):
            if code.startswith('UNIV'):
                remaining.pop(code, None)

    # Add prerequisite courses not in the degree plan but needed to unlock degree courses.
    # Without this, courses with external prereqs (e.g. CHEM 1441 for EE) get stuck
    # in a "Remaining" deadlock because the prereq is never scheduled.
    # Track already-processed codes to prevent infinite loops on cyclic prereqs.
    def _inject_external_prereq(prereq_entry, seen_prereqs):
        """Add an external prereq to remaining if it's not already there.
        For OR-groups, skip if any alternative is already satisfied."""
        injected = False
        if ' or ' in prereq_entry:
            alternatives = [a.strip() for a in prereq_entry.split(' or ')]
            # If any alt is completed or in remaining, no need to inject
            if any(a in normalized_completed or a in remaining for a in alternatives):
                return False
            # Pick the first alternative available in the course map
            for alt in alternatives:
                if alt not in seen_prereqs:
                    seen_prereqs.add(alt)
                    alt_course = merged_map.get(alt)
                    if alt_course:
                        remaining[alt] = {
                            **alt_course,
                            'requirement_type': 'required',
                            'elective_group': None,
                            'elective_hours': None,
                        }
                        injected = True
                        break  # only need one alternative
        else:
            if prereq_entry not in seen_prereqs:
                seen_prereqs.add(prereq_entry)
                prereq_course = merged_map.get(prereq_entry)
                if prereq_course:
                    remaining[prereq_entry] = {
                        **prereq_course,
                        'requirement_type': 'required',
                        'elective_group': None,
                        'elective_hours': None,
                    }
                    injected = True
        return injected

    seen_prereqs = set(remaining.keys()) | normalized_completed
    added = True
    while added:
        added = False
        for code in list(remaining):
            course = remaining[code]
            for prereq in parse_prereq_string(course.get('pre_requisites', '') or ''):
                if _inject_external_prereq(prereq, seen_prereqs):
                    added = True
            for coreq in parse_prereq_string(course.get('co_requisites', '') or ''):
                if _inject_external_prereq(coreq, seen_prereqs):
                    added = True

    warnings = []

    # Filter electives to only include user-chosen ones (if provided and non-empty),
    # or auto-cap to budget per group when not provided / empty
    if chosen_electives is not None and len(chosen_electives) > 0:
        chosen_normalized = set(normalize_code(c) for c in chosen_electives)
        missing_choices = sorted(code for code in chosen_normalized if code not in remaining and code not in all_done)
        if missing_choices:
            warnings.append(
                "Some selected electives could not be planned because they were not found in the remaining degree requirements: "
                + ", ".join(missing_choices)
            )
        for code in list(remaining):
            course = remaining[code]
            if course.get('requirement_type', 'required').lower() == 'elective':
                if code not in chosen_normalized:
                    remaining.pop(code)
    else:
        # Auto-cap: keep only enough electives per group to fill the budget
        elective_budgets = get_elective_budgets(all_courses)
        group_hours_remaining = dict(elective_budgets)
        # First subtract completed elective hours
        for c in all_courses:
            if c.get('requirement_type') == 'elective' and c.get('elective_group'):
                code = normalize_code(c['course_id'])
                if code in normalized_completed:
                    grp = c['elective_group']
                    if grp in group_hours_remaining:
                        group_hours_remaining[grp] = max(0, group_hours_remaining[grp] - c.get('credit_hours', 3))
        # Then keep electives up to remaining budget, remove extras
        # Sort by code for deterministic selection
        elective_codes = sorted(
            [c for c in remaining if remaining[c].get('requirement_type', 'required').lower() == 'elective']
        )
        group_hours_kept = {}
        for code in elective_codes:
            course = remaining[code]
            grp = course.get('elective_group', 'other')
            budget = group_hours_remaining.get(grp, 0)
            kept = group_hours_kept.get(grp, 0)
            hrs = course.get('credit_hours', 3)
            if kept < budget:
                group_hours_kept[grp] = kept + hrs
            else:
                remaining.pop(code)

    chosen_elective_set = set(normalize_code(c) for c in (chosen_electives or []))
    elective_budgets = get_elective_budgets(all_courses)

    # Build reverse dependency map: for each course, how many other courses need it as a prereq
    unlock_count = {}
    for code, course in remaining.items():
        prereqs = course.get('pre_requisites', '') or ''
        for p in parse_prereq_string(prereqs):
            if ' or ' in p:
                # Each alternative in an OR group gets partial credit
                for alt in p.split(' or '):
                    alt = alt.strip()
                    unlock_count[alt] = unlock_count.get(alt, 0) + 1
            else:
                unlock_count[p] = unlock_count.get(p, 0) + 1

    def get_credit_hours(course):
        hrs = course.get('credit_hours', 3)
        try:
            return int(hrs)
        except (ValueError, TypeError):
            return 3

    def get_coreqs(course):
        coreqs = course.get('co_requisites', '') or ''
        return parse_prereq_string(coreqs)

    def elective_hours_remaining(completed_like):
        remaining_hours = dict(elective_budgets)
        for c in all_courses:
            if c.get('requirement_type') != 'elective':
                continue
            code = normalize_code(c['course_id'])
            group = c.get('elective_group')
            if not group:
                continue
            if code in completed_like and group in remaining_hours:
                remaining_hours[group] = max(0, remaining_hours[group] - get_credit_hours(c))
        return remaining_hours

    def downstream_unlock_score(code, completed_like):
        score = 0
        next_completed = set(completed_like)
        next_completed.add(code)
        for other_code, other_course in remaining.items():
            if other_code == code:
                continue
            if not is_course_eligible(other_course, completed_like, merged_map) and is_course_eligible(other_course, next_completed, merged_map):
                score += 1
        return score

    def course_priority(code, completed_like, semester_hours):
        course = remaining[code]
        hrs = get_credit_hours(course)
        is_required = 1 if course.get('requirement_type', '').lower() == 'required' else 0
        group = course.get('elective_group')
        group_need = 0
        if not is_required and group:
            group_need = elective_hours_remaining(completed_like).get(group, 0)
        unlocks = max(unlock_count.get(code, 0), downstream_unlock_score(code, completed_like))
        fit_gap = abs(max(0, credits_per_semester - (semester_hours + hrs)))
        return (
            -is_required,
            -(1 if group_need > 0 else 0),
            -unlocks,
            -min(group_need, hrs),
            fit_gap,
            hrs,
            code,
        )

    planned_completed = set(all_done)
    semesters = []
    semester_num = 0
    MAX_SEMESTERS = 30  # Safety net: no degree should exceed ~30 semesters

    while remaining:
        semester_num += 1
        if semester_num > MAX_SEMESTERS:
            # Emergency break — something is wrong; dump remaining as leftover
            leftover = []
            for code in list(remaining):
                c = remaining[code]
                leftover.append({
                    'code': code,
                    'name': c.get('course_name', ''),
                    'creditHours': get_credit_hours(c),
                    'requirement': c.get('requirement_type', 'required'),
                    'electiveGroup': c.get('elective_group'),
                })
            if leftover:
                warnings.append("Planner stopped because some remaining courses could not be scheduled within 30 semesters.")
                semesters.append({
                    'semester': semester_num,
                    'label': 'Remaining (could not schedule)',
                    'courses': leftover,
                    'totalHours': sum(c['creditHours'] for c in leftover),
                })
            break

        # Find all currently eligible courses from remaining
        eligible = []
        for code, course in remaining.items():
            if is_course_eligible(course, planned_completed, merged_map):
                eligible.append(code)

        if not eligible:
            # Detect circular prerequisites: find courses whose only unmet
            # prereqs are each other (e.g. CE 3131 ↔ CE 3334).  These are
            # almost certainly co-requisites mislabeled in the data — break
            # the cycle by scheduling them together.
            cycle_courses = set()
            for code in remaining:
                prereqs = parse_prereq_string(remaining[code].get('pre_requisites', '') or '')
                unmet = []
                for p in prereqs:
                    if _is_prereq_met(p, planned_completed, merged_map):
                        continue
                    # For OR groups, check if any alternative is in remaining
                    if ' or ' in p:
                        alts = [a.strip() for a in p.split(' or ')]
                        if any(a in remaining for a in alts):
                            unmet.append(p)
                    elif p in remaining:
                        unmet.append(p)
                # All unmet prereqs are in remaining — potential cycle member
                if unmet:
                    cycle_courses.add(code)

            if cycle_courses:
                # Treat cycle members as eligible this semester
                eligible = list(cycle_courses)
            else:
                # True deadlock: remaining courses exist but none eligible
                warnings.append("Planner found remaining courses that could not be scheduled because prerequisites could not be satisfied from the chosen path.")
                leftover = []
                for code in list(remaining):
                    c = remaining[code]
                    leftover.append({
                        'code': code,
                        'name': c.get('course_name', ''),
                        'creditHours': get_credit_hours(c),
                        'requirement': c.get('requirement_type', 'required'),
                        'electiveGroup': c.get('elective_group'),
                    })
                if leftover:
                    semesters.append({
                        'semester': semester_num,
                        'label': 'Remaining (prerequisites not in degree plan)',
                        'courses': leftover,
                        'totalHours': sum(c['creditHours'] for c in leftover),
                    })
                break

        # Semester 1: use user's picks if provided
        if semester_num == 1 and selected_next:
            normalized_picks = [normalize_code(c) for c in selected_next]
            semester_courses = [c for c in normalized_picks if c in eligible]
            dropped_picks = [c for c in normalized_picks if c not in eligible]
            if dropped_picks:
                warnings.append(
                    "Some selected next-semester courses were not eligible and were excluded from the plan: "
                    + ", ".join(dropped_picks)
                )
            # Also pull in corequisites of selected courses
            extra_coreqs = []
            for code in semester_courses:
                for coreq in get_coreqs(remaining.get(code, {})):
                    if coreq in remaining and coreq not in semester_courses and coreq not in extra_coreqs:
                        extra_coreqs.append(coreq)
            semester_courses.extend(extra_coreqs)
        else:
            semester_courses = []
            semester_hours = 0

            while True:
                eligible_now = [
                    code for code in eligible
                    if code not in semester_courses and is_course_eligible(remaining[code], planned_completed | set(semester_courses), merged_map)
                ]
                eligible_now.sort(key=lambda code: course_priority(code, planned_completed | set(semester_courses), semester_hours))
                picked_this_round = False

                for code in eligible_now:
                    if code in semester_courses:
                        continue  # already added as a corequisite
                    c = remaining[code]
                    hrs = get_credit_hours(c)

                    # Check if adding this course (+ its coreqs) fits
                    coreqs = get_coreqs(c)
                    coreq_hours = 0
                    coreq_codes = []
                    coreq_blocked = False
                    temp_completed = planned_completed | set(semester_courses) | {code}
                    for coreq in coreqs:
                        if coreq in remaining and coreq not in semester_courses:
                            if not is_course_eligible(remaining[coreq], temp_completed, merged_map):
                                coreq_blocked = True
                                break
                            coreq_hours += get_credit_hours(remaining[coreq])
                            coreq_codes.append(coreq)

                    if coreq_blocked:
                        continue

                    total_add = hrs + coreq_hours
                    if semester_hours + total_add <= credits_per_semester:
                        semester_courses.append(code)
                        semester_courses.extend(coreq_codes)
                        semester_hours += total_add
                        picked_this_round = True
                        break

                if not picked_this_round:
                    break

                if semester_hours >= credits_per_semester:
                    break

            # If nothing was picked, force at least one (with its coreqs)
            if not semester_courses and eligible:
                semester_courses.append(eligible[0])
                for coreq in get_coreqs(remaining.get(eligible[0], {})):
                    if coreq in remaining and coreq not in semester_courses:
                        semester_courses.append(coreq)

        # Deduplicate while preserving order
        seen = set()
        unique_courses = []
        for code in semester_courses:
            if code not in seen and code in remaining:
                seen.add(code)
                unique_courses.append(code)
        semester_courses = unique_courses

        # Build semester output
        sem_label = get_next_label()
        course_list = []
        for code in semester_courses:
            c = remaining[code]
            course_list.append({
                'code': code,
                'name': c.get('course_name', ''),
                'creditHours': get_credit_hours(c),
                'requirement': c.get('requirement_type', 'required'),
                'electiveGroup': c.get('elective_group'),
            })

        total_hrs = sum(c['creditHours'] for c in course_list)
        semesters.append({
            'semester': semester_num,
            'label': sem_label,
            'courses': course_list,
            'totalHours': total_hrs,
        })

        # Move these courses to planned_completed and remove from remaining
        for code in semester_courses:
            planned_completed.add(code)
            remaining.pop(code, None)

    if chosen_elective_set:
        unscheduled_chosen = sorted(code for code in chosen_elective_set if code in remaining)
        if unscheduled_chosen:
            warnings.append(
                "Some chosen electives could not be scheduled with the current transcript and selections: "
                + ", ".join(unscheduled_chosen)
            )

    return semesters, warnings


def get_professor_offerings_for_course(course_code):
    # Looks in all tables for offerings of the given course code (subject_id + course_number)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, '../../data/grades.sqlite'))
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Grades DB file not found at {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cur.fetchall() if not row[0].startswith('sqlite')]
    offerings = []
    parts = course_code.split()
    if len(parts) != 2:
        return []
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
                    'course_gpa': row[10],
                    'instructors': [iname for iname in row[5:10] if iname and str(iname).strip() and str(iname).strip().lower() != 'none']
                })
        except Exception:
            continue
    conn.close()
    return offerings


def run_local_demo():
    """Run this for local testing with sample_transcript.pdf"""
    dept = 'CS'
    all_courses = get_department_courses(dept)
    print(f"Loaded {len(all_courses)} course/professor offerings for {dept} department.")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.abspath(os.path.join(script_dir, '../../data/sample_transcript.pdf'))

    if not os.path.exists(pdf_path):
        print(f"PDF transcript not found at: {pdf_path}")
        completed = []
    else:
        completed = extract_all_courses(pdf_path)

    print(f"Completed courses from transcript: {completed}")

    eligible = filter_eligible_courses_unique(all_courses, completed)
    print(f"Eligible courses (not yet taken, prereqs/coreqs satisfied): {len(eligible)}")

    for code, e in list(eligible.items()):
        print(f"{code}: {e['course_name']}")
        co_req = e.get('co_requisites', '') or ''
        coreq_list = parse_prereq_string(co_req)
        remaining_coreqs = [c for c in coreq_list if c not in completed]
        if remaining_coreqs:
            print(f"    Co-requisite(s): {', '.join(remaining_coreqs)}")

if __name__ == "__main__":
    run_local_demo()

# Export functions for API use
__all__ = [
    'get_department_courses',
    'get_core_curriculum',
    'get_degree_info',
    'get_elective_budgets',
    'filter_eligible_courses_unique',
    'get_professor_offerings_for_course',
    'generate_degree_plan',
    'parse_prereq_string',
    'extract_all_courses',
    'normalize_code'
]
