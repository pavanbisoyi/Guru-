const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'guru.db');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Simple Token Helper
function createToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    department: user.department
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  req.user = verifyToken(token);
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }
  next();
}

app.use(authMiddleware);

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Please enter email/username and password' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE (email = ? OR username = ?) AND password_hash = ?
  `).get(emailOrUsername, emailOrUsername, hash);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
  }

  const token = createToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name, department } = req.body;
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already registered' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, name, role, department)
    VALUES (?, ?, ?, ?, 'student', ?)
  `).run(username, email, hash, name, department || 'ECE');

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = createToken(newUser);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = db.prepare('SELECT id, username, email, name, role, department FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ==========================================
// 2. DOMAIN & DEPARTMENT ROUTES
// ==========================================
app.get('/api/domains', (req, res) => {
  const domains = db.prepare(`
    SELECT d.*, 
      (SELECT COUNT(*) FROM projects p WHERE p.domain = d.name AND (p.verification_status = 'verified' OR ? = 'admin')) as project_count
    FROM domains d
    ORDER BY d.name ASC
  `).all(req.user?.role || 'student');

  res.json(domains.map(d => ({
    ...d,
    real_world_apps: JSON.parse(d.real_world_apps || '[]'),
    industries: JSON.parse(d.industries || '[]'),
    common_problems: JSON.parse(d.common_problems || '[]'),
    important_concepts: JSON.parse(d.important_concepts || '[]'),
    programming_languages: JSON.parse(d.programming_languages || '[]'),
    tools_hardware_software: JSON.parse(d.tools_hardware_software || '{}'),
    beginner_examples: JSON.parse(d.beginner_examples || '[]'),
    intermediate_examples: JSON.parse(d.intermediate_examples || '[]'),
    advanced_examples: JSON.parse(d.advanced_examples || '[]'),
    implementation_steps: JSON.parse(d.implementation_steps || '[]'),
    related_domains: JSON.parse(d.related_domains || '[]'),
    relevant_hackathons: JSON.parse(d.relevant_hackathons || '[]')
  })));
});

app.get('/api/domains/:identifier', (req, res) => {
  const ident = req.params.identifier;
  const d = db.prepare(`
    SELECT * FROM domains WHERE code = ? OR LOWER(name) = LOWER(?) OR LOWER(name) LIKE ?
  `).get(ident, ident, `%${ident.toLowerCase()}%`);

  if (!d) return res.status(404).json({ error: 'Domain not found' });

  const projectCount = db.prepare(`
    SELECT COUNT(*) as count FROM projects WHERE domain = ? AND (verification_status = 'verified' OR ? = 'admin')
  `).get(d.name, req.user?.role || 'student').count;

  res.json({
    ...d,
    project_count: projectCount,
    real_world_apps: JSON.parse(d.real_world_apps || '[]'),
    industries: JSON.parse(d.industries || '[]'),
    common_problems: JSON.parse(d.common_problems || '[]'),
    important_concepts: JSON.parse(d.important_concepts || '[]'),
    programming_languages: JSON.parse(d.programming_languages || '[]'),
    tools_hardware_software: JSON.parse(d.tools_hardware_software || '{}'),
    beginner_examples: JSON.parse(d.beginner_examples || '[]'),
    intermediate_examples: JSON.parse(d.intermediate_examples || '[]'),
    advanced_examples: JSON.parse(d.advanced_examples || '[]'),
    implementation_steps: JSON.parse(d.implementation_steps || '[]'),
    related_domains: JSON.parse(d.related_domains || '[]'),
    relevant_hackathons: JSON.parse(d.relevant_hackathons || '[]')
  });
});

app.get('/api/departments', (req, res) => {
  const depts = db.prepare(`
    SELECT d.*,
      (SELECT COUNT(*) FROM projects p 
       WHERE (p.branch = d.code OR p.branch LIKE '%' || d.code || '%' OR (d.code = 'ECE' AND (p.branch LIKE '%ECE%' OR p.branch LIKE '%Electronic%')))
       AND (p.verification_status = 'verified' OR ? = 'admin')) as project_count
    FROM departments d
    ORDER BY d.id ASC
  `).all(req.user?.role || 'student');

  res.json(depts);
});

app.get('/api/themes', (req, res) => {
  const themes = db.prepare(`
    SELECT DISTINCT theme FROM projects 
    WHERE theme IS NOT NULL AND theme != '' AND (verification_status = 'verified' OR ? = 'admin')
    ORDER BY theme ASC
  `).all(req.user?.role || 'student');

  res.json(themes.map(t => t.theme));
});

// ==========================================
// 3. PROJECTS CATALOG & FILTERING
// ==========================================
app.get('/api/projects', (req, res) => {
  const {
    q,
    branch,
    domain,
    subdomain,
    theme,
    difficulty,
    purpose,
    category,
    source,
    sort = 'relevant',
    page = 1,
    limit = 24
  } = req.query;

  let conditions = [];
  let params = [];

  // Visibility: unauthenticated & students only see verified
  if (!req.user || req.user.role !== 'admin') {
    conditions.push("p.verification_status = 'verified'");
  } else if (req.query.status) {
    conditions.push("p.verification_status = ?");
    params.push(req.query.status);
  }

  // Branch filtering (Crucial feature):
  // "if i choose a branch without choosing any domain or fields/themes all data from ece same rule consider for other filters also"
  if (branch && branch !== 'all') {
    const b = branch.trim().toUpperCase();
    if (b === 'ECE' || b === 'EC') {
      conditions.push("(UPPER(p.branch) LIKE '%ECE%' OR UPPER(p.branch) LIKE '%ELECTRONIC%')");
    } else if (b === 'CSE' || b === 'CS') {
      conditions.push("(UPPER(p.branch) LIKE '%CSE%' OR UPPER(p.branch) LIKE '%COMPUTER%')");
    } else if (b === 'ELECTRICAL' || b === 'EEE') {
      conditions.push("(UPPER(p.branch) LIKE '%ELECTRICAL%' OR UPPER(p.branch) LIKE '%EEE%')");
    } else if (b === 'INSTRUMENTATION') {
      conditions.push("UPPER(p.branch) LIKE '%INSTRUMENTATION%'");
    } else if (b === 'MECHANICAL') {
      conditions.push("UPPER(p.branch) LIKE '%MECHANICAL%'");
    } else if (b === 'CIVIL') {
      conditions.push("UPPER(p.branch) LIKE '%CIVIL%'");
    } else {
      conditions.push("p.branch = ?");
      params.push(branch);
    }
  }

  // Domain filter
  if (domain && domain !== 'all') {
    conditions.push("(LOWER(p.domain) = LOWER(?) OR LOWER(p.domain) LIKE ?)");
    params.push(domain, `%${domain.toLowerCase()}%`);
  }

  // Subdomain filter
  if (subdomain && subdomain !== 'all') {
    conditions.push("LOWER(p.subdomain) = LOWER(?)");
    params.push(subdomain);
  }

  // Theme / Field filter
  if (theme && theme !== 'all') {
    conditions.push("(LOWER(p.theme) = LOWER(?) OR LOWER(p.theme) LIKE ?)");
    params.push(theme, `%${theme.toLowerCase()}%`);
  }

  // Difficulty filter
  if (difficulty && difficulty !== 'all') {
    conditions.push("LOWER(p.difficulty) = LOWER(?)");
    params.push(difficulty);
  }

  // Purpose / Category filter
  const targetCategory = purpose || category;
  if (targetCategory && targetCategory !== 'all') {
    conditions.push("(LOWER(p.suitable_for) LIKE ?)");
    params.push(`%${targetCategory.toLowerCase()}%`);
  }

  // Source document filter
  if (source && source !== 'all') {
    conditions.push("p.source_document = ?");
    params.push(source);
  }

  // Global search query
  if (q && q.trim()) {
    const term = `%${q.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(p.title) LIKE ? OR
      LOWER(p.project_id) LIKE ? OR
      LOWER(p.problem_statement) LIKE ? OR
      LOWER(p.simple_explanation) LIKE ? OR
      LOWER(p.technologies) LIKE ? OR
      LOWER(p.hardware_required) LIKE ? OR
      LOWER(p.software_required) LIKE ? OR
      LOWER(p.subdomain) LIKE ? OR
      LOWER(p.domain) LIKE ? OR
      LOWER(p.theme) LIKE ?
    )`);
    params.push(term, term, term, term, term, term, term, term, term, term);
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  // Count total matching
  const countSql = `SELECT COUNT(*) as total FROM projects p ${whereClause}`;
  const total = db.prepare(countSql).get(...params).total;

  // Sorting
  let orderBy = 'p.id ASC';
  if (sort === 'newest') {
    orderBy = 'p.id DESC';
  } else if (sort === 'title_asc') {
    orderBy = 'p.title ASC';
  } else if (sort === 'difficulty_asc') {
    orderBy = "CASE p.difficulty WHEN 'Beginner' THEN 1 WHEN 'Intermediate' THEN 2 WHEN 'Advanced' THEN 3 ELSE 4 END ASC";
  } else if (sort === 'difficulty_desc') {
    orderBy = "CASE p.difficulty WHEN 'Advanced' THEN 1 WHEN 'Intermediate' THEN 2 WHEN 'Beginner' THEN 3 ELSE 4 END ASC";
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit) || 24));
  const offset = (pageNum - 1) * pageSize;

  const dataSql = `
    SELECT p.*
    FROM projects p
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const projects = db.prepare(dataSql).all(...params, pageSize, offset);

  res.json({
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    projects: projects.map(formatProjectRecord)
  });
});

// Single Project Details with all 30 line-by-line items & 7-slide structure
app.get('/api/projects/:id', (req, res) => {
  const p = db.prepare(`
    SELECT * FROM projects WHERE id = ? OR project_id = ?
  `).get(req.params.id, req.params.id);

  if (!p) return res.status(404).json({ error: 'Project not found' });

  // If not admin and not verified
  if (p.verification_status !== 'verified' && (!req.user || req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Project is pending verification' });
  }

  const formatted = formatProjectRecord(p);

  // Fetch Domain Details for Section 9 & 10
  const domainInfo = db.prepare('SELECT * FROM domains WHERE name = ? OR LOWER(name) = LOWER(?)').get(p.domain, p.domain);

  // Fetch 3-4 Related Projects
  const related = db.prepare(`
    SELECT id, project_id, title, branch, domain, subdomain, difficulty, technologies, simple_explanation
    FROM projects
    WHERE domain = ? AND id != ? AND verification_status = 'verified'
    LIMIT 4
  `).all(p.domain, p.id).map(formatProjectRecord);

  // Fetch Relevant Hackathons
  const hackathons = db.prepare(`
    SELECT * FROM hackathons
    WHERE domains LIKE '%' || ? || '%' OR departments LIKE '%' || ? || '%'
    LIMIT 3
  `).all(p.domain, p.branch);

  // Generate Suggested 7-Slide Structure tailored to the domain & project
  const slides = generateSlideOutline(p, domainInfo);

  res.json({
    ...formatted,
    domain_info: domainInfo ? {
      ...domainInfo,
      real_world_apps: JSON.parse(domainInfo.real_world_apps || '[]'),
      important_concepts: JSON.parse(domainInfo.important_concepts || '[]'),
      tools_hardware_software: JSON.parse(domainInfo.tools_hardware_software || '{}')
    } : null,
    related_projects: related,
    relevant_hackathons: hackathons,
    slide_structure: slides
  });
});

function formatProjectRecord(p) {
  let custom = {};
  let steps = [];
  try { custom = JSON.parse(p.custom_fields || '{}'); } catch(e) {}
  try { steps = JSON.parse(p.implementation_steps || '[]'); } catch(e) {}

  // Parse technologies, hardware, software into arrays for clean UI pills
  const techList = p.technologies ? p.technologies.split(/[,;•|]/).map(t => t.trim()).filter(Boolean) : [];
  const hwList = p.hardware_required ? p.hardware_required.split(/[,;•|]/).map(h => h.trim()).filter(Boolean) : [];
  const swList = p.software_required ? p.software_required.split(/[,;•|]/).map(s => s.trim()).filter(Boolean) : [];
  const skillsList = p.skills_required ? p.skills_required.split(/[,;•|]/).map(k => k.trim()).filter(Boolean) : [];

  return {
    ...p,
    custom_fields: custom,
    implementation_steps: steps,
    tech_list: techList,
    hw_list: hwList,
    sw_list: swList,
    skills_list: skillsList
  };
}

// 7-Slide Generator (Section 8)
function generateSlideOutline(p, domainInfo) {
  const isVLSI = p.domain && p.domain.toLowerCase().includes('vlsi');
  const isIoT = p.domain && p.domain.toLowerCase().includes('iot');
  const isSec = p.domain && p.domain.toLowerCase().includes('cyber');
  const isDS = p.domain && p.domain.toLowerCase().includes('data');

  let techFlowContent = "Data sensing -> Local microcontroller processing -> Wireless telemetry -> Cloud analytics and dashboard visualization.";
  if (isVLSI) {
    techFlowContent = "Problem specification -> Finite State Machine (FSM) architecture -> Synthesizable Verilog RTL -> Cycle-accurate testbench simulation -> FPGA hardware synthesis.";
  } else if (isSec) {
    techFlowContent = "Threat modeling -> Traffic capture and packet inspection -> Signature & heuristic rules -> Alert triggering -> Incident mitigation checklist.";
  } else if (isDS) {
    techFlowContent = "Raw data ingestion -> Exploratory Data Analysis & cleaning -> Feature engineering -> Model training & hyperparameter tuning -> Evaluation metrics & dashboard.";
  }

  return [
    {
      slide_number: 1,
      title: "1. Introduction & Overview",
      subtitle: "Project Title, Team Members, and Academic Institution",
      key_points: [
        `Project Title: ${p.title}`,
        `Academic Domain: ${p.domain} (${p.subdomain || 'General'})`,
        `Branch / Department: ${p.branch}`,
        `Brief Overview: ${p.simple_explanation.slice(0, 160)}...`
      ]
    },
    {
      slide_number: 2,
      title: "2. Problem Statement & Real-World Impact",
      subtitle: "The Challenge Faced and Why It Matters",
      key_points: [
        `Official Problem Statement: ${p.problem_statement}`,
        `Who is Affected: ${p.who_affected || 'Students, industry workers, and target beneficiaries'}`,
        `Why This Problem Matters: ${p.why_matters || 'Directly causes inefficiencies, safety risks, or resource wastage'}`,
        `Gaps in Current Solutions: ${p.gaps_in_existing || 'High cost, lack of automation, or slow manual response'}`
      ]
    },
    {
      slide_number: 3,
      title: "3. Proposed Solution",
      subtitle: "The Core Technical Approach We Are Building",
      key_points: [
        `Proposed Solution: ${p.proposed_approach || p.simple_explanation}`,
        `Expected Output: ${p.expected_output}`,
        `Target Difficulty Level: ${p.difficulty}`,
        `Novelty / Differentiator: Lightweight, cost-effective, and reproducible student implementation`
      ]
    },
    {
      slide_number: 4,
      title: "4. Technical Flow & System Architecture",
      subtitle: "How the System Operates End-to-End",
      key_points: [
        `Architectural Flow: ${techFlowContent}`,
        `Input Mechanism: Sensors, user inputs, or historical dataset records`,
        `Processing Core: Logic algorithms, state machines, or predictive machine learning models`,
        `Output / Actuation: Alerts, physical actuation, dashboard displays, or reports`
      ]
    },
    {
      slide_number: 5,
      title: "5. Implementation Technologies & Tools",
      subtitle: "Hardware, Software, and Prerequisites",
      key_points: [
        `Key Technologies: ${p.technologies || 'Not specified'}`,
        `Hardware Tools: ${p.hardware_required || 'Standard PC / Laptop'}`,
        `Software & Libraries: ${p.software_required || 'Python / C++ / Web tools'}`,
        `Prerequisite Knowledge: ${p.skills_required || 'Basic programming and domain concepts'}`
      ]
    },
    {
      slide_number: 6,
      title: "6. Expected Results, Impact & Feasibility",
      subtitle: "Validation Plan, Practical Feasibility, and Metrics",
      key_points: [
        `Expected Deliverable: ${p.expected_output}`,
        `Feasibility Analysis: Tested using accessible lab components and open-source toolchains`,
        `Validation Plan: Unit testing, baseline comparisons, and stress tests under simulated conditions`,
        `Known Limitations: ${p.limitations_challenges || 'Battery life, noise interference, or dataset constraints'}`
      ]
    },
    {
      slide_number: 7,
      title: "7. Conclusion & Future Scope",
      subtitle: "Key Takeaways and Next Engineering Horizons",
      key_points: [
        `Key Takeaway: Functional proof-of-concept addressing the real-world problem effectively`,
        `Future Scope: ${p.future_scope || 'Cloud scaling, industrial ruggedization, and edge intelligence integration'}`,
        `Source Citation: ${p.source_reference || p.source_document}`,
        `Verification Status: Curated and verified in GURU database`
      ]
    }
  ];
}

// ==========================================
// 4. IDEA ANALYZER ROUTE (Page 5)
// ==========================================
app.post('/api/idea/analyze', (req, res) => {
  const { idea_text } = req.body;
  if (!idea_text || !idea_text.trim()) {
    return res.status(400).json({ error: 'Please enter a project idea to analyze' });
  }

  const text = idea_text.trim().toLowerCase();

  // Intelligent domain detection matching engineering taxonomy
  let domain = "Smart Automation";
  let branch = "ECE / CSE";
  let subdomain = "Intelligent Control";
  let whyFit = "The idea involves automated decision making from sensory feedback to control actuators.";
  let possibleTech = ["ESP32 / Arduino", "Sensors", "Relay drivers", "Python / C++", "Web Dashboard"];
  let theme = "General Engineering";

  if (text.includes('chip') || text.includes('vlsi') || text.includes('fpga') || text.includes('verilog') || text.includes('transistor') || text.includes('logic gate') || text.includes('alu') || text.includes('vhdl')) {
    domain = "VLSI";
    branch = "ECE";
    subdomain = "Digital Logic / ASIC Prototyping";
    whyFit = "The idea requires custom digital hardware logic synthesis, low power consumption at silicon level, and hardware verification.";
    possibleTech = ["Verilog HDL", "Xilinx Vivado", "ModelSim", "Basys 3 FPGA", "Digital Logic"];
    theme = "Semiconductor Design";
  } else if (text.includes('soil') || text.includes('water') || text.includes('irrigat') || text.includes('plant') || text.includes('farm') || text.includes('crop') || text.includes('agricult')) {
    domain = "Internet of Things (IoT)";
    branch = "ECE / CSE";
    subdomain = "Smart Agriculture";
    whyFit = "Agricultural automation relies on distributed environmental sensing (moisture, temperature) combined with remote wireless telemetry.";
    possibleTech = ["Soil Moisture Sensor", "ESP32", "Solenoid Valve Relay", "MQTT / HTTP", "Blynk / Web Dashboard"];
    theme = "Agriculture";
  } else if (text.includes('robot') || text.includes('rover') || text.includes('arm') || text.includes('motor') || text.includes('lidar') || text.includes('gripper') || text.includes('wheelchair') || text.includes('slam')) {
    domain = "Robotics";
    branch = "ECE / CSE / Mechanical";
    subdomain = "Autonomous Mobile Robotics";
    whyFit = "The system combines mechanical kinematics, sensory perception, and motor control loops to interact physically with the real world.";
    possibleTech = ["ROS 2", "Python / C++", "LiDAR / Ultrasonic", "Motor Drivers", "Raspberry Pi / Jetson"];
    theme = "Industrial Automation & Robotics";
  } else if (text.includes('security') || text.includes('hack') || text.includes('phish') || text.includes('cipher') || text.includes('vulnerab') || text.includes('malware') || text.includes('firewall') || text.includes('encrypt') || text.includes('scam')) {
    domain = "Cybersecurity";
    branch = "CSE / ECE";
    subdomain = "Network Security & Vulnerability Assessment";
    whyFit = "The idea focuses on finding vulnerabilities, hardening endpoints, or preventing fraudulent attacks in networked systems.";
    possibleTech = ["Python", "Wireshark", "Nmap", "OWASP ZAP", "Cryptography libraries", "Flask / FastAPI"];
    theme = "Safety and Security";
  } else if (text.includes('sales') || text.includes('churn') || text.includes('predict') || text.includes('dataset') || text.includes('sentiment') || text.includes('customer') || text.includes('recommend') || text.includes('nlp')) {
    domain = "Data Science";
    branch = "CSE";
    subdomain = "Predictive Modeling & Analytics";
    whyFit = "The challenge requires analyzing historical data patterns to extract predictive insights or classify unstructured text.";
    possibleTech = ["Python", "Pandas", "Scikit-Learn", "Matplotlib", "FastAPI / Streamlit", "Jupyter Notebook"];
    theme = "Business Analytics";
  } else if (text.includes('wireless') || text.includes('radio') || text.includes('antenna') || text.includes('5g') || text.includes('lora') || text.includes('telecom') || text.includes('satellite') || text.includes('spectrum')) {
    domain = "Communication Systems";
    branch = "ECE";
    subdomain = "Wireless Networks & Telemetry";
    whyFit = "The project requires long-range or high-throughput signal modulation, transmission across physical obstacles, and protocol design.";
    possibleTech = ["Software-Defined Radio (SDR)", "GNU Radio", "LoRa SX1276", "MATLAB", "Wireshark"];
    theme = "Telecommunications";
  } else if (text.includes('quantum') || text.includes('qubit') || text.includes('qiskit') || text.includes('entangle')) {
    domain = "Quantum Computing";
    branch = "CSE / ECE";
    subdomain = "Quantum Algorithms & Optimization";
    whyFit = "Exploits superposition and quantum entanglement to solve high-complexity combinatorial or molecular simulations.";
    possibleTech = ["Python", "Qiskit", "PennyLane", "Quantum Simulators", "Jupyter"];
    theme = "Emerging Computing";
  } else if (text.includes('wearable') || text.includes('health') || text.includes('heart') || text.includes('ecg') || text.includes('spo2') || text.includes('hospital') || text.includes('patient') || text.includes('medical')) {
    domain = "Embedded Systems";
    branch = "ECE / CSE";
    subdomain = "Medical / Healthcare Embedded Devices";
    whyFit = "Requires precise low-power physiological sensor reading, real-time alert thresholds, and safe non-invasive human monitoring.";
    possibleTech = ["MAX30102 PPG", "ESP32 / nRF52", "BLE GATT", "Analog Filters", "Mobile Dashboard"];
    theme = "Healthcare";
  }

  // Find 3 matching projects from the GURU database
  const matchingProjects = db.prepare(`
    SELECT id, project_id, title, branch, domain, subdomain, difficulty, simple_explanation, technologies
    FROM projects
    WHERE domain = ? AND verification_status = 'verified'
    LIMIT 3
  `).all(domain).map(formatProjectRecord);

  // Relevant hackathons
  const hackathons = db.prepare(`
    SELECT * FROM hackathons
    WHERE domains LIKE '%' || ? || '%'
    LIMIT 2
  `).all(domain);

  res.json({
    original_idea: idea_text,
    idea_explained_simply: `You want to create a system that automates or addresses this real-world task: "${idea_text}". This can be translated into a structured engineering project using sensor inputs, digital processing, and actuation/alerts.`,
    underlying_problem: `The primary real-world issue is the reliance on slow manual checks, unassisted physical labor, or lack of timely alerts, leading to delayed response or resource loss.`,
    suggested_problem_statement: `Develop a reliable, cost-effective ${domain}-based system that monitors key operational parameters and executes automated control or alerts to solve this issue.`,
    suggested_branch: branch,
    suggested_domain: domain,
    suggested_subdomain: subdomain,
    why_domain_fits: whyFit,
    suggested_theme: theme,
    possible_technologies: possibleTech,
    suggested_approach: `1. Select required hardware sensors/inputs\n2. Develop firmware or software processing pipeline\n3. Implement threshold/model logic\n4. Connect to local display or web dashboard\n5. Test and record error/delay metrics.`,
    variations: {
      beginner: "Build a single-node prototype using Arduino or basic Python script with direct local sensor feedback.",
      intermediate: "Add wireless telemetry (Wi-Fi/LoRa/MQTT), interactive web dashboard, and automated alerts.",
      advanced: "Integrate edge-AI predictive models, secure cryptographic authentication, and multi-node mesh networking."
    },
    potential_limitations: "Environmental interference, sensor drift over time, power supply requirements, and wireless connectivity ranges.",
    matching_projects: matchingProjects,
    relevant_hackathons: hackathons,
    suggested_slide_structure: [
      { slide_number: 1, title: "1. Introduction", subtitle: "Project Name and Team Roles" },
      { slide_number: 2, title: "2. Problem Statement", subtitle: "What problem exists and who faces it" },
      { slide_number: 3, title: "3. Proposed Solution", subtitle: "Our engineered approach" },
      { slide_number: 4, title: "4. Tech Flow & Architecture", subtitle: "Sensors -> Processing -> Output" },
      { slide_number: 5, title: "5. Technologies & Hardware", subtitle: possibleTech.join(', ') },
      { slide_number: 6, title: "6. Feasibility & Expected Results", subtitle: "Prototype demonstration and validation" },
      { slide_number: 7, title: "7. Conclusion & Next Steps", subtitle: "Key takeaways and future extensions" }
    ]
  });
});

// ==========================================
// 5. STUDENT SUBMISSION & ADMIN APPROVAL (Section 6)
// ==========================================
app.post('/api/submissions', (req, res) => {
  const {
    title,
    problem_statement,
    detailed_description,
    why_matters,
    department,
    domain,
    subdomain,
    theme,
    suggested_solution,
    required_tech,
    expected_outcome,
    reference_links,
    student_name,
    student_email
  } = req.body;

  if (!title || !problem_statement) {
    return res.status(400).json({ error: 'Problem title and problem statement are required' });
  }

  // Generate unique submission ID
  const subCount = db.prepare('SELECT COUNT(*) as c FROM student_submissions').get().c;
  const submission_id = `GURU-SUB-${String(subCount + 1001)}`;

  const userId = req.user ? req.user.id : null;
  const sName = student_name || (req.user ? req.user.name : 'Anonymous Student');
  const sEmail = student_email || (req.user ? req.user.email : 'student@guru.edu');

  const result = db.prepare(`
    INSERT INTO student_submissions (
      submission_id, user_id, student_name, student_email, title, problem_statement,
      detailed_description, why_matters, department, domain, subdomain, theme,
      suggested_solution, required_tech, expected_outcome, reference_links, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
  `).run(
    submission_id, userId, sName, sEmail, title, problem_statement,
    detailed_description || '', why_matters || '', department || 'ECE', domain || 'Embedded Systems',
    subdomain || 'General', theme || 'General Engineering', suggested_solution || '',
    required_tech || '', expected_outcome || '', reference_links || ''
  );

  // Log audit
  db.prepare(`
    INSERT INTO audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('CREATE_SUBMISSION', 'student_submission', ?, ?, ?)
  `).run(submission_id, userId, `Student submitted problem: ${title}`);

  res.status(201).json({
    message: 'Problem statement submitted successfully! It has been received and queued for admin review.',
    submission_id,
    id: result.lastInsertRowid,
    status: 'submitted'
  });
});

app.get('/api/submissions', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    // Admin sees all submissions
    const list = db.prepare('SELECT * FROM student_submissions ORDER BY id DESC').all();
    return res.json(list);
  }

  // Students see their own submissions
  const list = db.prepare(`
    SELECT * FROM student_submissions 
    WHERE user_id = ? OR student_email = ?
    ORDER BY id DESC
  `).all(req.user.id, req.user.email);
  res.json(list);
});

// Admin reviews and approves/rejects submission
app.put('/api/submissions/:id/review', requireAdmin, (req, res) => {
  const { status, admin_notes, publish_to_catalog } = req.body;
  const subId = req.params.id;

  const sub = db.prepare('SELECT * FROM student_submissions WHERE id = ? OR submission_id = ?').get(subId, subId);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  db.prepare(`
    UPDATE student_submissions 
    SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, admin_notes || '', sub.id);

  // If approved and publish requested, add to official projects catalog!
  if (status === 'approved' && publish_to_catalog) {
    const existing = db.prepare('SELECT id FROM projects WHERE project_id = ?').get(sub.submission_id);
    if (!existing) {
      db.prepare(`
        INSERT INTO projects (
          project_id, title, branch, domain, subdomain, theme, problem_statement,
          simple_explanation, detailed_description, why_matters, who_affected,
          difficulty, technologies, hardware_required, software_required,
          skills_required, expected_output, suitable_for, proposed_approach,
          source_document, source_reference, source_type, is_verified, verification_status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          'Intermediate', ?, 'Standard lab equipment', 'Open-source software',
          'Programming & Hardware interfacing', ?, 'Student Innovation / Mini Project', ?,
          'Student Submission', ?, 'Verified Student Submission', 1, 'verified'
        )
      `).run(
        sub.submission_id, sub.title, sub.department, sub.domain, sub.subdomain, sub.theme, sub.problem_statement,
        sub.detailed_description || sub.problem_statement, sub.detailed_description || '', sub.why_matters || '',
        'Target community & stakeholders', sub.required_tech || 'Microcontroller / Web', sub.expected_outcome || 'Working prototype',
        sub.suggested_solution || '', `Submitted by ${sub.student_name} (${sub.submission_id})`
      );
    }
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('REVIEW_SUBMISSION', 'student_submission', ?, ?, ?)
  `).run(sub.submission_id, req.user.id, `Status updated to ${status}. Notes: ${admin_notes || 'None'}`);

  res.json({ message: `Submission updated to ${status}`, sub_id: sub.submission_id, status });
});

// ==========================================
// 6. COLLABORATOR DISCOVERY (Page 9)
// ==========================================
app.get('/api/collaborators', (req, res) => {
  const { skill, department, domain, role } = req.query;
  let sql = 'SELECT * FROM collaborator_profiles WHERE 1=1';
  let params = [];

  if (skill) {
    sql += ' AND (LOWER(technical_skills) LIKE ? OR LOWER(tools_known) LIKE ?)';
    params.push(`%${skill.toLowerCase()}%`, `%${skill.toLowerCase()}%`);
  }
  if (department && department !== 'all') {
    sql += ' AND LOWER(department) = LOWER(?)';
    params.push(department);
  }
  if (domain && domain !== 'all') {
    sql += ' AND LOWER(domains_of_interest) LIKE ?';
    params.push(`%${domain.toLowerCase()}%`);
  }
  if (role && role !== 'all') {
    sql += ' AND LOWER(preferred_role) LIKE ?';
    params.push(`%${role.toLowerCase()}%`);
  }

  const profiles = db.prepare(sql).all(...params);
  res.json(profiles);
});

app.post('/api/collaborators/profile', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in to create or edit your profile' });

  const {
    display_name,
    department,
    domains_of_interest,
    technical_skills,
    tools_known,
    project_interests,
    preferred_role,
    availability,
    collaboration_preference
  } = req.body;

  db.prepare(`
    INSERT OR REPLACE INTO collaborator_profiles (
      user_id, display_name, department, domains_of_interest, technical_skills,
      tools_known, project_interests, preferred_role, availability, collaboration_preference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    display_name || req.user.name,
    department || req.user.department || 'ECE',
    domains_of_interest || '',
    technical_skills || '',
    tools_known || '',
    project_interests || '',
    preferred_role || 'Developer',
    availability || 'Flexible (5-10 hrs/week)',
    collaboration_preference || 'Hackathons & Mini Projects'
  );

  res.json({ message: 'Profile saved successfully' });
});

