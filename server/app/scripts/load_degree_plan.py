"""
load_degree_plan.py — Reusable script to load a degree plan CSV into classes.db.

Creates or replaces a ClassesFor{DEPT} table in data/classes.db.

CSV format (must have these columns):
    Formal Name, Course Name, Prerequisites, Corequisites

Prerequisites/Corequisites can be:
  - [None]                  → stored as empty string
  - ['MATH 1426']           → stored as 'MATH 1426'
  - ['MATH 1426', 'CE 2311'] → stored as 'MATH 1426, CE 2311'
  - plain comma-separated codes → stored as-is

Usage:
    python server/app/scripts/load_degree_plan.py EE
    python server/app/scripts/load_degree_plan.py MAE
    python server/app/scripts/load_degree_plan.py IE

Or call load_csv_to_db() directly from another script.
"""

import os
import sys
import csv
import re
import sqlite3


DEPT_TO_CSV = {
    'EE':  'EE Degree Plan CSV.csv',
    'MAE': 'MAE Degree Plan CSV.csv',
    'IE':  'IE Degree Plan CSV.csv',
}


def normalize_code(code):
    """Remove non-breaking spaces and extra whitespace."""
    return ' '.join(str(code).replace('\xa0', ' ').split()).strip()


def parse_req_field(raw):
    """
    Convert a prerequisites/corequisites cell to a plain comma-separated string.

    Handles:
      [None]                     -> ''
      ['MATH 1426']              -> 'MATH 1426'
      ['MATH 1426', 'CE 2311']   -> 'MATH 1426, CE 2311'
      MATH 1426, CE 2311         -> 'MATH 1426, CE 2311'  (pass-through)
    """
    if not raw:
        return ''
    stripped = raw.strip()
    if stripped.lower() in ('none', '[none]', "['none']"):
        return ''
    # Strip outer brackets if it looks like a Python list literal
    if stripped.startswith('[') and stripped.endswith(']'):
        inner = stripped[1:-1]
        # Remove individual quotes, split by comma
        codes = [c.strip().strip("'\"") for c in inner.split(',') if c.strip()]
        # Filter out 'None' entries
        codes = [c for c in codes if c.lower() != 'none' and c]
        return ', '.join(normalize_code(c) for c in codes)
    # Already plain format
    codes = [c.strip() for c in stripped.split(',') if c.strip()]
    return ', '.join(normalize_code(c) for c in codes)


def load_csv_to_db(dept_code, csv_path, db_path):
    """Load a degree plan CSV into a ClassesFor{dept_code} table."""
    if not os.path.exists(csv_path):
        print(f"ERROR: CSV not found at {csv_path}")
        return False
    if not os.path.exists(db_path):
        print(f"ERROR: classes.db not found at {db_path}")
        return False

    table_name = f'ClassesFor{dept_code}'

    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            course_num  = normalize_code(row.get('Formal Name', ''))
            course_name = row.get('Course Name', '').strip()
            prereqs     = parse_req_field(row.get('Prerequisites', ''))
            coreqs      = parse_req_field(row.get('Corequisites', ''))
            if not course_num:
                continue
            rows.append((course_num, course_name, prereqs, coreqs, ''))

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Drop and recreate the table
    cur.execute(f'DROP TABLE IF EXISTS [{table_name}]')
    cur.execute(f'''
        CREATE TABLE [{table_name}] (
            Course_Num    TEXT,
            Course_Name   TEXT,
            Pre_Requisites TEXT,
            Co_Requisites  TEXT,
            Description    TEXT
        )
    ''')
    cur.executemany(f'INSERT INTO [{table_name}] VALUES (?, ?, ?, ?, ?)', rows)
    conn.commit()
    conn.close()

    print(f"Loaded {len(rows)} courses into {table_name} from {os.path.basename(csv_path)}")
    return True


def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <DEPT_CODE>")
        print(f"Available: {', '.join(DEPT_TO_CSV.keys())}")
        sys.exit(1)

    dept = sys.argv[1].upper()
    if dept not in DEPT_TO_CSV:
        print(f"ERROR: Unknown dept '{dept}'. Available: {', '.join(DEPT_TO_CSV.keys())}")
        sys.exit(1)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir   = os.path.abspath(os.path.join(script_dir, '../../../data'))
    db_path    = os.path.join(data_dir, 'classes.db')
    csv_path   = os.path.join(data_dir, DEPT_TO_CSV[dept])

    load_csv_to_db(dept, csv_path, db_path)


if __name__ == '__main__':
    main()
