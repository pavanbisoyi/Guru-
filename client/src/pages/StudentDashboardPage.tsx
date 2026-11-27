import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Send, 
  ArrowRight, 
  PlusCircle, 
  Wrench,
  Trash2,
  User as UserIcon,
  Mail,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Project, StudentSubmission, User } from '../types';
import { api } from '../api';

interface StudentDashboardPageProps {
  user: User | null;
  onSetUser: (u: User | null) => void;
  onOpenAuth: () => void;
  onViewProject: (id: string | number) => void;
  onNavigateDevelop: (p: Project) => void;
  setCurrentTab: (tab: string) => void;
  savedProjectIds: Set<string>;
  onToggleSave: (projectId: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  user,
  onSetUser,
  onViewProject,
  onNavigateDevelop,
  setCurrentTab,
  savedProjectIds,
  onToggleSave
}) => {
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Name + Gmail form
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bData, sData] = await Promise.all([
        api.getBookmarks(),
        api.getSubmissions()
      ]);
      setSavedProjects(bData);
      setSubmissions(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim()) {
      alert('Please enter both your full name and student Gmail address.');
      return;
    }
    const studentUser: User = {
      id: Date.now(),
      username: loginEmail.split('@')[0],
      email: loginEmail.trim(),
      name: loginName.trim(),
      role: 'student',
      department: 'ECE'
    };
    onSetUser(studentUser);
    localStorage.setItem('guru_student_profile', JSON.stringify(studentUser));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="badge badge-diff-beginner">Published to Catalogue</span>;
      case 'approved':
        return <span className="badge badge-diff-beginner">Approved</span>;
      case 'under_review':
        return <span className="badge badge-diff-intermediate">Under Review</span>;
      case 'changes_requested':
        return <span className="badge badge-diff-intermediate">Changes Requested</span>;
      case 'rejected':
        return <span className="badge badge-diff-advanced">Rejected</span>;
      default:
        return <span className="badge badge-domain">Submitted</span>;
    }
  };

  // If user is not logged in: display the clean Name + Gmail login form
  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
        <div className="demo-login-card" style={{ margin: '0 auto' }}>
          <div className="login-badge">
            <Sparkles size={13} />
            <span>Student Dashboard Gateway</span>
          </div>

          <h2>Sign In to Student Dashboard</h2>
          <p className="subtitle">
            Enter your Full Name and Gmail address to access your saved projects, project plans, and submission tracking.
          </p>

          <form onSubmit={handleStudentFormSubmit}>
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. K. Srikanth / Priya Sharma"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GMAIL ADDRESS</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. srikanth@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px', marginTop: '12px' }}>
              <span>Enter My Student Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      {/* Top Welcome Header */}
      <div style={{
        background: 'var(--card-glow)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <span className="badge badge-branch">{user.department} Department</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>
            Logged in with {user.email} • Role: {user.role.toUpperCase()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => setCurrentTab('submit')}>
            <PlusCircle size={16} />
            <span>Submit a Problem</span>
          </button>
          <button className="btn-secondary" onClick={() => setCurrentTab('explore')}>
            <span>Explore Projects</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px' }}>
        {/* Left Column: Saved Projects */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={20} color="var(--accent-violet)" />
              Saved Projects ({savedProjects.length})
            </h2>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading saved projects...</p>
          ) : savedProjects.length === 0 ? (
            <div style={{ background: 'var(--surface-card)', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>
                You haven't saved any projects yet. Click the bookmark icon on any project card to save it here!
              </p>
              <button className="btn-secondary" onClick={() => setCurrentTab('explore')}>
                Explore Projects
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {savedProjects.map(proj => (
                <div key={proj.id} className="project-card" style={{ padding: '16px' }}>
                  <div className="project-card-header">
                    <div className="badge-group">
                      <span className="badge badge-branch">{proj.branch}</span>
                      <span className="badge badge-domain">{proj.domain}</span>
                      <span className={`badge badge-diff-${proj.difficulty.toLowerCase()}`}>{proj.difficulty}</span>
                    </div>
                    <button 
                      onClick={() => {
                        onToggleSave(proj.project_id);
                        setSavedProjects(prev => prev.filter(p => p.project_id !== proj.project_id));
                      }}
                      className="btn-ghost"
                      style={{ color: '#ef4444' }}
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 
                    style={{ cursor: 'pointer', marginTop: '6px' }}
                    onClick={() => onViewProject(proj.id)}
                  >
                    {proj.title}
                  </h3>

                  <p className="overview" style={{ marginBottom: '12px' }}>
                    {proj.simple_explanation || proj.problem_statement}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => onNavigateDevelop(proj)}
                    >
                      <Wrench size={13} />
                      <span>Develop Plan</span>
                    </button>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => onViewProject(proj.id)}
                    >
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: My Problem Submissions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="var(--accent-emerald)" />
              My Problem Submissions ({submissions.length})
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div style={{ background: 'var(--surface-card)', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>
                You have not submitted any problem statements yet.
              </p>
              <button className="btn-primary" onClick={() => setCurrentTab('submit')}>
                Submit a Problem
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {submissions.map(sub => (
                <div key={sub.id} className="details-section-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-branch">{sub.submission_id}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                        {sub.title}
                      </h4>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginBottom: '10px' }}>
                    "{sub.problem_statement.slice(0, 110)}..."
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Domain: {sub.domain}</span>
                    <span>Submitted: {new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>

                  {sub.admin_notes && (
                    <div style={{ marginTop: '10px', background: 'rgba(252, 211, 77, 0.1)', border: '1px solid rgba(252, 211, 77, 0.3)', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--accent-amber)' }}>
                      <strong>Admin Feedback:</strong> {sub.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
