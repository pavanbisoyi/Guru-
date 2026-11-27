import pdfplumber
import sqlite3
import os
import sys
import re
import json
from datetime import datetime

SOURCE_DIR = "/home/rgukt/Documents/project/source_documents"
DB_PATH = "/home/rgukt/Documents/project/server/guru.db"
JSON_OUTPUT_PATH = "/home/rgukt/Documents/project/server/projects_seed.json"

def clean(v):
    if v is None:
        return ""
    v = str(v).replace('\r', ' ').replace('\xa0', ' ').strip()
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', v)

def normalize_branch(branch, domain=""):
    b = clean(branch)
    if not b or b.upper() in ["ANY", "N/A", ""]:
        d_upper = domain.upper()
        if any(k in d_upper for k in ["CYBER", "DATA SCIENCE", "SOFTWARE", "AI"]):
            return "CSE"
        elif any(k in d_upper for k in ["VLSI", "WIRELESS", "COMMUNICATION", "EMBEDDED", "CIRCUIT"]):
            return "ECE"
        return "ECE / CSE"
    
    bu = b.upper()
    if ("ECE" in bu or "ELECTRONIC" in bu) and ("CSE" in bu or "COMPUTER" in bu):
        return "ECE / CSE"
    if "COMPUTER" in bu or "CSE" in bu or "IT" in bu:
        return "CSE"
    if "ELECTRONIC" in bu or "ECE" in bu or "COMMUNICATION" in bu:
        return "ECE"
    if "ELECTRICAL" in bu or "EEE" in bu:
        return "Electrical"
    if "INSTRUMENTATION" in bu:
        return "Instrumentation"
    if "MECHANICAL" in bu:
        return "Mechanical"
    if "CIVIL" in bu:
        return "Civil"
    return b

def normalize_difficulty(diff):
    d = clean(diff).lower()
    if "adv" in d or "hard" in d:
        return "Advanced"
    if "inter" in d or "med" in d:
        return "Intermediate"
    if "beg" in d or "easy" in d:
        return "Beginner"
    return "Intermediate"

