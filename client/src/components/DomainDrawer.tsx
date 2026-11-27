import React from 'react';
import { 
  X, 
  Cpu, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Globe, 
  Briefcase, 
  AlertTriangle, 
  Code, 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DomainGuide } from '../types';

interface DomainDrawerProps {
  domain: DomainGuide | null;
  isOpen: boolean;
  onClose: () => void;
  onExploreProjects: (domainName: string) => void;
}

export const DomainDrawer: React.FC<DomainDrawerProps> = ({
  domain,
  isOpen,
  onClose,
  onExploreProjects
}) => {
  if (!isOpen || !domain) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-branch-ece">{domain.branch_association}</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {domain.project_count || 0} Projects Available
              </span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {domain.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
              {domain.full_form}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Body - 17 Section Guide */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Quick CTA to filter projects */}
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              onExploreProjects(domain.name);
              onClose();
            }}
          >
            <span>View All {domain.project_count || ''} {domain.name} Projects</span>
            <ArrowRight size={16} />
          </button>

          {/* 1. Simple Definition */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f2b48', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#2563eb" />
              What is {domain.name}? (Simple Definition)
            </h4>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              {domain.simple_definition}
            </p>
          </div>

          {/* 2. Beginner Explanation */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} color="#059669" />
              Explanation for Absolute Beginners
            </h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, background: '#ecfdf5', padding: '14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              {domain.beginner_explanation}
            </p>
          </div>

          {/* 3. Why This Domain Exists & Purpose */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
                Why This Domain Exists
              </h5>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                {domain.why_exists}
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
                Main Purpose
              </h5>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                {domain.main_purpose}
              </p>
            </div>
          </div>

          {/* 4. Real-World Applications */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} color="#2563eb" />
              Where is {domain.name} Used in the Real World?
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {domain.real_world_apps.map((app, idx) => (
                <li key={idx}>{app}</li>
              ))}
            </ul>
          </div>

          {/* 5. Industries */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} color="#d97706" />
              Industries That Use This Technology
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {domain.industries.map((ind, idx) => (
                <span key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* 6. Tools, Hardware & Software */}
          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={16} color="#2563eb" />
              Hardware & Software Tools Needed
            </h4>
            {domain.tools_hardware_software?.Hardware && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Hardware:</span>
                <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                  {domain.tools_hardware_software.Hardware.join(' • ')}
                </p>
              </div>
            )}
            {domain.tools_hardware_software?.Software && (
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Software:</span>
                <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                  {domain.tools_hardware_software.Software.join(' • ')}
                </p>
              </div>
            )}
            {domain.programming_languages && domain.programming_languages.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Languages:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {domain.programming_languages.map((l, i) => (
                    <span key={i} style={{ background: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Important Concepts to Learn */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={16} color="#7c3aed" />
              Key Concepts to Learn First
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {domain.important_concepts.map((concept, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                  <CheckCircle2 size={14} color="#2563eb" />
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Project Examples (Beginner -> Intermediate -> Advanced) */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#2563eb" />
              Project Ideas By Difficulty Level
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Beginner */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Beginner Examples:</span>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#065f46', marginTop: '4px' }}>
                  {domain.beginner_examples.map((ex, i) => <li key={i}>{ex}</li>)}
                </ul>
              </div>

              {/* Intermediate */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Intermediate Examples:</span>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#92400e', marginTop: '4px' }}>
                  {domain.intermediate_examples.map((ex, i) => <li key={i}>{ex}</li>)}
                </ul>
              </div>

              {/* Advanced */}
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase' }}>Advanced Examples:</span>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#9f1239', marginTop: '4px' }}>
                  {domain.advanced_examples.map((ex, i) => <li key={i}>{ex}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* 9. Suggested 7 Implementation Steps */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2b48', marginBottom: '10px' }}>
              How Can a Student Start? (Step-by-Step)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {domain.implementation_steps.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#334155' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>{idx + 1}.</span>
                  <span>{st.replace(/^Step \d+:\s*/i, '')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Limitations & Challenges */}
          {domain.limitations_challenges && (
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '14px', borderRadius: '8px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#ea580c" />
                Possible Challenges & Realistic Bounds
              </h5>
              <p style={{ fontSize: '13px', color: '#7c2d12', lineHeight: 1.5 }}>
                {domain.limitations_challenges}
              </p>
            </div>
          )}

          {/* Bottom CTA */}
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            onClick={() => {
              onExploreProjects(domain.name);
              onClose();
            }}
          >
            <span>Explore Projects in {domain.name}</span>
            <ArrowRight size={16} />
          </button>

        </div>
      </div>
    </div>
  );
};
