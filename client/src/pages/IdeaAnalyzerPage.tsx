import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  RotateCcw,
  AlertTriangle,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { IdeaAnalysisResult, Project } from '../types';

interface IdeaAnalyzerPageProps {
  onViewProject: (id: string | number) => void;
  onNavigateDevelop: (p: Project) => void;
  onOpenSlideModal: (p: Project) => void;
}

export const IdeaAnalyzerPage: React.FC<IdeaAnalyzerPageProps> = ({
  onViewProject,
  onNavigateDevelop,
  onOpenSlideModal
}) => {
  const [ideaText, setIdeaText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdeaAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const sampleIdeas = [
    "I want to make an automatic dustbin that detects hand presence and alerts when the bin is full.",
    "I want to develop a smart irrigation system that automatically waters plants when the soil becomes dry.",
    "I want to create a wearable fall detection device with emergency GPS alerts for older adults.",
    "I want to design an FPGA-based digital traffic signal controller with pedestrian countdown."
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaText.trim()) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.analyzeIdea(ideaText);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px auto' }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'rgba(187, 164, 229, 0.12)',
          border: '1px solid rgba(187, 164, 229, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: 'var(--accent-violet)',
          boxShadow: '0 0 20px rgba(187, 164, 229, 0.2)'
        }}>
          <Sparkles size={28} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          Project Idea Analyzer
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Describe your engineering idea in simple English. GURU maps it to the right technical domain, formulates the real-world problem statement, and suggests matching hardware and toolchains.
        </p>
      </div>

      {/* Styled Dark Input Box */}
      <div className="idea-input-box">
        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
          ENTER YOUR PROJECT IDEA:
        </label>
        <textarea
          className="idea-textarea"
          placeholder="E.g., I want to build a smart solar monitoring node that detects dust accumulation on panels and alerts farmers via LoRaWAN telemetry..."
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
        />

        <div className="idea-actions-row">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Try sample idea:</span>
            {sampleIdeas.slice(0, 2).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setIdeaText(sample)}
              >
                {sample.slice(0, 32)}...
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {ideaText && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '8px 14px' }}
                onClick={() => { setIdeaText(''); setResult(null); }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => handleAnalyze()}
              disabled={loading || !ideaText.trim()}
            >
              <Sparkles size={16} />
              <span>{loading ? 'Analyzing Idea...' : 'Analyze Idea'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Analysis Results Display in Matching Dark Background */}
      {result && (
        <div>
          {/* Top Banner Notice */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            fontSize: '13px',
            color: 'var(--foreground)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <span>
                <strong>Formulation Complete:</strong> Your idea has been mapped to {result.suggested_domain} ({result.suggested_branch}).
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>GURU Taxonomy Engine</span>
          </div>

          <div className="analyzer-results-grid">
            {/* Left Column: Problem Breakdown & Variations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1 & 2. Idea & Underlying Problem */}
              <div className="details-section-card">
                <div className="detail-card-number">
                  <HelpCircle size={14} />
                  <span>Your Idea Explained Simply</span>
                </div>
                <p style={{ marginTop: '8px', lineHeight: 1.6 }}>
                  {result.idea_explained_simply}
                </p>

                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">UNDERLYING REAL-WORLD PROBLEM:</label>
                  <p style={{ color: 'var(--foreground-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                    {result.underlying_problem}
                  </p>
                </div>
              </div>

              {/* 3. Potential Problem Statement */}
              <div className="details-section-card" style={{ borderLeft: '4px solid var(--accent-violet)' }}>
                <div className="detail-card-number">
                  <AlertCircle size={14} />
                  <span>Formulated Problem Statement</span>
                </div>
                <div className="quote-box">
                  "{result.suggested_problem_statement}"
                </div>
              </div>

              {/* Project Variations */}
              <div className="details-section-card">
                <div className="detail-card-number">
                  <Sparkles size={14} />
                  <span>Project Variations by Experience Level</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Beginner Variation:</span>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>{result.variations.beginner}</p>
                  </div>

                  <div style={{ background: 'rgba(252, 211, 77, 0.08)', border: '1px solid rgba(252, 211, 77, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>Intermediate Variation:</span>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>{result.variations.intermediate}</p>
                  </div>

                  <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-rose)', textTransform: 'uppercase' }}>Advanced Variation:</span>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>{result.variations.advanced}</p>
                  </div>
                </div>
              </div>

              {/* Limitations */}
              <div className="details-section-card">
                <div className="detail-card-number">
                  <AlertTriangle size={14} color="var(--accent-amber)" />
                  <span style={{ color: 'var(--accent-amber)' }}>Potential Limitations & Challenges</span>
                </div>
                <p style={{ marginTop: '8px', color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                  {result.potential_limitations}
                </p>
              </div>

            </div>

            {/* Right Column: Suggested Domain, Technologies, Matching Projects */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Suggested Domain & Branch */}
              <div className="details-section-card">
                <div className="detail-card-number">
                  <Layers size={14} />
                  <span>Domain Taxonomy Mapping</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                  {result.suggested_domain}
                </h3>
                <div style={{ display: 'flex', gap: '8px', margin: '10px 0 14px 0' }}>
                  <span className="badge badge-branch">{result.suggested_branch}</span>
                  <span className="badge badge-domain">{result.suggested_subdomain}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  <strong>Why this fits:</strong> {result.why_domain_fits}
                </p>

                {/* Technologies */}
                <label className="form-label">SUGGESTED TECHNOLOGIES:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {result.possible_technologies.map((t, idx) => (
                    <span key={idx} className="tech-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matching Projects from GURU Database */}
              <div className="details-section-card">
                <div className="detail-card-number">
                  <Sparkles size={14} />
                  <span>Matching Problems in GURU Database</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {result.matching_projects.map(mp => (
                    <div 
                      key={mp.id}
                      onClick={() => onViewProject(mp.id)}
                      style={{
                        padding: '14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                        {mp.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                        {mp.branch} • {mp.subdomain} • {mp.difficulty}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-secondary)', lineHeight: 1.4 }}>
                        {mp.simple_explanation?.slice(0, 110)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relevant Hackathons */}
              {result.relevant_hackathons && result.relevant_hackathons.length > 0 && (
                <div className="details-section-card">
                  <div className="detail-card-number">
                    <Trophy size={14} />
                    <span>Relevant Competitions</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {result.relevant_hackathons.map(h => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{h.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{h.organizer}</div>
                        </div>
                        <a href={h.official_link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
