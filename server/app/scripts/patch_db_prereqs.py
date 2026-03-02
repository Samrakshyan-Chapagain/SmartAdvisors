"""
patch_db_prereqs.py — Patches data/classes.db to fix two issues:

1. MATH prerequisite chain: MATH 1302 → MATH 1402 → MATH 1426
   Without this chain, lower-level math courses appear as eligible even when
   a student has already completed higher-level math (e.g., Calc II).

2. Remove research/special-topics/problems courses that have no real prerequisites
   and should never be shown as generic recommendations (they require faculty
   permission or departmental approval, not course prerequisites).

Run once: python server/app/scripts/patch_db_prereqs.py
"""

import os
import sqlite3


def normalize_code(code):
    return ' '.join(str(code).replace('\xa0', ' ').split()).strip()


# Courses to remove from each table (research, co-op, special topics, problems)
# These courses require faculty permission, not course prerequisites, so they
# should not appear in algorithmic recommendations.
COURSES_TO_REMOVE = {
    'ClassesForCSE': [
        'CSE 1000',   # Freshman Undergraduate Research
        'CSE 2000',   # Sophomore Undergraduate Research
        'CSE 3000',   # Junior Undergraduate Research
        'CSE 4000',   # Senior Undergraduate Research
        'CSE 4191',   # Individual Projects (co-op/permission)
        'CSE 1392',   # Special Topics
        'CSE 2392',   # Special Topics
        'CSE 3392',   # Special Topics
        'CSE 4391',   # Individual Projects
        'CSE 4392',   # Special Topics
    ],
    'ClassesForCE': [
        'CE 1000',    # Freshman Undergraduate Research
        'CE 2000',    # Sophomore Undergraduate Research
        'CE 3000',    # Junior Undergraduate Research
        'CE 4000',    # Senior Undergraduate Research
        'CE 2191',    # Problems in Civil Engineering
        'CE 2291',    # Problems in Civil Engineering
        'CE 2391',    # Problems in Civil Engineering
        'CE 4191',    # Problems in Civil Engineering
        'CE 4291',    # Problems in Civil Engineering
        'CE 4391',    # Problems in Civil Engineering
        'CE 4300',    # Advanced Topics (no prereq)
        'CE 4301',    # Advanced Topics with Lab (no prereq)
    ],
}

# Prerequisite patches: (table, course_code) -> (new_prereqs, new_coreqs)
# '' means clear the field; None means leave it unchanged.
PREREQ_PATCHES = {
    # ── MATH CHAIN (add to all 5 tables) ────────────────────────────────────
    # MATH 1302 (College Algebra) has no prereq — that's correct, it's entry level.
    # MATH 1402 (Pre-Calculus) requires College Algebra.
    # MATH 1426 (Calculus I) requires Pre-Calculus.
    ('ClassesForCE',  'MATH 1426'): ('MATH 1302', None),   # CE has no MATH 1402 row
    ('ClassesForCSE', 'MATH 1402'): ('MATH 1302', None),
    ('ClassesForCSE', 'MATH 1426'): ('MATH 1402', None),
    ('ClassesForEE',  'MATH 1402'): ('MATH 1302', None),
    ('ClassesForEE',  'MATH 1426'): ('MATH 1402', None),
    ('ClassesForMAE', 'MATH 1402'): ('MATH 1302', None),
    ('ClassesForMAE', 'MATH 1426'): ('MATH 1402', None),
    ('ClassesForIE',  'MATH 1402'): ('MATH 1302', None),
    ('ClassesForIE',  'MATH 1426'): ('MATH 1402', None),

    # ── CSE 4378 (Unmanned Vehicle Systems) — real course, needs senior CSE prereq ──
    ('ClassesForCSE', 'CSE 4378'): ('CSE 3310', None),
    # CSE 4379 already requires CSE 4378, so that chain is fine.
}


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, '../../../data/classes.db'))

    if not os.path.exists(db_path):
        print(f'ERROR: classes.db not found at {db_path}')
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # ── 1. Remove inappropriate courses ─────────────────────────────────────
    print('=== Removing research/special-topics courses ===')
    total_removed = 0
    for table, codes in COURSES_TO_REMOVE.items():
        for raw_code in codes:
            # Match on normalized code (handles \xa0 non-breaking spaces in DB)
            cur.execute(f'SELECT rowid, Course_Num FROM [{table}]')
            rows = cur.fetchall()
            for rowid, db_code in rows:
                if normalize_code(db_code) == raw_code:
                    cur.execute(f'DELETE FROM [{table}] WHERE rowid=?', (rowid,))
                    print(f'  Removed {table}/{raw_code}')
                    total_removed += 1
                    break
            else:
                # Not found — not an error, may already be absent
                pass
    print(f'  → {total_removed} courses removed\n')

    # ── 2. Patch prerequisite chains ─────────────────────────────────────────
    print('=== Patching prerequisite chains ===')
    total_patched = 0
    for (table, raw_code), (new_pre, new_co) in PREREQ_PATCHES.items():
        cur.execute(f'SELECT rowid, Course_Num, Pre_Requisites, Co_Requisites FROM [{table}]')
        rows = cur.fetchall()
        for rowid, db_code, old_pre, old_co in rows:
            if normalize_code(db_code) == raw_code:
                updated_pre = new_pre if new_pre is not None else old_pre
                updated_co  = new_co  if new_co  is not None else old_co
                cur.execute(
                    f'UPDATE [{table}] SET Pre_Requisites=?, Co_Requisites=? WHERE rowid=?',
                    (updated_pre, updated_co, rowid)
                )
                print(f'  {table}/{raw_code}: prereq "{old_pre}" → "{updated_pre}"')
                total_patched += 1
                break
        else:
            print(f'  SKIP {table}/{raw_code}: not found in table')
    print(f'  → {total_patched} patches applied\n')

    conn.commit()
    conn.close()
    print('Done.')


if __name__ == '__main__':
    main()
