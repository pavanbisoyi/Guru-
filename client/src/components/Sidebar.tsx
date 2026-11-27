import React from 'react';
import { 
  Search, 
  Sparkles, 
  Wrench, 
  Trophy, 
  Users, 
  Layers, 
  PlusCircle, 
  User as UserIcon, 
  ShieldCheck 
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user
}) => {
  const navItems = [
    { id: 'explore', label: 'Explore Projects', icon: <Search size={18} /> },
    { id: 'develop', label: 'Develop Project', icon: <Wrench size={18} /> },
    { id: 'analyzer', label: 'Idea Analyzer', icon: <Sparkles size={18} /> },
    { id: 'domains', label: 'Domain Guides', icon: <Layers size={18} /> },
    { id: 'hackathons', label: 'Hackathons', icon: <Trophy size={18} /> },
    { id: 'collaborators', label: 'Collaborators', icon: <Users size={18} /> },
    { id: 'submit', label: 'Submit Problem', icon: <PlusCircle size={18} /> },
    { id: 'dashboard', label: 'Dashboard & Profile', icon: <UserIcon size={18} /> },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header with Uploaded Custom Logo */}
      <div className="sidebar-brand" onClick={() => setCurrentTab('explore')}>
        <div className="brand-logo-container">
          <img 
            src="/guru-logo.jpg" 
            alt="GURU Logo" 
            className="sidebar-logo-img" 
          />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">GURU</h1>
          <span>Project Discovery & Hub</span>
        </div>
      </div>

      <div className="sidebar-section-label">MAIN NAVIGATION</div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = currentTab === item.id || (item.id === 'explore' && currentTab === 'home');
          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}

        {user?.role === 'admin' && (
          <button
            className={`sidebar-nav-btn admin-btn ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentTab('admin')}
          >
            <span className="sidebar-icon"><ShieldCheck size={18} /></span>
            <span className="sidebar-label">Admin Portal</span>
          </button>
        )}
      </nav>

      {/* Bottom info badge */}
      <div className="sidebar-footer">
        <div className="system-pill">
          <span className="live-dot" />
          <span>340+ Verified Problems</span>
        </div>
      </div>
    </aside>
  );
};
