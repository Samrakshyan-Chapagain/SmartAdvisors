# import pdfplumber
# import re
# import sys
# from typing import List

# def extract_all_courses(pdf_path: str) -> List[str]:
#     """
#     Parses a UTA Unofficial Civil Engineering Undergrad transcript PDF to find all course codes,
#     handling all known formats including different semesters for transfers.
#     """
    
#     # Pattern 1: Finds regular semester courses (graded and in-progress).
#     semester_course_pattern = re.compile(r'^([A-Z]{2,4}(?:-[A-Z]{2})?)\s(\d{4}).*?\d+\.\d{3}\s+\d+\.\d{3}')
    
#     # Pattern 2: Finds ALL transfer/test credits.
#     # It now specifically looks for the semester name (Summer, Spring, Fall) and is case-insensitive.
#     transfer_test_pattern = re.compile(
#         r'Transferred to Term \d{4} (?:Summer|Spring|Fall) as\s*\n\s*([A-Z]{3,4}\s\d{4})',
#         re.IGNORECASE
#     )

#     found_courses_set = set()
    
#     try:
#         with pdfplumber.open(pdf_path) as pdf:
#             print(f"Reading {len(pdf.pages)} pages from '{pdf_path}'...")
            
#             for page in pdf.pages:
#                 text = page.extract_text(x_tolerance=2, y_tolerance=3)
                
#                 if not text:
#                     continue
                
#                 # --- Search for all Transfer and Test Credit courses ---
#                 transfer_matches = transfer_test_pattern.findall(text)
#                 for course_code in transfer_matches:
#                     found_courses_set.add(course_code)
                
#                 # --- Search for regular and in-progress courses line by line ---
#                 lines = text.split('\n')
#                 for line in lines:
#                     match = semester_course_pattern.match(line.strip())
#                     if match:
#                         course_code = f"{match.group(1)} {match.group(2)}"
#                         found_courses_set.add(course_code)
                        
#     except FileNotFoundError:
#         print(f"Error: The file '{pdf_path}' was not found.")
#         return []
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return []

#     unique_courses = sorted(list(found_courses_set))
#     return unique_courses

# # --- Main execution block ---
# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         transcript_pdf_path = sys.argv[1]
#     else:
#         transcript_pdf_path = '/home/aki/Downloads/SSR_TSRPT_UN.pdf'
    
#     extracted_courses = extract_all_courses(transcript_pdf_path)
    
#     if extracted_courses:
#         print("\n--- Found Courses ---")
#         for course in extracted_courses:
#             print(course)
#         print(f"\nTotal unique courses found: {len(extracted_courses)}")
#     else:
#         print("\nNo course codes could be extracted.")

# # if someone has a D, F, P, F, Q,W, R, I Z
# # also if you are a freshman, there might not be any grades attached to the courses
# # also if the user has no classes, there should be an option called i'm new to UTA and we just send them to select the professor and courses attributes

import pdfplumber
import re
import sys
from typing import List

# Lines that look like course codes but are really header / noise
_NOISE = re.compile(
    r'^\d{4}\s|^(Undergraduate|Graduate|Academic|University|Credit|Cumulative|Term|GPA|Subject|Course|Transfer|Semester|Page|Total)',
    re.IGNORECASE,
)

# Primary: dept + 4-digit course number with two trailing decimal numbers (graded)
_GRADED = re.compile(r'^([A-Z]{2,4}(?:-[A-Z]{2})?)\s(\d{4}).*?\d+\.\d{3}\s+\d+\.\d{3}')

# Fallback: dept + 4-digit course number with one trailing decimal number (in-progress / credit only)
_ONE_NUM = re.compile(r'^([A-Z]{2,4}(?:-[A-Z]{2})?)\s(\d{4}).*?\d+\.\d{3}')

# Broadest: dept + 4-digit number at start of line (catches anything the above missed)
_BROAD = re.compile(r'^([A-Z]{2,4}(?:-[A-Z]{2})?)\s(\d{4})\b')

# Transfer / test credits
_TRANSFER = re.compile(
    r'Transferred to Term \d{4} (?:Summer|Spring|Fall) as\s*\n\s*([A-Z]{3,4}\s\d{4})',
    re.IGNORECASE,
)


def extract_all_courses(pdf_path: str) -> List[str]:
    """
    Parse a UTA unofficial transcript PDF and return a sorted list of unique course codes.
    Uses multiple regex tiers so graded, in-progress, and transfer courses are all captured.
    """
    found: set[str] = set()

    try:
        with pdfplumber.open(pdf_path) as pdf:
            full_text_parts: list[str] = []
            for page in pdf.pages:
                text = page.extract_text(x_tolerance=2, y_tolerance=3)
                if not text:
                    continue
                full_text_parts.append(text)

                for line in text.split('\n'):
                    line = line.strip()
                    if not line or _NOISE.match(line):
                        continue
                    for pat in (_GRADED, _ONE_NUM, _BROAD):
                        m = pat.match(line)
                        if m:
                            found.add(f"{m.group(1)} {m.group(2)}")
                            break

            full_text = '\n'.join(full_text_parts)
            for code in _TRANSFER.findall(full_text):
                found.add(code)

    except Exception as e:
        print(f"Error parsing PDF: {e}", file=sys.stderr)
        return []

    result = sorted(found)
    print(f"[parse_transcript] Extracted {len(result)} courses from {pdf_path}", file=sys.stderr)
    return result