import React from 'react';
import { 
  Bookmark, 
  X, 
  ArrowRight, 
  Trash2, 
  Sparkles, 
  Layers, 
  Cpu, 
  ExternalLink 
} from 'lucide-react';
import { Project } from '../types';

interface SavedProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjectIds: Set<string>;
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onToggleSave: (projectId: string) => void;
  onExploreMore: () => void;
}

export const SavedProjectsDrawer: React.FC<SavedProjectsDrawerProps> = ({
  isOpen,
  onClose,
  savedProjectIds,
  allProjects,
  onSelectProject,
  onToggleSave,
  onExploreMore
}) => {
  if (!isOpen) return null;

  const savedList = allProjects.filter(p => savedProjectIds.has(p.project_id));

  return (
    <div className="saved-drawer-overlay" onClick={onClose}>
      <aside 
        className="saved-drawer-container"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="saved-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="saved-drawer-icon-box">
              <Bookmark size={18} color="#bba4e5" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f3e8ff', margin: 0 }}>
                Saved Projects
              </h2>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {savedList.length} bookmarked problem statement{savedList.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <button 
            className="saved-drawer-close-btn"
            onClick={onClose}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="saved-drawer-body">
          {savedList.length === 0 ? (
            <div className="saved-drawer-empty">
              <div className="saved-drawer-empty-icon">
                <Bookmark size={36} color="rgba(187, 164, 229, 0.4)" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f3e8ff', marginBottom: '6px' }}>
                No Saved Projects Yet
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '280px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                Click the Bookmark icon on any problem statement card while exploring to pin it here for quick access.
              </p>
              <button 
                className="btn-primary" 
                style={{ fontSize: '13px', padding: '10px 18px' }}
                onClick={() => {
                  onClose();
                  onExploreMore();
                }}
              >
                <span>Explore Projects Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="saved-drawer-list">
              {savedList.map(project => (
                <div key={project.project_id} className="saved-project-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="badge badge-branch" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {project.branch}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(187, 164, 229, 0.1)',
                        color: '#bba4e5',
                        border: '1px solid rgba(187, 164, 229, 0.25)',
                        fontWeight: 600
                      }}>
                        {project.domain}
                      </span>
                    </div>

                    <button
                      className="saved-card-remove-btn"
                      title="Remove from Saved"
                      onClick={() => onToggleSave(project.project_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#f3e8ff', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {project.title}
                  </h4>

                  <p style={{
                    fontSize: '12.5px',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: 1.5,
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.problem_statement}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'monospace' }}>
                      {project.project_id}
                    </span>

                    <button 
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => {
                        onClose();
                        onSelectProject(project);
                      }}
                    >
                      <span>View Details</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {savedList.length > 0 && (
          <div className="saved-drawer-footer">
            <button 
              className="btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '10px' }}
              onClick={() => {
                onClose();
                onExploreMore();
              }}
            >
              <span>Explore More Projects</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
