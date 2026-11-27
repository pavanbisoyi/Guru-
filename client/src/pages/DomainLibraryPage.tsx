import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Zap, 
  Wifi, 
  Shield, 
  BarChart2, 
  Wrench, 
  Radio, 
  Circle,
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  Code,
  Sparkles,
  X,
  Bookmark
} from 'lucide-react';
import { DomainGuide, Project } from '../types';
import { api } from '../api';

interface DomainLibraryPageProps {
  domains: DomainGuide[];
  onSelectDomain: (domain: DomainGuide) => void;
  onExploreDomainProjects: (domainName: string, branch?: string) => void;
}

export const DomainLibraryPage: React.FC<DomainLibraryPageProps> = ({
  domains,
  onExploreDomainProjects
}) => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activeGuideDomain, setActiveGuideDomain] = useState<DomainGuide | null>(null);
  
  // Inline Projects Grid State
  const [gridDomain, setGridDomain] = useState<string | null>(null);
  const [gridProjects, setGridProjects] = useState<Project[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(false);

  const filteredDomains = domains.filter(d => {
    if (selectedBranch === 'all') return true;
    return d.branch_association.toLowerCase().includes(selectedBranch.toLowerCase());
  });

  const getDomainIcon = (code: string) => {
    switch (code) {
      case 'vlsi': return <Cpu size={24} color="#d97706" />;
      case 'embedded': return <Zap size={24} color="#2563eb" />;
      case 'iot': return <Wifi size={24} color="#059669" />;
      case 'cybersecurity': return <Shield size={24} color="#e11d48" />;
      case 'data-science': return <BarChart2 size={24} color="#7c3aed" />;
      case 'robotics': return <Wrench size={24} color="#0d9488" />;
      case 'communication': return <Radio size={24} color="#0284c7" />;
      case 'quantum': return <Circle size={24} color="#4f46e5" />;
      default: return <Layers size={24} color="#2563eb" />;
    }
  };

  const handleViewDomainProjects = async (domainName: string) => {
    setGridDomain(domainName);
    setLoadingGrid(true);
    // Scroll down to projects grid
    try {
      const res = await api.getProjects({ domain: domainName, limit: 24 });
      setGridProjects(res.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGrid(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
          Engineering Domain Guides & Knowledge Library
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '4px' }}>
          Explore structured engineering domains with beginner-friendly explanations, required toolchains, and verified project problem statements.
        </p>

        {/* Branch Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'All Domains', value: 'all' },
            { label: 'Electronics & Communication (ECE)', value: 'ECE' },
            { label: 'Computer Science (CSE)', value: 'CSE' },
            { label: 'Electrical & Instrumentation', value: 'Electrical' }
          ].map(tab => (
            <button
              key={tab.value}
              className={`filter-pill-btn ${selectedBranch === tab.value ? 'active' : ''}`}
              onClick={() => setSelectedBranch(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domains Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filteredDomains.map(d => (
          <div 
            key={d.id}
            className="details-section-card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              marginBottom: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getDomainIcon(d.code)}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge badge-branch">{d.branch_association}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                    {d.project_count || 50} Projects
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                {d.name}
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '12px' }}>
                {d.full_form}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {d.simple_definition.slice(0, 150)}...
              </p>

              {/* Sample Real World Apps */}
              <div style={{ marginBottom: '14px' }}>
                <span className="form-label" style={{ fontSize: '11px' }}>REAL-WORLD APPLICATIONS:</span>
                <p style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '2px' }}>
                  {d.real_world_apps.slice(0, 2).join(' • ')}
                </p>
              </div>

              {/* Tools Preview */}
              {d.programming_languages && d.programming_languages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {d.programming_languages.slice(0, 3).map((l, i) => (
                    <span key={i} className="tech-pill">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                onClick={() => {
                  setActiveGuideDomain(d);
                  // Scroll to inline guide smoothly
                  setTimeout(() => {
                    const el = document.getElementById('domainGuideAnchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Read Domain Guide
              </button>
              <button 
                className="btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                onClick={() => onExploreDomainProjects(d.name, d.branch_association)}
              >
                <span>View Projects</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
          INLINE DOMAIN GUIDE SECTION (Rendered Below in Dark Theme)
          ========================================================= */}
      {activeGuideDomain && (
        <div id="domainGuideAnchor" className="domain-inline-guide">
          <div className="domain-inline-guide-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-branch">{activeGuideDomain.branch_association}</span>
                <span className="badge badge-domain">Domain Guide</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
                {activeGuideDomain.name} Guide
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--accent-violet)', fontWeight: 600 }}>
                {activeGuideDomain.full_form}
              </p>
            </div>
            <button 
              className="btn-ghost" 
              onClick={() => setActiveGuideDomain(null)}
              title="Close Guide"
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Simple Definition */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="detail-card-number">
                <BookOpen size={14} />
                <span>Simple Definition</span>
              </div>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                {activeGuideDomain.simple_definition}
              </p>
            </div>

            {/* Beginner Explanation */}
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="detail-card-number" style={{ color: 'var(--accent-emerald)' }}>
                <HelpCircle size={14} />
                <span>Beginner Explanation</span>
              </div>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                {activeGuideDomain.beginner_explanation}
              </p>
            </div>

            {/* Why Exists & Main Purpose */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="detail-card-number">
                <Briefcase size={14} />
                <span>Purpose & Application</span>
              </div>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                <strong>Why It Exists:</strong> {activeGuideDomain.why_exists}
              </p>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                <strong>Main Purpose:</strong> {activeGuideDomain.main_purpose}
              </p>
            </div>

            {/* Hardware & Software Tools */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="detail-card-number">
                <Wrench size={14} />
                <span>Tools & Hardware</span>
              </div>
              {activeGuideDomain.tools_hardware_software?.Hardware && (
                <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                  <strong>Hardware:</strong> {activeGuideDomain.tools_hardware_software.Hardware.join(' • ')}
                </p>
              )}
              {activeGuideDomain.tools_hardware_software?.Software && (
                <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                  <strong>Software:</strong> {activeGuideDomain.tools_hardware_software.Software.join(' • ')}
                </p>
              )}
            </div>

            {/* Key Concepts */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="detail-card-number">
                <Code size={14} />
                <span>Core Concepts to Learn</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {activeGuideDomain.important_concepts?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                    <CheckCircle2 size={13} color="var(--accent-violet)" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Examples */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="detail-card-number">
                <Sparkles size={14} />
                <span>Example Project Trajectories</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
                <div><strong>Beginner:</strong> {activeGuideDomain.beginner_examples?.[0]}</div>
                <div><strong>Intermediate:</strong> {activeGuideDomain.intermediate_examples?.[0]}</div>
                <div><strong>Advanced:</strong> {activeGuideDomain.advanced_examples?.[0]}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PERFECT GRID FOR DOMAIN PROJECTS (Rendered Below)
          ========================================================= */}
      {gridDomain && (
        <div id="domainProjectsGridAnchor" style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-domain">{gridDomain}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {gridProjects.length} Verified Problems Available
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                Projects in {gridDomain}
              </h2>
            </div>
            <button className="btn-secondary" onClick={() => setGridDomain(null)}>
              Close Projects Grid
            </button>
          </div>

          {loadingGrid ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading projects for {gridDomain}...</p>
          ) : gridProjects.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No projects found for {gridDomain}.</p>
          ) : (
            <div className="projects-grid">
              {gridProjects.map(p => (
                <div key={p.id} className="project-card">
                  <div className="project-card-header">
                    <div className="badge-group">
                      <span className="badge badge-branch">{p.branch}</span>
                      <span className={`badge badge-diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    </div>
                  </div>
                  <h3>{p.title}</h3>
                  <p className="overview">
                    {p.simple_explanation || p.problem_statement}
                  </p>
                  <div className="project-tech-pills">
                    {p.technologies?.split(',').slice(0, 3).map((t, idx) => (
                      <span key={idx} className="tech-pill">{t.trim()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
