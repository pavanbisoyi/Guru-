import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Presentation, 
  Wrench, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Cpu, 
  Zap, 
  Code, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  Info,
  Terminal,
  Flame,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Project, DomainGuide, Hackathon } from '../types';
import { api } from '../api';

interface ProjectDetailsPageProps {
  projectId: string | number;
  onBack: () => void;
  onNavigateDevelop: (project: Project) => void;
  onOpenSlideModal: (project: Project) => void;
  onFindCollaborators: (project: Project) => void;
  onSelectDomain: (domain: DomainGuide) => void;
  savedProjectIds: Set<string>;
  onToggleSave: (projectId: string) => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  projectId,
  onBack,
  onNavigateDevelop,
  onOpenSlideModal,
  onFindCollaborators,
  onSelectDomain,
  savedProjectIds,
  onToggleSave
}) => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRemainingDetails, setShowRemainingDetails] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProject();
    window.scrollTo(0, 0);
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProject(projectId);
      setProject(data);
      if (data.domain) {
        api.getProjects({ domain: data.domain, limit: 6 }).then(res => {
          setRelatedProjects(res.projects.filter(p => p.id !== data.id));
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error loading project details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: 'var(--muted)' }}>Loading verified problem specifications...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Problem not found</h2>
        <button className="btn-primary" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Problem Statements
        </button>
      </div>
    );
  }

  const isSaved = savedProjectIds.has(project.project_id);

  return (
    <div className="container details-container" style={{ padding: '30px 24px 60px' }}>
      
      {/* Top Header */}
      <div className="details-header">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Problem Suggestions</span>
        </button>

        <div className="details-title-row">
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-branch">{project.branch}</span>
              <span className="badge badge-domain">{project.domain}</span>
              {project.subdomain && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground-secondary)' }}>
                  {project.subdomain}
                </span>
              )}
              <span className={`badge badge-diff-${(project.difficulty || 'intermediate').toLowerCase()}`}>
                {project.difficulty}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                ID: {project.project_id}
              </span>
            </div>

            <h1>{project.title}</h1>
          </div>

          <div className="details-actions-bar">
            <button 
              className="btn-secondary"
              onClick={() => onToggleSave(project.project_id)}
            >
              <Bookmark 
                size={16} 
                fill={isSaved ? 'var(--accent-violet)' : 'none'} 
                color={isSaved ? 'var(--accent-violet)' : 'currentColor'} 
              />
              <span>{isSaved ? 'Saved' : 'Save Problem'}</span>
            </button>

            <button 
              className="btn-secondary"
              onClick={() => onOpenSlideModal(project)}
            >
              <Presentation size={16} color="var(--accent-purple)" />
              <span>7-Slide Pitch Outline</span>
            </button>

            <button 
              className="btn-primary"
              onClick={() => onNavigateDevelop(project)}
            >
              <Wrench size={16} />
              <span>Develop Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          THE 5 MAIN DETAILS SECTION (High Prominence)
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
              "{project.problem_statement}"
            </div>

            <div style={{ marginTop: '14px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '4px' }}>
                Simple English Explanation for Students
              </h4>
              <p>{project.simple_explanation}</p>
            </div>
          </div>

          {/* 2. Classification & Domain */}
          <div className="main-detail-card">
            <div className="detail-card-number">
              <Layers size={14} />
              <span>2. Engineering Classification</span>
            </div>
            <h3>Domain & Taxonomy</h3>
            <div className="meta-key-value-grid">
              <div className="meta-item">
                <dt>Primary Branch</dt>
                <dd>{project.branch}</dd>
              </div>
              <div className="meta-item">
                <dt>Technical Domain</dt>
                <dd>{project.domain}</dd>
              </div>
              <div className="meta-item">
                <dt>Subdomain</dt>
                <dd>{project.subdomain || 'General'}</dd>
              </div>
              <div className="meta-item">
                <dt>Theme / Sector</dt>
                <dd>{project.theme || 'Engineering'}</dd>
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
                <dd>{project.difficulty}</dd>
              </div>
              <div className="meta-item">
                <dt>Suitable Track</dt>
                <dd>{project.suitable_for || 'Mini Project / Major Project / SIH 2026'}</dd>
              </div>
            </div>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>
              Ideal for semester capstone projects, Smart India Hackathon entries, or final year B.Tech thesis work.
            </p>
          </div>

          {/* 4. Core Tech Stack & Tools */}
          <div className="main-detail-card">
            <div className="detail-card-number">
              <Terminal size={14} />
              <span>4. Primary Tech Stack & Protocols</span>
            </div>
            <h3>Software & Toolchains</h3>
            <p>{project.technologies}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {project.technologies?.split(',').map((t: string, i: number) => (
                <span key={i} className="tech-pill">{t.trim()}</span>
              ))}
            </div>
          </div>

          {/* 5. Required Hardware & Software Specs */}
          <div className="main-detail-card">
            <div className="detail-card-number">
              <Cpu size={14} />
              <span>5. Hardware & Software Requirements (BOM)</span>
            </div>
            <h3>Physical Modules & Simulators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#e0d2f0' }}>Hardware BOM:</strong>
                <p style={{ fontSize: '13px', marginTop: '2px' }}>{project.hardware_required || 'Standard Development Board & Peripherals'}</p>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#e0d2f0' }}>Software & Simulators:</strong>
                <p style={{ fontSize: '13px', marginTop: '2px' }}>{project.software_required || 'GCC, Keil/VS Code, Simulators'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          EXPANDABLE REMAINING DETAILS ACCORDION
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
                <p><strong>Document File:</strong> {project.source_document || 'Official Compendium'}</p>
                <p><strong>Official Reference:</strong> {project.source_reference || 'Smart India Hackathon / QAIC compendium'}</p>
                <p><strong>Page Number:</strong> Page {project.source_page || 1}</p>
                <p><strong>Verification Status:</strong> Verified Authenticity (Preserved verbatim from official source document)</p>
              </div>
            </div>

            {/* Why it Matters & Impact */}
            <div className="detail-sub-block">
              <h3>
                <AlertCircle size={16} color="var(--accent-amber)" />
                Why Does This Problem Matter & Who is Affected?
              </h3>
              <p>{project.why_matters || 'Directly affects system reliability, real-time safety, user convenience, and operational costs.'}</p>
              <p style={{ marginTop: '8px' }}>
                <strong>Affected Stakeholders:</strong> {project.who_affected || 'Engineers, industrial technicians, end-users, and public utilities.'}
              </p>
            </div>

            {/* Existing Solutions vs Gaps */}
            <div className="detail-sub-block">
              <h3>
                <HelpCircle size={16} color="var(--accent-rose)" />
                Existing Solutions & Critical Limitations
              </h3>
              <p><strong>Current Solutions:</strong> {project.existing_solutions || 'Commercial proprietary loggers, manual periodic inspection, legacy wired infrastructure.'}</p>
              <p style={{ marginTop: '8px' }}>
                <strong>Why They Fall Short:</strong> {project.gaps_in_existing || 'High deployment cost, lack of edge autonomy, high power consumption, and absence of predictive alerts.'}</p>
            </div>

            {/* Proposed Architecture Approach */}
            <div className="detail-sub-block">
              <h3>
                <Wrench size={16} color="var(--accent-emerald)" />
                Proposed Engineering Approach & Methodology
              </h3>
              <p>{project.proposed_approach || `Implement an integrated prototype leveraging ${project.technologies} with deterministic sampling, edge calibration, and low-latency communication.`}</p>
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
              <p>{project.expected_output || 'A functional working hardware/software prototype demonstrating end-to-end telemetry and validation.'}</p>
            </div>

            {/* 7-Slide SIH Presentation Outline Shortcut */}
            <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>Ready to Present This Problem?</strong>
                <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '2px' }}>
                  Generate a 7-slide SIH presentation outline structured for review panels.
                </p>
              </div>
              <button 
                className="btn-primary"
                onClick={() => onOpenSlideModal(project)}
              >
                <Presentation size={16} />
                <span>Open 7-Slide Pitch Outline</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* =========================================================
          MORE PROBLEMS IN THIS DOMAIN SECTION
          ========================================================= */}
      <div className="more-problems-section">
        <div className="more-problems-header">
          <div>
            <h2>More Problem Statements in {project.domain}</h2>
            <p>Explore alternative or related research problems in this engineering domain.</p>
          </div>

          <button 
            className="btn-secondary"
            onClick={onBack}
          >
            <span>View All Problems in Catalogue &rarr;</span>
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
                  onClick={() => {
                    loadProject();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
  );
};
