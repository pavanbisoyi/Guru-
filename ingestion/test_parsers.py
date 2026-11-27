import pdfplumber
import os
import re
import json

SOURCE_DIR = "/home/rgukt/Documents/project/source_documents"

def clean_text(val):
    if val is None:
        return ""
    # Replace non-breaking spaces and line wraps
    t = str(val).replace('\r', ' ').replace('\xa0', ' ').strip()
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', t)

def normalize_branch(branch, domain=""):
    b = clean_text(branch).upper()
    if not b or b == "ANY":
        if "CYBER" in domain.upper() or "DATA" in domain.upper():
            return "CSE"
        elif "VLSI" in domain.upper() or "WIRELESS" in domain.upper() or "COMMUNICATION" in domain.upper():
            return "ECE"
        return "ECE / CSE"
    # Normalize common representations
    if "COMPUTER" in b or "CSE" in b:
        if "ECE" in b or "ELECTRONIC" in b:
            return "ECE / CSE"
        return "CSE"
    if "ELECTRONIC" in b or "ECE" in b:
        return "ECE"
    if "ELECTRICAL" in b or "EEE" in b:
        return "Electrical"
    if "INSTRUMENTATION" in b:
        return "Instrumentation"
    if "MECHANICAL" in b:
        return "Mechanical"
    if "CIVIL" in b:
        return "Civil"
    return b

def parse_tabular_pdf(pdf_path, col_mapping):
    projects = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                header = [clean_text(h).lower() for h in table[0]]
                for row_idx, row in enumerate(table[1:]):
                    if not row or all(clean_text(c) == '' for c in row):
                        continue
                    # Check if this row is a repeated header
                    first_cell = clean_text(row[0]).lower()
                    if first_cell in ['#', 'no.', 'project title', 'title']:
                        continue
                    
                    record = {
                        "source_document": os.path.basename(pdf_path),
                        "source_page": page_idx + 1
                    }
                    for field, matcher in col_mapping.items():
                        val = ""
                        if isinstance(matcher, int) and matcher < len(row):
                            val = clean_text(row[matcher])
                        elif callable(matcher):
                            val = matcher(header, row)
                        record[field] = val
                    
                    if record.get("title"):
                        projects.append(record)
    return projects

def parse_vlsi_pdf(pdf_path):
    projects = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 3:
                    continue
                # 2-column key-value table
                kv = {}
                for row in table:
                    if len(row) >= 2:
                        k = clean_text(row[0]).lower()
                        v = clean_text(row[1])
                        kv[k] = v
                
                title = kv.get("project title", "")
                if title:
                    record = {
                        "source_document": os.path.basename(pdf_path),
                        "source_page": page_idx + 1,
                        "title": title,
                        "problem_statement": kv.get("problem statement", ""),
                        "simple_explanation": kv.get("explanation about problem", "") or kv.get("explanation", ""),
                        "branch": normalize_branch(kv.get("branch", "ECE"), "VLSI"),
                        "domain": "VLSI",
                        "subdomain": kv.get("sub-domain", "") or kv.get("subdomain", "Digital VLSI Design"),
                        "difficulty": kv.get("difficulty", "Intermediate"),
                        "technologies": kv.get("technologies", ""),
                        "hardware_required": kv.get("hardware required", ""),
                        "software_required": kv.get("software required", ""),
                        "skills_required": kv.get("skills required", ""),
                        "expected_output": kv.get("expected output", ""),
                        "source_reference": kv.get("source / reference", "") or kv.get("source", "VLSI / ULSI Project Bank"),
                        "category": "Mini Project / Hardware Project"
                    }
                    projects.append(record)
    return projects

print("Testing parser functions...")