app.post('/api/collaborators/request', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in to send a collaboration request' });
  const { receiver_id, project_id, project_title, message, role_needed } = req.body;

  if (!receiver_id) return res.status(400).json({ error: 'Receiver ID is required' });

  db.prepare(`
    INSERT INTO collaboration_requests (
      sender_id, sender_name, receiver_id, project_id, project_title, message, role_needed, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    req.user.id, req.user.name, receiver_id, project_id || '', project_title || '',
    message || 'Hi, I would love to team up on this project!', role_needed || 'Teammate'
  );

  res.json({ message: 'Collaboration request sent successfully!' });
});

app.get('/api/collaborators/my-requests', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  const sent = db.prepare(`
    SELECT r.*, c.display_name as receiver_name, c.department as receiver_department
    FROM collaboration_requests r
    LEFT JOIN collaborator_profiles c ON r.receiver_id = c.user_id
    WHERE r.sender_id = ?
    ORDER BY r.id DESC
  `).all(req.user.id);

  const received = db.prepare(`
    SELECT r.*
    FROM collaboration_requests r
    WHERE r.receiver_id = ?
    ORDER BY r.id DESC
  `).all(req.user.id);

  res.json({ sent, received });
});

app.put('/api/collaborators/request/:id', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const { status } = req.body;
  const reqId = req.params.id;

  db.prepare(`
    UPDATE collaboration_requests 
    SET status = ? 
    WHERE id = ? AND receiver_id = ?
  `).run(status, reqId, req.user.id);

  res.json({ message: `Request ${status}` });
});

// ==========================================
// 7. BOOKMARKS & DASHBOARD ROUTES
// ==========================================
app.get('/api/bookmarks', (req, res) => {
  if (!req.user) return res.json([]);
  const bookmarks = db.prepare(`
    SELECT p.*, b.saved_at
    FROM saved_projects b
    JOIN projects p ON b.project_id = p.project_id
    WHERE b.user_id = ?
    ORDER BY b.saved_at DESC
  `).all(req.user.id).map(formatProjectRecord);

  res.json(bookmarks);
});

app.post('/api/bookmarks/toggle', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const { project_id } = req.body;
  if (!project_id) return res.status(400).json({ error: 'Project ID is required' });

  const existing = db.prepare('SELECT id FROM saved_projects WHERE user_id = ? AND project_id = ?').get(req.user.id, project_id);
  if (existing) {
    db.prepare('DELETE FROM saved_projects WHERE id = ?').run(existing.id);
    return res.json({ saved: false, message: 'Removed from saved projects' });
  } else {
    db.prepare('INSERT INTO saved_projects (user_id, project_id) VALUES (?, ?)').run(req.user.id, project_id);
    return res.json({ saved: true, message: 'Project saved to dashboard' });
  }
});

// ==========================================
// 8. HACKATHONS ROUTES
// ==========================================
app.get('/api/hackathons', (req, res) => {
  const { department, domain, mode, status } = req.query;
  let sql = 'SELECT * FROM hackathons WHERE 1=1';
  let params = [];

  if (department && department !== 'all') {
    sql += ' AND departments LIKE ?';
    params.push(`%${department}%`);
  }
  if (domain && domain !== 'all') {
    sql += ' AND domains LIKE ?';
    params.push(`%${domain}%`);
  }
  if (mode && mode !== 'all') {
    sql += ' AND LOWER(mode) LIKE ?';
    params.push(`%${mode.toLowerCase()}%`);
  }
  if (status && status !== 'all') {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY id ASC';
  const list = db.prepare(sql).all(...params);
  res.json(list);
});

app.post('/api/hackathons', requireAdmin, (req, res) => {
  const {
    title, organizer, official_link, tracks, domains, departments,
    themes, mode, eligibility, registration_deadline, event_dates, location, team_size
  } = req.body;

  const result = db.prepare(`
    INSERT INTO hackathons (
      title, organizer, official_link, tracks, domains, departments,
      themes, mode, eligibility, registration_deadline, event_dates, location, team_size, status, verified, last_verified_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 1, date('now'))
  `).run(
    title, organizer, official_link, tracks || '', domains || '', departments || '',
    themes || '', mode || 'Hybrid', eligibility || 'Open to all students', registration_deadline || 'Check official website',
    event_dates || 'Upcoming', location || 'Virtual / Hybrid', team_size || '2-4 members'
  );

  res.status(201).json({ id: result.lastInsertRowid, message: 'Hackathon added successfully' });
});

// ==========================================
// 9. ADMIN DASHBOARD & DOCUMENT INGESTION
// ==========================================
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const totalProjects = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  const verifiedProjects = db.prepare("SELECT COUNT(*) as c FROM projects WHERE verification_status = 'verified'").get().c;
  const pendingSubmissions = db.prepare("SELECT COUNT(*) as c FROM student_submissions WHERE status = 'submitted'").get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalImportJobs = db.prepare('SELECT COUNT(*) as c FROM document_import_jobs').get().c;

  const domainBreakdown = db.prepare('SELECT domain, COUNT(*) as count FROM projects GROUP BY domain ORDER BY count DESC').all();
  const branchBreakdown = db.prepare('SELECT branch, COUNT(*) as count FROM projects GROUP BY branch ORDER BY count DESC').all();

  res.json({
    totalProjects,
    verifiedProjects,
    pendingSubmissions,
    totalUsers,
    totalImportJobs,
    domainBreakdown,
    branchBreakdown
  });
});

app.get('/api/admin/import-jobs', requireAdmin, (req, res) => {
  const jobs = db.prepare('SELECT * FROM document_import_jobs ORDER BY id DESC').all();
  res.json(jobs.map(j => ({
    ...j,
    report: JSON.parse(j.report_json || '{}')
  })));
});

// Document Upload & Ingestion
app.post('/api/admin/import-document', requireAdmin, upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const filename = req.file.originalname;
  const fileExt = path.extname(filename).toLowerCase();
  const fileSize = req.file.size;

  // Execute Python parser script on uploaded file
  const pyScript = path.join(__dirname, '..', 'ingestion', 'parse_uploaded_doc.py');

  exec(`python3 "${pyScript}" "${filePath}" "${filename}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Document ingestion error:', err, stderr);
      db.prepare(`
        INSERT INTO document_import_jobs (
          filename, file_type, file_size, total_extracted, duplicates_found, errors_count, missing_fields_flagged, status, report_json
        ) VALUES (?, ?, ?, 0, 0, 1, 0, 'failed', ?)
      `).run(filename, fileExt.replace('.', '').toUpperCase(), fileSize, JSON.stringify({ error: stderr || err.message }));

      return res.status(500).json({
        error: 'Failed to process document',
        details: stderr || err.message
      });
    }

    try {
      const result = JSON.parse(stdout);
      
      // Save import job
      db.prepare(`
        INSERT INTO document_import_jobs (
          filename, file_type, file_size, total_extracted, duplicates_found, errors_count, missing_fields_flagged, status, report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'success', ?)
      `).run(
        filename,
        fileExt.replace('.', '').toUpperCase(),
        fileSize,
        result.total_extracted || 0,
        result.duplicates_found || 0,
        result.errors_count || 0,
        result.missing_fields_flagged || 0,
        JSON.stringify(result)
      );

      res.json({
        message: 'Document successfully parsed and ingested into GURU database',
        report: result
      });
    } catch (parseErr) {
      res.json({
        message: 'Document uploaded and analyzed',
        stdout: stdout
      });
    }
  });
});

