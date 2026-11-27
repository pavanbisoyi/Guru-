import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Filter,
  GraduationCap,
  Layers,
  Code2
} from 'lucide-react';
import { User, Project } from '../types';

interface Collaborator {
  id: number;
  name: string;
  branch: string;
  domain: string;
  role: string;
  skills: string[];
  bio: string;
  status: string;
}

const EXAMPLE_COLLABORATORS: Collaborator[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    branch: 'ECE',
    domain: 'Embedded Systems',
    role: 'Hardware & Firmware Lead',
    skills: ['ARM Cortex-M', 'C/C++', 'FreeRTOS', 'KiCad PCB', 'SPI/I2C'],
    bio: 'Looking for a CSE teammate to build the cloud backend for an IoT smart grid monitor.',
    status: 'Available'
  },
  {
    id: 2,
    name: 'Sneha Patel',
    branch: 'CSE',
    domain: 'Data Science',
    role: 'ML Engineer',
    skills: ['Python', 'PyTorch', 'FastAPI', 'OpenCV', 'Edge Impulse'],
    bio: 'Interested in TinyML computer vision projects. Seeking ECE partner for edge deployment.',
    status: 'Available'
  },
  {
    id: 3,
    name: 'Rohan Verma',
    branch: 'ECE',
    domain: 'VLSI',
    role: 'ASIC / RTL Designer',
    skills: ['Verilog', 'SystemVerilog', 'ModelSim', 'Xilinx Vivado', 'FPGA'],
    bio: 'Designing an optimized RISC-V coprocessor core for sensor encryption.',
    status: 'Available'
  },
  {
    id: 4,
    name: 'Pooja Nair',
    branch: 'Electrical',
    domain: 'Internet of Things (IoT)',
    role: 'Power Electronics & IoT',
    skills: ['MATLAB/Simulink', 'ESP32', 'Battery Management', 'MQTT', 'Altium'],
    bio: 'Building an EV solar charging controller. Looking for a firmware teammate.',
    status: 'Available'
  },
  {
    id: 5,
    name: 'Vikram Joshi',
    branch: 'Mechanical',
    domain: 'Robotics',
    role: 'Mechatronics Specialist',
    skills: ['SolidWorks', 'ROS 2', 'Kinematics', '3D Printing', 'Arduino'],
    bio: 'Constructing a quadcopter inspection rover. Looking for ECE/CSE peers for path planning.',
    status: 'Available'
  },
  {
    id: 6,
    name: 'Ananya Deshmukh',
    branch: 'CSE',
    domain: 'Cybersecurity',
    role: 'Security & Network Analyst',
    skills: ['Wireshark', 'Cryptography', 'Go', 'Linux Kernel', 'TLS Protocols'],
    bio: 'Focused on hardware security and cryptographic side-channel attack countermeasures.',
    status: 'Available'
  },
  {
    id: 7,
    name: 'Karthik Rao',
    branch: 'ECE',
    domain: 'Communication Systems',
    role: 'RF & Wireless Engineer',
    skills: ['GNU Radio', 'SDR', 'LoRaWAN', 'Antenna Design', 'MATLAB'],
    bio: 'Working on rural long-range emergency communication mesh networks.',
    status: 'Available'
  },
  {
    id: 8,
    name: 'Divya Sundaram',
    branch: 'CSE',
    domain: 'Smart Automation',
    role: 'Full Stack & Automation',
    skills: ['React', 'TypeScript', 'Node.js', 'Docker', 'WebSockets'],
    bio: 'Developing industrial telemetry dashboards with real-time sensor visualization.',
    status: 'Available'
  }
];

interface CollaboratorsPageProps {
  user: User | null;
  onOpenAuth: () => void;
  targetProject?: Project | null;
}

