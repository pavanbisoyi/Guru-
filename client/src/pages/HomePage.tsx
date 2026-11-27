import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Wifi, 
  Shield, 
  BarChart2, 
  Layers, 
  Wrench, 
  Trophy, 
  BookOpen, 
  CheckCircle,
  HelpCircle,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';
import { DomainGuide, Project } from '../types';

interface HomePageProps {
  domains: DomainGuide[];
  featuredProjects: Project[];
  onSelectDomain: (domain: DomainGuide) => void;
  onSelectCategory: (category: string) => void;
  onNavigateExplore: (searchQuery?: string, branch?: string) => void;
  onViewProject: (projectId: string | number) => void;
  setCurrentTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  domains,
  featuredProjects,
  onSelectDomain,
  onSelectCategory,
  onNavigateExplore,
  onViewProject,
  setCurrentTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateExplore(searchTerm);
  };

  const getDomainIcon = (code: string) => {
    switch (code) {
      case 'vlsi': return <Cpu size={26} color="#d97706" />;
      case 'embedded': return <Zap size={26} color="#2563eb" />;
      case 'iot': return <Wifi size={26} color="#059669" />;
      case 'cybersecurity': return <Shield size={26} color="#e11d48" />;
      case 'data-science': return <BarChart2 size={26} color="#7c3aed" />;
      case 'robotics': return <Wrench size={26} color="#0d9488" />;
      case 'communication': return <Layers size={26} color="#0284c7" />;
      default: return <BookOpen size={26} color="#2563eb" />;
    }
  };

  const getDomainBg = (code: string) => {
    switch (code) {
      case 'vlsi': return '#fffbeb';
      case 'embedded': return '#eff6ff';
      case 'iot': return '#ecfdf5';
      case 'cybersecurity': return '#fff1f2';
      case 'data-science': return '#f5f3ff';
      case 'robotics': return '#f0fdfa';
      case 'communication': return '#f0f9ff';
      default: return '#f8fafc';
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION (Matching Problem2Project Screen 1) */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>GURU Project Discovery & Learning Platform</span>
            </div>
            
            <h1 className="hero-title">
              Find a Problem.<br />
              <span>Understand the Technology.</span><br />
              Build a Solution.
            </h1>

            <p className="hero-subtitle">
              Discover real-world engineering problems from verified source documents, understand the underlying technology with line-by-line beginner explanations, and develop impactful university and hackathon projects.
            </p>

            {/* Search Box */}
            <form className="hero-search-bar" onSubmit={handleSearchSubmit}>
              <Search size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                className="hero-search-input" 
                placeholder="Search for a problem (e.g., IoT, agriculture, smart healthcare, VLSI, cybersecurity)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '9px 18px' }}>
                <span>Explore Problems</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="hero-cta-buttons">
              <button className="btn-outline-primary" onClick={() => onNavigateExplore()}>
                Browse All 445+ Projects
              </button>
              <button className="btn-secondary" onClick={() => setCurrentTab('analyzer')}>
                <Sparkles size={15} color="#2563eb" />
                Analyze My Idea
              </button>
              <button className="btn-secondary" onClick={() => setCurrentTab('submit')}>
                Submit a Problem
              </button>
            </div>
          </div>

          {/* Right Hero Illustration / Visual Card */}
          <div className="hero-illustration-card">
            <div className="hero-illustration-header">
              <span className="badge badge-branch-ece">Curated Engineering Bank</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>10 Source Documents Ingested</span>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#2563eb',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)'
              }}>
                <Cpu size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
                Guided Engineering Discovery
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
                Every problem includes simple English breakdowns, hardware & software tools, step-by-step roadmaps, and 7-slide presentation outlines.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  ECE & CSE Project Synergy
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>445+ Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE BY DOMAIN SECTION */}
      <section className="home-domains-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore by Engineering Domain</h2>
            <p className="section-desc">Click any domain to read its complete beginner guide or browse its curated projects.</p>
          </div>
          <button className="btn-secondary" onClick={() => setCurrentTab('domains')}>
            <span>View All Guides</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="domain-cards-grid">
          {domains.map((domain) => (
            <div 
              key={domain.id} 
              className="domain-card"
              onClick={() => onSelectDomain(domain)}
            >
              <div 
                className="domain-card-icon"
                style={{ background: getDomainBg(domain.code) }}
              >
                {getDomainIcon(domain.code)}
              </div>
              <h4 className="domain-card-title">{domain.name}</h4>
              <span className="domain-card-count">{domain.project_count || 0} Projects</span>
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                background: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {domain.branch_association.split('/')[0].trim()}
              </div>
            </div>
          ))}
        </div>

        {/* 3. WHAT DO YOU WANT TO BUILD? */}
        <div style={{ marginTop: '48px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">What do you want to build?</h2>
              <p className="section-desc">Tailored problem sets structured for your specific academic or competition goal.</p>
            </div>
          </div>

          <div className="build-types-grid">
            <div 
              className="build-type-card hackathon"
              onClick={() => onSelectCategory('Hackathon')}
            >
              <div>
                <Trophy size={24} style={{ marginBottom: '8px' }} />
                <div>Hackathon</div>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>High impact, fast prototyping</span>
              </div>
              <ArrowRight size={20} />
            </div>

            <div 
              className="build-type-card mini-project"
              onClick={() => onSelectCategory('Mini Project')}
            >
              <div>
                <Wrench size={24} style={{ marginBottom: '8px' }} />
                <div>Mini Project</div>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>2nd & 3rd year laboratory builds</span>
              </div>
              <ArrowRight size={20} />
            </div>

            <div 
              className="build-type-card seminar"
              onClick={() => onSelectCategory('Seminar')}
            >
              <div>
                <BookOpen size={24} style={{ marginBottom: '8px' }} />
                <div>Seminar</div>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>Technical review & presentation</span>
              </div>
              <ArrowRight size={20} />
            </div>

            <div 
              className="build-type-card research"
              onClick={() => onSelectCategory('Research')}
            >
              <div>
                <Sparkles size={24} style={{ marginBottom: '8px' }} />
                <div>Research / Final Year</div>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>Novel architectures & publications</span>
              </div>
              <ArrowRight size={20} />
            </div>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="feature-highlights-strip">
          <div className="feature-highlight-item">
            <div className="highlight-icon-box">
              <CheckCircle size={22} />
            </div>
            <div className="highlight-text">
              <h4>Real-World Problems</h4>
              <p>Curated and verified from official documents and SIH</p>
            </div>
          </div>

          <div className="feature-highlight-item">
            <div className="highlight-icon-box">
              <Layers size={22} />
            </div>
            <div className="highlight-text">
              <h4>Multiple Domains</h4>
              <p>VLSI, IoT, Embedded, Cybersecurity, Robotics & Data Science</p>
            </div>
          </div>

          <div className="feature-highlight-item">
            <div className="highlight-icon-box">
              <Wrench size={22} />
            </div>
            <div className="highlight-text">
              <h4>Guided Development</h4>
              <p>From problem statement to 7-slide presentation pitch</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED / BEGINNER PROJECTS SHOWCASE */}
      <section className="container" style={{ padding: '30px 0 50px 0' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Popular Curated Problems</h2>
            <p className="section-desc">Sample real-world problem statements ready for university implementation.</p>
          </div>
          <button className="btn-secondary" onClick={() => onNavigateExplore()}>
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {featuredProjects.slice(0, 6).map((proj) => (
            <div 
              key={proj.id}
              className="project-card"
              style={{ cursor: 'pointer' }}
              onClick={() => onViewProject(proj.id)}
            >
              <div 
                className="project-card-icon"
                style={{ 
                  background: proj.domain === 'VLSI' ? '#fffbeb' : 
                              proj.domain === 'Cybersecurity' ? '#fff1f2' : 
                              proj.domain === 'Data Science' ? '#f5f3ff' : '#eff6ff',
                  color: proj.domain === 'VLSI' ? '#d97706' : 
                         proj.domain === 'Cybersecurity' ? '#e11d48' : 
                         proj.domain === 'Data Science' ? '#7c3aed' : '#2563eb'
                }}
              >
                {proj.domain === 'VLSI' ? <Cpu size={24} /> : 
                 proj.domain === 'Cybersecurity' ? <Shield size={24} /> : 
                 proj.domain === 'Data Science' ? <BarChart2 size={24} /> : <Zap size={24} />}
              </div>

              <div className="project-card-content">
                <div className="project-card-top">
                  <h4 className="project-card-title">{proj.title}</h4>
                  <span className={`badge badge-diff-${proj.difficulty.toLowerCase()}`}>
                    {proj.difficulty}
                  </span>
                </div>

                <div className="project-card-meta">
                  <span className="badge badge-branch-ece">{proj.branch}</span>
                  <span className="badge badge-domain">{proj.domain}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{proj.subdomain}</span>
                </div>

                <p className="project-card-summary">
                  {proj.simple_explanation.slice(0, 140)}...
                </p>

                <div className="project-card-actions">
                  <span className="project-id-tag">{proj.project_id}</span>
                  <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>View Problem</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. USER JOURNEY FLOW (Matching Screen 6) */}
      <section className="container journey-flow-section">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f2b48', marginBottom: '8px' }}>
            User Journey Flow — How GURU Works
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b' }}>
            A structured path designed to guide any student from problem discovery to building a real working prototype.
          </p>
        </div>

        <div className="journey-steps-grid">
          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
              1. Visit Homepage
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Search or Explore</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Browse through curated engineering branches (ECE, CSE, Electrical) or type your interests into the global search bar.
            </p>
          </div>

          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
              2. Filter & Select
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Target Your Constraints</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Filter by branch, domain, subdomain, difficulty, or project purpose (Hackathon, Mini Project, Research).
            </p>
          </div>

          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              3. View Problems
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Read Authentic Statements</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Inspect the faithful problem statements imported directly from official documents and research repositories.
            </p>
          </div>

          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#fffbeb', color: '#d97706' }}>
              4. Understand
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Line-by-Line Breakdown</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Read beginner-friendly explanations: who is affected, why it matters, existing gaps, and required tools.
            </p>
          </div>

          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
              5. Develop & Plan
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Get Tailored Roadmap</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Generate an estimated 6-step implementation plan, hardware checklist, and a 7-slide presentation pitch.
            </p>
          </div>

          <div className="journey-step-box">
            <span className="journey-step-badge" style={{ background: '#fff1f2', color: '#e11d48' }}>
              6. Build & Impact
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Collaborate & Deliver</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Find team members with matching skills, prototype in your college laboratory, and compete in hackathons.
            </p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2b48, #1e3a8a)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
              From Real-World Problems to Real-World Impact
            </h3>
            <p style={{ fontSize: '14px', color: '#93c5fd' }}>
              Start your university project, hackathon journey, or academic publication with GURU today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-primary" 
              style={{ background: '#2563eb', border: '1px solid #60a5fa' }}
              onClick={() => onNavigateExplore()}
            >
              Explore Project Catalogue
            </button>
            <button 
              className="btn-secondary"
              style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setCurrentTab('submit')}
            >
              Submit a Problem
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
