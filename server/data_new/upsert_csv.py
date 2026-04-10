#!/usr/bin/env python3
import csv
import os
import argparse
from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).resolve().parent / 'smart_advisors.db'

def get_credit_hours(course_id):
    """Extracts credit hours from the second digit of the course number (e.g., CSE 1310 -> 3)."""
    try:
        # Using .split() without arguments handles all whitespace (tabs, non-breaking spaces)
        parts = course_id.split()
        if len(parts) > 1:
            num_part = parts[1]
            return int(num_part[1])
    except (IndexError, ValueError):
        return 3 # Default to 3 if parsing fails
    return 3

def sync_csv_to_db(csv_filepath):
    if not os.path.exists(csv_filepath):
        print(f"Error: File not found at {csv_filepath}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    with open(csv_filepath, 'r', encoding='utf-8') as f:
        # We strip spaces from headers to prevent "Prerequisites " vs "Prerequisites" errors
        reader = csv.DictReader(f)
        reader.fieldnames = [name.strip() for name in reader.fieldnames]
        
        print(f"Detected CSV Headers: {reader.fieldnames}")

        count = 0
        for row in reader:
            course_id = row.get('Formal Name', '').strip()
            if not course_id:
                continue

            # Check for different possible header names just in case
            prereqs = row.get('Prerequisites') or row.get('Prerequisite') or "[]"
            coreqs = row.get('Corequisites') or row.get('Corequisite') or "[]"
            
            prefix = course_id.split()[0] if ' ' in course_id else ""
            
            course_data = (
                course_id,
                row.get('Course Name', ''),
                prereqs,
                coreqs,
                "", # description
                get_credit_hours(course_id),
                prefix
            )

            cursor.execute('''
                INSERT INTO courses (course_id, course_name, pre_requisites, co_requisites, description, credit_hours, dept_prefix)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(course_id) DO UPDATE SET
                    course_name=excluded.course_name,
                    pre_requisites=excluded.pre_requisites,
                    co_requisites=excluded.co_requisites,
                    credit_hours=excluded.credit_hours,
                    dept_prefix=excluded.dept_prefix
            ''', course_data)
            count += 1

    conn.commit()
    print(f"Successfully synced {count} courses to {DB_PATH}")
    conn.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('csv_path')
    args = parser.parse_args()
    sync_csv_to_db(os.path.abspath(os.path.expanduser(args.csv_path)))