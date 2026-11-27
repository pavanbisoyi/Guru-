import { Project, DomainGuide, Department, Hackathon, CollaboratorProfile, StudentSubmission, IdeaAnalysisResult, User } from './types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('guru_token');
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem('guru_token', token);
  else localStorage.removeItem('guru_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Projects
  getProjects: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    return request<{ total: number; page: number; pageSize: number; totalPages: number; projects: Project[] }>(`/projects?${qs.toString()}`);
  },

  getProject: (id: string | number) => {
    return request<Project & {
      domain_info?: DomainGuide | null;
      related_projects?: Project[];
      relevant_hackathons?: Hackathon[];
      slide_structure?: any[];
    }>(`/projects/${id}`);
  },

  // Domains & Departments
  getDomains: () => request<DomainGuide[]>('/domains'),
  getDomain: (code: string) => request<DomainGuide>(`/domains/${code}`),
  getDepartments: () => request<Department[]>('/departments'),
  getThemes: () => request<string[]>('/themes'),

  // Idea Analyzer
  analyzeIdea: (idea_text: string) => request<IdeaAnalysisResult>('/idea/analyze', {
    method: 'POST',
    body: JSON.stringify({ idea_text })
  }),

  // Student Submissions
  createSubmission: (data: Partial<StudentSubmission>) => request<{ message: string; submission_id: string }>(`/submissions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSubmissions: () => request<StudentSubmission[]>('/submissions'),
  reviewSubmission: (id: string | number, data: { status: string; admin_notes?: string; publish_to_catalog?: boolean }) => request<{ message: string }>(`/submissions/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Bookmarks
  getBookmarks: () => request<Project[]>('/bookmarks'),
  toggleBookmark: (project_id: string) => request<{ saved: boolean; message: string }>('/bookmarks/toggle', {
    method: 'POST',
    body: JSON.stringify({ project_id })
  }),

  // Hackathons
  getHackathons: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.append(k, String(v));
    });
    return request<Hackathon[]>(`/hackathons?${qs.toString()}`);
  },
  createHackathon: (data: Partial<Hackathon>) => request<{ message: string }>('/hackathons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Collaborators
  getCollaborators: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.append(k, String(v));
    });
    return request<CollaboratorProfile[]>(`/collaborators?${qs.toString()}`);
  },
  saveProfile: (data: Partial<CollaboratorProfile>) => request<{ message: string }>('/collaborators/profile', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  sendCollaborationRequest: (data: { receiver_id: number; project_id?: string; project_title?: string; message: string; role_needed?: string }) => request<{ message: string }>('/collaborators/request', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMyCollaborationRequests: () => request<{ sent: any[]; received: any[] }>('/collaborators/my-requests'),
  respondCollaborationRequest: (id: number, status: 'accepted' | 'declined') => request<{ message: string }>(`/collaborators/request/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Auth
  login: (emailOrUsername: string, password: string) => request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrUsername, password })
  }),
  register: (data: { username: string; email: string; password: string; name: string; department?: string }) => request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMe: () => request<{ user: User }>('/auth/me'),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getImportJobs: () => request<any[]>('/admin/import-jobs'),
  createAdminProject: (data: any) => request<any>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAdminProject: (id: number | string, data: any) => request<any>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAdminProject: (id: number | string) => request<any>(`/admin/projects/${id}`, {
    method: 'DELETE'
  }),
  uploadDocument: async (file: File) => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('document', file);
    const res = await fetch(`${API_BASE}/admin/import-document`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document');
    }
    return res.json();
  }
};