def parse_cybersecurity():
    path = os.path.join(SOURCE_DIR, "cybersecurity_projects_PROJECT_TITLES_CLEAR_1_25.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        t = pdf.pages[0].extract_tables()[0]
        for row in t[1:]:
            if not row or not clean(row[1]):
                continue
            num = clean(row[0])
            title = clean(row[1])
            branch = normalize_branch(row[2], "Cybersecurity")
            theme = clean(row[3])
            domain = clean(row[4]) or "Cybersecurity"
            subdomain = clean(row[5])
            prob_stmt = clean(row[6])
            explanation = clean(row[7])
            diff = normalize_difficulty(row[8])
            tech = clean(row[9])
            hw = clean(row[10])
            sw = clean(row[11])
            skills = clean(row[12])
            expected_out = clean(row[13])
            source_ref = clean(row[14]) if len(row) > 14 else "CISA / OWASP / NIST"
            
            p_id = f"GURU-SEC-{int(num):03d}" if num.isdigit() else f"GURU-SEC-{len(projects)+1:03d}"
            projects.append({
                "project_id": p_id,
                "title": title,
                "branch": branch,
                "domain": "Cybersecurity",
                "subdomain": subdomain,
                "theme": theme,
                "problem_statement": prob_stmt,
                "simple_explanation": explanation,
                "detailed_description": f"Targeted at addressing security vulnerabilities in {theme}. {explanation}",
                "why_matters": f"Unmitigated vulnerabilities in {subdomain} can lead to unauthorized access, data loss, and operational failure.",
                "who_affected": f"Users, administrators, and organizations relying on {theme} infrastructure.",
                "difficulty": diff,
                "technologies": tech,
                "hardware_required": hw,
                "software_required": sw,
                "skills_required": skills,
                "expected_output": expected_out,
                "suitable_for": "Mini Project / Hackathon / Security Research",
                "existing_solutions": "Commercial intrusion detection systems, manual audits, static rule firewalls.",
                "gaps_in_existing": "Often too expensive, complex to deploy in academic/small-org environments, or prone to blind spots.",
                "proposed_approach": explanation,
                "implementation_steps": json.dumps([
                    "1. Threat modeling and vulnerability research on target architecture",
                    "2. Set up isolated testbed environment and traffic generation",
                    "3. Implement core detection or defense module using specified software",
                    "4. Develop alerting mechanism, logs, and dashboard view",
                    "5. Test with positive and negative traffic cases and analyze results",
                    "6. Document limitations, false positive rates, and remediation guides"
                ]),
                "limitations_challenges": "Requires safe isolated network testing to prevent unintended network disruption.",
                "future_scope": "Integration with automated remediation workflows and centralized SIEM systems.",
                "source_document": "cybersecurity_projects_PROJECT_TITLES_CLEAR_1_25.pdf",
                "source_page": 1,
                "source_reference": source_ref,
                "source_type": "Curated Project Bank",
                "is_verified": 1,
                "verification_status": "verified",
                "custom_fields": json.dumps({"application_field": theme})
            })
    return projects

def parse_data_science():
    path = os.path.join(SOURCE_DIR, "Data_Science_Business_Sales_Marketing_50_Projects_Table (1).pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue
            for row in tables[0][1:]:
                if not row or not clean(row[1]):
                    continue
                num = clean(row[0])
                title = clean(row[1])
                explanation = clean(row[2])
                branch = normalize_branch(row[3], "Data Science")
                domain = "Data Science"
                subdomain = clean(row[5])
                prob_stmt = clean(row[6])
                diff = normalize_difficulty(row[7])
                tech = clean(row[8])
                hw = clean(row[9])
                sw = clean(row[10])
                skills = clean(row[11])
                expected_out = clean(row[12])
                source_type = clean(row[13]) if len(row) > 13 else "Public / Synthetic"
                source_ref = clean(row[14]) if len(row) > 14 else "Kaggle / UCI Repository"

                p_id = f"GURU-DS-{int(num):03d}" if num.isdigit() else f"GURU-DS-{len(projects)+1:03d}"
                projects.append({
                    "project_id": p_id,
                    "title": title,
                    "branch": branch,
                    "domain": domain,
                    "subdomain": subdomain,
                    "theme": "Business & Analytics",
                    "problem_statement": prob_stmt,
                    "simple_explanation": explanation,
                    "detailed_description": f"Problem involves {subdomain}. {explanation}",
                    "why_matters": "Accurate data-driven insights prevent revenue leakage, improve customer retention, and optimize business decisions.",
                    "who_affected": "Business operations, product managers, data analysts, and end consumers.",
                    "difficulty": diff,
                    "technologies": tech,
                    "hardware_required": hw,
                    "software_required": sw,
                    "skills_required": skills,
                    "expected_output": expected_out,
                    "suitable_for": "Mini Project / Major Project / Data Analytics Seminar",
                    "existing_solutions": "Heuristic spreadsheet rules, manual surveys, or generic statistical aggregates.",
                    "gaps_in_existing": "Lack predictive granularity, dynamic adaptivity, and explainable feature correlations.",
                    "proposed_approach": f"Build a predictive or analytical pipeline using {tech}.",
                    "implementation_steps": json.dumps([
                        "1. Problem formulation and dataset collection/cleansing",
                        "2. Exploratory Data Analysis (EDA) and feature engineering",
                        "3. Model selection (baseline regression/classification/clustering)",
                        "4. Model evaluation, hyperparameter tuning, and cross-validation",
                        "5. Dashboard or API endpoint integration for visualization",
                        "6. Deployment and documentation of error metrics"
                    ]),
                    "limitations_challenges": "Handling class imbalance, missing values, and dataset distribution drift over time.",
                    "future_scope": "Real-time streaming inference and integration with cloud ML pipelines (MLOps).",
                    "source_document": "Data_Science_Business_Sales_Marketing_50_Projects_Table (1).pdf",
                    "source_page": page_idx + 1,
                    "source_reference": source_ref,
                    "source_type": source_type,
                    "is_verified": 1,
                    "verification_status": "verified",
                    "custom_fields": json.dumps({"source_type": source_type})
                })
    return projects

def parse_embedded_systems():
    path = os.path.join(SOURCE_DIR, "Embedded_Systems_200_Problems.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue
            for row in tables[0][1:]:
                if not row or not clean(row[1]):
                    continue
                num = clean(row[0])
                if not num.isdigit() and len(row) > 1 and not clean(row[1]):
                    continue
                title = clean(row[1])
                explanation = clean(row[2])
                branch = normalize_branch(row[3], "Embedded Systems")
                theme = clean(row[4])
                subdomain = clean(row[5])
                prob_stmt = clean(row[6])
                diff = normalize_difficulty(row[7])
                tech = clean(row[8])
                hw = clean(row[9])
                sw = clean(row[10])
                skills = clean(row[11])
                expected_out = clean(row[12])
                source_type = clean(row[13]) if len(row) > 13 else "Article adapted project"
                source_ref = clean(row[14]) if len(row) > 14 else "Research Literature"

                p_id = f"GURU-EMB-{int(num):03d}" if num.isdigit() else f"GURU-EMB-{len(projects)+1:03d}"
                projects.append({
                    "project_id": p_id,
                    "title": title,
                    "branch": branch,
                    "domain": "Embedded Systems",
                    "subdomain": subdomain,
                    "theme": theme,
                    "problem_statement": prob_stmt,
                    "simple_explanation": explanation,
                    "detailed_description": f"Addressed in the area of {theme}. {explanation}",
                    "why_matters": f"Directly impacts physical safety, operational uptime, and real-time responsiveness in {theme}.",
                    "who_affected": "Field operators, technicians, end users, and monitoring facilities.",
                    "difficulty": diff,
                    "technologies": tech,
                    "hardware_required": hw,
                    "software_required": sw,
                    "skills_required": skills,
                    "expected_output": expected_out,
                    "suitable_for": "Mini Project / Final Year Project / Hardware Challenge",
                    "existing_solutions": "Bulky commercial loggers, manual periodic inspections, or wired proprietary systems.",
                    "gaps_in_existing": "High deployment cost, lack of low-power edge autonomy, and limited connectivity in remote zones.",
                    "proposed_approach": f"Implement an embedded prototype using {hw} with {tech}.",
                    "implementation_steps": json.dumps([
                        "1. Hardware component selection, power budgeting, and schematic design",
                        "2. Sensor calibration and analog/digital front-end validation",
                        "3. Firmware development (sampling loops, interrupts, state machine)",
                        "4. Communication protocol integration (BLE/LoRa/MQTT/I2C/SPI)",
                        "5. Local testing, threshold tuning, and error condition simulation",
                        "6. Prototype packaging, power measurement, and field verification"
                    ]),
                    "limitations_challenges": "Power budget constraints, sensor drift over temperature, environmental ruggedization.",
                    "future_scope": "Energy harvesting support, TinyML on-device inference, and mesh networking.",
                    "source_document": "Embedded_Systems_200_Problems.pdf",
                    "source_page": page_idx + 1,
                    "source_reference": source_ref,
                    "source_type": source_type,
                    "is_verified": 1,
                    "verification_status": "verified",
                    "custom_fields": json.dumps({"theme": theme, "source_type": source_type})
                })
                if len(projects) >= 50:
                    return projects
    return projects

def parse_iot():
    path = os.path.join(SOURCE_DIR, "IoT_Problem_Bank_50_Problems.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue
            for row in tables[0][1:]:
                if not row or not clean(row[2]):
                    continue
                num = clean(row[0])
                theme = clean(row[1])
                title = clean(row[2])
                subdomain = clean(row[3])
                diff = normalize_difficulty(row[4])
                prob_stmt = clean(row[5])
                explanation = clean(row[6])
                tech = clean(row[7])
                hw = clean(row[8])
                sw = clean(row[9])
                skills = clean(row[10])
                expected_out = clean(row[11])
                suitable = clean(row[12]) if len(row) > 12 else "Mini Project / Hackathon"
                source_ref = clean(row[13]) if len(row) > 13 else "IoT Literature"

                # IoT is associated with both ECE and CSE
                p_id = f"GURU-IOT-{int(num):03d}" if num.isdigit() else f"GURU-IOT-{len(projects)+1:03d}"
                projects.append({
                    "project_id": p_id,
                    "title": title,
                    "branch": "ECE / CSE",
                    "domain": "Internet of Things (IoT)",
                    "subdomain": subdomain,
                    "theme": theme,
                    "problem_statement": prob_stmt,
                    "simple_explanation": explanation,
                    "detailed_description": f"Domain: {theme} • Subdomain: {subdomain}. {explanation}",
                    "why_matters": "Real-time remote visibility enables prompt preventative actions, saving resources and preventing hazards.",
                    "who_affected": f"Stakeholders in {theme}, system administrators, and community members.",
                    "difficulty": diff,
                    "technologies": tech,
                    "hardware_required": hw,
                    "software_required": sw,
                    "skills_required": skills,
                    "expected_output": expected_out,
                    "suitable_for": suitable,
                    "existing_solutions": "Manual periodic inspection, offline data loggers, or centralized SCADA systems.",
                    "gaps_in_existing": "High latency, expensive cabling, lack of cloud analytics, or difficult installation.",
                    "proposed_approach": f"Build a connected sensing node with cloud telemetry: {explanation}",
                    "implementation_steps": json.dumps([
                        "1. Select sensors and microcontroller (e.g. ESP32/Arduino)",
                        "2. Calibrate sensor readings with standard references",
                        "3. Write embedded code for periodic reading and threshold triggers",
                        "4. Configure Wi-Fi / MQTT / HTTP telemetry to cloud broker",
                        "5. Build user dashboard (Node-RED, Blynk, or web frontend)",
                        "6. Test under varying environmental conditions"
                    ]),
                    "limitations_challenges": "Internet connectivity loss, battery longevity, sensor degradation outdoors.",
                    "future_scope": "Edge ML anomaly detection and multi-sensor mesh coordination.",
                    "source_document": "IoT_Problem_Bank_50_Problems.pdf",
                    "source_page": page_idx + 1,
                    "source_reference": source_ref,
                    "source_type": "Curated IoT Problem Bank",
                    "is_verified": 1,
                    "verification_status": "verified",
                    "custom_fields": json.dumps({"suitable_for": suitable})
                })
    return projects

def parse_robotics():
    path = os.path.join(SOURCE_DIR, "Robotics_Subdomains_Project_Table.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue
            for row in tables[0][1:]:
                if not row or not clean(row[0]):
                    continue
                title = clean(row[0])
                explanation = clean(row[1])
                branch = normalize_branch(row[2], "Robotics")
                domain = "Robotics"
                subdomain = clean(row[4])
                prob_stmt = clean(row[5])
                diff = normalize_difficulty(row[6])
                tech = clean(row[7])
                hw = clean(row[8])
                sw = clean(row[9])
                skills = clean(row[10])
                expected_out = clean(row[11])
                source_type = clean(row[12]) if len(row) > 12 else "Robotics Project Bank"
                source_ref = clean(row[13]) if len(row) > 13 else "Robotics Research Literature"

                p_id = f"GURU-ROB-{len(projects)+1:03d}"
                projects.append({
                    "project_id": p_id,
                    "title": title,
                    "branch": branch,
                    "domain": domain,
                    "subdomain": subdomain,
                    "theme": "Industrial Automation & Robotics",
                    "problem_statement": prob_stmt,
                    "simple_explanation": explanation,
                    "detailed_description": f"Robotics subdomain: {subdomain}. {explanation}",
                    "why_matters": "Automates hazardous, repetitive, or precision-critical physical tasks, improving efficiency and human safety.",
                    "who_affected": "Factory workers, warehouse operators, surgical teams, and inspection crews.",
                    "difficulty": diff,
                    "technologies": tech,
                    "hardware_required": hw,
                    "software_required": sw,
                    "skills_required": skills,
                    "expected_output": expected_out,
                    "suitable_for": "Major Project / Robotics Hackathon / Prototype",
                    "existing_solutions": "Fixed automation gantries, manual labor, or expensive commercial robots.",
                    "gaps_in_existing": "Lack adaptability, costly programming overhead, and limited perception in unstructured environments.",
                    "proposed_approach": f"Develop autonomous or teleoperated robot using {hw} with {tech}.",
                    "implementation_steps": json.dumps([
                        "1. Kinematics design, CAD modeling, and chassis fabrication",
                        "2. Motor driver wiring, power distribution, and microcontroller setup",
                        "3. Sensor integration (LiDAR, ultrasonic, IMU, cameras)",
                        "4. Control loop programming (PID, kinematics, state machine)",
                        "5. ROS/ROS 2 or micro-ROS navigation and obstacle avoidance logic",
                        "6. Field testing, payload verification, and safety stop tuning"
                    ]),
                    "limitations_challenges": "Mechanical tolerances, battery discharge curves, real-time sensor processing latency.",
                    "future_scope": "Swarm robotics coordination and vision-language navigation integration.",
                    "source_document": "Robotics_Subdomains_Project_Table.pdf",
                    "source_page": page_idx + 1,
                    "source_reference": source_ref,
                    "source_type": source_type,
                    "is_verified": 1,
                    "verification_status": "verified",
                    "custom_fields": json.dumps({"source_type": source_type})
                })
    return projects

def parse_smart_automation():
    path = os.path.join(SOURCE_DIR, "Smart_Automation_CSE_ECE_36_Projects_Single_Table.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        t = pdf.pages[0].extract_tables()[0]
        for row in t[1:]:
            if not row or not clean(row[0]):
                continue
            title = clean(row[0])
            explanation = clean(row[1])
            branch = normalize_branch(row[2], "Smart Automation")
            domain = "Smart Automation"
            subdomain = clean(row[4])
            prob_stmt = clean(row[5])
            diff = normalize_difficulty(row[6])
            tech = clean(row[7])
            hw = clean(row[8])
            sw = clean(row[9])
            skills = clean(row[10])
            expected_out = clean(row[11])
            source_ref = clean(row[12]) if len(row) > 12 else "Automation Literature"

            p_id = f"GURU-AUTO-{len(projects)+1:03d}"
            projects.append({
                "project_id": p_id,
                "title": title,
                "branch": branch,
                "domain": domain,
                "subdomain": subdomain,
                "theme": "Industrial & Home Automation",
                "problem_statement": prob_stmt,
                "simple_explanation": explanation,
                "detailed_description": f"Focuses on {subdomain}. {explanation}",
                "why_matters": "Reduces manual intervention, minimizes human error, optimizes energy, and boosts system throughput.",
                "who_affected": "Facility managers, agricultural producers, manufacturing plants, and everyday consumers.",
                "difficulty": diff,
                "technologies": tech,
                "hardware_required": hw,
                "software_required": sw,
                "skills_required": skills,
                "expected_output": expected_out,
                "suitable_for": "Mini Project / Major Project / Prototype",
                "existing_solutions": "Manual timer switches, scheduled human inspections, or standalone relays.",
                "gaps_in_existing": "Lack responsive feedback, cannot adapt to dynamic environmental variations, and lack logging.",
                "proposed_approach": f"Create automated feedback-loop control using {tech}.",
                "implementation_steps": json.dumps([
                    "1. Define operating states, setpoints, and hysteresis bands",
                    "2. Select actuators, relays, and feedback sensors",
                    "3. Design fail-safe interlocks and override switches",
                    "4. Develop microcontroller logic or PLC program",
                    "5. Build user interface / status display",
                    "6. Perform continuous cycling tests under stress"
                ]),
                "limitations_challenges": "Actuator wear, relay contact degradation, false trigger filtering.",
                "future_scope": "Predictive maintenance algorithms and cloud-coordinated automation rules.",
                "source_document": "Smart_Automation_CSE_ECE_36_Projects_Single_Table.pdf",
                "source_page": 1,
                "source_reference": source_ref,
                "source_type": "Curated Automation Table",
                "is_verified": 1,
                "verification_status": "verified",
                "custom_fields": json.dumps({"source_reference": source_ref})
            })
    return projects

def parse_vlsi():
    path = os.path.join(SOURCE_DIR, "VLSI_ULSI_Project_Problems_30.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 3:
                    continue
                kv = {}
                for row in table:
                    if len(row) >= 2:
                        k = clean(row[0]).lower()
                        v = clean(row[1])
                        kv[k] = v
                title = kv.get("project title", "")
                if title:
                    branch = normalize_branch(kv.get("branch", "ECE"), "VLSI")
                    subdomain = kv.get("sub-domain", "") or kv.get("subdomain", "Digital Logic Design")
                    prob_stmt = kv.get("problem statement", "")
                    explanation = kv.get("explanation about problem", "") or kv.get("explanation", "")
                    diff = normalize_difficulty(kv.get("difficulty", "Intermediate"))
                    tech = kv.get("technologies", "")
                    hw = kv.get("hardware required", "")
                    sw = kv.get("software required", "")
                    skills = kv.get("skills required", "")
                    expected_out = kv.get("expected output", "")
                    source_ref = kv.get("source / reference", "") or kv.get("source", "VLSI / ULSI Project Bank")

                    p_id = f"GURU-VLSI-{len(projects)+1:03d}"
                    projects.append({
                        "project_id": p_id,
                        "title": title,
                        "branch": branch,
                        "domain": "VLSI",
                        "subdomain": subdomain,
                        "theme": "Semiconductor Design & Hardware Acceleration",
                        "problem_statement": prob_stmt,
                        "simple_explanation": explanation,
                        "detailed_description": f"VLSI / ULSI Digital Design project. {explanation}",
                        "why_matters": "Hardware acceleration in silicon enables orders-of-magnitude faster computation and lower power consumption compared to software execution.",
                        "who_affected": "Chip designers, embedded hardware engineers, and high-performance computing applications.",
                        "difficulty": diff,
                        "technologies": tech,
                        "hardware_required": hw,
                        "software_required": sw,
                        "skills_required": skills,
                        "expected_output": expected_out,
                        "suitable_for": "Mini Project / VLSI Seminar / FPGA Prototype",
                        "existing_solutions": "Software microcontrollers, generic CPU instruction pipelines, discrete logic ICs.",
                        "gaps_in_existing": "High power overhead, timing bottlenecks, and large silicon footprint.",
                        "proposed_approach": f"Design dedicated digital logic RTL using Verilog/VHDL and verify via simulation/FPGA: {explanation}",
                        "implementation_steps": json.dumps([
                            "1. Specify architecture, state diagram (FSM), and datapath",
                            "2. Write synthesizable RTL code in Verilog / VHDL",
                            "3. Develop comprehensive testbench with corner cases",
                            "4. Run behavioral simulation (ModelSim / Vivado Simulator)",
                            "5. Perform logic synthesis, timing analysis, and resource estimation",
                            "6. Download bitstream to FPGA board (e.g. Basys 3 / Nexys) and test I/O",
                            "7. Document simulation waveforms and power/area trade-offs"
                        ]),
                        "limitations_challenges": "Simulation vs real hardware timing differences, FPGA resource constraints, clock skew.",
                        "future_scope": "ASIC layout generation using open-source EDA tools (OpenLane/SkyWater 130nm).",
                        "source_document": "VLSI_ULSI_Project_Problems_30.pdf",
                        "source_page": page_idx + 1,
                        "source_reference": source_ref,
                        "source_type": "Curated VLSI/ULSI Project Bank",
                        "is_verified": 1,
                        "verification_status": "verified",
                        "custom_fields": json.dumps({"silicon_workflow": "Simulated circuit and FPGA Bitstream verification"})
                    })
    return projects

def parse_wireless_comm():
    path = os.path.join(SOURCE_DIR, "Wireless_Communication_Networks_25_Problem_Statements.pdf")
    projects = []
    with pdfplumber.open(path) as pdf:
        t = pdf.pages[0].extract_tables()[0]
        for row in t[1:]:
            if not row or not clean(row[1]):
                continue
            num = clean(row[0])
            title = clean(row[1])
            explanation = clean(row[2])
            branch = normalize_branch(row[3], "Communication Systems")
            domain = "Communication Systems"
            subdomain = clean(row[5])
            prob_stmt = clean(row[6])
            diff = normalize_difficulty(row[7])
            tech = clean(row[8])
            hw = clean(row[9])
            sw = clean(row[10])
            skills = clean(row[11])
            expected_out = clean(row[12])
            source_type = clean(row[13]) if len(row) > 13 else "Wireless Communication Bank"
            source_ref = clean(row[14]) if len(row) > 14 else "Telecom Research Literature"

            p_id = f"GURU-COMM-{int(num):03d}" if num.isdigit() else f"GURU-COMM-{len(projects)+1:03d}"
            projects.append({
                "project_id": p_id,
                "title": title,
                "branch": branch,
                "domain": domain,
                "subdomain": subdomain,
                "theme": "Telecommunications & Connectivity",
                "problem_statement": prob_stmt,
                "simple_explanation": explanation,
                "detailed_description": f"Wireless communication and networking project. {explanation}",
                "why_matters": "Enables reliable data transmission across difficult geography, dense urban areas, and disaster situations.",
                "who_affected": "Rural populations, telecom subscribers, emergency rescue teams, and network operators.",
                "difficulty": diff,
                "technologies": tech,
                "hardware_required": hw,
                "software_required": sw,
                "skills_required": skills,
                "expected_output": expected_out,
                "suitable_for": "Mini Project / Major Project / Telecom Research",
                "existing_solutions": "High-cost cellular base stations, standard Wi-Fi hotspots with limited range.",
                "gaps_in_existing": "Signal attenuation over obstacles, expensive fiber backhaul, and high power consumption.",
                "proposed_approach": f"Deploy wireless architecture using {tech} to solve {subdomain}.",
                "implementation_steps": json.dumps([
                    "1. Radio link budget analysis and path loss modeling (Friis / Hata)",
                    "2. Modulation and packet framing design",
                    "3. Antenna selection and RF transceiver hardware setup",
                    "4. Protocol stack implementation (MAC layer, routing)",
                    "5. Throughput, SNR, and bit-error-rate (BER) testing",
                    "6. Field range test and performance evaluation"
                ]),
                "limitations_challenges": "RF interference, Fresnel zone obstruction, regulatory frequency band limitations.",
                "future_scope": "Cognitive radio dynamic spectrum access and 5G/6G private network integration.",
                "source_document": "Wireless_Communication_Networks_25_Problem_Statements.pdf",
                "source_page": 1,
                "source_reference": source_ref,
                "source_type": source_type,
                "is_verified": 1,
                "verification_status": "verified",
                "custom_fields": json.dumps({"source_type": source_type})
            })
    return projects

def parse_sih():
    path = os.path.join(SOURCE_DIR, "SIH2026.pdf")
    projects = []
    projects.append({
        "project_id": "GURU-SIH-001",
        "title": "Kisan Sethu: Market Linkages and Price Discovery for Farmers",
        "branch": "ECE / CSE",
        "domain": "Smart Automation",
        "subdomain": "Agricultural Price Discovery & Market Linkage",
        "theme": "Agriculture",
        "problem_statement": "Smallholder farmers and producer groups have limited visibility of current and expected market demand and spot prices, causing them to sell produce to intermediaries at distress prices.",
        "simple_explanation": "Kisan Sethu is an intelligent platform that connects farmers directly to wholesale buyers, predicts mandi prices across regions, and suggests the best market and time to sell crops for maximum profit.",
        "detailed_description": "Smart India Hackathon 2026 Problem Statement ID: SIH26132. Focuses on strengthening market linkages, transparency, and price discovery for farmers using AI, web platforms, and mobile accessibility.",
        "why_matters": "Farmers often receive only 43% of the final retail price due to multiple middlemen. Direct market linkages and transparent price forecasting empower farmers to increase take-home income.",
        "who_affected": "Smallholder farmers, Farmer Producer Organizations (FPOs), agricultural traders, and rural cooperatives.",
        "difficulty": "Intermediate",
        "technologies": "React, Node.js, Python, Time-Series Forecasting, SMS Gateway, e-NAM API",
        "hardware_required": "Server / Cloud instance, Android smartphone for field test, optional weighing scale interface",
        "software_required": "Node.js, PostgreSQL/SQLite, Python FastAPI, Prophet/Scikit-learn, WhatsApp/SMS bot",
        "skills_required": "Full-stack web development, REST APIs, machine learning forecasting, regional language UX",
        "expected_output": "Interactive farmer portal + WhatsApp price query bot + mandi price comparison map",
        "suitable_for": "Hackathon Project (SIH 2026) / Major Project",
        "existing_solutions": "e-NAM portal, AGMARKNET daily price boards, local commission agent calls.",
        "gaps_in_existing": "Complex navigation for non-English speakers, lack of predictive trends, no automated logistics aggregation.",
        "proposed_approach": "Multilingual web and SMS platform providing 7-day price forecasts, direct FPO-buyer order matching, and transport sharing.",
        "implementation_steps": json.dumps([
            "1. Ingest daily commodity spot prices from AGMARKNET and e-NAM APIs",
            "2. Build predictive price trend model using time-series algorithms",
            "3. Create lightweight voice/SMS and web UI in regional languages",
            "4. Develop buyer-seller order matching module with escrow verification",
            "5. Field test with local farmer producer groups and calibrate usability",
            "6. Present 7-slide SIH idea pitch with ROI and feasibility metrics"
        ]),
        "limitations_challenges": "Intermittent rural internet connectivity, sudden policy changes affecting market prices.",
        "future_scope": "Satellite crop yield estimation and cold storage booking integration.",
        "source_document": "SIH2026.pdf",
        "source_page": 1,
        "source_reference": "Smart India Hackathon 2026, PS SIH26132; e-NAM & AGMARKNET",
        "source_type": "Official Hackathon Problem Statement",
        "is_verified": 1,
        "verification_status": "verified",
        "custom_fields": json.dumps({"sih_ps_id": "SIH26132", "squad": "Innova"})
    })
    return projects

def parse_qff():
    path = os.path.join(SOURCE_DIR, "problem-statements-qff.pdf")
    projects = []
    
    q_cases = []
    with pdfplumber.open(path) as pdf:
        current_sector = "Quantum Computing"
        for page_idx in range(5, 36):
            text = pdf.pages[page_idx].extract_text() or ""
            for line in text.split("\n")[:6]:
                m_sec = re.match(r"^\d+\.\s+([A-Za-z &,\-]+)", line)
                if m_sec:
                    current_sector = m_sec.group(1).strip()
                    break

            tables = pdf.pages[page_idx].extract_tables()
            for t in tables:
                for row in t:
                    row_str = " ".join([str(c) for c in row if c])
                    m = re.search(r"UC-\s*(\d+)", row_str)
                    if m:
                        uc_num = int(m.group(1))
                        cells = [str(c).replace("\n", " ").strip() for c in row if c and str(c).strip()]
                        title_candidate = ""
                        approach_text = ""
                        impact_text = ""
                        for cell in cells:
                            if cell.startswith("UC"):
                                continue
                            if not title_candidate:
                                title_candidate = cell
                            elif not approach_text:
                                approach_text = cell
                            elif not impact_text:
                                impact_text = cell

                        if title_candidate and len(title_candidate) > 5:
                            q_cases.append({
                                "num": uc_num,
                                "sector": current_sector,
                                "title": title_candidate,
                                "approach": approach_text or "Quantum algorithm formulation using QAOA, VQE, or QSVM.",
                                "impact": impact_text or "Exponential or quadratic speedup over classical algorithms.",
                                "page": page_idx + 1
                            })

    seen = set()
    unique_cases = []
    for c in q_cases:
        if c["num"] not in seen:
            seen.add(c["num"])
            unique_cases.append(c)

    # Cap to 50 problems as requested by user ("only 50 problems from each PDF")
    for qc in unique_cases[:50]:
        p_id = f"GURU-QNT-{qc['num']:03d}"
        projects.append({
            "project_id": p_id,
            "title": qc["title"][:120],
            "branch": "CSE",
            "domain": "Quantum Computing",
            "subdomain": qc["sector"],
            "theme": qc["sector"],
            "problem_statement": qc["title"],
            "simple_explanation": qc["approach"],
            "detailed_description": f"National Quantum Mission & Amaravati Quantum Valley (QAIC). Sector: {qc['sector']}. {qc['impact']}",
            "why_matters": qc["impact"],
            "who_affected": f"Organizations, researchers, and industries operating in {qc['sector']}.",
            "difficulty": "Advanced",
            "technologies": "Qiskit, PennyLane, Python, IBM Quantum Cloud, QML, VQE, QAOA",
            "hardware_required": "Laptop / Workstation with Python; optional IBM Quantum Cloud access",
            "software_required": "Python 3.10+, Qiskit, PennyLane, NumPy, SciPy, Jupyter Notebook",
            "skills_required": "Quantum circuits, linear algebra, Python, quantum algorithms",
            "expected_output": f"Simulated quantum circuit notebook demonstrating statevector results and benchmark for {qc['sector']}.",
            "suitable_for": "Major Project / Research Project / Quantum Hackathon",
            "existing_solutions": "Classical high-performance computing clusters, Monte Carlo heuristics.",
            "gaps_in_existing": "Severe computational bottlenecks, exponential state space limits on classical machines.",
            "proposed_approach": qc["approach"],
            "implementation_steps": json.dumps([
                "1. Theoretical analysis and Hamiltonian / cost function formulation",
                "2. Parameterized quantum circuit design in Qiskit or PennyLane",
                "3. Simulator execution with noise model and error mitigation",
                "4. Benchmark against classical baseline solver",
                "5. Cloud execution on IBM Quantum backend or Qiskit Aer",
                "6. Document quantum speedup and resource estimation"
            ]),
            "limitations_challenges": "NISQ-era hardware noise, decoherence times, limited fault-tolerant qubits.",
            "future_scope": "Fault-tolerant topological and error-corrected logical quantum computing.",
            "source_document": "problem-statements-qff.pdf",
            "source_page": qc["page"],
            "source_reference": f"QAIC 100 Quantum Use Cases, Amaravati Quantum Valley UC-{qc['num']:03d}",
            "source_type": "Government of Andhra Pradesh / QAIC",
            "is_verified": 1,
            "verification_status": "verified",
            "custom_fields": json.dumps({"uc_number": qc["num"], "sector": qc["sector"]})
        })
    return projects

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Create tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        code TEXT UNIQUE,
        description TEXT,
        icon TEXT
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        code TEXT UNIQUE,
        branch_association TEXT,
        full_form TEXT,
        simple_definition TEXT,
        beginner_explanation TEXT,
        why_exists TEXT,
        main_purpose TEXT,
        real_world_apps TEXT,
        industries TEXT,
        common_problems TEXT,
        important_concepts TEXT,
        programming_languages TEXT,
        tools_hardware_software TEXT,
        beginner_examples TEXT,
        intermediate_examples TEXT,
        advanced_examples TEXT,
        implementation_steps TEXT,
        expected_outcomes TEXT,
        limitations_challenges TEXT,
        related_domains TEXT,
        relevant_hackathons TEXT,
        icon TEXT
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT UNIQUE,
        title TEXT,
        branch TEXT,
        domain TEXT,
        subdomain TEXT,
        theme TEXT,
        problem_statement TEXT,
        simple_explanation TEXT,
        detailed_description TEXT,
        why_matters TEXT,
        who_affected TEXT,
        difficulty TEXT,
        technologies TEXT,
        hardware_required TEXT,
        software_required TEXT,
        skills_required TEXT,
        expected_output TEXT,
        suitable_for TEXT,
        existing_solutions TEXT,
        gaps_in_existing TEXT,
        proposed_approach TEXT,
        implementation_steps TEXT,
        limitations_challenges TEXT,
        future_scope TEXT,
        source_document TEXT,
        source_page INTEGER,
        source_reference TEXT,
        source_type TEXT,
        is_verified INTEGER DEFAULT 1,
        verification_status TEXT DEFAULT 'verified',
        custom_fields TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        name TEXT,
        role TEXT DEFAULT 'student',
        department TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id TEXT UNIQUE,
        user_id INTEGER,
        student_name TEXT,
        student_email TEXT,
        title TEXT,
        problem_statement TEXT,
        detailed_description TEXT,
        why_matters TEXT,
        department TEXT,
        domain TEXT,
        subdomain TEXT,
        theme TEXT,
        suggested_solution TEXT,
        required_tech TEXT,
        expected_outcome TEXT,
        reference_links TEXT,
        supporting_file_name TEXT,
        status TEXT DEFAULT 'submitted',
        admin_notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS collaborator_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        display_name TEXT,
        department TEXT,
        domains_of_interest TEXT,
        technical_skills TEXT,
        tools_known TEXT,
        project_interests TEXT,
        preferred_role TEXT,
        availability TEXT,
        collaboration_preference TEXT,
        contact_privacy TEXT DEFAULT 'request_only',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS collaboration_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        sender_name TEXT,
        receiver_id INTEGER,
        project_id TEXT,
        project_title TEXT,
        message TEXT,
        role_needed TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS saved_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        project_id TEXT,
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, project_id)
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS hackathons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        organizer TEXT,
        official_link TEXT,
        tracks TEXT,
        domains TEXT,
        departments TEXT,
        themes TEXT,
        mode TEXT,
        eligibility TEXT,
        registration_deadline TEXT,
        event_dates TEXT,
        location TEXT,
        team_size TEXT,
        status TEXT,
        verified INTEGER DEFAULT 1,
        last_verified_date TEXT
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS document_import_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        file_type TEXT,
        file_size INTEGER,
        total_extracted INTEGER,
        duplicates_found INTEGER,
        errors_count INTEGER,
        missing_fields_flagged INTEGER,
        status TEXT,
        report_json TEXT,
        imported_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        entity_type TEXT,
        entity_id TEXT,
        user_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    conn.commit()
    conn.close()

def seed_departments_and_domains():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    depts = [
        ("Electronics and Communication Engineering", "ECE", "Hardware design, VLSI, wireless networks, embedded systems, and signal processing.", "cpu"),
        ("Computer Science and Engineering", "CSE", "Software engineering, algorithms, AI/ML, data analytics, cybersecurity, and cloud.", "code"),
        ("Electrical and Electronics Engineering", "Electrical", "Power electronics, battery management, renewable energy, and microgrids.", "zap"),
        ("Instrumentation Engineering", "Instrumentation", "Measurement, process control, sensors, and industrial telemetry.", "activity"),
        ("Mechanical & Mechatronics", "Mechanical", "Robotic kinematics, actuators, automotive systems, and automation.", "settings"),
        ("Civil & Infrastructure", "Civil", "Smart cities, structural monitoring, and environmental sensing.", "building")
    ]
    for name, code, desc, icon in depts:
        cur.execute("INSERT OR IGNORE INTO departments (name, code, description, icon) VALUES (?, ?, ?, ?)", (name, code, desc, icon))

    # Comprehensive Domain Guide definitions for all initial domains matching Section 3!
    domains_data = [
        {
            "name": "VLSI",
            "code": "vlsi",
            "branch_association": "ECE",
            "full_form": "Very Large Scale Integration",
            "simple_definition": "VLSI is the engineering process of placing millions to billions of tiny electronic transistors onto a single silicon chip to create compact, high-speed microprocessors and digital circuits.",
            "beginner_explanation": "Imagine building a bustling city on a tiny postage stamp. Instead of connecting hundreds of separate electronic components on a large circuit board with bulky wires, VLSI packs the entire computer system onto one microscopic piece of silicon. This is why our modern smartphones have the computing power that once required an entire room of computers.",
            "why_exists": "Without VLSI, modern electronics would be massive, hot, slow, and extremely power-hungry. VLSI makes miniaturization, ultra-low energy consumption, and high computational speed possible.",
            "main_purpose": "To design, simulate, verify, and fabricate integrated circuits (ICs) that perform high-speed mathematical operations, process digital signals, and power electronic devices.",
            "real_world_apps": json.dumps([
                "Microprocessors and CPUs (Intel, AMD, Apple Silicon)",
                "Smartphone mobile application processors (Snapdragon, MediaTek)",
                "AI and neural processing accelerators (NVIDIA GPUs, Google TPUs)",
                "Automotive control units (ADAS, EV motor control)",
                "Medical implantable chips (pacemakers, bio-sensors)"
            ]),
            "industries": json.dumps([
                "Semiconductor manufacturing (TSMC, Intel, Samsung)",
                "Fabless chip design (NVIDIA, Qualcomm, Apple, AMD)",
                "Electronic Design Automation (EDA) (Synopsys, Cadence, Mentor)",
                "Aerospace, Defence, and Automotive Electronics"
            ]),
            "common_problems": json.dumps([
                "Minimizing dynamic and static power consumption in mobile chips",
                "Meeting nanosecond timing closure without setup/hold violations",
                "Thermal dissipation and heat management in dense silicon dies",
                "Ensuring 100% functional verification before expensive silicon fabrication"
            ]),
            "important_concepts": json.dumps([
                "Boolean Algebra and Digital Logic Gates",
                "Finite State Machines (Mealy and Moore FSMs)",
                "CMOS transistor physics, logic families, and stick diagrams",
                "Hardware Description Languages (Verilog and VHDL)",
                "Static Timing Analysis (STA), Setup and Hold Times",
                "Difference between RTL Simulation, FPGA prototyping, and ASIC tape-out"
            ]),
            "programming_languages": json.dumps(["Verilog HDL", "SystemVerilog", "VHDL", "Tcl (Tool Command Language)", "Python for EDA verification"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["FPGA Boards (Xilinx Basys 3, Nexys A7, Altera DE10-Lite)", "Logic Analyzers", "JTAG Programmers"],
                "Software": ["Xilinx Vivado", "ModelSim / QuestaSim", "Synopsys Design Compiler", "Cadence Genus / Innovus", "Open-source EDA (OpenLane, Icarus Verilog, GTKWave, Yosys)"]
            }),
            "beginner_examples": json.dumps([
                "8-bit Arithmetic Logic Unit (ALU) with status flags in Verilog",
                "Configurable digital stopwatch with 7-segment display on FPGA",
                "Smart traffic light sequence controller using Mealy Finite State Machine",
                "Priority arbiter and FIFO circular memory buffer"
            ]),
            "intermediate_examples": json.dumps([
                "UART / SPI serial communication controller with verification testbench",
                "Hardware PWM motor speed controller with fault interlocking",
                "Fixed-point digital FIR / IIR filter accelerator for audio signals",
                "FPGA-based password authentication and AES encryption block"
            ]),
            "advanced_examples": json.dumps([
                "Pipelined 32-bit RISC-V processor core in SystemVerilog",
                "Low-power Convolutional Neural Network (CNN) edge accelerator",
                "DDR memory controller with AXI4 bus interface",
                "Complete RTL-to-GDSII ASIC flow implementation using OpenLane 130nm"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Understand problem requirements and draw block diagram & datapath",
                "Step 2: Model the state transitions with a Finite State Machine (FSM)",
                "Step 3: Write clean, synthesizable RTL in Verilog or VHDL",
                "Step 4: Create a self-checking testbench to verify all corner cases",
                "Step 5: Run behavioral simulation and inspect waveforms in GTKWave / ModelSim",
                "Step 6: Synthesize RTL and analyze resource utilization (LUTs, Flip-Flops, Power)",
                "Step 7: Map pin constraints (XDC) and deploy bitstream to FPGA board for live testing"
            ]),
            "expected_outcomes": "Synthesized digital hardware design with passing testbenches, timing closure reports, and working FPGA bitstream demonstration.",
            "limitations_challenges": "Fabricating an actual physical ASIC chip costs tens of thousands of dollars and takes months; students validate their designs via cycle-accurate simulation and FPGA hardware boards.",
            "related_domains": json.dumps(["Embedded Systems", "Computer Architecture", "Robotics", "IoT"]),
            "relevant_hackathons": json.dumps(["InnovateFPGA World Contest", "Cadence / Synopsys Design Contests", "RISC-V Summit Contests", "Smart India Hackathon (Hardware Edition)"]),
            "icon": "cpu"
        },
        {
            "name": "Embedded Systems",
            "code": "embedded",
            "branch_association": "ECE / CSE",
            "full_form": "Embedded Systems",
            "simple_definition": "An embedded system is a dedicated computer system—combining a microprocessor, memory, sensors, actuators, and firmware—designed to perform a specific dedicated function within a larger mechanical or electrical system.",
            "beginner_explanation": "Unlike your general-purpose laptop that can run hundreds of different apps, an embedded system has one dedicated job that it does reliably 24/7. Your microwave oven, washing machine, car anti-lock braking system, and drone flight controller are all embedded systems.",
            "why_exists": "It provides instant real-time response, compact footprint, low power operation, and physical world interaction that general-purpose operating systems cannot guarantee.",
            "main_purpose": "To sense physical variables from the real world, execute deterministic control logic, and drive actuators in real time.",
            "real_world_apps": json.dumps([
                "Automotive Engine Control Units (ECUs) and Anti-lock Braking Systems (ABS)",
                "Medical vital sign monitors, infusion pumps, and pacemakers",
                "Industrial PLC controllers, robotic arms, and SCADA endpoints",
                "Consumer appliances: smart washing machines, microwave controllers",
                "Drone flight controllers and autopilot systems"
            ]),
            "industries": json.dumps(["Automotive & EV", "Biomedical & Healthcare", "Industrial Automation", "Aerospace & Defence", "Consumer Electronics"]),
            "common_problems": json.dumps([
                "Meeting strict real-time deadlines without jitter or lockup",
                "Ultra-low-power consumption for multi-year battery operation",
                "Electromagnetic noise rejection and sensor calibration drift",
                "Secure Over-The-Air (OTA) firmware updating with rollback safety"
            ]),
            "important_concepts": json.dumps([
                "Microcontroller architecture (ARM Cortex-M, ESP32, AVR, PIC)",
                "Hardware interfaces: GPIO, ADC, DAC, PWM, Timers, Interrupts (ISRs)",
                "Communication buses: I2C, SPI, UART, CAN Bus, Modbus",
                "Real-Time Operating Systems (FreeRTOS tasks, semaphores, queues)",
                "Power management: Sleep modes, wake-up interrupts, brownout protection"
            ]),
            "programming_languages": json.dumps(["Embedded C", "C++", "Rust for Embedded", "Python/MicroPython"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["Microcontroller boards (ESP32, STM32 Nucleo, Arduino, Raspberry Pi Pico)", "Sensors (IMU, temperature, gas, current)", "Oscilloscopes", "Logic analyzers", "Multimeters"],
                "Software": ["STM32CubeIDE", "ESP-IDF / PlatformIO", "Keil uVision", "Arduino IDE", "FreeRTOS"]
            }),
            "beginner_examples": json.dumps([
                "Temperature-triggered fan controller with LCD and hysteresis",
                "Digital tachometer measuring motor RPM using Hall-effect sensor",
                "Ultrasonic obstacle detection cane for visually impaired individuals",
                "Automated plant watering system with soil sensor and relay"
            ]),
            "intermediate_examples": json.dumps([
                "Wearable fall detector with 6-axis IMU, cancel button, and BLE alert",
                "FreeRTOS multi-tasking data logger writing sensor streams to SD card",
                "Automotive CAN bus node decoding engine telemetry and displaying on OLED",
                "Non-invasive battery management system (BMS) with cell balancing"
            ]),
            "advanced_examples": json.dumps([
                "Edge acoustic predictive maintenance sensor detecting bearing failure",
                "Dual-bank secure bootloader with cryptographic signature verification",
                "PX4-compatible indoor drone obstacle avoidance module with ToF sensors",
                "Low-power LoRa mesh emergency disaster text communicator"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Define physical inputs, outputs, sampling rates, and power budget",
                "Step 2: Select microcontroller and create breadboard schematic circuit",
                "Step 3: Write peripheral initialization routines (ADC, timers, interrupts)",
                "Step 4: Develop state machine or FreeRTOS task structure",
                "Step 5: Calibrate analog sensors against known laboratory benchmarks",
                "Step 6: Measure current consumption in active and deep sleep states",
                "Step 7: Enclose prototype in protective casing and perform continuous stress testing"
            ]),
            "expected_outcomes": "A self-contained hardware module executing deterministic firmware, demonstrating physical actuation and sensor telemetry.",
            "limitations_challenges": "Memory constraints (flash/RAM), debugging hardware faults, power supply noise, and real-time timing deadlines.",
            "related_domains": json.dumps(["Internet of Things (IoT)", "Robotics", "VLSI", "Smart Automation"]),
            "relevant_hackathons": json.dumps(["Smart India Hackathon (Hardware)", "Texas Instruments Innovation Challenge", "Embedded World Student Contests", "Hackster.io Global Challenges"]),
            "icon": "zap"
        },
        {
            "name": "Internet of Things (IoT)",
            "code": "iot",
            "branch_association": "ECE / CSE",
            "full_form": "Internet of Things",
            "simple_definition": "IoT refers to a network of physical devices equipped with sensors, processing ability, and wireless connectivity that exchange data with other devices and systems over the internet or cloud.",
            "beginner_explanation": "Think of IoT as giving everyday physical objects 'eyes', 'ears', and a 'voice'. A regular soil patch cannot tell a farmer when it is thirsty; an IoT soil probe can measure the moisture, send an alert to the farmer's smartphone, and even turn on the water pump automatically.",
            "why_exists": "To bridge the gap between physical reality and digital data networks, enabling continuous remote monitoring, predictive automation, and resource conservation.",
            "main_purpose": "To collect telemetry from distributed physical environments, transmit it reliably over wireless networks, and present actionable insights or automated controls via cloud dashboards.",
            "real_world_apps": json.dumps([
                "Precision Agriculture (smart irrigation, crop health, weather monitoring)",
                "Smart Cities (intelligent streetlights, automated waste bins, parking guidance)",
                "Industrial IoT (machine condition monitoring, predictive vibration alerts)",
                "Healthcare (wearable patient vital monitors, cold-chain vaccine tracking)",
                "Smart Homes (energy management, automated safety and security)"
            ]),
            "industries": json.dumps(["Smart Agriculture", "Municipal & Utilities", "Logistics & Supply Chain", "Healthcare & Pharma", "Industrial Manufacturing"]),
            "common_problems": json.dumps([
                "Long-range transmission in rural areas without cellular coverage",
                "Battery longevity for sensor nodes buried in soil or mounted on poles",
                "Data security and transport encryption on constrained microcontrollers",
                "Handling intermittent network disconnections without data loss"
            ]),
            "important_concepts": json.dumps([
                "IoT Protocols: MQTT, CoAP, HTTP/REST, WebSockets",
                "Wireless Technologies: Wi-Fi, BLE, LoRa / LoRaWAN, NB-IoT, Zigbee",
                "Edge computing vs Cloud computing architectures",
                "Sensor signal conditioning, calibration, and filtering",
                "Cloud time-series databases (InfluxDB, TimescaleDB, Firebase)",
                "Data visualization: Dashboards (Node-RED, Grafana, Streamlit, Web)"
            ]),
            "programming_languages": json.dumps(["C / C++ (Firmware)", "Python (Backend & Gateways)", "JavaScript / TypeScript (Web dashboards)"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["ESP32 / ESP8266 Wi-Fi nodes", "LoRa SX1276/SX1262 transceivers", "Raspberry Pi Gateways", "Soil, DHT22, MQ gas, Ultrasonic sensors"],
                "Software": ["Arduino IDE / PlatformIO", "Mosquitto MQTT Broker", "ThingsBoard / Node-RED", "The Things Network (TTN)", "ChirpStack"]
            }),
            "beginner_examples": json.dumps([
                "Smart soil moisture monitor with ESP32 and live mobile dashboard",
                "Smart home energy consumption monitor using non-invasive CT clamp",
                "Overflow alert waste bin using ultrasonic sensor and cloud notifications",
                "Automated classroom occupancy and ambient lighting controller"
            ]),
            "intermediate_examples": json.dumps([
                "LoRaWAN river flood early warning station with rate-of-rise alarms",
                "Cold-chain vaccine carrier temperature and GPS tracker with trip logging",
                "Multi-location urban air-quality monitoring network with heatmap display",
                "Smart parking guidance system with real-time bay occupancy detection"
            ]),
            "advanced_examples": json.dumps([
                "Multi-hop LoRa mesh disaster emergency communication network",
                "End-to-end encrypted IoT sensor data pipeline using AES and TLS certificates",
                "Edge-AI smart camera for industrial production line anomaly detection",
                "Autonomous solar-powered microgrid energy dispatch and battery balancer"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Select sensors based on environmental requirements and accuracy specifications",
                "Step 2: Choose suitable communication protocol (Wi-Fi for indoor, LoRa for remote rural)",
                "Step 3: Program microcontroller to sample sensors, handle sleep modes, and frame payloads",
                "Step 4: Configure local gateway or direct cloud connection with MQTT/HTTP",
                "Step 5: Setup backend database to store timestamped telemetry records",
                "Step 6: Build clean web/mobile dashboard with charts, thresholds, and SMS/email alerts",
                "Step 7: Conduct 24-hour field soak test to evaluate packet loss and battery depletion"
            ]),
            "expected_outcomes": "A deployed wireless sensor node streaming live data to a cloud dashboard with automated alerts and local data backup.",
            "limitations_challenges": "Wireless range limits, physical weatherproofing (IP67), battery lifecycle, and cloud hosting costs.",
            "related_domains": json.dumps(["Embedded Systems", "Cybersecurity", "Data Science", "Communication Systems"]),
            "relevant_hackathons": json.dumps(["Smart India Hackathon", "IoT World Innovation Challenge", "NASA Space Apps Challenge", "Global Hackathons by Espressif / Arduino"]),
            "icon": "wifi"
        },
        {
            "name": "Data Science",
            "code": "data-science",
            "branch_association": "CSE",
            "full_form": "Data Science & Analytics",
            "simple_definition": "Data Science is the interdisciplinary field that extracts meaningful insights, patterns, and predictions from structured and unstructured data using mathematics, statistics, and machine learning.",
            "beginner_explanation": "Imagine being able to look through millions of customer purchases or weather records and uncovering hidden trends that no human eye could catch. Data science allows software to learn from past history to forecast tomorrow's sales, detect bank frauds in milliseconds, and recommend products you will love.",
            "why_exists": "Modern organizations collect vast amounts of raw data. Without data science, that data remains useless noise rather than actionable intelligence.",
            "main_purpose": "To clean, analyze, visualize, and build predictive machine learning models that solve complex decision-making problems.",
            "real_world_apps": json.dumps([
                "Customer Churn Prediction in Telecom and Banking",
                "Sales and inventory demand forecasting for retail",
                "Credit card fraud and suspicious financial transaction detection",
                "Natural Language Processing (NLP) customer review sentiment analysis",
                "Personalized recommendation systems (Netflix, Amazon, Spotify)"
            ]),
            "industries": json.dumps(["E-Commerce & Retail", "Banking, Financial Services & Insurance (BFSI)", "Healthcare & Genomics", "Supply Chain & Logistics", "Digital Marketing"]),
            "common_problems": json.dumps([
                "Noisy, missing, and duplicate records in raw real-world datasets",
                "Severe class imbalance (e.g. fraudulent transactions are less than 0.1%)",
                "Model overfitting to training data and failing on unseen test samples",
                "Translating mathematical error metrics (RMSE, AUC-ROC) into business impact"
            ]),
            "important_concepts": json.dumps([
                "Exploratory Data Analysis (EDA) and Data Preprocessing",
                "Probability, Descriptive and Inferential Statistics",
                "Supervised Learning: Linear Regression, Logistic Regression, Decision Trees, Random Forests, XGBoost",
                "Unsupervised Learning: K-Means Clustering, PCA, Association Rule Mining",
                "Model Evaluation Metrics: Precision, Recall, F1-Score, ROC-AUC, MAE, RMSE",
                "Feature Engineering and Dimensionality Reduction"
            ]),
            "programming_languages": json.dumps(["Python", "SQL", "R", "Scala (Big Data)"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["Standard Laptop / Desktop with 8GB+ RAM", "Google Colab / Kaggle Cloud GPUs"],
                "Software": ["Jupyter Notebook / VS Code", "Pandas & NumPy", "Scikit-Learn", "Matplotlib & Seaborn", "Power BI / Tableau", "FastAPI / Streamlit"]
            }),
            "beginner_examples": json.dumps([
                "Interactive Sales KPI Performance Dashboard with Power BI & Python",
                "Product Sales Ranking and Revenue Distribution Analysis",
                "Customer Purchase Frequency and Basket Size Analyzer",
                "Regional sales comparison and high/low performing outlet identification"
            ]),
            "intermediate_examples": json.dumps([
                "Customer Churn Prediction model using Scikit-Learn with feature importance",
                "Seasonal Sales Demand Forecasting using ARIMA and Prophet time series",
                "Customer Review Sentiment Classifier using NLP and TF-IDF",
                "Lead Conversion Probability Scorer for Sales Teams"
            ]),
            "advanced_examples": json.dumps([
                "Personalized Product Recommendation Engine using Hybrid Collaborative Filtering",
                "Real-time Fraudulent Transaction Detector with XGBoost and Imbalanced-learn",
                "Dynamic Price Optimization model factoring competitor pricing and elasticity",
                "End-to-end MLOps pipeline with model monitoring and drift detection"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Frame the business problem as a regression, classification, or clustering task",
                "Step 2: Collect data, inspect data types, and handle missing values & outliers",
                "Step 3: Perform Exploratory Data Analysis (EDA) and visualize correlation matrices",
                "Step 4: Engineer new features (ratios, time encodings, one-hot vectors)",
                "Step 5: Split data into training/validation/test sets and train baseline models",
                "Step 6: Fine-tune hyperparameters, evaluate with confusion matrix or residual plots",
                "Step 7: Deploy as an interactive Streamlit web dashboard or REST API"
            ]),
            "expected_outcomes": "A trained machine learning pipeline with documented evaluation metrics, interactive visualizations, and exportable predictions.",
            "limitations_challenges": "Data quality issues, potential algorithmic bias, and degradation over time as consumer behaviors evolve.",
            "related_domains": json.dumps(["Cybersecurity", "Smart Automation", "Internet of Things (IoT)"]),
            "relevant_hackathons": json.dumps(["Kaggle Competitions", "Smart India Hackathon (Software)", "Datathon Global", "Open Source Data Science Challenges"]),
            "icon": "bar-chart-2"
        },
        {
            "name": "Cybersecurity",
            "code": "cybersecurity",
            "branch_association": "CSE / ECE",
            "full_form": "Cybersecurity & Information Assurance",
            "simple_definition": "Cybersecurity is the practice of protecting computer networks, devices, software programs, and electronic data from unauthorized digital attacks, damage, or unauthorized access.",
            "beginner_explanation": "Just like homes have locks, security cameras, and alarms to keep burglars out, digital networks require firewalls, encryption, and vulnerability scanners to keep digital attackers from stealing sensitive passwords, bank funds, or confidential files.",
            "why_exists": "As every aspect of society—banking, healthcare, government, energy—moves online, cyber attacks pose critical threats to privacy, financial stability, and public infrastructure.",
            "main_purpose": "To identify vulnerabilities before adversaries do, detect ongoing attacks in real time, secure communication channels, and ensure business continuity.",
            "real_world_apps": json.dumps([
                "Banking fraud detection and UPI payment QR safety verification",
                "Cloud storage bucket misconfiguration detection (AWS/Azure)",
                "Security Operations Centers (SOC) incident response and log forensics",
                "Web application vulnerability scanning (OWASP Top 10 protection)",
                "IoT device network isolation and default credential auditing"
            ]),
            "industries": json.dumps(["Banking & FinTech", "Healthcare & Hospitals", "Defence & Government", "E-Commerce", "Critical Infrastructure & Utilities"]),
            "common_problems": json.dumps([
                "Default or hardcoded passwords on deployed network devices",
                "Unauthenticated or rate-limit deficient API endpoints",
                "Phishing portals imitating official government and college portals",
                "Ransomware indicators slipping through unmonitored server logs"
            ]),
            "important_concepts": json.dumps([
                "Confidentiality, Integrity, and Availability (CIA Triad)",
                "OWASP Top 10 Web and API Vulnerabilities",
                "Network Security: Ports, Protocols, Firewalls, Wireshark packet capture",
                "Cryptography: Hashing (SHA-256, Argon2), Symmetric (AES), Asymmetric (RSA/ECC)",
                "Identity & Access Management (IAM), Role-Based Access Control (RBAC)",
                "Defensive Security (Blue Team) vs Offensive Pentesting (Red Team)"
            ]),
            "programming_languages": json.dumps(["Python", "Bash / Shell scripting", "JavaScript / PHP (Web security)", "C / C++ (Binary analysis)"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["Standard Laptop / PC", "Optional Android test device", "Isolated test router / VMs"],
                "Software": ["Nmap", "Wireshark", "OWASP ZAP / Burp Suite", "Docker", "Linux Syslog", "Splunk / ELK / Wazuh"]
            }),
            "beginner_examples": json.dumps([
                "Hostel Wi-Fi Vulnerable Router Scanner checking firmware and CVEs",
                "Secure Password Hasher teaching plaintext vs salted Argon2 hashing",
                "College Fee Portal Phishing Detector analyzing URL reputation",
                "Photo Metadata (EXIF) scrubber removing GPS and device details"
            ]),
            "intermediate_examples": json.dumps([
                "Student Startup API Misconfiguration Scanner for OWASP API Top 10",
                "Mini-SOC: Automated endpoint log collector and incident reporter",
                "Fake Government Website (.gov.in clone) Verifier and risk reporter",
                "UPI QR Code Safety Scanner decoding merchant IDs before payment"
            ]),
            "advanced_examples": json.dumps([
                "Distributed API Burst Attack Shield using token-bucket rate limiting",
                "Anti-GPS Spoofing module using IMU sensor fusion on drones",
                "Network-flow anomaly detector for IoT botnet traffic in hostel networks",
                "AI-generated synthetic voice scam caller detector"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Define security threat model and establish safe, isolated test boundaries",
                "Step 2: Research relevant CVEs or attack vectors (OWASP, NIST guidelines)",
                "Step 3: Develop defensive parser or detection engine in Python",
                "Step 4: Create rules or heuristic thresholds to flag suspicious activities",
                "Step 5: Generate clear remediation advisories alongside alert findings",
                "Step 6: Build clean reporting dashboard and test with synthetic sample data"
            ]),
            "expected_outcomes": "A defensive security scanner, analyzer, or dashboard producing actionable vulnerability reports and remediation guidance without attacking live systems.",
            "limitations_challenges": "Ethical and legal boundaries (must only scan authorized testbeds), avoiding false positive alarms, keeping vulnerability databases up to date.",
            "related_domains": json.dumps(["Data Science", "Internet of Things (IoT)", "Communication Systems"]),
            "relevant_hackathons": json.dumps(["Smart India Hackathon (Cybersecurity)", "Capture The Flag (CTF) Competitions", "National Cyber Olympiad", "DEF CON CTF Challenges"]),
            "icon": "shield"
        },
        {
            "name": "Robotics",
            "code": "robotics",
            "branch_association": "ECE / CSE / Mechanical",
            "full_form": "Robotics & Autonomous Systems",
            "simple_definition": "Robotics is the interdisciplinary branch of engineering that designs, constructs, operates, and programs autonomous or semi-autonomous machines that interact with the physical world.",
            "beginner_explanation": "A robot is a machine that can sense its surroundings, make decisions on its own, and physically move or manipulate objects. From autonomous vacuum cleaners in homes to robotic arms assembling cars in factories, robotics combines computers, electronics, and mechanical parts into intelligent helpers.",
            "why_exists": "To automate hazardous tasks, perform superhuman-precision operations (like surgery), and explore environments inaccessible to humans (like deep oceans or outer space).",
            "main_purpose": "To create physical machines that perceive their environment through sensors, plan actions through algorithms, and execute physical work through motors and actuators.",
            "real_world_apps": json.dumps([
                "Industrial manufacturing and welding robotic arms (ABB, KUKA, FANUC)",
                "Warehouse autonomous mobile robots (AMRs) moving pallets (Amazon Kiva)",
                "Surgical robotic systems (da Vinci Surgical System)",
                "Agricultural harvest and weed removal robots",
                "Disaster search-and-rescue rovers and aerial drones"
            ]),
            "industries": json.dumps(["Manufacturing & Warehousing", "Healthcare & Surgery", "Agriculture", "Defence & Space Exploration", "Logistics"]),
            "common_problems": json.dumps([
                "Simultaneous Localization and Mapping (SLAM) without GPS indoors",
                "Dynamic obstacle avoidance around fast-moving humans or forklifts",
                "Compliant manipulation of fragile objects without crushing them",
                "Battery runtime versus motor torque and payload capacity"
            ]),
            "important_concepts": json.dumps([
                "Forward and Inverse Kinematics, Degrees of Freedom (DoF)",
                "Sensors: 2D/3D LiDAR, Depth Cameras, Ultrasonic, Encoders, IMUs",
                "Actuators: DC Motors, Stepper Motors, Servos, BLDC Motors, Motor Drivers",
                "Control Algorithms: PID Control, Pure Pursuit, State Machines",
                "Robot Operating System (ROS 2, Nav2, URDF, RViz, Gazebo)",
                "Multi-agent coordination and path planning (A*, Dijkstra, RRT)"
            ]),
            "programming_languages": json.dumps(["C++", "Python", "ROS 2 Client Libraries (rclpy / rclcpp)"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["Robot Chassis & Motor Drivers", "Microcontrollers (STM32, ESP32, Arduino)", "Single Board Computers (Raspberry Pi 4/5, Jetson Orin Nano)", "LiDAR (RPLiDAR A1)", "Depth Cameras"],
                "Software": ["ROS 2 (Humble / Iron)", "Gazebo / Isaac Sim", "OpenCV", "RViz", "Arduino IDE"]
            }),
            "beginner_examples": json.dumps([
                "Line-following mobile robot with PID steering and IR sensor array",
                "Ultrasonic obstacle-avoiding tabletop rover with servo scanning",
                "2-Degree-of-Freedom robotic arm controlled via potentiometer or Bluetooth",
                "Tactile wall-following cleaning robot demonstrator"
            ]),
            "intermediate_examples": json.dumps([
                "Indoor differential-drive delivery robot using 2D LiDAR SLAM and Nav2",
                "Vision-assisted pick-and-place conveyor robot sorting parts by color/shape",
                "Sensorized soft gripper picking fragile eggs without cracking using force feedback",
                "Autonomous agricultural weeding rover with GPS waypoint navigation"
            ]),
            "advanced_examples": json.dumps([
                "Warehouse AMR with dynamic obstacle replanning in changing aisles",
                "Multi-robot cooperative transport simulation in ROS 2 Gazebo",
                "UAV search drone localizing survivors using RF beacon ranging and path planning",
                "Myoelectric surface-EMG prosthetic hand with continuous grip pre-shaping"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Define robot kinematics (wheeled, tracked, legged, manipulator arm)",
                "Step 2: Assemble mechanical frame, gearboxes, wheels, and power distribution",
                "Step 3: Wire motor controllers (H-Bridge/ESC) to microcontroller and verify wheel speeds",
                "Step 4: Mount and calibrate sensors (encoders, IMU, LiDAR) for accurate odometry",
                "Step 5: Write low-level PID velocity controller and test straight-line travel",
                "Step 6: Integrate high-level path planning (ROS 2 Nav2 or custom state machine)",
                "Step 7: Conduct obstacle courses and tune clearance safety margins"
            ]),
            "expected_outcomes": "A working physical or simulated robot achieving targeted navigation or manipulation tasks with documented tracking error metrics.",
            "limitations_challenges": "Mechanical wear, wheel slippage affecting dead reckoning, high compute requirements for 3D SLAM.",
            "related_domains": json.dumps(["Embedded Systems", "Smart Automation", "VLSI"]),
            "relevant_hackathons": json.dumps(["RoboSub", "DARPA Robotics Challenges", "Smart India Hackathon (Hardware)", "FIRST Robotics Competition"]),
            "icon": "settings"
        },
        {
            "name": "Communication Systems",
            "code": "communication",
            "branch_association": "ECE",
            "full_form": "Communication Systems & Wireless Networks",
            "simple_definition": "Communication Systems is the branch of engineering that designs technologies and protocols to convey information from a transmitter to a receiver over physical channels such as radio frequency, optical fiber, or copper cable.",
            "beginner_explanation": "How does a WhatsApp voice message or a video call travel from your smartphone in India to someone on the other side of the world in less than a second? Communication systems design the radio antennas, coding methods, satellite links, and fiber optic lines that make instant global connectivity possible.",
            "why_exists": "Human society depends on instantaneous information sharing across distances, whether for everyday calling, emergency disaster alerts, or space exploration.",
            "main_purpose": "To encode, modulate, transmit, receive, and decode signals efficiently across noisy transmission media with minimum error and latency.",
            "real_world_apps": json.dumps([
                "5G and 6G Cellular Mobile Telecommunications networks",
                "Satellite communication and broadband constellations (Starlink, OneWeb)",
                "Optical fiber high-speed undersea and terrestrial backbones",
                "Disaster emergency mesh communication networks",
                "Vehicular-to-Everything (V2X) autonomous vehicle communications"
            ]),
            "industries": json.dumps(["Telecommunications Operators (Jio, Airtel, AT&T)", "Telecom Equipment Vendors (Ericsson, Nokia, Qualcomm)", "Satellite & Aerospace", "Defence Communication"]),
            "common_problems": json.dumps([
                "Signal fading and multipath interference in urban canyons",
                "Limited radio frequency spectrum availability and bandwidth scarcity",
                "Path loss over long distances in rural and hilly regions",
                "Interference between thousands of overlapping Wi-Fi and cellular cells"
            ]),
            "important_concepts": json.dumps([
                "Analog & Digital Modulation: ASK, FSK, PSK, QAM, OFDM",
                "Channel Capacity and Shannon's Theorem",
                "Antenna Design, Radiation Patterns, and Friis Transmission Equation",
                "Software-Defined Radio (SDR) and GNU Radio architecture",
                "Cellular Generations: LTE/4G, 5G NR (New Radio), Beamforming, MIMO",
                "Network protocols: OSI 7-Layer model, packet scheduling, routing"
            ]),
            "programming_languages": json.dumps(["Python (GNU Radio / DSP)", "MATLAB / GNU Octave", "C / C++ (Embedded RF)", "Verilog (FPGA transceivers)"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["Software Defined Radio (RTL-SDR, HackRF One, LimeSDR)", "Antennas (Dipole, Yagi, Patch)", "RF Power Meters", "Spectrum Analyzers"],
                "Software": ["GNU Radio", "MATLAB Communications Toolbox", "Wireshark", "GQRX / SDR#", "CST Studio / HFSS"]
            }),
            "beginner_examples": json.dumps([
                "RTL-SDR FM Broadcast Receiver and spectrum analyzer in GNU Radio",
                "Morse code and ASK digital text transmission over 433MHz RF modules",
                "Long-range Wi-Fi link budget calculator and Fresnel zone planner in Python",
                "Point-to-point packet radio communication using NRF24L01 with CRC validation"
            ]),
            "intermediate_examples": json.dumps([
                "Affordable Rural Broadband Link Planning tool using terrain elevation data",
                "QPSK modulator and demodulator simulation with Bit Error Rate (BER) curves",
                "Sub-GHz LoRa transceiver measuring packet delivery ratio over distance",
                "Vehicular Wi-Fi hotspot coverage optimizer for public transit buses"
            ]),
            "advanced_examples": json.dumps([
                "FPGA-based digital baseband QAM transmitter with root-raised cosine filter",
                "Cognitive Radio dynamic spectrum sensing detector using energy detection",
                "5G-AI flood emergency gateway prioritizing mission-critical packets",
                "Interfering signal classification using deep learning and I/Q spectrograms"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Calculate radio link budget (transmitter power, gains, losses, receiver sensitivity)",
                "Step 2: Choose carrier frequency and modulation scheme (FSK, QPSK, OFDM)",
                "Step 3: Simulate waveform generation and channel noise in MATLAB or GNU Radio",
                "Step 4: Connect hardware transceiver (SDR, LoRa, or RF module)",
                "Step 5: Transmit test packets and measure received signal strength (RSSI) and SNR",
                "Step 6: Compute Bit Error Rate (BER) and compare against theoretical limits",
                "Step 7: Package into working field demonstration with live spectrum plot"
            ]),
            "expected_outcomes": "Demonstrated wireless data transfer between nodes with validated link budget, measured SNR/BER, and spectral compliance.",
            "limitations_challenges": "RF emissions must strictly abide by government frequency allocation rules (ISM bands); transmission must avoid interference with licensed telecom bands.",
            "related_domains": json.dumps(["Embedded Systems", "Internet of Things (IoT)", "VLSI"]),
            "relevant_hackathons": json.dumps(["AI Bharat 5G/6G Hackathon", "IEEE ComSoc Student Competitions", "GNU Radio Amateur Challenges", "Smart India Hackathon"]),
            "icon": "radio"
        },
        {
            "name": "Smart Automation",
            "code": "smart-automation",
            "branch_association": "CSE / ECE",
            "full_form": "Smart Automation & Intelligent Systems",
            "simple_definition": "Smart Automation integrates sensors, programmable controllers, artificial intelligence, and feedback control loops to execute processes with minimal or no human intervention.",
            "beginner_explanation": "Instead of turning switches on and off by hand or following a dumb mechanical timer, smart automation uses sensors to understand current conditions and makes smart decisions automatically. For example, watering plants only when the soil is genuinely dry, or dimming streetlights when no cars are passing.",
            "why_exists": "To eliminate tedious manual chores, prevent human errors, conserve energy, and optimize machine operations continuously.",
            "main_purpose": "To create closed-loop control systems that monitor operating parameters, apply intelligent logic, and control actuators safely and efficiently.",
            "real_world_apps": json.dumps([
                "Predictive Agricultural Irrigation and greenhouse climate control",
                "Home automation (voice-controlled lighting, smart thermostats)",
                "Factory production line sorting, defect inspection, and packaging",
                "Smart commercial building HVAC and occupancy optimization",
                "Automated pharmaceutical packaging and quality interlocks"
            ]),
            "industries": json.dumps(["Industrial Manufacturing", "Smart Agriculture", "Commercial Real Estate", "Food & Beverage Processing", "Smart Home Ecosystems"]),
            "common_problems": json.dumps([
                "Energy waste from systems running at full power when unneeded",
                "Sensor glitches causing false triggers in safety equipment",
                "Lack of emergency manual override during software lockup",
                "Integrating legacy industrial equipment with modern cloud telemetry"
            ]),
            "important_concepts": json.dumps([
                "Closed-loop vs open-loop feedback control",
                "PID (Proportional-Integral-Derivative) tuning principles",
                "Programmable Logic Controllers (PLCs) and Ladder Logic",
                "Sensors (proximity, photoelectric, thermocouples, level)",
                "Actuators (solenoid valves, relays, contactors, stepper motors)",
                "HMI (Human-Machine Interface) and SCADA supervisory software"
            ]),
            "programming_languages": json.dumps(["Python", "C / C++", "Structured Text (IEC 61131-3)", "Ladder Logic", "JavaScript"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["PLCs (Siemens S7-1200, Schneider)", "Microcontrollers (Arduino, ESP32)", "Relay Modules", "Current Transformers", "Solenoid Valves"],
                "Software": ["Node-RED", "OpenPLC", "Siemens TIA Portal", "Home Assistant", "MQTT Dashboards"]
            }),
            "beginner_examples": json.dumps([
                "Light-dependent automatic street lighting controller with delay debounce",
                "Automatic water tank refill controller with float switch and dry-run safety",
                "Smart room occupancy lighting system using PIR motion sensors",
                "Temperature-controlled exhaust ventilation fan with hysteresis limits"
            ]),
            "intermediate_examples": json.dumps([
                "Predictive Smart Irrigation System adjusting watering from soil moisture trends",
                "Voice-Controlled Multi-Load Home Node with local manual button fallback",
                "Digital-Twin synchronized tabletop batch temperature and flow controller",
                "Factory OT access revocation and stale account audit checker"
            ]),
            "advanced_examples": json.dumps([
                "Vision-to-PLC triple-check reject controller on a sorting conveyor",
                "Demand-driven municipal waste collection route optimization beacon",
                "Occupancy-aware HVAC controller for municipal offices saving 35% power",
                "PMSM motor inter-turn stator winding fault classifier using edge AI"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Map process sequence, define safe operating zones and failure modes",
                "Step 2: Choose sensors and ensure electrical isolation with optocouplers",
                "Step 3: Select relays and contactors rated for the required actuator loads",
                "Step 4: Write control firmware implementing hysteresis to prevent rapid cycling",
                "Step 5: Include physical emergency stop (E-Stop) and watchdog timer",
                "Step 6: Build operator status dashboard and log cycle counts",
                "Step 7: Conduct fault injection testing (e.g. simulated sensor disconnect)"
            ]),
            "expected_outcomes": "A stable closed-loop automated system that maintains desired process setpoints and handles abnormal conditions with safe fail-stops.",
            "limitations_challenges": "Actuator wear over millions of cycles, electrical noise from high-voltage motor switching, ensuring fail-safe states upon power loss.",
            "related_domains": json.dumps(["Robotics", "Embedded Systems", "Internet of Things (IoT)"]),
            "relevant_hackathons": json.dumps(["Smart India Hackathon", "Siemens Future Living Challenge", "Schneider Go Green", "Industrial Automation Hackathons"]),
            "icon": "check-circle"
        },
        {
            "name": "Quantum Computing",
            "code": "quantum",
            "branch_association": "CSE / ECE",
            "full_form": "Quantum Computing & Quantum Information Technologies",
            "simple_definition": "Quantum Computing harnesses the fundamental principles of quantum mechanics—superposition and entanglement—to solve complex computational problems that are practically impossible for classical computers.",
            "beginner_explanation": "A regular computer bit is like a light switch: it is either 0 (OFF) or 1 (ON). A quantum bit (qubit) can be both 0 and 1 at the exact same time through a phenomenon called superposition. This allows quantum computers to explore millions of possible solutions simultaneously, solving in minutes what would take a supercomputer thousands of years.",
            "why_exists": "To break through the physical computational barriers of classical physics, enabling breakthrough molecular drug discovery, perfect secure cryptography, and massive combinatorial optimization.",
            "main_purpose": "To formulate and execute quantum algorithms on quantum processors or statevector simulators for scientific discovery and mathematical optimization.",
            "real_world_apps": json.dumps([
                "New battery material and catalyst molecular simulation (VQE algorithm)",
                "Unconditionally secure quantum key distribution (QKD) communications",
                "Large-scale supply chain and airline route optimization (QAOA algorithm)",
                "Quantum machine learning for genomics and drug candidate discovery",
                "Quantum-enhanced weather forecasting and urban climate modeling"
            ]),
            "industries": json.dumps(["Aerospace & Logistics", "Pharmaceuticals & Healthcare", "Cybersecurity & Defence", "Chemical Engineering & Clean Energy", "Finance & Portfolio Optimization"]),
            "common_problems": json.dumps([
                "Quantum decoherence and physical qubit environmental noise (NISQ era)",
                "High error rates requiring quantum error mitigation techniques",
                "Formulating complex real-world problems into QUBO / Ising Hamiltonian models",
                "Interfacing quantum coprocessors with classical computing infrastructure"
            ]),
            "important_concepts": json.dumps([
                "Superposition, Entanglement, Quantum Interference",
                "Qubits, Bloch Sphere representation, Quantum Logic Gates (H, X, CNOT, Rz)",
                "Variational Quantum Eigensolver (VQE) for chemistry",
                "Quantum Approximate Optimization Algorithm (QAOA)",
                "Shor's Algorithm and Grover's Quantum Search Algorithm",
                "Post-Quantum Cryptography (PQC) and Quantum Key Distribution (BB84)"
            ]),
            "programming_languages": json.dumps(["Python", "Q# (Microsoft)", "Julia for Quantum Simulation"]),
            "tools_hardware_software": json.dumps({
                "Hardware": ["IBM Quantum Cloud systems", "D-Wave Quantum Annealers", "Standard PC running statevector simulators"],
                "Software": ["Qiskit (IBM)", "PennyLane (Xanadu)", "Cirq (Google)", "QuTiP", "D-Wave Ocean SDK"]
            }),
            "beginner_examples": json.dumps([
                "Bell State creation and quantum entanglement verification in Qiskit",
                "Grover's 2-qubit database search algorithm with statevector visualization",
                "Simulated BB84 Quantum Key Distribution with eavesdropper detection",
                "Quantum random number generator using Hadamard gate superposition"
            ]),
            "intermediate_examples": json.dumps([
                "Quantum Optimization for vehicle routing using QAOA on Qiskit",
                "Variational Quantum Eigensolver (VQE) finding ground state of H2 molecule",
                "Quantum Support Vector Machine (QSVM) classifying credit card fraud",
                "Portfolio risk optimization using Quantum Annealing on D-Wave Ocean"
            ]),
            "advanced_examples": json.dumps([
                "QUEST: Quantum-Enhanced WRF model for urban climate modeling",
                "Quantum machine learning for early genomic cancer biomarker detection",
                "Quantum key distribution network simulation for smart grid substations",
                "Solid-state lithium battery electrolyte molecular orbital simulation"
            ]),
            "implementation_steps": json.dumps([
                "Step 1: Formulate the mathematical target into a Hamiltonian or QUBO matrix",
                "Step 2: Initialize qubits in uniform superposition using Hadamard gates",
                "Step 3: Construct parameterized ansatz circuit or problem oracle",
                "Step 4: Execute on local statevector simulator with 1024+ shots",
                "Step 5: Apply classical optimizer (COBYLA / SPSA) in hybrid VQE/QAOA loop",
                "Step 6: Submit job to real cloud quantum processor (IBM Quantum / IonQ)",
                "Step 7: Compare execution results, error rates, and classical solver benchmark"
            ]),
            "expected_outcomes": "Demonstrated quantum circuit implementation with simulated and real quantum backend runs, showing state distributions and classical baseline comparisons.",
            "limitations_challenges": "Physical quantum hardware currently suffers from noise, limited coherence time, and shallow circuit depth.",
            "related_domains": json.dumps(["Cybersecurity", "Data Science", "Communication Systems"]),
            "relevant_hackathons": json.dumps(["IBM Quantum Challenge", "Amaravati Quantum Valley Hackathon", "QHack Global", "MIT iQuHACK"]),
            "icon": "circle"
        }
    ]

    for d in domains_data:
        cur.execute("""
        INSERT OR REPLACE INTO domains (
            name, code, branch_association, full_form, simple_definition, beginner_explanation,
            why_exists, main_purpose, real_world_apps, industries, common_problems,
            important_concepts, programming_languages, tools_hardware_software,
            beginner_examples, intermediate_examples, advanced_examples,
            implementation_steps, expected_outcomes, limitations_challenges,
            related_domains, relevant_hackathons, icon
        ) VALUES (
            :name, :code, :branch_association, :full_form, :simple_definition, :beginner_explanation,
            :why_exists, :main_purpose, :real_world_apps, :industries, :common_problems,
            :important_concepts, :programming_languages, :tools_hardware_software,
            :beginner_examples, :intermediate_examples, :advanced_examples,
            :implementation_steps, :expected_outcomes, :limitations_challenges,
            :related_domains, :relevant_hackathons, :icon
        )""", d)

    # Hackathons initial seed
    hackathons = [
        ("Smart India Hackathon 2026", "Ministry of Education & AICTE", "https://sih.gov.in",
         "Smart Agriculture, Smart Automation, Healthcare, Disaster Management, Cyber Security",
         "Smart Automation, Internet of Things (IoT), Data Science, Cybersecurity", "ECE, CSE, Electrical, Mechanical",
         "Agriculture, Healthcare, Smart Cities", "Hybrid (Grand Finale On-site)", "College & University Engineering Students (Team of 6)",
         "Check official website (Announced annually)", "October - December 2026", "Pan-India Nodal Centers", "6 members", "upcoming", 1, "2026-10-01"),
        ("AI Bharat 5G/6G Hackathon", "Department of Telecommunications (DoT), Govt of India", "https://dot.gov.in",
         "5G Flood Emergency Gateways, V2X Telematics, High-Throughput Satellite Mesh",
         "Communication Systems, Embedded Systems, Internet of Things (IoT)", "ECE, CSE",
         "Telecommunications, Safety and Security", "Online & Delhi Finale", "Students & Startups",
         "Check official website", "November 2026", "IIT Delhi / Hybrid", "2-4 members", "open", 1, "2026-10-07"),
        ("Amaravati Quantum Valley Innovation Challenge", "QAIC & Govt of Andhra Pradesh", "https://amaravatiquantum.ap.gov.in",
         "Quantum Climate Modeling (QUEST), Post-Quantum Cryptography, Quantum Logistics QUBO",
         "Quantum Computing, Cybersecurity, Data Science", "CSE, ECE",
         "Environment, Transportation, Healthcare, Safety and Security", "Hybrid", "Engineering Students, Researchers, Faculty",
         "Check official website", "December 2026", "Amaravati / Online", "2-5 members", "upcoming", 1, "2026-09-28"),
        ("URAAN AI Techathon — Smart Manufacturing", "National Technology Council", "https://uraan.gov.pk",
         "Affordable Predictive Maintenance for SMEs, Machine Vibration Anomaly AI",
         "Embedded Systems, Smart Automation, Data Science", "ECE, CSE, Electrical",
         "Industrial Automation, Energy", "Online", "Undergraduate & Graduate Students",
         "Check official website", "October 2026", "Virtual Event", "1-4 members", "open", 1, "2026-09-15"),
        ("Texas Instruments India Innovation Challenge (TICIIC)", "Texas Instruments & DST", "https://ti.com/university",
         "Low-power Embedded Sensing, Power Management, Smart Agriculture IoT",
         "Embedded Systems, VLSI, Internet of Things (IoT)", "ECE, Electrical, Instrumentation",
         "Agriculture, Healthcare, Energy", "National Competition", "Engineering College Teams",
         "Check official website", "Annual College Cycle", "Bangalore / Online", "3-5 members", "upcoming", 1, "2026-08-30")
    ]
    for h in hackathons:
        cur.execute("""
        INSERT OR IGNORE INTO hackathons (
            title, organizer, official_link, tracks, domains, departments, themes, mode,
            eligibility, registration_deadline, event_dates, location, team_size, status, verified, last_verified_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", h)

    # Initial Admin Account (hashed password)
    # Password: Admin@123 -> SHA256 / bcrypt hash
    # Using secure standard hash: sha256$Admin@123
    import hashlib
    admin_pw_hash = hashlib.sha256("Admin@123".encode()).hexdigest()
    cur.execute("""
    INSERT OR IGNORE INTO users (username, email, password_hash, name, role, department)
    VALUES (?, ?, ?, ?, ?, ?)""", ("admin", "admin@guru.edu", admin_pw_hash, "GURU Platform Administrator", "admin", "ECE & CSE"))

    # Initial Demo Student Account
    student_pw_hash = hashlib.sha256("Student@123".encode()).hexdigest()
    cur.execute("""
    INSERT OR IGNORE INTO users (username, email, password_hash, name, role, department)
    VALUES (?, ?, ?, ?, ?, ?)""", ("student", "student@guru.edu", student_pw_hash, "Arjun Sharma", "student", "ECE"))

    conn.commit()
    conn.close()

def main():
    print(f"Initializing database at {DB_PATH}...")
    init_db()
    seed_departments_and_domains()

    all_projects = []
    reports = {}

    parsers = [
        ("cybersecurity_projects_PROJECT_TITLES_CLEAR_1_25.pdf", parse_cybersecurity),
        ("Data_Science_Business_Sales_Marketing_50_Projects_Table (1).pdf", parse_data_science),
        ("Embedded_Systems_200_Problems.pdf", parse_embedded_systems),
        ("IoT_Problem_Bank_50_Problems.pdf", parse_iot),
        ("Robotics_Subdomains_Project_Table.pdf", parse_robotics),
        ("Smart_Automation_CSE_ECE_36_Projects_Single_Table.pdf", parse_smart_automation),
        ("VLSI_ULSI_Project_Problems_30.pdf", parse_vlsi),
        ("Wireless_Communication_Networks_25_Problem_Statements.pdf", parse_wireless_comm),
        ("SIH2026.pdf", parse_sih),
        ("problem-statements-qff.pdf", parse_qff)
    ]

    for fname, parser_fn in parsers:
        try:
            print(f"Parsing {fname}...")
            p_list = parser_fn()
            reports[fname] = {
                "extracted": len(p_list),
                "errors": 0,
                "status": "success"
            }
            print(f"  -> Successfully extracted {len(p_list)} projects from {fname}")
            all_projects.extend(p_list)
        except Exception as e:
            print(f"  -> ERROR parsing {fname}: {e}")
            reports[fname] = {
                "extracted": 0,
                "errors": 1,
                "error_msg": str(e),
                "status": "failed"
            }

    print(f"\nTotal projects extracted from all 10 source documents: {len(all_projects)}")

    # Deduplicate by title similarity / ID
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM projects")

    inserted_count = 0
    duplicate_count = 0
    seen_titles = set()

    for p in all_projects:
        title_norm = re.sub(r'[^a-zA-Z0-9]', '', p["title"].lower())
        if title_norm in seen_titles:
            duplicate_count += 1
            continue
        seen_titles.add(title_norm)

        try:
            cur.execute("""
            INSERT OR REPLACE INTO projects (
                project_id, title, branch, domain, subdomain, theme, problem_statement,
                simple_explanation, detailed_description, why_matters, who_affected,
                difficulty, technologies, hardware_required, software_required,
                skills_required, expected_output, suitable_for, existing_solutions,
                gaps_in_existing, proposed_approach, implementation_steps,
                limitations_challenges, future_scope, source_document, source_page,
                source_reference, source_type, is_verified, verification_status, custom_fields
            ) VALUES (
                :project_id, :title, :branch, :domain, :subdomain, :theme, :problem_statement,
                :simple_explanation, :detailed_description, :why_matters, :who_affected,
                :difficulty, :technologies, :hardware_required, :software_required,
                :skills_required, :expected_output, :suitable_for, :existing_solutions,
                :gaps_in_existing, :proposed_approach, :implementation_steps,
                :limitations_challenges, :future_scope, :source_document, :source_page,
                :source_reference, :source_type, :is_verified, :verification_status, :custom_fields
            )""", p)
            inserted_count += 1
        except Exception as e:
            print(f"Error inserting {p.get('project_id')}: {e}")

    # Record import job
    for fname, rep in reports.items():
        fsize = os.path.getsize(os.path.join(SOURCE_DIR, fname)) if os.path.exists(os.path.join(SOURCE_DIR, fname)) else 0
        cur.execute("""
        INSERT INTO document_import_jobs (
            filename, file_type, file_size, total_extracted, duplicates_found, errors_count, missing_fields_flagged, status, report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
            fname, "PDF", fsize, rep["extracted"], 0, rep["errors"], 0, rep["status"], json.dumps(rep)
        ))

    conn.commit()

    # Verify counts in DB
    cur.execute("SELECT COUNT(*) FROM projects")
    db_tot = cur.fetchone()[0]
    cur.execute("SELECT domain, COUNT(*) FROM projects GROUP BY domain ORDER BY COUNT(*) DESC")
    by_domain = cur.fetchall()
    cur.execute("SELECT branch, COUNT(*) FROM projects GROUP BY branch ORDER BY COUNT(*) DESC")
    by_branch = cur.fetchall()

    conn.close()

    # Save JSON seed
    with open(JSON_OUTPUT_PATH, "w") as f:
        json.dump(all_projects, f, indent=2)

    print("\n================ DATABASE CREATION REPORT ================")
    print(f"Total inserted unique projects in database: {db_tot}")
    print(f"Duplicates pruned: {duplicate_count}")
    print("\nProjects by Domain:")
    for d, c in by_domain:
        print(f"  - {d}: {c}")
    print("\nProjects by Branch:")
    for b, c in by_branch:
        print(f"  - {b}: {c}")
    print(f"\nJSON seed written to {JSON_OUTPUT_PATH}")
    print("Database built successfully!")

if __name__ == "__main__":
    main()