// Admin Project CRUD
app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p.title || !p.problem_statement) {
    return res.status(400).json({ error: 'Title and problem statement are required' });
  }

  const pId = p.project_id || `GURU-ADM-${Date.now().toString().slice(-4)}`;
  try {
    const result = db.prepare(`
      INSERT INTO projects (
        project_id, title, branch, domain, subdomain, theme, problem_statement,
        simple_explanation, detailed_description, why_matters, who_affected,
        difficulty, technologies, hardware_required, software_required,
        skills_required, expected_output, suitable_for, existing_solutions,
        gaps_in_existing, proposed_approach, implementation_steps,
        limitations_challenges, future_scope, source_document, source_reference,
        source_type, is_verified, verification_status, custom_fields
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, 'Admin Manual Entry', 'Administrator',
        'Admin Created', 1, 'verified', ?
      )
    `).run(
      pId, p.title, p.branch || 'ECE', p.domain || 'Embedded Systems', p.subdomain || 'General',
      p.theme || 'General', p.problem_statement, p.simple_explanation || p.problem_statement,
      p.detailed_description || '', p.why_matters || '', p.who_affected || '',
      p.difficulty || 'Intermediate', p.technologies || '', p.hardware_required || '',
      p.software_required || '', p.skills_required || '', p.expected_output || '',
      p.suitable_for || 'Mini Project', p.existing_solutions || '', p.gaps_in_existing || '',
      p.proposed_approach || '', JSON.stringify(p.implementation_steps || []),
      p.limitations_challenges || '', p.future_scope || '', JSON.stringify(p.custom_fields || {})
    );

    res.status(201).json({ id: result.lastInsertRowid, project_id: pId, message: 'Project created successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const p = req.body;
  const id = req.params.id;

  try {
    db.prepare(`
      UPDATE projects SET
        title = COALESCE(?, title),
        branch = COALESCE(?, branch),
        domain = COALESCE(?, domain),
        subdomain = COALESCE(?, subdomain),
        theme = COALESCE(?, theme),
        problem_statement = COALESCE(?, problem_statement),
        simple_explanation = COALESCE(?, simple_explanation),
        difficulty = COALESCE(?, difficulty),
        technologies = COALESCE(?, technologies),
        hardware_required = COALESCE(?, hardware_required),
        software_required = COALESCE(?, software_required),
        skills_required = COALESCE(?, skills_required),
        expected_output = COALESCE(?, expected_output),
        verification_status = COALESCE(?, verification_status),
        custom_fields = COALESCE(?, custom_fields),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR project_id = ?
    `).run(
      p.title, p.branch, p.domain, p.subdomain, p.theme, p.problem_statement,
      p.simple_explanation, p.difficulty, p.technologies, p.hardware_required,
      p.software_required, p.skills_required, p.expected_output,
      p.verification_status, p.custom_fields ? JSON.stringify(p.custom_fields) : null,
      id, id
    );

    res.json({ message: 'Project updated successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM projects WHERE id = ? OR project_id = ?').run(id, id);
  res.json({ message: 'Project deleted successfully' });
});

// Admin Manage Domains and Themes
app.post('/api/admin/domains', requireAdmin, (req, res) => {
  const d = req.body;
  if (!d.name || !d.code) return res.status(400).json({ error: 'Domain name and code are required' });

  db.prepare(`
    INSERT INTO domains (
      name, code, branch_association, full_form, simple_definition, beginner_explanation,
      why_exists, main_purpose, real_world_apps, industries, common_problems,
      important_concepts, programming_languages, tools_hardware_software,
      beginner_examples, intermediate_examples, advanced_examples,
      implementation_steps, expected_outcomes, limitations_challenges,
      related_domains, relevant_hackathons, icon
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?
    )
  `).run(
    d.name, d.code, d.branch_association || 'ECE / CSE', d.full_form || d.name,
    d.simple_definition || '', d.beginner_explanation || '', d.why_exists || '',
    d.main_purpose || '', JSON.stringify(d.real_world_apps || []), JSON.stringify(d.industries || []),
    JSON.stringify(d.common_problems || []), JSON.stringify(d.important_concepts || []),
    JSON.stringify(d.programming_languages || []), JSON.stringify(d.tools_hardware_software || {}),
    JSON.stringify(d.beginner_examples || []), JSON.stringify(d.intermediate_examples || []),
    JSON.stringify(d.advanced_examples || []), JSON.stringify(d.implementation_steps || []),
    d.expected_outcomes || '', d.limitations_challenges || '',
    JSON.stringify(d.related_domains || []), JSON.stringify(d.relevant_hackathons || []),
    d.icon || 'layers'
  );

  res.status(201).json({ message: 'Domain added successfully' });
});

// Serve frontend static build if present
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`GURU API Server running on port ${PORT}`);
});
