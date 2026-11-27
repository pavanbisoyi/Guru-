import React from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  User as UserIcon, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles, 
  Wrench, 
  Trophy, 
  Users, 
  Layers 
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  savedCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  savedCount,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setCurrentTab('home')}>
          <div className="brand-icon-box">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>GURU</h1>
            <span>Guided Understanding, Research & University Projects</span>
          </div>
        </div>

        {/* Navigation Tabs matching Pivot Sols & GURU */}
        <nav className="nav-links">
          <button 
            className={`nav-link ${currentTab === 'home' || currentTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            <Sparkles size={15} color="var(--accent-violet)" />
            Guided Discovery
          </button>
          <button 
            className={`nav-link ${currentTab === 'explore' ? 'active' : ''}`}
            onClick={() => setCurrentTab('explore')}
          >
            Explore Projects
          </button>
          <button 
            className={`nav-link ${currentTab === 'develop' ? 'active' : ''}`}
            onClick={() => setCurrentTab('develop')}
          >
            <Wrench size={15} />
            Develop Project
          </button>
          <button 
            className={`nav-link ${currentTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setCurrentTab('analyzer')}
          >
            <Sparkles size={15} />
            Idea Analyzer
          </button>
          <button 
            className={`nav-link ${currentTab === 'domains' ? 'active' : ''}`}
            onClick={() => setCurrentTab('domains')}
          >
            <Layers size={15} />
            Domains
          </button>
          <button 
            className={`nav-link ${currentTab === 'hackathons' ? 'active' : ''}`}
            onClick={() => setCurrentTab('hackathons')}
          >
            <Trophy size={15} />
            Hackathons
          </button>
          <button 
            className={`nav-link ${currentTab === 'collaborators' ? 'active' : ''}`}
            onClick={() => setCurrentTab('collaborators')}
          >
            <Users size={15} />
            Collaborators
          </button>
          <button 
            className={`nav-link ${currentTab === 'submit' ? 'active' : ''}`}
            onClick={() => setCurrentTab('submit')}
          >
            <PlusCircle size={15} />
            Submit Problem
          </button>
        </nav>

        {/* User Actions */}
        <div className="nav-actions">
          {/* Saved Bookmarks */}
          <button 
            className="btn-secondary" 
            title="Saved Projects"
            onClick={() => setCurrentTab('dashboard')}
            style={{ position: 'relative', padding: '8px 12px' }}
          >
            <Bookmark size={16} />
            {savedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                background: '#2563eb',
                color: 'white',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Admin portal shortcut if logged in as admin */}
          {user?.role === 'admin' && (
            <button 
              className={`btn-primary ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('admin')}
              style={{ background: '#0f2b48', fontSize: '13px', padding: '8px 14px' }}
            >
              <ShieldCheck size={16} />
              Admin Portal
            </button>
          )}

          {/* Auth State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="btn-secondary"
                onClick={() => setCurrentTab('dashboard')}
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                <UserIcon size={14} />
                <span>{user.name.split(' ')[0]} ({user.role})</span>
              </button>
              <button 
                onClick={onLogout}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px 10px', color: '#ef4444' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={onOpenAuth}>
              <UserIcon size={16} />
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
