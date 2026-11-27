import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Search, 
  Cpu, 
  Terminal, 
  Zap, 
  Wrench, 
  Sparkles, 
  Layers, 
  Bookmark, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Presentation, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Filter,
  Flame,
  Check,
  Copy,
  X
} from 'lucide-react';
import { Project, DomainGuide, User } from '../types';
import { api, setStoredToken } from '../api';

interface GuidedRedesignViewProps {
  user: User | null;
  onSetUser: (user: User | null) => void;
  domains: DomainGuide[];
  savedProjectIds: Set<string>;
  onToggleSave: (projectId: string) => void;
  onOpenSlideModal?: (project: Project) => void;
  onNavigateDevelop: (project: Project) => void;
  onFindCollaborators: (project: Project) => void;
  initialDomain?: string | null;
  initialBranch?: string | null;
  onStepChange?: (step: number) => void;
  stepBackTrigger?: number;
}

export const GuidedRedesignView: React.FC<GuidedRedesignViewProps> = ({
  user,
  onSetUser,
  domains,
  savedProjectIds,
  onToggleSave,
  onOpenSlideModal,
  onNavigateDevelop,
  onFindCollaborators,
  initialDomain,
  initialBranch,
  onStepChange,
  stepBackTrigger
}) => {
  // Step State: 1 = Branch, 2 = Domain, 3 = Project Suggestions, 4 = Project Details
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 & 2 State
  const [selectedBranch, setSelectedBranch] = useState<string>('ECE');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Inline 7-Slide Pitch Outline State
  const [showInlineSlides, setShowInlineSlides] = useState(false);
  const [activeInlineSlide, setActiveInlineSlide] = useState(0);
  const [copiedSlideDeck, setCopiedSlideDeck] = useState(false);

  // Handle Domain redirect from external pages (like Domain Guides)
  useEffect(() => {
    if (initialDomain) {
      if (initialBranch) {
        setSelectedBranch(initialBranch);
      }
      setSelectedDomain(initialDomain);
      setCurrentStep(3);
    }
  }, [initialDomain, initialBranch]);

  // Handle floating back button step trigger
  useEffect(() => {
    if (stepBackTrigger && stepBackTrigger > 0) {
      setCurrentStep(prev => Math.max(1, prev - 1));
      setShowInlineSlides(false);
    }
  }, [stepBackTrigger]);

  // Notify parent of step change for navigation
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Step 3 Catalogue State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Step 4 Selected Project Details State
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showRemainingDetails, setShowRemainingDetails] = useState(false);

  // More Problems in Domain State
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);

  // Problem Session Drawer State
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [savedProjectsList, setSavedProjectsList] = useState<Project[]>([]);

  // Load Saved Projects for Problem Session
  useEffect(() => {
    if (savedProjectIds.size > 0) {
      api.getBookmarks().then(setSavedProjectsList).catch(() => {});
    } else {
      setSavedProjectsList([]);
    }
  }, [savedProjectIds]);

  // Branch Options List
  const branches = [
    {
      code: 'ECE',
      name: 'Electronics & Communication Engineering',
      short: 'ECE',
      icon: <Cpu size={28} />,
      desc: 'Hardware design, Embedded Systems, VLSI/ULSI, IoT Nodes, Wireless Telecom & Robotics.',
      chips: ['FPGA & RTL', 'STM32 / ESP32', 'LoRaWAN & 5G', 'Verilog', 'Sensors & Actuators'],
      count: '132 Verified Problems'
    },
    {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      short: 'CSE',
      icon: <Terminal size={28} />,
      desc: 'Data Science, Machine Learning, Cybersecurity, Cloud IoT platforms, Intelligent Automation & Quantum Algorithms.',
      chips: ['PyTorch / Scikit', 'Ethical Hacking', 'Qiskit Quantum', 'Distributed Systems', 'FastAPI'],
      count: '225 Verified Problems'
    },
    {
      code: 'Electrical',
      name: 'Electrical & Electronics (EEE)',
      short: 'EEE',
      icon: <Zap size={28} />,
      desc: 'Smart grid telemetry, power electronics, motor drive controllers, solar telemetry & instrumentation.',
      chips: ['Power Converters', 'Battery Management', 'CAN Bus', 'Simulink', 'Microcontrollers'],
      count: '65 Verified Problems'
    },
    {
      code: 'Mechanical',
      name: 'Mechanical & Mechatronics',
      short: 'MECH',
      icon: <Wrench size={28} />,
      desc: 'Autonomous mobile robots, actuator kinematics, industrial automation & cyber-physical systems.',
      chips: ['ROS', 'Kinematics', 'Motor Drives', 'SolidWorks', 'PLC Automation'],
      count: '22 Verified Problems'
    },
    {
      code: 'Emerging',
      name: 'Multidisciplinary & Hackathons',
      short: 'SIH',
      icon: <Sparkles size={28} />,
      desc: 'Smart India Hackathon (SIH 2026), Amaravati Quantum Valley (QAIC), Agriculture & Health tech.',
      chips: ['SIH 2026', 'e-NAM Mandi', 'Quantum Climate', 'Bio-Informatics', 'Smart Cities'],
      count: '51 Verified Problems'
    }
  ];

  // Strictly Filter Domains according to Selected Branch:
  // "if I select ECE section then I need domains of ECE only if I select CSE domain then I need only CSE domain"
  const getBranchDomains = (branchCode: string): DomainGuide[] => {
    const b = branchCode.toUpperCase();
    return domains.filter(d => {
      const name = d.name.toLowerCase();
      if (b === 'ECE') {
        // Only ECE domains
        return (
          name.includes('embedded') ||
          name.includes('vlsi') ||
          name.includes('communication') ||
          name.includes('iot') ||
          name.includes('internet of things') ||
          name.includes('robotics') ||
          (name.includes('smart automation') && !name.includes('data'))
        ) && !name.includes('data science') && !name.includes('quantum');
      }
      if (b === 'CSE') {
        // Only CSE domains
        return (
          name.includes('data science') ||
          name.includes('cybersecurity') ||
          name.includes('quantum') ||
          name.includes('smart automation') ||
          name.includes('iot') ||
          name.includes('internet of things')
        ) && !name.includes('vlsi') && !name.includes('communication');
      }
      if (b === 'ELECTRICAL') {
        return name.includes('embedded') || name.includes('smart automation') || name.includes('iot');
      }
      if (b === 'MECHANICAL') {
        return name.includes('robotics') || name.includes('smart automation');
      }
      return true;
    });
  };

  const branchFilteredDomains = getBranchDomains(selectedBranch);

  // Fetch Projects for Step 3
  useEffect(() => {
    if (currentStep === 3) {
      loadProjects();
    }
  }, [currentStep, selectedBranch, selectedDomain, searchQuery, selectedDifficulty, selectedTrack]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await api.getProjects({
        q: searchQuery,
        branch: selectedBranch,
        domain: selectedDomain === 'all' ? undefined : selectedDomain,
        difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        purpose: selectedTrack === 'all' ? undefined : selectedTrack,
        limit: 50
      });
      setProjects(res.projects);
      setTotalCount(res.total);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load Single Project Details for Step 4
  useEffect(() => {
    if (selectedProjectId) {
      loadSingleProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadSingleProject = async (id: string | number) => {
    setLoadingDetails(true);
    try {
      const p = await api.getProject(id);
      setSelectedProject(p);
      setShowRemainingDetails(false);
      // Load more problems from the same domain
      if (p.domain) {
        api.getProjects({ domain: p.domain, limit: 6 }).then(res => {
          setRelatedProjects(res.projects.filter(item => item.id !== p.id));
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to load single project:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Step 1: Handle Branch Select
  const handleSelectBranch = (bCode: string) => {
    setSelectedBranch(bCode);
    setSelectedDomain('all');
    setCurrentStep(2);
  };

  // Step 2: Handle Domain Select
  const handleSelectDomain = (domainName: string) => {
    setSelectedDomain(domainName);
    setCurrentStep(3);
  };

  // Step 3: Handle Choose Problem Statement
  const handleChooseProblem = (p: Project) => {
    setSelectedProjectId(p.id);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* =========================================================
          INTERACTIVE STEP PROGRESS BAR (Steps 1 to 4)
          ========================================================= */}
      <div className="workflow-stepper">
        <div className="container">
          <div className="stepper-nav">
            
            {/* Step 1 */}
            <div 
              className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(1)}
            >
              <div className="step-bubble">
                {currentStep > 1 ? <Check size={14} /> : '1'}
              </div>
              <div className="step-text">
                <span className="step-title">Engineering Branch</span>
                <span className="step-desc">{selectedBranch}</span>
              </div>
            </div>

            <div className="step-divider" />

            {/* Step 2 */}
            <div 
              className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(2)}
            >
              <div className="step-bubble">
                {currentStep > 2 ? <Check size={14} /> : '2'}
              </div>
              <div className="step-text">
                <span className="step-title">Branch Domains</span>
                <span className="step-desc">{selectedDomain === 'all' ? 'All Fields' : selectedDomain.slice(0, 15)}</span>
              </div>
            </div>

            <div className="step-divider" />

            {/* Step 3 */}
            <div 
              className={`step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(3)}
            >
              <div className="step-bubble">
                {currentStep > 3 ? <Check size={14} /> : '3'}
              </div>
              <div className="step-text">
                <span className="step-title">Project Suggestions</span>
                <span className="step-desc">{totalCount} Available</span>
              </div>
            </div>

            <div className="step-divider" />

            {/* Step 4 */}
            <div 
              className={`step-item ${currentStep === 4 ? 'active' : ''}`}
              onClick={() => selectedProjectId && setCurrentStep(4)}
              style={{ opacity: selectedProjectId ? 1 : 0.4 }}
            >
              <div className="step-bubble">
                4
              </div>
              <div className="step-text">
                <span className="step-title">Problem Statement</span>
                <span className="step-desc">5 Key Details</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ flex: 1, paddingBottom: '60px' }}>
        
        {/* =========================================================
            STEP 1: BRANCHES OF ENGINEERING
            ========================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="step-header">
              <div className="step-tag">
                <Cpu size={13} />
                <span>Step 1 of 4 • Choose Your Branch</span>
              </div>
              <h2>Select Your Engineering Branch</h2>
              <p>
                Choose your department to unlock branch-specific technical domains, hardware requirements, and authentic problem statements.
              </p>
            </div>

            <div className="branch-grid">
              {branches.map(b => (
                <div 
                  key={b.code}
                  className={`branch-card ${selectedBranch === b.code ? 'selected' : ''}`}
                  onClick={() => handleSelectBranch(b.code)}
                >
                  <div className="branch-card-top">
                    <div className="branch-icon">
                      {b.icon}
                    </div>
                    <span className="branch-pill">{b.count}</span>
                  </div>

                  <h3>{b.name}</h3>
                  <p>{b.desc}</p>

                  <div className="branch-chips">
                    {b.chips.map(chip => (
                      <span key={chip} className="branch-chip">{chip}</span>
                    ))}
                  </div>

                  <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-violet)', fontSize: '12px', fontWeight: 600 }}>
                    <span>Explore {b.short} Domains</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 2: DOMAINS OF SPECIFIC BRANCH & RELATED FIELDS
            ========================================================= */}
        {currentStep === 2 && (
          <div>
            {/* Active Branch Context Banner */}
            <div className="branch-context-banner">
              <div className="branch-context-info">
                <Cpu size={24} color="var(--accent-violet)" />
                <div>
                  <h3>Branch: {selectedBranch} ({branches.find(b => b.code === selectedBranch)?.name || selectedBranch})</h3>
                  <p>Showing technical domains exclusively belonging to {selectedBranch}. Select a domain to see problem suggestions.</p>
                </div>
              </div>

              <button 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={14} />
                <span>Change Branch</span>
              </button>
            </div>

            <div className="step-header">
              <div className="step-tag">
                <Layers size={13} />
                <span>Step 2 of 4 • Branch Domains & Fields</span>
              </div>
              <h2>Domains & Fields for {selectedBranch}</h2>
              <p>
                {selectedBranch === 'ECE' 
                  ? 'ECE-exclusive engineering fields: Embedded Systems, VLSI/ULSI Design, Wireless Telecom, IoT Hardware, and Robotics.'
                  : selectedBranch === 'CSE'
                  ? 'CSE-exclusive computing domains: Data Science & AI, Cybersecurity Defense, Quantum Algorithms, and Cloud Automation.'
                  : `Specialized fields for ${selectedBranch}. Select any domain to view suggested problem statements.`}
              </p>
            </div>

            {/* All Domains Option */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary"
                onClick={() => handleSelectDomain('all')}
              >
                <span>View All Problems in {selectedBranch} &rarr;</span>
              </button>
            </div>

            {/* Domains Grid strictly filtered by branch */}
            <div className="domain-grid">
              {branchFilteredDomains.map(d => (
                <div 
                  key={d.id}
                  className={`discovery-card ${selectedDomain === d.name ? 'selected' : ''}`}
                  onClick={() => handleSelectDomain(d.name)}
                >
                  <div className="discovery-card-top">
                    <span className="discovery-category">{d.code} • {selectedBranch}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {d.project_count || 50} Problems
                    </span>
                  </div>

                  <h3>{d.name}</h3>
                  <p>{d.simple_definition || d.beginner_explanation}</p>

                  {/* Sub-fields / concepts chips */}
                  <ul className="discovery-chips">
                    {(d.important_concepts?.slice(0, 4) || d.real_world_apps?.slice(0, 4) || ['Fundamentals', 'Hardware', 'Protocols', 'Design']).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>

                  <div className="discovery-card-action">
                    <span>Explore Problem Statements</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: PROJECT SUGGESTIONS & FILTERABLE CATALOGUE
            ========================================================= */}
        {currentStep === 3 && (
          <div>
            <div className="step-header" style={{ marginBottom: '24px' }}>
              <div className="step-tag">
                <FolderOpen size={13} />
                <span>Step 3 of 4 • Project Suggestions</span>
              </div>
              <h2>Suggested Problems for {selectedBranch} {selectedDomain !== 'all' ? `• ${selectedDomain}` : ''}</h2>
              <p>
                Extracted verbatim from authentic official PDFs (capped to 50 problems per document). Filter by branch, domain, search keywords, or academic fit.
              </p>
            </div>

            {/* Dynamic Sync Filter Bar */}
            <div className="catalog-filter-bar">
              <div className="filter-row-top">
                {/* Search Bar */}
                <div className="search-input-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    className="catalog-search-input"
                    placeholder="Search problem title, keywords, STM32, Verilog, PyTorch, LoRa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Branch Dropdown */}
                <div>
                  <select 
                    className="custom-select"
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      setSelectedDomain('all');
                    }}
                  >
                    <option value="ECE">Branch: ECE (Electronics & Comm)</option>
                    <option value="CSE">Branch: CSE (Computer Science)</option>
                    <option value="Electrical">Branch: Electrical (EEE)</option>
                    <option value="Mechanical">Branch: Mechanical</option>
                    <option value="all">Branch: All Engineering</option>
                  </select>
                </div>

                {/* Domain Dropdown (Strictly Filtered to Current Branch!) */}
                <div>
                  <select 
                    className="custom-select"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                  >
                    <option value="all">All Domains in {selectedBranch}</option>
                    {branchFilteredDomains.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Difficulty & Track Pills Row */}
              <div className="filter-pills-row">
                <div className="pills-group">
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginRight: '4px' }}>DIFFICULTY:</span>
                  {['all', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                    <button 
                      key={diff}
                      className={`filter-pill-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff === 'all' ? 'All Levels' : diff}
                    </button>
                  ))}
                </div>

                <div className="pills-group">
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginRight: '4px' }}>ACADEMIC TRACK:</span>
                  {[
                    { label: 'All Tracks', val: 'all' },
                    { label: 'Mini Project', val: 'Mini' },
                    { label: 'Major Project', val: 'Major' },
                    { label: 'SIH 2026', val: 'Hackathon' },
                    { label: 'Research', val: 'Research' }
                  ].map(trk => (
                    <button 
                      key={trk.val}
                      className={`filter-pill-btn ${selectedTrack === trk.val ? 'active' : ''}`}
                      onClick={() => setSelectedTrack(trk.val)}
                    >
                      {trk.label}
                    </button>
                  ))}
                </div>

                <div className="result-count-label">
                  Showing <strong>{projects.length}</strong> of {totalCount} problems
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            {loadingProjects ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
                <p>Loading curated problems from official source documents...</p>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <h3>No problem statements match these filters</h3>
                <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Try selecting "All Domains" or clearing your search term.</p>
                <button 
                  className="btn-secondary" 
                  style={{ marginTop: '16px' }}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDomain('all');
                    setSelectedDifficulty('all');
                    setSelectedTrack('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(p => {
                  const isSaved = savedProjectIds.has(p.project_id);
                  return (
                    <div 
                      key={p.id}
                      className="project-card"
                    >
                      <div className="project-card-header">
                        <div className="badge-group">
                          <span className="badge badge-branch">{p.branch}</span>
                          <span className="badge badge-domain">{p.domain}</span>
                          <span className={`badge badge-diff-${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                        </div>
                        <button 
                          className="btn-ghost"
                          title={isSaved ? "Saved" : "Save project"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(p.project_id);
                          }}
                        >
                          <Bookmark size={16} fill={isSaved ? 'var(--accent-violet)' : 'none'} color={isSaved ? 'var(--accent-violet)' : 'var(--muted)'} />
                        </button>
                      </div>

                      <h3>{p.title}</h3>

                      <p className="overview">
                        {p.simple_explanation || p.problem_statement}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="project-tech-pills">
                        {(p.technologies?.split(',').slice(0, 4) || ['Embedded', 'Sensors']).map((tech, i) => (
                          <span key={i} className="tech-pill">{tech.trim()}</span>
                        ))}
                      </div>

                      <div className="project-card-footer">
                        <span className="source-tag" title={p.source_document || 'Official PDF'}>
                          <FileText size={12} />
                          <span>{p.source_document ? p.source_document.replace(/_/g, ' ').slice(0, 24) : 'Source PDF'}</span>
                        </span>

                        <button 
                          className="btn-view-details"
                          onClick={() => handleChooseProblem(p)}
                        >
                          <span>View 5 Key Details</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 4: PROBLEM STATEMENT DETAILS — 5 MAIN DETAILS PROMINENTLY
            ========================================================= */}
        {currentStep === 4 && selectedProject && (
          <div className="details-container">
            {/* Top Navigation Row */}
            <div className="details-header">
              <button className="back-link" onClick={() => setCurrentStep(3)}>
                <ArrowLeft size={16} />
                <span>Back to Suggested Problems</span>
              </button>

              <div className="details-title-row">
                <div style={{ maxWidth: '850px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span className="badge badge-branch">{selectedProject.branch}</span>
                    <span className="badge badge-domain">{selectedProject.domain}</span>
                    {selectedProject.subdomain && (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground-secondary)' }}>
                        {selectedProject.subdomain}
                      </span>
                    )}
                    <span className={`badge badge-diff-${selectedProject.difficulty.toLowerCase()}`}>
                      {selectedProject.difficulty}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      ID: {selectedProject.project_id}
                    </span>
                  </div>

                  <h1>{selectedProject.title}</h1>
                </div>

                <div className="details-actions-bar">
                  <button 
                    className="btn-secondary"
                    onClick={() => onToggleSave(selectedProject.project_id)}
                  >
                    <Bookmark 
                      size={16} 
                      fill={savedProjectIds.has(selectedProject.project_id) ? 'var(--accent-violet)' : 'none'} 
                      color={savedProjectIds.has(selectedProject.project_id) ? 'var(--accent-violet)' : 'currentColor'} 
                    />
                    <span>{savedProjectIds.has(selectedProject.project_id) ? 'Saved' : 'Save Problem'}</span>
                  </button>

                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowInlineSlides(prev => !prev);
                      setTimeout(() => {
                        const el = document.getElementById('inlineSlideDeckAnchor');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    <Presentation size={16} color="var(--accent-purple)" />
                    <span>{showInlineSlides ? 'Hide Pitch Outline' : '7-Slide Pitch Outline'}</span>
                  </button>

                  <button 
                    className="btn-primary"
                    onClick={() => onNavigateDevelop(selectedProject)}
                  >
                    <Wrench size={16} />
                    <span>Develop Plan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* =========================================================
                THE 5 MAIN DETAILS SECTION (Prominently Featured)
                ========================================================= */}
            <div className="five-details-section">
              <div className="five-details-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <strong>The 5 Core Problem Specifications</strong>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Verified Official Dataset • Preserved Verbatim
                </span>
              </div>

              <div className="five-details-grid">
                
                {/* 1. Problem Statement & Objective */}
                <div className="main-detail-card span-two">
                  <div className="detail-card-number">
                    <AlertCircle size={14} />
                    <span>1. Problem Statement & Core Objective</span>
                  </div>
                  <h3>Official Problem Statement</h3>
                  <div className="quote-box">
                    "{selectedProject.problem_statement}"
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '4px' }}>
                      Simple English Explanation for Students
                    </h4>
                    <p>{selectedProject.simple_explanation}</p>
                  </div>
                </div>

                {/* 2. Classification & Domain Mapping */}
                <div className="main-detail-card">
                  <div className="detail-card-number">
                    <Layers size={14} />
                    <span>2. Engineering Classification</span>
                  </div>
                  <h3>Domain & Taxonomy</h3>
                  <div className="meta-key-value-grid">
                    <div className="meta-item">
                      <dt>Primary Branch</dt>
                      <dd>{selectedProject.branch}</dd>
                    </div>
                    <div className="meta-item">
                      <dt>Technical Domain</dt>
                      <dd>{selectedProject.domain}</dd>
                    </div>
                    <div className="meta-item">
                      <dt>Subdomain</dt>
                      <dd>{selectedProject.subdomain || 'General'}</dd>
                    </div>
                    <div className="meta-item">
                      <dt>Theme / Sector</dt>
                      <dd>{selectedProject.theme || 'Engineering'}</dd>
                    </div>
                  </div>
                </div>

                {/* 3. Difficulty & Academic Fit */}
                <div className="main-detail-card">
                  <div className="detail-card-number">
                    <Flame size={14} />
                    <span>3. Difficulty & Academic Fit</span>
                  </div>
                  <h3>Level & Suggested Purpose</h3>
                  <div className="meta-key-value-grid">
                    <div className="meta-item">
                      <dt>Complexity</dt>
                      <dd>{selectedProject.difficulty}</dd>
                    </div>
                    <div className="meta-item">
                      <dt>Suitable Track</dt>
                      <dd>{selectedProject.suitable_for || 'Mini Project / Major Project / SIH 2026'}</dd>
                    </div>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '13px' }}>
                    Recommended for engineering students building semester review prototypes, Smart India Hackathon entries, or final year projects.
                  </p>
                </div>

                {/* 4. Core Tech Stack & Tools */}
                <div className="main-detail-card">
                  <div className="detail-card-number">
                    <Terminal size={14} />
                    <span>4. Primary Tech Stack & Protocols</span>
                  </div>
                  <h3>Software & Programming Toolchain</h3>
                  <p>{selectedProject.technologies}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {selectedProject.technologies?.split(',').map((t: string, i: number) => (
                      <span key={i} className="tech-pill">{t.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* 5. Required Hardware & Software Specs (BOM) */}
                <div className="main-detail-card">
                  <div className="detail-card-number">
                    <Cpu size={14} />
                    <span>5. Hardware & Software Requirements (BOM)</span>
                  </div>
                  <h3>Physical Components & IDEs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#e0d2f0' }}>Hardware BOM:</strong>
                      <p style={{ fontSize: '13px', marginTop: '2px' }}>{selectedProject.hardware_required || 'Standard Development Board & Peripherals'}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#e0d2f0' }}>Software & Simulators:</strong>
                      <p style={{ fontSize: '13px', marginTop: '2px' }}>{selectedProject.software_required || 'GCC, Keil/VS Code, Simulators'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* =========================================================
                EXPANDABLE REMAINING DETAILS ACCORDION
                "remaining one should show after they need or not you have to put it in a problem session if I need that one mention heading in the 2016"
                ========================================================= */}
            <div className="remaining-details-section">
              <div 
                className="remaining-toggle-header"
                onClick={() => setShowRemainingDetails(!showRemainingDetails)}
              >
                <div className="remaining-toggle-title">
                  <SlidersHorizontal size={18} color="var(--accent-violet)" />
                  <h2>Deep-Dive Implementation Specs & 2016/2026 Reference</h2>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    (Why it matters, gaps, implementation roadmap, 7-slide pitch)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-violet)', fontSize: '13px', fontWeight: 600 }}>
                  <span>{showRemainingDetails ? 'Collapse Details' : 'Show More Details'}</span>
                  {showRemainingDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {showRemainingDetails && (
                <div className="remaining-content-area">
                  
                  {/* Official Source Provenance & 2016/2026 Heading */}
                  <div className="detail-sub-block">
                    <h3>
                      <FileText size={16} color="var(--accent-indigo)" />
                      Official Document Heading & Provenance Reference
                    </h3>
                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <p><strong>Document File:</strong> {selectedProject.source_document || 'Official Compendium'}</p>
                      <p><strong>Official Reference:</strong> {selectedProject.source_reference || 'Smart India Hackathon / QAIC compendium'}</p>
                      <p><strong>Page Number:</strong> Page {selectedProject.source_page || 1}</p>
                      <p><strong>Verification Status:</strong> Verified Authenticity (Preserved verbatim from official source document)</p>
                    </div>
                  </div>

                  {/* Why it Matters & Impact */}
                  <div className="detail-sub-block">
                    <h3>
                      <AlertCircle size={16} color="var(--accent-amber)" />
                      Why Does This Problem Matter & Who is Affected?
                    </h3>
                    <p>{selectedProject.why_matters || 'Directly affects system reliability, real-time safety, user convenience, and operational costs.'}</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Affected Stakeholders:</strong> {selectedProject.who_affected || 'Engineers, industrial technicians, end-users, and public utilities.'}
                    </p>
                  </div>

                  {/* Existing Solutions vs Gaps */}
                  <div className="detail-sub-block">
                    <h3>
                      <HelpCircle size={16} color="var(--accent-rose)" />
                      Existing Solutions & Critical Limitations
                    </h3>
                    <p><strong>Current Solutions:</strong> {selectedProject.existing_solutions || 'Commercial proprietary loggers, manual periodic inspection, legacy wired infrastructure.'}</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Why They Fall Short:</strong> {selectedProject.gaps_in_existing || 'High deployment cost, lack of edge autonomy, high power consumption, and absence of predictive alerts.'}
                    </p>
                  </div>

                  {/* Proposed Architecture Approach */}
                  <div className="detail-sub-block">
                    <h3>
                      <Wrench size={16} color="var(--accent-emerald)" />
                      Proposed Engineering Approach & Methodology
                    </h3>
                    <p>{selectedProject.proposed_approach || `Implement an integrated prototype leveraging ${selectedProject.technologies} with deterministic sampling, edge calibration, and low-latency communication.`}</p>
                  </div>

                  {/* Implementation Roadmap */}
                  <div className="detail-sub-block">
                    <h3>
                      <CheckCircle2 size={16} color="var(--accent-violet)" />
                      6-Stage Implementation Roadmap
                    </h3>
                    <ul className="roadmap-list">
                      {[
                        'Milestone 1: Hardware BOM selection, power budgeting, and circuit schematic design.',
                        'Milestone 2: Sensor calibration, analog front-end conditioning, and logic simulation.',
                        'Milestone 3: Core firmware implementation (interrupt loops, state machine, sensor fusion).',
                        'Milestone 4: Communication protocol integration (SPI, I2C, CAN, LoRa, or REST APIs).',
                        'Milestone 5: Bench testing, edge anomaly threshold tuning, and error condition tests.',
                        'Milestone 6: Prototype packaging, field testing, and 7-slide SIH pitch presentation.'
                      ].map((step, idx) => (
                        <li key={idx} className="roadmap-item">
                          <div className="roadmap-num">{idx + 1}</div>
                          <div className="roadmap-content">
                            <p>{step}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Output */}
                  <div className="detail-sub-block">
                    <h3>
                      <CheckCircle2 size={16} color="var(--accent-cyan)" />
                      Expected Output & Deliverables
                    </h3>
                    <p>{selectedProject.expected_output || 'A functional working hardware/software prototype demonstrating end-to-end telemetry and validation.'}</p>
                  </div>

                  {/* 7-Slide SIH Presentation Outline Shortcut */}
                  <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#ffffff' }}>Ready to Present This Problem?</strong>
                      <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '2px' }}>
                        Generate a 7-slide presentation pitch outline structured for review panels.
                      </p>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => setShowInlineSlides(prev => !prev)}
                    >
                      <Presentation size={16} />
                      <span>{showInlineSlides ? 'Hide Pitch Outline' : 'Open 7-Slide Pitch Outline'}</span>
                    </button>
                  </div>

                  {/* Inline 7-Slide Pitch Outline Deck */}
                  {showInlineSlides && selectedProject && (
                    <div className="inline-slide-deck-container" id="inlineSlideDeckAnchor">
                      <div className="slide-deck-header">
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f3e8ff', margin: 0 }}>
                            7-Slide Review Panel Pitch Deck
                          </h3>
                          <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '3px' }}>
                            Standardized engineering presentation outline structured for review panels.
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => {
                              const slides = [
                                {
                                  title: "1. Introduction & Overview",
                                  subtitle: "Project Title, Team Members, and Academic Institution",
                                  points: [
                                    `Project Title: ${selectedProject.title}`,
                                    `Branch / Department: ${selectedProject.branch}`,
                                    `Domain: ${selectedProject.domain}`,
                                    `Short Overview: ${selectedProject.simple_explanation || selectedProject.problem_statement}`
                                  ]
                                },
                                {
                                  title: "2. Problem Statement & Context",
                                  subtitle: "The Challenge Faced and Why It Matters",
                                  points: [
                                    `Problem Statement: ${selectedProject.problem_statement}`,
                                    `Who is Affected: ${selectedProject.who_affected || 'Engineers, industry operators, students and communities'}`,
                                    `Why This Problem Matters: ${selectedProject.why_matters || 'Critical efficiency bottleneck and resource waste in conventional systems'}`
                                  ]
                                },
                                {
                                  title: "3. Proposed Technical Solution",
                                  subtitle: "What the Team Plans to Build",
                                  points: [
                                    `Core Technical Approach: ${selectedProject.proposed_approach || selectedProject.simple_explanation}`,
                                    `Expected Deliverable: ${selectedProject.expected_output || 'Functional working prototype with validated telemetry'}`,
                                    `Complexity Level: ${selectedProject.difficulty}`
                                  ]
                                },
                                {
                                  title: "4. System Architecture & Methodology",
                                  subtitle: "How the System Operates End-to-End",
                                  points: [
                                    `Architectural Flow: Sensors / Data Input → Processing Unit / Microcontroller → Telemetry / Cloud → Dashboard / Actuators`,
                                    `Core Processing: Real-time telemetry, state machine, algorithmic filtering, or edge ML inference`,
                                    `Hardware-Software Synergy: Low-latency embedded edge processing coupled with real-time UI`
                                  ]
                                },
                                {
                                  title: "5. Implementation Technologies",
                                  subtitle: "Hardware, Software, and Toolchains",
                                  points: [
                                    `Primary Technologies: ${selectedProject.technologies}`,
                                    `Hardware Components: ${selectedProject.hardware_required || 'Sensors, dev board, power module, communication shield'}`,
                                    `Software & Frameworks: ${selectedProject.software_required || 'C/C++, Python, PlatformIO/Arduino IDE, Git'}`,
                                    `Core Prerequisites: ${selectedProject.skills_required || 'Embedded C, basic circuit debugging, interface protocols'}`
                                  ]
                                },
                                {
                                  title: "6. Expected Results & Feasibility",
                                  subtitle: "Validation Plan, Benefits, and Challenges",
                                  points: [
                                    `Key Deliverable: ${selectedProject.expected_output || 'Field-deployable physical prototype'}`,
                                    `Validation Plan: Comprehensive laboratory testing followed by real-world simulation`,
                                    `Known Limitations: ${selectedProject.limitations_challenges || 'Power consumption constraints and wireless transmission range'}`
                                  ]
                                },
                                {
                                  title: "7. Conclusion & Future Roadmap",
                                  subtitle: "Key Takeaways and Next Horizons",
                                  points: [
                                    `Takeaway: Low-cost, reproducible engineering solution directly targeting the core problem`,
                                    `Future Scope: ${selectedProject.future_scope || 'Cloud data analytics, multi-node mesh networking, and mass deployment'}`
                                  ]
                                }
                              ];
                              const text = slides.map((s, i) => `Slide ${i+1}: ${s.title}\nSubtitle: ${s.subtitle}\nKey Points:\n${s.points.map(k => `• ${k}`).join('\n')}\n`).join('\n---\n\n');
                              navigator.clipboard.writeText(text);
                              setCopiedSlideDeck(true);
                              setTimeout(() => setCopiedSlideDeck(false), 2000);
                            }}
                          >
                            {copiedSlideDeck ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                            <span>{copiedSlideDeck ? 'Copied Pitch Deck!' : 'Copy Slide Deck'}</span>
                          </button>

                          <button
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px' }}
                            onClick={() => setShowInlineSlides(false)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Slide Tabs 1 to 7 */}
                      <div className="slide-deck-tabs">
                        {[1, 2, 3, 4, 5, 6, 7].map((num, idx) => (
                          <button
                            key={num}
                            className={`slide-tab-btn ${activeInlineSlide === idx ? 'active' : ''}`}
                            onClick={() => setActiveInlineSlide(idx)}
                          >
                            Slide {num}
                          </button>
                        ))}
                      </div>

                      {/* Active Slide Content */}
                      {(() => {
                        const slidesData = [
                          {
                            slide_number: 1,
                            title: "1. Introduction & Overview",
                            subtitle: "Project Title, Team Members, and Academic Institution",
                            key_points: [
                              `Project Title: ${selectedProject.title}`,
                              `Branch / Department: ${selectedProject.branch}`,
                              `Domain: ${selectedProject.domain}`,
                              `Short Overview: ${selectedProject.simple_explanation ? selectedProject.simple_explanation.slice(0, 160) + '...' : selectedProject.problem_statement.slice(0, 160) + '...'}`
                            ]
                          },
                          {
                            slide_number: 2,
                            title: "2. Problem Statement & Context",
                            subtitle: "The Challenge Faced and Why It Matters",
                            key_points: [
                              `Problem Statement: ${selectedProject.problem_statement}`,
                              `Who is Affected: ${selectedProject.who_affected || 'Engineers, industry operators, students and communities'}`,
                              `Why This Problem Matters: ${selectedProject.why_matters || 'Critical efficiency bottleneck and resource waste in conventional systems'}`
                            ]
                          },
                          {
                            slide_number: 3,
                            title: "3. Proposed Technical Solution",
                            subtitle: "What the Team Plans to Build",
                            key_points: [
                              `Core Technical Approach: ${selectedProject.proposed_approach || selectedProject.simple_explanation}`,
                              `Expected Output / Deliverable: ${selectedProject.expected_output || 'Functional working prototype with validated telemetry'}`,
                              `Complexity Level: ${selectedProject.difficulty}`
                            ]
                          },
                          {
                            slide_number: 4,
                            title: "4. System Architecture & Methodology",
                            subtitle: "How the System Operates End-to-End",
                            key_points: [
                              `Architectural Flow: Sensors / Data Input → Processing Unit / Microcontroller → Telemetry / Cloud → Dashboard / Actuators`,
                              `Core Processing: Real-time telemetry, state machine, algorithmic filtering, or edge ML inference`,
                              `Hardware-Software Synergy: Low-latency embedded edge processing coupled with real-time UI`
                            ]
                          },
                          {
                            slide_number: 5,
                            title: "5. Implementation Technologies",
                            subtitle: "Hardware, Software, and Toolchains",
                            key_points: [
                              `Primary Technologies: ${selectedProject.technologies}`,
                              `Hardware Components: ${selectedProject.hardware_required || 'Sensors, dev board, power module, communication shield'}`,
                              `Software & Frameworks: ${selectedProject.software_required || 'C/C++, Python, PlatformIO/Arduino IDE, Git'}`,
                              `Core Prerequisites: ${selectedProject.skills_required || 'Embedded C, basic circuit debugging, interface protocols'}`
                            ]
                          },
                          {
                            slide_number: 6,
                            title: "6. Expected Results & Feasibility",
                            subtitle: "Validation Plan, Benefits, and Challenges",
                            key_points: [
                              `Key Deliverable: ${selectedProject.expected_output || 'Field-deployable physical prototype'}`,
                              `Validation Plan: Comprehensive laboratory testing followed by real-world simulation`,
                              `Known Limitations & Risks: ${selectedProject.limitations_challenges || 'Power consumption constraints and wireless transmission range'}`
                            ]
                          },
                          {
                            slide_number: 7,
                            title: "7. Conclusion & Future Roadmap",
                            subtitle: "Key Takeaways and Next Horizons",
                            key_points: [
                              `Takeaway: Low-cost, reproducible engineering solution directly targeting the core problem`,
                              `Future Scope: ${selectedProject.future_scope || 'Cloud data analytics, multi-node mesh networking, and mass deployment'}`
                            ]
                          }
                        ];
                        const cur = slidesData[activeInlineSlide] || slidesData[0];
                        return (
                          <div className="slide-content-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#bba4e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Slide {cur.slide_number} of 7
                              </span>
                              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
                                Academic Review Format
                              </span>
                            </div>

                            <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>
                              {cur.title}
                            </h4>
                            <div style={{ fontSize: '13px', color: '#bba4e5', marginBottom: '14px', fontWeight: 500 }}>
                              {cur.subtitle}
                            </div>

                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Key Discussion Points:
                            </div>

                            <ul className="slide-key-points-list">
                              {cur.key_points.map((pt, i) => (
                                <li key={i} className="slide-key-point-item">
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#bba4e5', marginTop: '7px', flexShrink: 0 }} />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* =========================================================
                MORE PROBLEMS IN THIS DOMAIN SECTION
                "he wants more and more you have to have more problem section"
                ========================================================= */}
            <div className="more-problems-section">
              <div className="more-problems-header">
                <div>
                  <h2>More Problem Statements in {selectedProject.domain}</h2>
                  <p>Explore alternative or related research problems in this engineering domain.</p>
                </div>

                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedDomain(selectedProject.domain);
                    setCurrentStep(4);
                  }}
                >
                  <span>View All {selectedProject.domain} Problems &rarr;</span>
                </button>
              </div>

              <div className="projects-grid">
                {relatedProjects.slice(0, 3).map(rp => (
                  <div 
                    key={rp.id}
                    className="project-card"
                  >
                    <div className="project-card-header">
                      <div className="badge-group">
                        <span className="badge badge-branch">{rp.branch}</span>
                        <span className="badge badge-diff-beg">{rp.difficulty}</span>
                      </div>
                      <button 
                        className="btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(rp.project_id);
                        }}
                      >
                        <Bookmark size={15} fill={savedProjectIds.has(rp.project_id) ? 'var(--accent-violet)' : 'none'} color="var(--accent-violet)" />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '16px' }}>{rp.title}</h3>
                    <p className="overview" style={{ fontSize: '12px' }}>
                      {rp.simple_explanation || rp.problem_statement}
                    </p>

                    <div className="project-card-footer" style={{ marginTop: 'auto' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>ID: {rp.project_id}</span>
                      <button 
                        className="btn-view-details"
                        onClick={() => handleChooseProblem(rp)}
                      >
                        <span>Inspect Problem</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating Problem Session Dock (Bottom right) */}
      {savedProjectsList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 90,
          background: 'rgba(13, 11, 19, 0.95)',
          border: '1px solid var(--border-glow)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-glow-violet)',
          cursor: 'pointer'
        }}
        onClick={() => setIsSessionDrawerOpen(true)}
        >
          <Bookmark size={16} fill="var(--accent-violet)" color="var(--accent-violet)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            Problem Session ({savedProjectsList.length} saved)
          </span>
          <span style={{
            background: 'var(--accent-violet)',
            color: '#08060d',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800
          }}>
            {savedProjectsList.length}
          </span>
        </div>
      )}

      {/* Problem Session Drawer */}
      {isSessionDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 110,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setIsSessionDrawerOpen(false)}
        >
          <div style={{
            width: '100%',
            maxWidth: '480px',
            height: '100%',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2>My Problem Session</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {savedProjectsList.length} shortlisted engineering problems
                </p>
              </div>
              <button 
                className="btn-secondary" 
                style={{ padding: '6px 10px' }}
                onClick={() => setIsSessionDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              {savedProjectsList.map(sp => (
                <div 
                  key={sp.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="badge badge-branch">{sp.branch} • {sp.domain}</span>
                    <button 
                      className="btn-ghost" 
                      onClick={() => onToggleSave(sp.project_id)}
                      style={{ color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>

                  <strong style={{ fontSize: '14px', color: '#ffffff' }}>{sp.title}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                    {sp.simple_explanation?.slice(0, 100)}...
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button 
                      className="btn-view-details" 
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      onClick={() => {
                        handleChooseProblem(sp);
                        setIsSessionDrawerOpen(false);
                      }}
                    >
                      Inspect Problem
                    </button>
                    <button 
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      onClick={() => onOpenSlideModal?.(sp)}
                    >
                      7 Slides
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern Footer matching Pivot Sols */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <strong>GURU — Guided Understanding, Research & University Projects</strong>
            <span>Pivot Sols Design System • Built for RGUKT Engineering Students</span>
          </div>

          <div className="footer-links">
            <span onClick={() => { setSelectedBranch('ECE'); setCurrentStep(3); }}>ECE Domains</span>
            <span onClick={() => { setSelectedBranch('CSE'); setCurrentStep(3); }}>CSE Domains</span>
            <span onClick={() => setCurrentStep(4)}>Problem Suggestions</span>
            <span onClick={() => setCurrentStep(1)}>Student Login</span>
          </div>

          <div className="footer-copy">
            © 2026 GURU Platform • 340 Problems (Max 50 per PDF)
          </div>
        </div>
      </footer>

    </div>
  );
};
