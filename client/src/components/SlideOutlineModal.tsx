import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Download, 
  Check, 
  Presentation, 
  FileText, 
  ChevronRight,
  Info
} from 'lucide-react';
import { SlideItem, Project } from '../types';

interface SlideOutlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  slides: SlideItem[];
}

export const SlideOutlineModal: React.FC<SlideOutlineModalProps> = ({
  isOpen,
  onClose,
  project,
  slides
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen || !project) return null;

  const currentSlides = slides && slides.length > 0 ? slides : [
    {
      slide_number: 1,
      title: "1. Introduction & Overview",
      subtitle: "Project Title, Team Members, and Academic Institution",
      key_points: [
        `Project: ${project.title}`,
        `Branch / Department: ${project.branch}`,
        `Domain: ${project.domain}`,
        `Short Overview: ${project.simple_explanation.slice(0, 160)}...`
      ]
    },
    {
      slide_number: 2,
      title: "2. Problem Statement & Understanding",
      subtitle: "The Challenge Faced and Why It Matters",
      key_points: [
        `Official Problem Statement: ${project.problem_statement}`,
        `Who is Affected: ${project.who_affected || 'Students, industry workers, community'}`,
        `Why This Problem Matters: ${project.why_matters || 'Critical inefficiency or resource loss'}`
      ]
    },
    {
      slide_number: 3,
      title: "3. Proposed Solution",
      subtitle: "What the Team Plans to Build",
      key_points: [
        `Core Approach: ${project.proposed_approach || project.simple_explanation}`,
        `Expected Output: ${project.expected_output}`,
        `Target Difficulty: ${project.difficulty}`
      ]
    },
    {
      slide_number: 4,
      title: "4. Technical Flow & Methodology",
      subtitle: "How the System Operates End-to-End",
      key_points: [
        `Architectural Flow: Sensory/Data Input -> Microcontroller / Algorithm -> Telemetry -> Dashboard / Actuation`,
        `Core Processing: State machine, predictive model, or synthesizable logic`
      ]
    },
    {
      slide_number: 5,
      title: "5. Implementation Technologies",
      subtitle: "Hardware, Software, and Tools",
      key_points: [
        `Technologies: ${project.technologies}`,
        `Hardware: ${project.hardware_required}`,
        `Software: ${project.software_required}`,
        `Prerequisites: ${project.skills_required}`
      ]
    },
    {
      slide_number: 6,
      title: "6. Expected Results & Feasibility",
      subtitle: "Benefits, Validation Plan, and Limitations",
      key_points: [
        `Deliverable: ${project.expected_output}`,
        `Validation Plan: Unit testing and stress testing under varying conditions`,
        `Known Limitations: ${project.limitations_challenges || 'Power constraints or sensor limits'}`
      ]
    },
    {
      slide_number: 7,
      title: "7. Conclusion & Future Scope",
      subtitle: "Key Takeaways and Next Horizons",
      key_points: [
        `Key Takeaway: Functional student prototype solving the problem`,
        `Future Scope: ${project.future_scope || 'Cloud scaling and automation expansion'}`,
        `Source Citation: ${project.source_reference || project.source_document}`
      ]
    }
  ];

  const generateMarkdownText = () => {
    let md = `# Presentation Outline: ${project.title}\n`;
    md += `Domain: ${project.domain} | Branch: ${project.branch} | ID: ${project.project_id}\n\n`;
    currentSlides.forEach(s => {
      md += `## Slide ${s.slide_number}: ${s.title}\n`;
      md += `*Subtitle: ${s.subtitle}*\n\n`;
      if (s.key_points) {
        s.key_points.forEach(kp => {
          md += `- ${kp}\n`;
        });
      }
      md += `\n`;
    });
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateMarkdownText()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.project_id}_presentation_outline.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Presentation size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48' }}>
                Recommended Presentation Structure (Max 7 Slides)
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Standard SIH / College Project Review Format for: <strong>{project.title}</strong>
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Note Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#475569'
          }}>
            <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              Seven slides are the recommended maximum for project idea pitches. Adapt this structure to your specific competition or university review guidelines without fabricating experimental results.
            </span>
          </div>

          {/* Interactive Slide Selector & Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', minHeight: '340px' }}>
            
            {/* Slide List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentSlides.map((slide, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: activeSlide === idx ? '#2563eb' : '#e2e8f0',
                    background: activeSlide === idx ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: activeSlide === idx ? '#2563eb' : '#64748b' }}>
                      SLIDE {slide.slide_number}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      {slide.title.replace(/^\d+\.\s*/, '')}
                    </div>
                  </div>
                  <ChevronRight size={16} color={activeSlide === idx ? '#2563eb' : '#94a3b8'} />
                </div>
              ))}
            </div>

            {/* Slide Preview Card */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.08)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 16,
                right: 20,
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748b',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Slide {currentSlides[activeSlide].slide_number} of 7
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2b48', marginBottom: '4px' }}>
                {currentSlides[activeSlide].title}
              </h3>
              <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, marginBottom: '20px' }}>
                {currentSlides[activeSlide].subtitle}
              </p>

              <div style={{ flex: 1 }}>
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Recommended Content Points:
                </h5>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#334155' }}>
                  {currentSlides[activeSlide].key_points?.map((pt, pIdx) => (
                    <li key={pIdx} style={{ lineHeight: 1.5 }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Adaptable for PowerPoint, Canva, or Google Slides
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {activeSlide > 0 && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => setActiveSlide(prev => prev - 1)}
                    >
                      Previous
                    </button>
                  )}
                  {activeSlide < currentSlides.length - 1 && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => setActiveSlide(prev => prev + 1)}
                    >
                      Next Slide
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Actions: Copy & Download */}
          <div style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button className="btn-secondary" onClick={handleCopy}>
              {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
              <span>{copied ? 'Copied Outline!' : 'Copy Outline Markdown'}</span>
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={16} />
              <span>Download Outline (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
