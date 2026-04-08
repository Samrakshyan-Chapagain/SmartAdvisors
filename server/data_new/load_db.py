import sqlite3
import csv
import os
import glob

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "smart_advisors.db")

print(f"--- Connecting to: {db_path} ---")

csv_folder_path = '/home/aki/Desktop/SmartAdvisors/server/csv_files'

def get_credit_hours(course_id):
    """Extracts credit hours from the second digit of the course number."""
    try:
        # Split "COMS 1301" -> "1301" -> second digit "3"
        num_part = course_id.split(' ')[1]
        return int(num_part[1])
    except:
        return 3 # Default

def process_csv_files():
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Use glob to find all .csv files in the folder
    files = glob.glob(os.path.join(csv_folder_path, "*.csv"))
    
    if not files:
        print(f"No CSV files found in {csv_folder_path}")
        return

    print(f"Found {len(files)} files. Starting import...")

    for file_path in files:
        print(f"Processing: {os.path.basename(file_path)}...")
        
        with open(file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                course_id = row['Formal Name']
                course_name = row['Course Name']
                
                # Handle [None] or empty strings
                pre_reqs = "" if row['Prerequisites'] in ["[None]", "None", None] else row['Prerequisites']
                co_reqs = "" if row['Corequisites'] in ["[None]", "None", None] else row['Corequisites']
                
                # Metadata
                dept_prefix = course_id.split(' ')[0]
                credit_hours = get_credit_hours(course_id)
                
                cursor.execute("""
                    INSERT OR REPLACE INTO courses (
                        course_id, course_name, pre_requisites, co_requisites, credit_hours, dept_prefix
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (course_id, course_name, pre_reqs, co_reqs, credit_hours, dept_prefix))

    conn.commit()
    print("Database overhaul complete! All files processed.")
    conn.close()

if __name__ == "__main__":
    process_csv_files()