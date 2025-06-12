import { WorkLog } from './workLog';

// Base API Response Type (matches backend BaseResponse)
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

// Error Response Type
export interface ApiError {
  code: number;
  message: string;
  error?: string;
  errors?: string[];
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  user: User;
}

export interface RefreshTokenRequest {
  email: string;
}

// User Types (matching backend UserResponseDto)
export interface User {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: 'admin' | 'pm' | 'dev' | 'ba' | 'test';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  currentWorkload?: number;
}

// User Workload Types (matching backend getUserWorkload response)
export interface UserWorkload {
  userId: number;
  userName: string;
  email: string;
  role: string;
  totalWorkload: number;
  availableCapacity: number;
  activeProjectCount: number;
  isOverloaded: boolean;
}

// Project Manager List with Workload
export interface ProjectManagerWithWorkload {
  id: number;
  fullName: string;
  email: string;
  activeProjectCount: number;
  totalWorkload: number;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

// Project Member Types (matching backend ProjectMemberResponseDto)
export interface ProjectMember {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  userRole: string;
  workloadPercentage: number;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// User Request Types (matching backend UserRequestDto)
export interface CreateUserRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'pm' | 'dev' | 'ba' | 'test';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  password?: string;
  role: 'admin' | 'pm' | 'dev' | 'ba' | 'test';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Project Types (matching backend ProjectResponseDto)
export interface Project {
  id: number;
  projectCode: string;
  projectName: string; // Backend field name
  pmEmail: string;
  startDate: string;
  endDate?: string;
  projectType: ProjectType;
  status: ProjectStatus; // Backend field name
  description?: string;
  createdAt?: string; // Backend field name
  updatedAt?: string; // Backend field name
  createdBy?: string;
  updatedBy?: string;
  users?: ProjectUser[];
}

export interface ProjectUser {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: string;
  workloadPercentage?: number;
}

export enum ProjectType {
  TM = 'TM',
  Package = 'Package',
  OSDC = 'OSDC',
  Presale = 'Presale'
}

export enum ProjectStatus {
  Closed = 'Closed',
  InProgress = 'InProgress',
  Hold = 'Hold',
  Presale = 'Presale',
  Open = 'Open'
}

// Project Request Types
export interface CreateProjectRequest {
  projectCode: string;
  projectName: string; // Changed from 'name' to match backend
  pmEmail: string;
  description?: string;
  startDate: string; // Will be converted to LocalDate by backend
  endDate?: string; // Will be converted to LocalDate by backend
  projectType: ProjectType;
  status: ProjectStatus; // Changed from 'projectStatus' to match backend
  budget?: number;
}

export interface UpdateProjectRequest {
  projectCode?: string;
  projectName?: string; // Changed from 'name' to match backend
  pmEmail?: string;
  startDate?: string;
  endDate?: string;
  projectType?: ProjectType;
  status?: ProjectStatus; // Changed from 'projectStatus' to match backend
  description?: string;
  budget?: number;
}

// Dashboard Types (matching backend responses)
export interface DashboardProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  plannedProjects: number;
  cancelledProjects: number;
  onHoldProjects: number;
  projectCompletionRate: number;
  averageProjectDuration: number;
}

export interface DashboardUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  userWorkloadUtilization: number;
}

export interface ProjectStatsResponse {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
  averageDuration: number;
  completionRate: number;
}

// Complete Dashboard Response Type (matching backend DashboardResponseDto)
export interface DashboardResponse {
  projectStats: DashboardProjectStats;
  userStats?: DashboardUserStats; // Only for admin
  workLogStats: WorkLogStats;
  recentProjects: Project[];
  recentWorkLogs: WorkLog[];
  unreadNotificationCount: number;
}

export interface WorkLogStats {
  totalHoursThisMonth: number;
  totalHoursLastMonth: number;
  averageHoursPerDay: number;
  totalWorkLogs: number;
  hoursByProject: Record<string, number>;
}

// Pagination Types (matching backend PagedResponse)
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

// Search Parameters
export interface UserSearchParams extends PaginationParams {
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  projectId?: number;
}

export interface ProjectSearchParams extends PaginationParams {
  projectType?: ProjectType;
  projectStatus?: ProjectStatus;
  startDateFrom?: string;
  startDateTo?: string;
  pmEmail?: string;
}
