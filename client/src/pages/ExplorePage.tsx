import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Bookmark, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Cpu, 
  Zap, 
  Wifi, 
  Shield, 
  BarChart2, 
  Wrench, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';
import { Project, DomainGuide } from '../types';
import { api } from '../api';

interface ExplorePageProps {
  initialSearch?: string;
  initialBranch?: string;
  initialDomain?: string;
  initialCategory?: string;
  domains: DomainGuide[];
  onViewProject: (id: string | number) => void;
  onOpenDomainDrawer: (domain: DomainGuide) => void;
  savedProjectIds: Set<string>;
  onToggleSave: (projectId: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialSearch = '',
  initialBranch = 'all',
  initialDomain = 'all',
  initialCategory = 'all',
  domains,
  onViewProject,
  onOpenDomainDrawer,
  savedProjectIds,
  onToggleSave
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState(initialCategory);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<string[]>([]);

  // Fetch available themes once
  useEffect(() => {
    api.getThemes().then(setThemes).catch(() => {});
  }, []);

  // Update filters if initial props change
  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialBranch) setSelectedBranch(initialBranch);
    if (initialDomain) setSelectedDomain(initialDomain);
    if (initialCategory) setSelectedPurpose(initialCategory);
  }, [initialSearch, initialBranch, initialDomain, initialCategory]);

  // Load projects based on active filters
  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedBranch, selectedDomain, selectedDifficulty, selectedPurpose, selectedTheme, sortBy]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects({
        q: searchQuery,
        branch: selectedBranch,
        domain: selectedDomain,
        difficulty: selectedDifficulty,
        purpose: selectedPurpose,
        theme: selectedTheme,
        sort: sortBy,
        limit: 50
      });
      setProjects(res.projects);
      setTotalCount(res.total);
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBranch('all');
    setSelectedDomain('all');
    setSelectedDifficulty('all');
    setSelectedPurpose('all');
    setSelectedTheme('all');
    setSortBy('relevant');
  };

  const activeDomainGuide = domains.find(d => 
    d.name.toLowerCase() === selectedDomain.toLowerCase() || 
    d.code.toLowerCase() === selectedDomain.toLowerCase()
  );

  const getDomainIcon = (domainName: string) => {
    const d = domainName.toLowerCase();
    if (d.includes('vlsi')) return <Cpu size={22} color="#d97706" />;
    if (d.includes('embedded')) return <Zap size={22} color="#2563eb" />;
    if (d.includes('iot')) return <Wifi size={22} color="#059669" />;
    if (d.includes('cyber')) return <Shield size={22} color="#e11d48" />;
    if (d.includes('data')) return <BarChart2 size={22} color="#7c3aed" />;
    if (d.includes('robotic')) return <Wrench size={22} color="#0d9488" />;
    return <Layers size={22} color="#2563eb" />;
  };

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
          Explore Problem Statements
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '4px' }}>
          Find real-world engineering problems across different branches, technologies, and difficulty levels.
        </p>
      </div>

      <div className="explore-layout">
        {/* =========================================================
            SIDEBAR FILTERS (Screen 2)
            ========================================================= */}
        <aside className="filters-sidebar">
          <div className="sidebar-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={18} color="#2563eb" />
              Filter Problems
            </span>
            <button 
              className="btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '12px' }}
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* 1. BRANCH FILTER (CRITICAL USER REQUIREMENT) */}
          <div className="filter-group">
            <div className="filter-group-header">
              <span>Engineering Branch</span>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'none' }}>
                All domain data included
              </span>
            </div>

            {/* Quick Branch Selector Pills */}
            <div className="branch-pill-group">
              {[
                { label: 'All', value: 'all' },
                { label: 'ECE', value: 'ECE' },
                { label: 'CSE', value: 'CSE' },
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Instrumentation', value: 'Instrumentation' },
                { label: 'Mechanical', value: 'Mechanical' },
                { label: 'Civil', value: 'Civil' }
              ].map(b => (
                <button
                  key={b.value}
                  type="button"
                  className={`branch-pill ${selectedBranch === b.value ? 'active' : ''}`}
                  onClick={() => setSelectedBranch(b.value)}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Active Branch Callout indicator */}
            {selectedBranch !== 'all' && (
              <div className="active-branch-banner">
                <div>
                  <strong>Branch: {selectedBranch}</strong>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    Showing all projects for {selectedBranch} across all domains & themes.
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBranch('all')}
                  style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* 2. DOMAIN FILTER (with Instant Domain Explanation Trigger) */}
          <div className="filter-group">
            <div className="filter-group-header">
              <span>Domain / Technology</span>
              <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer' }} onClick={() => onOpenDomainDrawer(domains[0])}>
                Guides
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="filter-checkbox-item">
                <input 
                  type="radio" 
                  name="domain"
                  checked={selectedDomain === 'all'}
                  onChange={() => setSelectedDomain('all')}
                />
                <span>All Domains</span>
              </label>

              {/* Filter domains strictly by selected branch */}
              {domains.filter(d => {
                if (selectedBranch === 'all') return true;
                const b = selectedBranch.toUpperCase();
                const name = d.name.toLowerCase();
                if (b === 'ECE') {
                  return (
                    name.includes('embedded') ||
                    name.includes('vlsi') ||
                    name.includes('communication') ||
                    name.includes('iot') ||
                    name.includes('robotics') ||
                    (name.includes('smart automation') && !name.includes('data'))
                  ) && !name.includes('data science') && !name.includes('quantum');
                }
                if (b === 'CSE') {
                  return (
                    name.includes('data science') ||
                    name.includes('cybersecurity') ||
                    name.includes('quantum') ||
                    name.includes('smart automation') ||
                    name.includes('iot')
                  ) && !name.includes('vlsi') && !name.includes('communication');
                }
                return d.branch_association?.toUpperCase().includes(b);
              }).map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="filter-checkbox-item" style={{ flex: 1, marginBottom: 0 }}>
                    <input 
                      type="radio" 
                      name="domain"
                      checked={selectedDomain.toLowerCase() === d.name.toLowerCase()}
                      onChange={() => setSelectedDomain(d.name)}
                    />
                    <span style={{ fontWeight: selectedDomain.toLowerCase() === d.name.toLowerCase() ? 600 : 400 }}>
                      {d.name}
                    </span>
                  </label>
                  
                  {/* Dedicated Explain Domain Button on Sidebar */}
                  <button 
                    type="button" 
                    title={`Explain ${d.name} domain for beginners`}
                    onClick={() => onOpenDomainDrawer(d)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <Info size={13} />
                    <span>Guide</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar Active Domain Insight Card */}
            {activeDomainGuide && (
              <div className="sidebar-domain-insight">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h5>{activeDomainGuide.name} Insight</h5>
                  <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {activeDomainGuide.branch_association}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, marginBottom: '8px' }}>
                  {activeDomainGuide.simple_definition.slice(0, 110)}...
                </p>
                <button 
                  className="btn-outline-primary" 
                  style={{ width: '100%', padding: '5px 8px', fontSize: '11px', justifyContent: 'center' }}
                  onClick={() => onOpenDomainDrawer(activeDomainGuide)}
                >
                  <Info size={12} />
                  <span>Read Full Domain Guide</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. DIFFICULTY FILTER */}
          <div className="filter-group">
            <div className="filter-group-header">Difficulty Level</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <label key={diff} className="filter-checkbox-item">
                  <input 
                    type="radio" 
                    name="difficulty"
                    checked={selectedDifficulty.toLowerCase() === diff.toLowerCase()}
                    onChange={() => setSelectedDifficulty(diff)}
                  />
                  <span>{diff === 'all' ? 'All Difficulties' : diff}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. PURPOSE / CATEGORY FILTER */}
          <div className="filter-group">
            <div className="filter-group-header">Purpose / Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'All Purposes', value: 'all' },
                { label: 'Hackathon Project', value: 'Hackathon' },
                { label: 'Mini Project', value: 'Mini Project' },
                { label: 'Major / Final Year', value: 'Major' },
                { label: 'Seminar', value: 'Seminar' },
                { label: 'Research', value: 'Research' }
              ].map(cat => (
                <label key={cat.value} className="filter-checkbox-item">
                  <input 
                    type="radio" 
                    name="purpose"
                    checked={selectedPurpose.toLowerCase() === cat.value.toLowerCase()}
                    onChange={() => setSelectedPurpose(cat.value)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. THEME / APPLICATION FIELD */}
          {themes.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-header">Application Field / Theme</div>
              <select 
                className="form-select"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                style={{ fontSize: '13px', padding: '8px' }}
              >
                <option value="all">All Fields & Themes</option>
                {themes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

        </aside>

        {/* =========================================================
            MAIN PROJECT STREAM (Screen 2)
            ========================================================= */}
        <main>
          {/* Top Search & Sort Bar */}
          <div className="projects-stream-header">
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search projects by title, problem, technologies, hardware, software, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>Sort by:</span>
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevant">Most Relevant</option>
                <option value="newest">Recently Added</option>
                <option value="title_asc">Title (A to Z)</option>
                <option value="difficulty_asc">Difficulty (Easy to Hard)</option>
                <option value="difficulty_desc">Difficulty (Hard to Easy)</option>
              </select>
            </div>
          </div>

          {/* Result Stats Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
              Showing {projects.length} {projects.length === 1 ? 'problem' : 'problems'}
              {totalCount > projects.length && ` (of ${totalCount} total)`}
              {selectedBranch !== 'all' && ` in ${selectedBranch}`}
              {selectedDomain !== 'all' && ` in ${selectedDomain}`}
            </span>

            {(selectedBranch !== 'all' || selectedDomain !== 'all' || selectedDifficulty !== 'all' || selectedPurpose !== 'all' || selectedTheme !== 'all' || searchQuery) && (
              <button 
                onClick={handleClearFilters}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Projects List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>Loading verified project problems...</div>
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '60px 24px',
              textAlign: 'center'
            }}>
              <Search size={40} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
                No projects matched your selected filters
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                Try clearing one or more filters, or search with different keywords to explore more of the 445+ problems.
              </p>
              <button className="btn-primary" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="projects-list">
              {projects.map((proj) => {
                const isSaved = savedProjectIds.has(proj.project_id);
                return (
                  <div key={proj.id} className="project-card">
                    {/* Domain Icon Box */}
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
                      title={proj.domain}
                    >
                      {getDomainIcon(proj.domain)}
                    </div>

                    {/* Card Content */}
                    <div className="project-card-content">
                      <div className="project-card-top">
                        <h3 
                          className="project-card-title"
                          onClick={() => onViewProject(proj.id)}
                        >
                          {proj.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge badge-diff-${proj.difficulty.toLowerCase()}`}>
                            {proj.difficulty}
                          </span>
                          
                          {/* Save / Bookmark Button */}
                          <button 
                            type="button" 
                            title={isSaved ? "Saved to your dashboard" : "Save project"}
                            onClick={() => onToggleSave(proj.project_id)}
                            style={{
                              background: isSaved ? '#eff6ff' : 'none',
                              border: isSaved ? '1px solid #bfdbfe' : 'none',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: isSaved ? '#2563eb' : '#94a3b8'
                            }}
                          >
                            <Bookmark size={18} fill={isSaved ? '#2563eb' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Domain, Branch, Theme Badges */}
                      <div className="project-card-meta">
                        <span className="badge badge-branch-ece">{proj.branch}</span>
                        <span 
                          className="badge badge-domain"
                          onClick={() => {
                            const found = domains.find(d => d.name.toLowerCase() === proj.domain.toLowerCase());
                            if (found) onOpenDomainDrawer(found);
                          }}
                          title="Click to learn about this domain"
                        >
                          {proj.domain}
                        </span>
                        {proj.subdomain && (
                          <span style={{ fontSize: '12px', color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                            {proj.subdomain}
                          </span>
                        )}
                        {proj.theme && proj.theme !== proj.subdomain && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            • {proj.theme}
                          </span>
                        )}
                      </div>

                      {/* Problem Summary (Faithful to source) */}
                      <p className="project-card-summary">
                        {proj.simple_explanation || proj.problem_statement}
                      </p>

                      {/* Tech Tags preview */}
                      {proj.tech_list && proj.tech_list.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                          {proj.tech_list.slice(0, 4).map((tech, idx) => (
                            <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                              {tech}
                            </span>
                          ))}
                          {proj.tech_list.length > 4 && (
                            <span style={{ fontSize: '11px', color: '#94a3b8', alignSelf: 'center' }}>
                              +{proj.tech_list.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="project-card-actions">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="project-id-tag">{proj.project_id}</span>
                          {proj.is_verified === 1 && (
                            <span style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                              <CheckCircle2 size={13} />
                              Verified
                            </span>
                          )}
                        </div>

                        <button 
                          className="btn-primary" 
                          style={{ padding: '7px 16px', fontSize: '13px' }}
                          onClick={() => onViewProject(proj.id)}
                        >
                          <span>View Problem</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
