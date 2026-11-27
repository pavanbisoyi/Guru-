import React from 'react';
import { Bookmark, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { User } from '../types';

interface TopHeaderProps {
  user: User | null;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateDashboard: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  savedCount,
  onOpenSavedDrawer,
  onOpenAuth,
  onLogout,
  onNavigateDashboard
}) => {
  return (
    <header className="top-header-bar">
      <div className="top-header-right">
        {/* Saved Projects Button */}
        <button
          className="header-saved-btn"
          title="Saved Projects"
          onClick={onOpenSavedDrawer}
        >
          <Bookmark size={16} />
          <span>Saved Projects</span>
          {savedCount > 0 && (
            <span className="header-saved-badge">
              {savedCount}
            </span>
          )}
        </button>

        {/* User Profile / Login Name */}
        {user ? (
          <div className="header-user-wrapper">
            <button 
              className="header-user-btn"
              onClick={onNavigateDashboard}
              title="Open Student Dashboard"
            >
              <div className="user-avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-display-name">{user.name}</span>
            </button>
            <button
              onClick={onLogout}
              className="header-logout-btn"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button className="btn-primary header-login-btn" onClick={onOpenAuth}>
            <UserIcon size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
