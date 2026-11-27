import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DomainDrawer } from './components/DomainDrawer';
import { SlideOutlineModal } from './components/SlideOutlineModal';
import { AuthModal } from './components/AuthModal';
import { GuidedRedesignView } from './components/GuidedRedesignView';
import { SavedProjectsDrawer } from './components/SavedProjectsDrawer';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { DevelopProjectPage } from './pages/DevelopProjectPage';
import { IdeaAnalyzerPage } from './pages/IdeaAnalyzerPage';
import { DomainLibraryPage } from './pages/DomainLibraryPage';
import { HackathonsPage } from './pages/HackathonsPage';
import { SubmitProblemPage } from './pages/SubmitProblemPage';
import { CollaboratorsPage } from './pages/CollaboratorsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { api, getStoredToken, setStoredToken } from './api';
import { Project, DomainGuide, User } from './types';
import { ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [user, setUser] = useState<User | null>(null);
  const [domains, setDomains] = useState<DomainGuide[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  // Navigation / Modal Context States
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [selectedProjectForDevelop, setSelectedProjectForDevelop] = useState<Project | null>(null);
  const [selectedProjectForSlides, setSelectedProjectForSlides] = useState<Project | null>(null);
  
  // Drawer & Modal Triggers
  const [drawerDomain, setDrawerDomain] = useState<DomainGuide | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Domain redirect state into explore projects
  const [exploreInitialDomain, setExploreInitialDomain] = useState<string | null>(null);
  const [exploreInitialBranch, setExploreInitialBranch] = useState<string | null>(null);

  // Explore step tracking for hierarchical back button
  const [exploreStep, setExploreStep] = useState<number>(1);
  const [stepBackTrigger, setStepBackTrigger] = useState<number>(0);

  // Bookmarks state (persisted locally for all students + synced with database when authenticated)
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('guru_saved_project_ids');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Target project for collaborator matching
  const [collabTargetProject, setCollabTargetProject] = useState<Project | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    // Check stored student profile
    const storedStudent = localStorage.getItem('guru_student_profile');
    if (storedStudent && !user) {
      try {
        setUser(JSON.parse(storedStudent));
      } catch (e) {}
    }

    // Check auth
    if (getStoredToken()) {
      api.getMe()
        .then(res => setUser(res.user))
        .catch(() => setStoredToken(null));
      
      api.getBookmarks()
        .then(bm => {
          setSavedProjectIds(prev => {
            const next = new Set(prev);
            bm.forEach(p => next.add(p.project_id));
            try {
              localStorage.setItem('guru_saved_project_ids', JSON.stringify(Array.from(next)));
            } catch (e) {}
            return next;
          });
        })
        .catch(() => {});
    }

    // Load domains
    api.getDomains().then(setDomains).catch(console.error);

    // Load initial sample projects
    api.getProjects({ limit: 100 }).then(res => setAllProjects(res.projects)).catch(console.error);
  }, []);

  // Universal bookmark toggle - works seamlessly for guests and logged-in students
  const handleToggleSave = async (projectId: string) => {
    setSavedProjectIds(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      try {
        localStorage.setItem('guru_saved_project_ids', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });

    if (user) {
      try {
        await api.toggleBookmark(projectId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    localStorage.removeItem('guru_student_profile');
    setUser(null);
    if (currentTab === 'admin' || currentTab === 'dashboard') {
      setCurrentTab('explore');
    }
  };

  const handleSelectDomain = (domain: DomainGuide) => {
    setDrawerDomain(domain);
    setIsDrawerOpen(true);
  };

  // Redirect from Domain Guides into Explore Projects with domain preselected
  const handleExploreDomainProjects = (domainName: string, branch?: string) => {
    setExploreInitialDomain(domainName);
    if (branch) setExploreInitialBranch(branch);
    setCurrentTab('explore');
  };

  const handleViewProject = (id: string | number) => {
    setSelectedProjectId(id);
    setCurrentTab('details');
  };

  const handleNavigateDevelop = (project: Project) => {
    setSelectedProjectForDevelop(project);
    setCurrentTab('develop');
  };

  const handleOpenSlideModal = (project: Project) => {
    setSelectedProjectForSlides(project);
    setIsSlideModalOpen(true);
  };

  const handleFindCollaborators = (project: Project) => {
    setCollabTargetProject(project);
    setCurrentTab('collaborators');
  };

  // Hierarchical Back Navigation Handler
  const handleGlobalBack = () => {
    if (isSavedDrawerOpen) {
      setIsSavedDrawerOpen(false);
      return;
    }
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      return;
    }
    if (isSlideModalOpen) {
      setIsSlideModalOpen(false);
      return;
    }
    if (selectedProjectId) {
      setSelectedProjectId(null);
      setCurrentTab('explore');
      return;
    }
    if (currentTab === 'explore' && exploreStep > 1) {
      setStepBackTrigger(prev => prev + 1);
      return;
    }
    if (currentTab !== 'explore') {
      setCurrentTab('explore');
      return;
    }
  };

  // Determine if student has navigated inward and can go back
  const canGoBack = 
    isSavedDrawerOpen || 
    isDrawerOpen || 
    isSlideModalOpen || 
    selectedProjectId !== null || 
    (currentTab === 'explore' && exploreStep > 1) || 
    currentTab !== 'explore';

  return (
    <div className="app-layout">
      {/* Left-Side Dashboard Sidebar */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedProjectId(null);
          setCurrentTab(tab);
        }}
        user={user}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Header Bar with Saved Projects and User Name */}
        <TopHeader 
          user={user}
          savedCount={savedProjectIds.size}
          onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onNavigateDashboard={() => {
            setSelectedProjectId(null);
            setCurrentTab('dashboard');
          }}
        />

        {/* Dynamic Page Views */}
        <main style={{ flex: 1, paddingBottom: '40px' }}>
          {(currentTab === 'explore' || currentTab === 'home' || currentTab === 'discovery') && (
            <GuidedRedesignView 
              user={user}
              onSetUser={setUser}
              domains={domains}
              savedProjectIds={savedProjectIds}
              onToggleSave={handleToggleSave}
              onOpenSlideModal={handleOpenSlideModal}
              onNavigateDevelop={handleNavigateDevelop}
              onFindCollaborators={handleFindCollaborators}
              initialDomain={exploreInitialDomain}
              initialBranch={exploreInitialBranch}
              onStepChange={setExploreStep}
              stepBackTrigger={stepBackTrigger}
            />
          )}

          {currentTab === 'details' && selectedProjectId && (
            <ProjectDetailsPage 
              projectId={selectedProjectId}
              onBack={() => {
                setSelectedProjectId(null);
                setCurrentTab('explore');
              }}
              onNavigateDevelop={handleNavigateDevelop}
              onOpenSlideModal={handleOpenSlideModal}
              onFindCollaborators={handleFindCollaborators}
              onSelectDomain={handleSelectDomain}
              savedProjectIds={savedProjectIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentTab === 'develop' && (
            <DevelopProjectPage 
              initialProject={selectedProjectForDevelop}
              projects={allProjects}
              onSelectProject={setSelectedProjectForDevelop}
              onFindCollaborators={handleFindCollaborators}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'analyzer' && (
            <IdeaAnalyzerPage 
              onViewProject={handleViewProject}
              onNavigateDevelop={handleNavigateDevelop}
              onOpenSlideModal={handleOpenSlideModal}
            />
          )}

          {currentTab === 'domains' && (
            <DomainLibraryPage 
              domains={domains}
              onSelectDomain={handleSelectDomain}
              onExploreDomainProjects={handleExploreDomainProjects}
            />
          )}

          {currentTab === 'hackathons' && (
            <HackathonsPage 
              user={user}
              onExploreProjectsWithDomain={handleExploreDomainProjects}
            />
          )}

          {currentTab === 'submit' && (
            <SubmitProblemPage 
              user={user}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'collaborators' && (
            <CollaboratorsPage 
              user={user}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              targetProject={collabTargetProject}
            />
          )}

          {currentTab === 'dashboard' && (
            <StudentDashboardPage 
              user={user}
              onSetUser={setUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onViewProject={handleViewProject}
              onNavigateDevelop={handleNavigateDevelop}
              setCurrentTab={setCurrentTab}
              savedProjectIds={savedProjectIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboardPage 
              user={user}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onViewProject={handleViewProject}
            />
          )}
        </main>
      </div>

      {/* Slide-Out Saved Projects Drawer from Top Header */}
      <SavedProjectsDrawer 
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedProjectIds={savedProjectIds}
        allProjects={allProjects}
        onSelectProject={(proj) => {
          setIsSavedDrawerOpen(false);
          handleViewProject(proj.project_id);
        }}
        onToggleSave={handleToggleSave}
        onExploreMore={() => {
          setIsSavedDrawerOpen(false);
          setCurrentTab('explore');
        }}
      />

      {/* Domain Guide Slide-Out Drawer */}
      <DomainDrawer 
        domain={drawerDomain}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onExploreProjects={handleExploreDomainProjects}
      />

      {/* 7-Slide Pitch Outline Presentation Modal */}
      <SlideOutlineModal 
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        project={selectedProjectForSlides}
        slides={selectedProjectForSlides ? [] : []}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          api.getBookmarks()
            .then(bm => {
              setSavedProjectIds(prev => {
                const next = new Set(prev);
                bm.forEach(p => next.add(p.project_id));
                try {
                  localStorage.setItem('guru_saved_project_ids', JSON.stringify(Array.from(next)));
                } catch (e) {}
                return next;
              });
            })
            .catch(() => {});
        }}
      />

      {/* Floating Small Transparent Back Button at Rightmost Bottom */}
      {canGoBack && (
        <button 
          className="floating-back-btn"
          onClick={handleGlobalBack}
          title="Go back to previous level"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      )}
    </div>
  );
};

export default App;
