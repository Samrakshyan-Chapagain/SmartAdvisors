#!/usr/bin/env python3
import sys
import os
import re
import csv
import urllib.request
import html
import argparse

# --- CHANGE THIS TO YOUR PREFERRED DEFAULT DIRECTORY ---
import os

# This finds the directory where the script is currently running
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SAVE_DIR = os.path.join(SCRIPT_DIR, "..", "..", "csv_files")


def fetch_page(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) SmartAdvisors/1.0'
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode('utf-8', errors='replace')

def _parse_req_text(text):
    """
    Extracts requirements into a list. 
    Groups 'or' conditions together: ['CSE 3318', 'IE 3301 or MATH 3313']
    """
    if not text:
        return []

    results = []
    course_code = r'[A-Z]{2,4}\s+\d{4}'
    
    # 1. First, find everything inside parentheses: (IE 3301 or MATH 3313)
    paren_groups = re.findall(r'\(([^)]+)\)', text)
    for group in paren_groups:
        if ' or ' in group.lower():
            # Clean up the internal codes
            codes = re.findall(course_code, group)
            results.append(" or ".join(codes))
            # Remove from text so we don't double-count
            text = text.replace(f"({group})", "")

    # 2. Next, find 'or' groups not in parentheses: IE 3301 or MATH 3313
    or_pattern = re.compile(rf'({course_code}(?:\s+or\s+{course_code})+)', re.IGNORECASE)
    standalone_ors = or_pattern.findall(text)
    for group in standalone_ors:
        results.append(re.sub(r'\s+or\s+', ' or ', group, flags=re.IGNORECASE))
        text = text.replace(group, "")

    # 3. Finally, grab any remaining single course codes
    remaining_codes = re.findall(course_code, text)
    for code in remaining_codes:
        results.append(code.strip())

    return results

def parse_prerequisites(desc_text):
    # Regex looks for Prerequisite(s): and stops at Corequisite or end of string
    match = re.search(r'Prerequisite(?:s)?\s*:\s*(.*)', desc_text, re.IGNORECASE | re.DOTALL)
    if match:
        content = re.split(r'Corequisite', match.group(1), flags=re.IGNORECASE)[0]
        # Clean up common UTA filler phrases that break parsers
        content = re.sub(r'Admitted into.*?\.', '', content, flags=re.IGNORECASE)
        content = re.sub(r'C or better in.*?(?:following:)?', '', content, flags=re.IGNORECASE)
        return _parse_req_text(content)
    return []

def parse_corequisites(desc_text):
    match = re.search(r'Corequisite(?:s)?\s*:\s*(.*)', desc_text, re.IGNORECASE | re.DOTALL)
    if match:
        return _parse_req_text(match.group(1))
    return []

def _clean(raw_html):
    text = html.unescape(re.sub(r'<[^>]+>', ' ', raw_html)).strip()
    text = text.replace('\xa0', ' ').replace('&nbsp;', ' ')
    return re.sub(r'  +', ' ', text)

def scrape_catalog(dept_code):
    dept_lower = dept_code.lower()
    url = f'https://catalog.uta.edu/coursedescriptions/{dept_lower}/'
    print(f"Fetching: {url}")

    try:
        page_html = fetch_page(url)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    courses = []
    # Primary UTA Catalog pattern
    course_blocks = re.findall(
        r'class="courseblocktitle[^"]*"[^>]*>(.*?)</p>.*?class="courseblockdesc[^"]*"[^>]*>(.*?)</p>',
        page_html, re.DOTALL
    )

    for title_html, desc_html in course_blocks:
        title_text = _clean(title_html)
        desc_text  = _clean(desc_html)

        # Pattern: CODE. NAME. HOURS.
        title_match = re.match(r'([A-Z]{2,4}\s+\d{4})\.\s+(.*?)\.\s+\d+\s+Hour', title_text)
        if title_match:
            courses.append({
                'code': title_match.group(1).strip(),
                'name': title_match.group(2).strip(),
                'prereqs': parse_prerequisites(desc_text),
                'coreqs': parse_corequisites(desc_text)
            })
    return courses

def write_csv(courses, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Formal Name', 'Course Name', 'Prerequisites', 'Corequisites', 'Requirement'])
        for c in courses:
            # This stores the list exactly as requested: ['Code', 'Code or Code']
            # If you want it without brackets in the CSV, use: ", ".join(c['prereqs'])
            prereq_val = str(c['prereqs']) if c['prereqs'] else "[None]"
            coreq_val = str(c['coreqs']) if c['coreqs'] else "[None]"
            
            writer.writerow([c['code'], c['name'], prereq_val, coreq_val, 'required'])
    print(f"File created: {output_path}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('dept', help='Dept code (e.g., CSE)')
    parser.add_argument('--output', '-o', help='Custom path')
    args = parser.parse_args()

    dept_code = args.dept.upper()
    output_path = args.output if args.output else os.path.join(DEFAULT_SAVE_DIR, f"{dept_code} Fixed Degree plan.csv")
    
    all_courses = scrape_catalog(dept_code)
    dept_only = [c for c in all_courses if c['code'].startswith(dept_code)]
    
    write_csv(dept_only, output_path)

if __name__ == '__main__':
    main()