export const CollaboratorsPage: React.FC<CollaboratorsPageProps> = ({
  user,
  onOpenAuth,
  targetProject
}) => {
  const [branchFilter, setBranchFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const branches = ['All', 'ECE', 'CSE', 'Electrical', 'Mechanical'];
  const domains = [
    'All',
    'Embedded Systems',
    'Data Science',
    'VLSI',
    'Internet of Things (IoT)',
    'Robotics',
    'Cybersecurity',
    'Communication Systems',
    'Smart Automation'
  ];

  const filteredCollaborators = EXAMPLE_COLLABORATORS.filter(c => {
    const matchBranch = branchFilter === 'All' || c.branch === branchFilter;
    const matchDomain = domainFilter === 'All' || c.domain.toLowerCase().includes(domainFilter.toLowerCase());
    return matchBranch && matchDomain;
  });

  const handleConnect = (collab: Collaborator) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setSelectedCollab(collab);
    setMessage(`Hi ${collab.name}, I would like to team up with you on an engineering project!`);
    setContactSuccess(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setSelectedCollab(null);
      setContactSuccess(false);
    }, 1800);
  };

  return (
    <div className="container" style={{ padding: '32px 28px 60px 28px', maxWidth: '1280px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bba4e5', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <Users size={16} />
          <span>Peer Collaboration Network</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3e8ff', margin: 0, letterSpacing: '-0.02em' }}>
          Student Collaborators
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '6px', maxWidth: '720px', lineHeight: 1.6 }}>
          Filter students by Engineering Branch and Technical Domain to find the ideal project partner for hackathons, capstones, and research.
        </p>
      </div>

      {/* Target Project Callout */}
      {targetProject && (
        <div style={{
          background: 'rgba(187, 164, 229, 0.08)',
          border: '1px solid rgba(187, 164, 229, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#bba4e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Project Matching:
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {targetProject.title} ({targetProject.project_id})
            </h4>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
              Stack: {targetProject.technologies}
            </div>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(187, 164, 229, 0.15)', color: '#bba4e5', border: '1px solid rgba(187, 164, 229, 0.3)', padding: '6px 14px', borderRadius: '20px', fontWeight: 600 }}>
            Looking for Teammates
          </span>
        </div>
      )}

      {/* Filters: Branch & Domain Only */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '32px',
        backdropFilter: 'blur(10px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {/* Branch Filter */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#bba4e5',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <GraduationCap size={15} />
            <span>Filter by Branch</span>
          </label>
          <select 
            className="form-select"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            {branches.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'All Engineering Branches' : b}</option>
            ))}
          </select>
        </div>

        {/* Domain Filter */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#bba4e5',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <Layers size={15} />
            <span>Filter by Domain</span>
          </label>
          <select 
            className="form-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            {domains.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Technical Domains' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Collaborators List */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
          Showing {filteredCollaborators.length} Collaborator{filteredCollaborators.length === 1 ? '' : 's'}
        </span>
      </div>

      {filteredCollaborators.length === 0 ? (
        <div className="details-section-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255, 255, 255, 0.6)' }}>
          <Users size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No collaborators found matching the selected filters.</p>
          <button 
            className="btn-secondary" 
            style={{ marginTop: '12px' }}
            onClick={() => { setBranchFilter('All'); setDomainFilter('All'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredCollaborators.map(collab => (
            <div 
              key={collab.id} 
              className="details-section-card" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                margin: 0,
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'rgba(187, 164, 229, 0.15)',
                      border: '1px solid rgba(187, 164, 229, 0.3)',
                      color: '#bba4e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px'
                    }}>
                      {collab.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f3e8ff', margin: 0 }}>
                        {collab.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                        <span style={{ fontSize: '12px', color: '#bba4e5', fontWeight: 600 }}>
                          {collab.branch}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                          {collab.domain}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 700
                  }}>
                    {collab.status}
                  </span>
                </div>

                {/* Role badge */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    {collab.role}
                  </span>
                </div>

                {/* Bio */}
                <p style={{
                  fontSize: '13.5px',
                  color: 'rgba(255, 255, 255, 0.72)',
                  lineHeight: 1.55,
                  margin: '0 0 16px 0',
                  minHeight: '42px'
                }}>
                  {collab.bio}
                </p>

                {/* Technical Skills */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <Code2 size={12} />
                    <span>Skills</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {collab.skills.map(s => (
                      <span key={s} style={{
                        fontSize: '11.5px',
                        background: 'rgba(187, 164, 229, 0.08)',
                        color: '#d8b4fe',
                        border: '1px solid rgba(187, 164, 229, 0.2)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px' }}
                  onClick={() => handleConnect(collab)}
                >
                  <Send size={14} />
                  <span>Connect Collaborator</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {selectedCollab && (
        <div className="modal-overlay" onClick={() => setSelectedCollab(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Connect with {selectedCollab.name}</h3>
              <button className="close-btn" onClick={() => setSelectedCollab(null)}>✕</button>
            </div>
            <div className="modal-body">
              {contactSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle2 size={44} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '18px', color: '#f3e8ff', fontWeight: 700 }}>Collaboration Request Sent!</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '6px' }}>
                    {selectedCollab.name} has been notified. You can coordinate your engineering project together.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '4px' }}>
                      To: <strong style={{ color: '#f3e8ff' }}>{selectedCollab.name}</strong> ({selectedCollab.branch} • {selectedCollab.domain})
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message / Project Details</label>
                    <textarea 
                      className="form-textarea"
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Share what project you are building and why you would like to collaborate..."
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                  >
                    <Send size={15} />
                    <span>Send Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
