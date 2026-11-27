export interface Project {
  id: number;
  project_id: string;
  title: string;
  branch: string;
  domain: string;
  subdomain: string;
  theme: string;
  problem_statement: string;
  simple_explanation: string;
  detailed_description?: string;
  why_matters?: string;
  who_affected?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  technologies: string;
  hardware_required: string;
  software_required: string;
  skills_required: string;
  expected_output: string;
  suitable_for?: string;
  existing_solutions?: string;
  gaps_in_existing?: string;
  proposed_approach?: string;
  implementation_steps?: string[];
  limitations_challenges?: string;
  future_scope?: string;
  source_document?: string;
  source_page?: number;
  source_reference?: string;
  source_type?: string;
  is_verified?: number;
  verification_status?: string;
  custom_fields?: Record<string, any>;
  tech_list?: string[];
  hw_list?: string[];
  sw_list?: string[];
  skills_list?: string[];
}

export interface DomainGuide {
  id: number;
  name: string;
  code: string;
  branch_association: string;
  full_form: string;
  simple_definition: string;
  beginner_explanation: string;
  why_exists: string;
  main_purpose: string;
  real_world_apps: string[];
  industries: string[];
  common_problems: string[];
  important_concepts: string[];
  programming_languages: string[];
  tools_hardware_software: {
    Hardware?: string[];
    Software?: string[];
  };
  beginner_examples: string[];
  intermediate_examples: string[];
  advanced_examples: string[];
  implementation_steps: string[];
  expected_outcomes: string;
  limitations_challenges: string;
  related_domains: string[];
  relevant_hackathons: string[];
  icon?: string;
  project_count?: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  project_count?: number;
}

export interface SlideItem {
  slide_number: number;
  title: string;
  subtitle: string;
  key_points?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  department: string;
}

export interface StudentSubmission {
  id: number;
  submission_id: string;
  user_id: number;
  student_name: string;
  student_email: string;
  title: string;
  problem_statement: string;
  detailed_description: string;
  why_matters: string;
  department: string;
  domain: string;
  subdomain: string;
  theme: string;
  suggested_solution: string;
  required_tech: string;
  expected_outcome: string;
  reference_links: string;
  status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected' | 'published';
  admin_notes?: string;
  created_at: string;
}

export interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  official_link: string;
  tracks: string;
  domains: string;
  departments: string;
  themes: string;
  mode: string;
  eligibility: string;
  registration_deadline: string;
  event_dates: string;
  location: string;
  team_size: string;
  status: string;
  verified: number;
  last_verified_date: string;
}

export interface CollaboratorProfile {
  id: number;
  user_id: number;
  display_name: string;
  department: string;
  domains_of_interest: string;
  technical_skills: string;
  tools_known: string;
  project_interests: string;
  preferred_role: string;
  availability: string;
  collaboration_preference: string;
}

export interface IdeaAnalysisResult {
  original_idea: string;
  idea_explained_simply: string;
  underlying_problem: string;
  suggested_problem_statement: string;
  suggested_branch: string;
  suggested_domain: string;
  suggested_subdomain: string;
  why_domain_fits: string;
  suggested_theme: string;
  possible_technologies: string[];
  suggested_approach: string;
  variations: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  potential_limitations: string;
  matching_projects: Project[];
  relevant_hackathons: Hackathon[];
  suggested_slide_structure: SlideItem[];
}
