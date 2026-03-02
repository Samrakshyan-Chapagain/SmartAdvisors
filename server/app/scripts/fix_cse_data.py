"""
fix_cse_data.py — One-time script to patch broken corequisite data in ClassesForCSE.

Problem: Several CSE courses have coreqs that are actually prerequisites (or irrelevant
math courses listed in bulk). The eligibility algorithm requires ALL coreqs' own
prereqs to be met, so bad coreq data blocks entire course chains.

Run once: python server/app/scripts/fix_cse_data.py
"""

import os
import sqlite3

def normalize_code(code):
    return ' '.join(str(code).replace('\xa0', ' ').split()).strip()

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, '../../../data/classes.db'))

    if not os.path.exists(db_path):
        print(f"ERROR: classes.db not found at {db_path}")
        return

    # course_code -> (new_prereqs, new_coreqs)
    # Empty string means "no requirement" (cleared)
    patches = {
        'CSE 1310': ('', ''),
        'CSE 1311': ('', ''),
        'CSE 1320': ('CSE 1310', ''),
        'CSE 2315': ('CSE 1310', ''),
        'CSE 4316': ('CSE 3310, CSE 3320, CSE 3442, CSE 3314', ''),
        'CSE 4381': ('CSE 4344, CSE 3320', ''),
        'PHYS 1444': ('PHYS 1443, MATH 2425', ''),
    }

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Load all rows so we can match on normalized code
    cur.execute('SELECT rowid, Course_Num, Pre_Requisites, Co_Requisites FROM ClassesForCSE')
    rows = cur.fetchall()

    updated = 0
    for rowid, raw_num, old_pre, old_co in rows:
        norm = normalize_code(raw_num)
        if norm in patches:
            new_pre, new_co = patches[norm]
            cur.execute(
                'UPDATE ClassesForCSE SET Pre_Requisites=?, Co_Requisites=? WHERE rowid=?',
                (new_pre, new_co, rowid)
            )
            print(f"  PATCHED {norm}:")
            print(f"    prereqs:  '{old_pre}' -> '{new_pre}'")
            print(f"    coreqs:   '{old_co}'  -> '{new_co}'")
            updated += 1

    conn.commit()
    conn.close()
    print(f"\nDone. {updated}/{len(patches)} patches applied.")

if __name__ == '__main__':
    main()
