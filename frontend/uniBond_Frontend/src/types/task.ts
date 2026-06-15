export interface TaskApplication {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  email: string;
  portfolioUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  submissionUrl?: string;
  submittedAt?: string;
}

export interface Task {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  category: string;
  projectType: 'Group' | 'Individual';
  skills: string[];
  technologies: string[];
  experienceLevel: string;
  studentsNeeded: number;
  duration: string;
  startDate: string;
  deadline: string;
  stipend: string;
  certificate: boolean;
  internshipOpportunity: boolean;
  tags: string[];
  contactEmail: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  applicants: TaskApplication[];
}
