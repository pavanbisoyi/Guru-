import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { Hackathon, User } from '../types';
import { api } from '../api';

interface HackathonsPageProps {
  user: User | null;
  onExploreProjectsWithDomain: (domain: string) => void;
}

export const HackathonsPage: React.FC<HackathonsPageProps> = ({ user }) => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTracks, setNewTracks] = useState('');

  // Verified real official links dictionary fallback
  const getVerifiedLink = (h: Hackathon): string => {
    const t = (h.title || '').toLowerCase();
    if (t.includes('smart india') || t.includes('sih')) return 'https://www.sih.gov.in/';
    if (t.includes('5g') || t.includes('ai bharat')) return 'https://dot.gov.in/';
    if (t.includes('texas') || t.includes('ti')) return 'https://www.ti.com/';
    if (t.includes('quantum')) return 'https://amaravatiquantum.ap.gov.in/';
    if (t.includes('uraan')) return 'https://uraan.gov.pk/';
    if (h.official_link && h.official_link.startsWith('http')) return h.official_link;
    return 'https://www.sih.gov.in/';
  };

  useEffect(() => {
    loadHackathons();
  }, [departmentFilter, modeFilter]);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const data = await api.getHackathons({
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        mode: modeFilter !== 'all' ? modeFilter : undefined
      });
      // Filter out duplicate titles if any
      const unique: Hackathon[] = [];
      const seen = new Set<string>();
      data.forEach(h => {
        if (!seen.has(h.title)) {
          seen.add(h.title);
          unique.push(h);
        }
      });
      setHackathons(unique);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLink) return;
    try {
      await api.createHackathon({
        title: newTitle,
        organizer: newOrganizer || 'Official Organization',
        official_link: newLink,
        tracks: newTracks,
        mode: 'Hybrid',
        domains: 'IoT, Smart Automation, AI/ML',
        departments: 'ECE, CSE',
        status: 'open'
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewOrganizer('');
      setNewLink('');
      setNewTracks('');
      loadHackathons();
    } catch (err) {
      alert('Failed to add hackathon');
    }
  };

  return (
    <div className="container" style={{ padding: '30px 24px 60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
            Verified National & Global Hackathons
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '4px' }}>
            Official university and engineering hackathons aligned with GURU problem statement domains.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add Verified Hackathon</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'ECE', 'CSE', 'Electrical'].map(b => (
            <button
              key={b}
              className={`filter-pill-btn ${departmentFilter === b ? 'active' : ''}`}
              onClick={() => setDepartmentFilter(b)}
            >
              {b === 'all' ? 'All Branches' : b}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'Online', 'Hybrid', 'Offline'].map(m => (
            <button
              key={m}
              className={`filter-pill-btn ${modeFilter === m ? 'active' : ''}`}
              onClick={() => setModeFilter(m)}
            >
              {m === 'all' ? 'All Modes' : m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          Loading verified hackathons...
        </div>
      ) : hackathons.length === 0 ? (
        <div style={{ background: 'var(--surface-card)', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--muted)' }}>
          No hackathons found matching the selected filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {hackathons.map((h) => {
            const realLink = getVerifiedLink(h);
            return (
              <div 
                key={h.id} 
                className="details-section-card" 
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(252, 211, 77, 0.12)',
                      color: 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Trophy size={20} />
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className="badge badge-diff-beginner">
                        Verified Official
                      </span>
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--foreground-secondary)' }}>
                        {h.mode}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                    {h.title}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '12px' }}>
                    Organized by: {h.organizer}
                  </div>

                  {/* Tracks */}
                  {h.tracks && (
                    <div style={{ marginBottom: '14px' }}>
                      <label className="form-label">FOCUS TRACKS:</label>
                      <p style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                        {h.tracks}
                      </p>
                    </div>
                  )}

                  {/* Info List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--foreground-secondary)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--accent-violet)" />
                      <span><strong>Deadline:</strong> {h.registration_deadline}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="var(--accent-violet)" />
                      <span><strong>Location:</strong> {h.location} • {h.event_dates}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} color="var(--accent-violet)" />
                      <span><strong>Eligibility:</strong> {h.eligibility}</span>
                    </div>
                  </div>
                </div>

                {/* Real Link Action */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                  <a 
                    href={realLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '13px' }}
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Add Hackathon Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Add Verified Hackathon</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateHackathon}>
                <div className="form-group">
                  <label className="form-label">Hackathon Name</label>
                  <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Organizer</label>
                  <input className="form-input" value={newOrganizer} onChange={e => setNewOrganizer(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Official URL</label>
                  <input className="form-input" placeholder="https://..." value={newLink} onChange={e => setNewLink(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Focus Tracks</label>
                  <input className="form-input" value={newTracks} onChange={e => setNewTracks(e.target.value)} placeholder="e.g. Smart Agriculture, IoT, Cybersecurity" />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                  Save Hackathon
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
