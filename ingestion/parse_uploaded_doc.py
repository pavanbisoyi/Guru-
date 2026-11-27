import sys
import os
import json
import sqlite3
import re
from datetime import datetime

# Optional document parsing libs
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import docx
except ImportError:
    docx = None

try:
    import openpyxl
except ImportError:
    openpyxl = None

DB_PATH = "/home/rgukt/Documents/project/server/guru.db"

def clean(v):
    if v is None:
        return ""
    v = str(v).replace('\r', ' ').replace('\xa0', ' ').strip()
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', v)

def parse_pdf(file_path):
    projects = []
    if not pdfplumber:
        return projects, ["pdfplumber library not available"]

    errors = []
    with pdfplumber.open(file_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    if len(table) < 2:
                        continue
                    header = [clean(c).lower() for c in table[0]]
                    for row in table[1:]:
                        if not row or all(clean(c) == '' for c in row):
                            continue
                        # If row[0] is just a number or header
                        first = clean(row[0])
                        title = clean(row[1]) if len(row) > 1 else first
                        if not title or title.lower() in ['project title', 'title']:
                            continue
                        
                        proj = {
                            "title": title,
                            "problem_statement": clean(row[2]) if len(row) > 2 else f"Problem statement from {title}",
                            "simple_explanation": clean(row[3]) if len(row) > 3 else f"Automates and solves problems regarding {title}",
                            "branch": "ECE / CSE",
                            "domain": "Embedded Systems",
                            "subdomain": "General",
                            "theme": "Engineering",
                            "difficulty": "Intermediate",
                            "technologies": clean(row[4]) if len(row) > 4 else "Microcontroller / Python",
                            "hardware_required": "Standard lab hardware",
                            "software_required": "Open source tools",
                            "skills_required": "Programming & Electronics",
                            "expected_output": "Functional project prototype",
                            "source_page": page_idx + 1
                        }
                        projects.append(proj)
            else:
                # Text extraction fallback
                text = page.extract_text()
                if text:
                    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 10]
                    for idx, line in enumerate(lines[:5]):
                        if any(k in line.lower() for k in ['project', 'problem', 'system', 'monitoring', 'design']):
                            projects.append({
                                "title": line[:100],
                                "problem_statement": lines[min(idx+1, len(lines)-1)],
                                "simple_explanation": f"Extracted from document line: {line}",
                                "branch": "ECE / CSE",
                                "domain": "General Engineering",
                                "subdomain": "Exploratory",
                                "theme": "General",
                                "difficulty": "Intermediate",
                                "technologies": "Microcontroller / Software",
                                "hardware_required": "Lab PC",
                                "software_required": "Python / IDE",
                                "skills_required": "Engineering fundamentals",
                                "expected_output": "Technical report and prototype",
                                "source_page": page_idx + 1
                            })
    return projects, errors

def parse_docx(file_path):
    projects = []
    errors = []
    if not docx:
        return projects, ["python-docx library not available"]

    doc = docx.Document(file_path)
    for table in doc.tables:
        for row in table.rows[1:]:
            cells = [clean(c.text) for c in row.cells]
            if len(cells) >= 2 and cells[0]:
                projects.append({
                    "title": cells[0],
                    "problem_statement": cells[1] if len(cells) > 1 else "",
                    "simple_explanation": cells[2] if len(cells) > 2 else "",
                    "branch": "ECE / CSE",
                    "domain": "Smart Automation",
                    "subdomain": "General",
                    "theme": "Engineering",
                    "difficulty": "Intermediate",
                    "technologies": cells[3] if len(cells) > 3 else "Python / Embedded C",
                    "hardware_required": "Standard hardware",
                    "software_required": "Standard tools",
                    "skills_required": "Engineering skills",
                    "expected_output": "Working solution",
                    "source_page": 1
                })
    return projects, errors

def parse_txt(file_path):
    projects = []
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    chunks = re.split(r'\n\s*\n', content)
    for idx, chunk in enumerate(chunks):
        lines = [c.strip() for c in chunk.split('\n') if c.strip()]
        if lines:
            projects.append({
                "title": lines[0][:120],
                "problem_statement": " ".join(lines[1:]) if len(lines) > 1 else lines[0],
                "simple_explanation": f"Imported from text document entry {idx+1}",
                "branch": "ECE / CSE",
                "domain": "General Engineering",
                "subdomain": "Exploratory",
                "theme": "General",
                "difficulty": "Intermediate",
                "technologies": "Python / C++",
                "hardware_required": "Standard PC",
                "software_required": "Text editor / compiler",
                "skills_required": "Problem solving",
                "expected_output": "Working code & documentation",
                "source_page": 1
            })
    return projects, []

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: parse_uploaded_doc.py <filepath> <original_filename>"}))
        sys.exit(1)

    file_path = sys.argv[1]
    filename = sys.argv[2]
    ext = os.path.splitext(filename)[1].lower()

    projects = []
    errors = []

    if ext == ".pdf":
        projects, errors = parse_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        projects, errors = parse_docx(file_path)
    elif ext in [".txt", ".csv"]:
        projects, errors = parse_txt(file_path)
    else:
        errors.append(f"Unsupported extension {ext}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    total_extracted = len(projects)
    duplicates_found = 0
    missing_fields_flagged = 0
    inserted = 0

    for idx, p in enumerate(projects):
        title = p["title"]
        # Check duplicate
        cur.execute("SELECT id FROM projects WHERE LOWER(title) = LOWER(?)", (title,))
        if cur.fetchone():
            duplicates_found += 1
            continue

        p_id = f"GURU-IMP-{Date_now_id(idx)}"

        if not p.get("problem_statement") or p.get("problem_statement") == "":
            missing_fields_flagged += 1

        cur.execute("""
        INSERT INTO projects (
            project_id, title, branch, domain, subdomain, theme, problem_statement,
            simple_explanation, detailed_description, why_matters, who_affected,
            difficulty, technologies, hardware_required, software_required,
            skills_required, expected_output, suitable_for, proposed_approach,
            source_document, source_reference, source_type, is_verified, verification_status
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, 'Document Import', 1, 'verified'
        )""", (
            p_id, title, p["branch"], p["domain"], p["subdomain"], p["theme"], p["problem_statement"],
            p["simple_explanation"], p["simple_explanation"], "Important real-world problem", "Industry and community",
            p["difficulty"], p["technologies"], p["hardware_required"], p["software_required"],
            p["skills_required"], p["expected_output"], "Mini Project / Major Project", p["simple_explanation"],
            filename, f"Imported file: {filename}"
        ))
        inserted += 1

    conn.commit()
    conn.close()

    report = {
        "filename": filename,
        "total_extracted": total_extracted,
        "inserted": inserted,
        "duplicates_found": duplicates_found,
        "missing_fields_flagged": missing_fields_flagged,
        "errors_count": len(errors),
        "errors": errors,
        "status": "success" if inserted > 0 or total_extracted == 0 else "partial"
    }

    print(json.dumps(report))

def Date_now_id(idx):
    import time
    return f"{int(time.time()) % 100000}-{idx+1}"

if __name__ == "__main__":
    main()
