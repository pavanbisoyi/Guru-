import pdfplumber
import os, sys, re, json

SOURCE_DIR = "/home/rgukt/Documents/project/source_documents"

def clean(v):
    if v is None:
        return ""
    v = str(v).replace('\r', ' ').replace('\xa0', ' ').strip()
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', v)

def find_idx(header, possible_names):
    for name in possible_names:
        for idx, h in enumerate(header):
            if name in h.lower():
                return idx
    return None

def test_all():
    # 1. Cybersecurity
    cyber_file = os.path.join(SOURCE_DIR, "cybersecurity_projects_PROJECT_TITLES_CLEAR_1_25.pdf")
    with pdfplumber.open(cyber_file) as p:
        t = p.pages[0].extract_tables()[0]
        h = [clean(x).lower() for x in t[0]]
        print(f"Cybersecurity rows: {len(t)-1}, Header: {h}")
        print("Sample row 1:", [clean(c)[:25] for c in t[1]])

    # 2. Data Science
    ds_file = os.path.join(SOURCE_DIR, "Data_Science_Business_Sales_Marketing_50_Projects_Table (1).pdf")
    with pdfplumber.open(ds_file) as p:
        tot = sum(len(page.extract_tables()[0])-1 for page in p.pages if page.extract_tables())
        print(f"Data science total rows across pages: {tot}")

    # 3. Embedded Systems
    emb_file = os.path.join(SOURCE_DIR, "Embedded_Systems_200_Problems.pdf")
    with pdfplumber.open(emb_file) as p:
        tot = sum(len(page.extract_tables()[0])-1 for page in p.pages if page.extract_tables())
        print(f"Embedded total rows across 8 pages: {tot}")

    # 4. IoT
    iot_file = os.path.join(SOURCE_DIR, "IoT_Problem_Bank_50_Problems.pdf")
    with pdfplumber.open(iot_file) as p:
        tot = sum(len(page.extract_tables()[0])-1 for page in p.pages if page.extract_tables())
        print(f"IoT total rows across 2 pages: {tot}")

    # 5. Robotics
    rob_file = os.path.join(SOURCE_DIR, "Robotics_Subdomains_Project_Table.pdf")
    with pdfplumber.open(rob_file) as p:
        tot = sum(len(page.extract_tables()[0])-1 for page in p.pages if page.extract_tables())
        print(f"Robotics total rows across 2 pages: {tot}")

    # 6. Smart Automation
    auto_file = os.path.join(SOURCE_DIR, "Smart_Automation_CSE_ECE_36_Projects_Single_Table.pdf")
    with pdfplumber.open(auto_file) as p:
        tot = len(p.pages[0].extract_tables()[0])-1
        print(f"Smart Automation total rows: {tot}")

    # 7. Wireless Comm
    comm_file = os.path.join(SOURCE_DIR, "Wireless_Communication_Networks_25_Problem_Statements.pdf")
    with pdfplumber.open(comm_file) as p:
        tot = len(p.pages[0].extract_tables()[0])-1
        print(f"Wireless Comm total rows: {tot}")

test_all()
