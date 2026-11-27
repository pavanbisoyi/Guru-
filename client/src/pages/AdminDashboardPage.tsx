import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  Database, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  Search, 
  Layers, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Project, StudentSubmission, User } from '../types';
import { api } from '../api';

interface AdminDashboardPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onViewProject: (id: string | number) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user,
  onOpenAuth,
  onViewProject
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'projects' | 'imports' | 'stats'>('submissions');
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [importJobs, setImportJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviewingSub, setReviewingSub] = useState<StudentSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [publishToCatalog, setPublishToCatalog] = useState(true);

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadReport, setUploadReport] = useState<any>(null);

  // Edit / Add Project state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for project edit/add
  const [formTitle, setFormTitle] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formBranch, setFormBranch] = useState('ECE');
  const [formDomain, setFormDomain] = useState('Embedded Systems');
  const [formSubdomain, setFormSubdomain] = useState('');
  const [formTheme, setFormTheme] = useState('General');
  const [formDifficulty, setFormDifficulty] = useState('Intermediate');
  const [formTech, setFormTech] = useState('');
  const [formHw, setFormHw] = useState('');
  const [formSw, setFormSw] = useState('');
  const [formExpected, setFormExpected] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllAdminData();
    }
  }, [user]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [sData, subData, pData, jData] = await Promise.all([
        api.getAdminStats(),
        api.getSubmissions(),
        api.getProjects({ limit: 50 }),
        api.getImportJobs()
      ]);
      setStats(sData);
      setSubmissions(subData);
      setProjects(pData.projects);
      setImportJobs(jData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmission = async (status: 'approved' | 'rejected' | 'changes_requested') => {
    if (!reviewingSub) return;
    try {
      await api.reviewSubmission(reviewingSub.id, {
        status,
        admin_notes: reviewNotes,
        publish_to_catalog: status === 'approved' && publishToCatalog
      });
      alert(`Submission ${reviewingSub.submission_id} marked as ${status}!`);
      setReviewingSub(null);
      setReviewNotes('');
      loadAllAdminData();
    } catch (e: any) {
      alert(e.message || 'Error updating review');
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadReport(null);
    try {
      const res = await api.uploadDocument(uploadFile);
      setUploadReport(res.report || res);
      setUploadFile(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Error processing document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormProblem(p.problem_statement);
    setFormExplanation(p.simple_explanation);
    setFormBranch(p.branch);
    setFormDomain(p.domain);
    setFormSubdomain(p.subdomain || '');
    setFormTheme(p.theme || '');
    setFormDifficulty(p.difficulty);
    setFormTech(p.technologies);
    setFormHw(p.hardware_required);
    setFormSw(p.software_required);
    setFormExpected(p.expected_output);
    setCustomFields(p.custom_fields || {});
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formTitle,
        problem_statement: formProblem,
        simple_explanation: formExplanation,
        branch: formBranch,
        domain: formDomain,
        subdomain: formSubdomain,
        theme: formTheme,
        difficulty: formDifficulty,
        technologies: formTech,
        hardware_required: formHw,
        software_required: formSw,
        expected_output: formExpected,
        custom_fields: customFields
      };

      if (editingProject) {
        await api.updateAdminProject(editingProject.id, payload);
        alert('Project updated successfully!');
        setEditingProject(null);
      } else {
        await api.createAdminProject(payload);
        alert('New project created in catalogue!');
        setShowAddProjectModal(false);
      }
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this project record?')) return;
    try {
      await api.deleteAdminProject(id);
      loadAllAdminData();
    } catch (e: any) {
      alert(e.message || 'Error deleting project');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <ShieldCheck size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '24px', color: '#0f2b48', marginBottom: '8px' }}>
          Protected Administrator Portal
        </h2>
        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '440px', margin: '0 auto 24px auto' }}>
          This portal requires administrator privileges. Please sign in with an authorized admin account.
        </p>
        <button className="btn-primary" onClick={onOpenAuth}>
          Sign in as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2b48, #1e3a8a)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: 'white',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#60a5fa" />
            <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>
              Authorized Admin Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
            GURU Management Console
          </h1>
          <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
            Logged in: {user.name} ({user.email}) • Full catalogue curation & document processing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            style={{ background: 'white', color: '#0f2b48' }}
            onClick={loadAllAdminData}
          >
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
          <button 
            className="btn-primary"
            style={{ background: '#2563eb', border: '1px solid #60a5fa' }}
            onClick={() => {
              setEditingProject(null);
              setFormTitle('');
              setFormProblem('');
              setFormExplanation('');
              setFormTech('');
              setCustomFields({});
              setShowAddProjectModal(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <div className="details-section-card" style={{ marginBottom: 0, padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Projects</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f2b48' }}>{stats.totalProjects}</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>{stats.verifiedProjects} Verified</span>
          </div>

          <div className="details-section-card" style={{ marginBottom: 0, padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Pending Submissions</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stats.pendingSubmissions > 0 ? '#d97706' : '#0f2b48' }}>
              {stats.pendingSubmissions}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Needs review</span>
          </div>

          <div className="details-section-card" style={{ marginBottom: 0, padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Source Ingestion Jobs</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f2b48' }}>{stats.totalImportJobs}</div>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>10 Core PDFs Active</span>
          </div>

          <div className="details-section-card" style={{ marginBottom: 0, padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Platform Users</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f2b48' }}>{stats.totalUsers}</div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Students & Admins</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Review Submissions ({submissions.filter(s => s.status === 'submitted').length} Pending)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Project Database ({projects.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'imports' ? 'active' : ''}`}
          onClick={() => setActiveTab('imports')}
        >
          Document Upload & Ingestion
        </button>
      </div>

      {/* TAB 1: REVIEW SUBMISSIONS QUEUE */}
      {activeTab === 'submissions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48' }}>
              Student Problem Statements Queue
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Total submissions: {submissions.length}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
              No submissions currently in queue.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {submissions.map(sub => (
                <div key={sub.id} className="details-section-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="project-id-tag">{sub.submission_id}</span>
                        <span className="badge badge-branch-ece">{sub.department} • {sub.domain}</span>
                        <span className={`badge badge-diff-${sub.status === 'approved' ? 'beginner' : sub.status === 'submitted' ? 'intermediate' : 'advanced'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2b48', marginTop: '4px' }}>
                        {sub.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        By: <strong>{sub.student_name}</strong> ({sub.student_email}) • {new Date(sub.created_at).toLocaleString()}
                      </div>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ padding: '7px 14px', fontSize: '13px' }}
                      onClick={() => {
                        setReviewingSub(sub);
                        setReviewNotes(sub.admin_notes || '');
                      }}
                    >
                      Inspect & Review
                    </button>
                  </div>

                  {/* Problem statement preview */}
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb', margin: '12px 0', fontSize: '14px', color: '#1e293b' }}>
                    "{sub.problem_statement}"
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                    <div><strong>Why Matters:</strong> {sub.why_matters || 'Not specified'}</div>
                    <div><strong>Tech:</strong> {sub.required_tech || 'Not specified'}</div>
                    <div><strong>Outcome:</strong> {sub.expected_outcome || 'Not specified'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT DATABASE CRUD & EXTRA FIELDS */}
      {activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48' }}>
              Manage Verified Projects & Dynamic Fields
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {projects.length} loaded records
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map(proj => (
              <div key={proj.id} className="details-section-card" style={{ marginBottom: 0, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="project-id-tag">{proj.project_id}</span>
                      <span className="badge badge-branch-ece">{proj.branch}</span>
                      <span className="badge badge-domain">{proj.domain}</span>
                      <span className={`badge badge-diff-${proj.difficulty.toLowerCase()}`}>{proj.difficulty}</span>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2b48', marginTop: '4px' }}>
                      {proj.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                      {proj.simple_explanation?.slice(0, 140)}...
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleOpenEdit(proj)}
                      title="Edit project fields & add custom fields"
                    >
                      <Edit size={14} />
                      <span>Edit / Add Fields</span>
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444' }}
                      onClick={() => handleDeleteProject(proj.id)}
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT UPLOAD & INGESTION MANAGER */}
      {activeTab === 'imports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px' }}>
          {/* Upload New Document Box */}
          <div>
            <div className="details-section-card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color="#2563eb" />
                Upload New Source Document
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                Upload additional PDF, DOCX, TXT, or XLSX source files. The ingestion engine automatically parses project records, validates domains, and flags duplicates.
              </p>

              <form onSubmit={handleUploadDocument}>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  marginBottom: '18px',
                  cursor: 'pointer'
                }}>
                  <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt,.xlsx" 
                    onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'block', margin: '0 auto', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    Supports PDF, Word (DOCX), Excel (XLSX), and Plain Text (TXT)
                  </div>
                </div>

                {uploadFile && (
                  <div style={{ fontSize: '13px', color: '#059669', marginBottom: '14px', fontWeight: 600 }}>
                    Selected file: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={uploadLoading || !uploadFile}
                >
                  <Upload size={16} />
                  <span>{uploadLoading ? 'Extracting & Parsing Document...' : 'Ingest Document into Database'}</span>
                </button>
              </form>

              {/* Upload Report Result */}
              {uploadReport && (
                <div style={{ marginTop: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>
                    Import Report: {uploadReport.filename}
                  </h4>
                  <ul style={{ fontSize: '13px', color: '#047857', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Total Records Extracted: <strong>{uploadReport.total_extracted}</strong></li>
                    <li>Records Added to Database: <strong>{uploadReport.inserted}</strong></li>
                    <li>Duplicates Detected: <strong>{uploadReport.duplicates_found}</strong></li>
                    <li>Missing Fields Flagged: <strong>{uploadReport.missing_fields_flagged}</strong></li>
                    <li>Status: <strong>{uploadReport.status}</strong></li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Import History & Active Sources */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48', marginBottom: '14px' }}>
              Ingested Source Documents ({importJobs.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {importJobs.map(job => (
                <div key={job.id} className="details-section-card" style={{ marginBottom: 0, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#2563eb" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f2b48' }}>
                        {job.filename}
                      </span>
                    </div>
                    <span className="badge badge-diff-beginner">
                      {job.total_extracted} Projects
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Status: {job.status} • Size: {(job.file_size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT & REVIEW MODAL */}
      {reviewingSub && (
        <div className="modal-overlay" onClick={() => setReviewingSub(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div>
                <h3>Review Submission: {reviewingSub.submission_id}</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>By {reviewingSub.student_name} ({reviewingSub.student_email})</span>
              </div>
              <button className="close-btn" onClick={() => setReviewingSub(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-branch-ece">{reviewingSub.department} • {reviewingSub.domain}</span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2b48', marginTop: '6px' }}>
                  {reviewingSub.title}
                </h4>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Original Statement:</span>
                <p style={{ fontSize: '14px', color: '#1e293b', marginTop: '4px' }}>
                  "{reviewingSub.problem_statement}"
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px', fontSize: '13px' }}>
                <div><strong>Why Matters:</strong> {reviewingSub.why_matters}</div>
                <div><strong>Suggested Solution:</strong> {reviewingSub.suggested_solution}</div>
                <div><strong>Required Tech:</strong> {reviewingSub.required_tech}</div>
                <div><strong>Outcome:</strong> {reviewingSub.expected_outcome}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Reviewer / Admin Feedback Notes:</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Feedback sent to student (e.g. Approved for catalogue, or please clarify sensor requirements)..."
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={publishToCatalog}
                  onChange={e => setPublishToCatalog(e.target.checked)}
                />
                <span>Automatically publish to public verified catalogue upon approval</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ color: '#ef4444' }}
                  onClick={() => handleReviewSubmission('rejected')}
                >
                  Reject
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => handleReviewSubmission('changes_requested')}
                >
                  Request Changes
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleReviewSubmission('approved')}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD PROJECT MODAL WITH CUSTOM FIELDS */}
      {(editingProject || showAddProjectModal) && (
        <div className="modal-overlay" onClick={() => { setEditingProject(null); setShowAddProjectModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3>{editingProject ? `Edit Project: ${editingProject.project_id}` : 'Add New Project'}</h3>
              <button className="close-btn" onClick={() => { setEditingProject(null); setShowAddProjectModal(false); }}>✕</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSaveProject}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea className="form-textarea" rows={3} value={formProblem} onChange={e => setFormProblem(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Simplified Explanation</label>
                  <textarea className="form-textarea" rows={2} value={formExplanation} onChange={e => setFormExplanation(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={formBranch} onChange={e => setFormBranch(e.target.value)}>
                      <option value="ECE">ECE</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE / CSE">ECE / CSE</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Instrumentation">Instrumentation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Domain</label>
                    <input className="form-input" value={formDomain} onChange={e => setFormDomain(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="form-select" value={formDifficulty} onChange={e => setFormDifficulty(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Technologies</label>
                    <input className="form-input" value={formTech} onChange={e => setFormTech(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Output</label>
                    <input className="form-input" value={formExpected} onChange={e => setFormExpected(e.target.value)} />
                  </div>
                </div>

                {/* DYNAMIC CUSTOM FIELDS BUILDER (Fulfilling: "i can upload some more feilds later") */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginTop: '10px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f2b48', marginBottom: '8px' }}>
                    Custom Dynamic Fields (Extensible Schema)
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Field Name (e.g., funding_grant, lab_code, patent_no)"
                      value={customKey}
                      onChange={e => setCustomKey(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Field Value"
                      value={customVal}
                      onChange={e => setCustomVal(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        if (customKey.trim() && customVal.trim()) {
                          setCustomFields(prev => ({ ...prev, [customKey.trim()]: customVal.trim() }));
                          setCustomKey('');
                          setCustomVal('');
                        }
                      }}
                    >
                      Add Field
                    </button>
                  </div>

                  {Object.entries(customFields).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {Object.entries(customFields).map(([k, v]) => (
                        <div key={k} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>{k}:</strong> {v}
                          <button 
                            type="button" 
                            onClick={() => {
                              const copy = { ...customFields };
                              delete copy[k];
                              setCustomFields(copy);
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setEditingProject(null); setShowAddProjectModal(false); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
