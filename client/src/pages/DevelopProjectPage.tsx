import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Presentation, 
  Copy, 
  Check, 
  Users, 
  ArrowRight,
  Info,
  Layers,
  Cpu,
  Code
} from 'lucide-react';
import { Project, SlideItem } from '../types';

interface DevelopProjectPageProps {
  initialProject?: Project | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onFindCollaborators: (p: Project) => void;
  setCurrentTab: (tab: string) => void;
}

export const DevelopProjectPage: React.FC<DevelopProjectPageProps> = ({
  initialProject,
  projects,
  onSelectProject,
  onFindCollaborators,
  setCurrentTab
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject || (projects[0] || null));
  const [selectedGoal, setSelectedGoal] = useState('Mini Project');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setSelectedProject(initialProject);
      setSelectedDifficulty(initialProject.difficulty || 'Intermediate');
    }
  }, [initialProject]);

  const p = selectedProject;

  const slides: SlideItem[] = p ? [
    {
      slide_number: 1,
      title: "1. Introduction & Overview",
      subtitle: `${p.title} • ${p.branch}`,
      key_points: [
        `Project Title: ${p.title}`,
        `Academic Domain: ${p.domain} (${p.subdomain || 'General'})`,
        `Branch: ${p.branch}`,
        `Overview: ${p.simple_explanation?.slice(0, 140)}...`
      ]
    },
    {
      slide_number: 2,
      title: "2. Problem Statement & Impact",
      subtitle: "The Core Real-World Challenge",
      key_points: [
        `Original Problem Statement: ${p.problem_statement}`,
        `Target Beneficiaries: ${p.who_affected || 'Industry workers, farmers, or civic users'}`,
        `Why It Matters: ${p.why_matters || 'Directly prevents inefficiency or resource wastage'}`
      ]
    },
    {
      slide_number: 3,
      title: "3. Proposed Technical Solution",
      subtitle: "Engineered Architecture",
      key_points: [
        `Approach: ${p.proposed_approach || p.simple_explanation}`,
        `Target Format: ${selectedGoal}`,
        `Difficulty Level: ${selectedDifficulty}`
      ]
    },
    {
      slide_number: 4,
      title: "4. Technical Flow & System Architecture",
      subtitle: "End-to-End Operation",
      key_points: [
        `Input Layer: Physical sensors, telemetry, or dataset inputs`,
        `Core Processing: ${p.domain === 'VLSI' ? 'Synthesizable Verilog RTL on FPGA' : p.domain === 'Cybersecurity' ? 'Python detection engine' : 'Microcontroller sampling loop & telemetry'}`,
        `Output / Actuation: Alerts, physical relays, or web dashboard`
      ]
    },
    {
      slide_number: 5,
      title: "5. Implementation Technologies",
      subtitle: "Hardware & Software Stack",
      key_points: [
        `Technologies: ${p.technologies}`,
        `Hardware: ${p.hardware_required}`,
        `Software: ${p.software_required}`,
        `Prerequisites: ${p.skills_required}`
      ]
    },
    {
      slide_number: 6,
      title: "6. Expected Results & Feasibility",
      subtitle: "Prototype Validation Plan",
      key_points: [
        `Deliverable: ${p.expected_output}`,
        `Validation Plan: Lab bench testing and timing measurements`,
        `Practical Feasibility: Reproducible using university lab resources`
      ]
    },
    {
      slide_number: 7,
      title: "7. Conclusion & Future Scope",
      subtitle: "Key Takeaways and Next Horizons",
      key_points: [
        `Key Takeaway: Functional proof-of-concept prototype`,
        `Future Scope: ${p.future_scope || 'Cloud scaling and edge intelligence'}`,
        `Source Reference: ${p.source_reference || p.source_document}`
      ]
    }
  ] : [];

  const handleCopySlides = () => {
    let text = `# 7-Slide Pitch Outline: ${p?.title}\n\n`;
    slides.forEach(s => {
      text += `## Slide ${s.slide_number}: ${s.title}\n`;
      text += `*${s.subtitle}*\n`;
      s.key_points?.forEach(kp => {
        text += `- ${kp}\n`;
      });
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
          Develop Your Project
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '4px' }}>
          Select your problem statement, target track, and difficulty level to generate a complete technical roadmap and 7-slide pitch outline.
        </p>
      </div>

      {/* Grid of Options */}
      <div className="develop-grid">
        {/* Card 1: Select Project */}
        <div className="develop-card">
          <div className="develop-card-header">
            <div className="develop-card-title">
              <span className="step-badge-indicator">1</span>
              <span>Project Problem</span>
            </div>
            <span className="badge badge-branch">{p?.branch || 'Branch'}</span>
          </div>
          
          <label className="form-label">CHOOSE FROM GURU DATABASE:</label>
          <select 
            className="form-select"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const found = projects.find(item => item.id === parseInt(e.target.value));
              if (found) setSelectedProject(found);
            }}
          >
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>
                [{proj.branch}] {proj.title} ({proj.domain})
              </option>
            ))}
          </select>

          {p && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
              <strong>Objective:</strong> {p.simple_explanation || p.problem_statement}
            </div>
          )}
        </div>

        {/* Card 2: Select Goal */}
        <div className="develop-card">
          <div className="develop-card-header">
            <div className="develop-card-title">
              <span className="step-badge-indicator">2</span>
              <span>Target Track</span>
            </div>
          </div>

          <label className="form-label">SELECT PROJECT PURPOSE:</label>
          <div className="goal-selection-cards">
            {[
              { label: 'Hackathon', desc: 'Fast prototype & pitch', icon: <Trophy size={16} color="var(--accent-purple)" /> },
              { label: 'Mini Project', desc: 'Semester lab build', icon: <Wrench size={16} color="var(--accent-emerald)" /> },
              { label: 'Seminar', desc: 'Technical presentation', icon: <BookOpen size={16} color="var(--accent-amber)" /> },
              { label: 'Major Project', desc: 'In-depth build', icon: <Sparkles size={16} color="var(--accent-rose)" /> }
            ].map(g => (
              <div 
                key={g.label}
                className={`goal-btn-card ${selectedGoal === g.label ? 'selected' : ''}`}
                onClick={() => setSelectedGoal(g.label)}
              >
                {g.icon}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{g.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Select Difficulty */}
        <div className="develop-card">
          <div className="develop-card-header">
            <div className="develop-card-title">
              <span className="step-badge-indicator">3</span>
              <span>Complexity Level</span>
            </div>
          </div>

          <label className="form-label">DIFFICULTY LEVEL:</label>
          <div className="diff-radio-group">
            {['Beginner', 'Intermediate', 'Advanced'].map(d => (
              <div 
                key={d}
                className={`diff-radio-card ${selectedDifficulty === d ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty(d)}
              >
                {d}
              </div>
            ))}
          </div>

          {p && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-domain">Domain: {p.domain}</span>
              <span className="badge badge-diff-beginner">Verified Model</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan & Pitch Outline Details */}
      {p && (
        <div style={{ marginTop: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Left: Hardware & Software Stack */}
          <div className="develop-card">
            <div className="develop-card-header">
              <div className="develop-card-title">
                <Cpu size={18} color="var(--accent-violet)" />
                <span>Required Hardware & Toolchain</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">HARDWARE BILL OF MATERIALS:</label>
                <p style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                  {p.hardware_required || 'Standard PC / Development Board'}
                </p>
              </div>

              <div>
                <label className="form-label">SOFTWARE & SIMULATORS:</label>
                <p style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                  {p.software_required || 'Open-source toolchains & IDEs'}
                </p>
              </div>

              <div>
                <label className="form-label">PREREQUISITE SKILLS:</label>
                <p style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                  {p.skills_required || 'Basic programming & electronics fundamentals'}
                </p>
              </div>

              <button 
                className="btn-secondary"
                style={{ marginTop: '8px' }}
                onClick={() => onFindCollaborators(p)}
              >
                <Users size={15} />
                <span>Find Teammates for this Project</span>
              </button>
            </div>
          </div>

          {/* Right: 7-Slide Pitch Presentation Generator */}
          <div className="develop-card">
            <div className="develop-card-header">
              <div className="develop-card-title">
                <Presentation size={18} color="var(--accent-purple)" />
                <span>7-Slide Presentation Outline</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleCopySlides}
              >
                {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied Outline' : 'Copy All Slides'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
              {slides.map(s => (
                <div 
                  key={s.slide_number}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-violet)', marginBottom: '6px' }}>
                    {s.subtitle}
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                    {s.key_points?.map((kp, idx) => (
                      <li key={idx} style={{ marginTop: '2px' }}>{kp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
