import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Save, 
  AlertCircle, 
  HelpCircle,
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface SubmitProblemPageProps {
  user: User | null;
  onOpenAuth: () => void;
  setCurrentTab: (tab: string) => void;
}

export const SubmitProblemPage: React.FC<SubmitProblemPageProps> = ({
  user,
  onOpenAuth,
  setCurrentTab
}) => {
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [whyMatters, setWhyMatters] = useState('');
  const [department, setDepartment] = useState('ECE');
  const [domain, setDomain] = useState('Embedded Systems');
  const [subdomain, setSubdomain] = useState('');
  const [theme, setTheme] = useState('Agriculture');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [requiredTech, setRequiredTech] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!title.trim() || !problemStatement.trim()) {
      setError('Please provide at least a problem title and problem statement.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.createSubmission({
        title,
        problem_statement: problemStatement,
        detailed_description: detailedDescription,
        why_matters: whyMatters,
        department,
        domain,
        subdomain: subdomain || 'General',
        theme,
        suggested_solution: suggestedSolution,
        required_tech: requiredTech,
        expected_outcome: expectedOutcome,
        reference_links: referenceLinks,
        student_name: studentName || user?.name || 'Student Submitter',
        student_email: studentEmail || user?.email || 'student@guru.edu',
        status: isDraft ? 'draft' : 'submitted'
      });
      setSubmittedId(res.submission_id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 28px 60px 28px', maxWidth: '920px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bba4e5', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <FileText size={16} />
          <span>Community Contribution</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3e8ff', margin: 0, letterSpacing: '-0.02em' }}>
          Submit a Problem Statement
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '6px', lineHeight: 1.6 }}>
          Contribute real-world engineering challenges you encountered. Submissions are curated and published to the GURU problem statement repository.
        </p>
      </div>

      {submittedId ? (
        <div className="details-section-card" style={{
          padding: '44px 32px',
          textAlign: 'center',
          borderColor: 'rgba(16, 185, 129, 0.4)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f3e8ff', marginBottom: '8px' }}>
            Problem Statement Received!
          </h2>

          <div style={{
            display: 'inline-block',
            background: 'rgba(187, 164, 229, 0.12)',
            border: '1px solid rgba(187, 164, 229, 0.3)',
            color: '#bba4e5',
            fontSize: '15px',
            fontWeight: 700,
            padding: '8px 20px',
            borderRadius: '8px',
            margin: '12px 0 16px 0',
            fontFamily: 'monospace'
          }}>
            Submission ID: {submittedId}
          </div>

          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.65 }}>
            Your problem has been entered into the Review Queue. An authorized evaluator will review the technical domain alignment and approve it for the public catalogue.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => setCurrentTab('dashboard')}>
              <span>Track in My Dashboard</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => {
              setSubmittedId(null);
              setTitle('');
              setProblemStatement('');
            }}>
              Submit Another Problem
            </button>
          </div>
        </div>
      ) : (
        <div className="details-section-card" style={{ padding: '36px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Guide Notice */}
          <div style={{
            background: 'rgba(187, 164, 229, 0.08)',
            border: '1px solid rgba(187, 164, 229, 0.2)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '28px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <HelpCircle size={18} color="#bba4e5" style={{ flexShrink: 0 }} />
            <span>
              <strong>Review Process:</strong> Submitted ➔ Under Technical Review ➔ Approved ➔ Published to Catalogue.
            </span>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)}>
            {/* Title */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">
                Problem Title <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Automated Canal Silt Level Detector for Irrigation"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Original Problem Statement */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">
                Original Problem Statement <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea 
                className="form-textarea" 
                rows={3}
                placeholder="State the exact problem clearly (e.g. Canals experience unmonitored silt accumulation that reduces water flow to farms...)"
                value={problemStatement}
                onChange={e => setProblemStatement(e.target.value)}
                required
              />
            </div>

            {/* Detailed Description & Why It Matters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '22px' }}>
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Explain who faces this problem and context..."
                  value={detailedDescription}
                  onChange={e => setDetailedDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Why This Problem Matters</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="What happens if this problem is not solved?"
                  value={whyMatters}
                  onChange={e => setWhyMatters(e.target.value)}
                />
              </div>
            </div>

            {/* Branch, Domain, Subdomain, Theme */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '22px' }}>
              <div className="form-group">
                <label className="form-label">Engineering Branch</label>
                <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="ECE">Electronics and Communication (ECE)</option>
                  <option value="CSE">Computer Science and Engineering (CSE)</option>
                  <option value="ECE / CSE">Interdisciplinary (ECE / CSE)</option>
                  <option value="Electrical">Electrical and Electronics (EEE)</option>
                  <option value="Instrumentation">Instrumentation Engineering</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Main Domain</label>
                <select className="form-select" value={domain} onChange={e => setDomain(e.target.value)}>
                  <option value="VLSI">VLSI — Very Large Scale Integration</option>
                  <option value="Embedded Systems">Embedded Systems</option>
                  <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Communication Systems">Communication Systems</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Smart Automation">Smart Automation</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Quantum Computing">Quantum Computing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subdomain</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Water Infrastructure, Precision Agri, etc."
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Theme / Application Field</label>
                <select className="form-select" value={theme} onChange={e => setTheme(e.target.value)}>
                  <option value="Agriculture">Agriculture & Food Systems</option>
                  <option value="Healthcare">Healthcare & Assistive Devices</option>
                  <option value="Smart Cities">Smart Cities & Public Facilities</option>
                  <option value="Industrial Automation">Industrial Automation & IIoT</option>
                  <option value="Environment">Environment & Climate</option>
                  <option value="Energy">Energy & Battery Systems</option>
                  <option value="Transportation">Transportation & Logistics</option>
                  <option value="Safety and Security">Safety, Defence & Security</option>
                  <option value="Education">Education & Campus Tech</option>
                </select>
              </div>
            </div>

            {/* Suggested Solution & Required Tech */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '22px' }}>
              <div className="form-group">
                <label className="form-label">Suggested Solution (If known)</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="What could be built to solve this?"
                  value={suggestedSolution}
                  onChange={e => setSuggestedSolution(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Technologies / Tools</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="e.g. ESP32, Ultrasonic sensor, Python, LoRa"
                  value={requiredTech}
                  onChange={e => setRequiredTech(e.target.value)}
                />
              </div>
            </div>

            {/* Expected Outcome & Reference Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div className="form-group">
                <label className="form-label">Expected Output</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Working sensor node and dashboard"
                  value={expectedOutcome}
                  onChange={e => setExpectedOutcome(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Source or Reference Links</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. News link, research paper, community observation"
                  value={referenceLinks}
                  onChange={e => setReferenceLinks(e.target.value)}
                />
              </div>
            </div>

            {/* Submitter Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '28px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#bba4e5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Submitter Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Student Name"
                  />
                </div>
                <div>
                  <label className="form-label">Gmail / Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    placeholder="student@gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                <Save size={16} />
                <span>Save Draft</span>
              </button>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                <Send size={16} />
                <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
