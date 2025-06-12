// Workload Management Types - Aligned with Backend DTOs

// Backend API Response Types (matching actual Spring Boot DTOs)
export interface BackendWorkloadAnalytics {
  workloadByRole: Record<string, {
    totalUsers: number;
    averageWorkload: number;
    overloadedUsers: number;
  }>;
  topWorkloadUsers: Array<{
    userId: number;
    fullName: string;
    email: string;
    role: string;
    totalWorkload: number;
    activeProjectCount: number;
    isOverloaded: boolean;
  }>;
  systemUtilization: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    availableCapacity: number;
  };
}

export interface BackendUserWorkload {
  userId: number;
  userName: string;
  email: string;
  role: string;
  totalWorkload: number;
  availableCapacity: number;
  activeProjectCount: number;
  isOverloaded: boolean;
}

// Work Log Types (matching backend WorkLog entity)
export interface WorkLog {
  id: number;
  projectId: number;
  userId: number;
  workDate: string;
  hoursWorked: number;
  taskFeature?: string;
  workDescription: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
    projectCode: string;
    projectStatus: string;
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface WorkLogRequest {
  projectId: number;
  workDate: string;
  hoursWorked: number;
  taskFeature?: string;
  workDescription: string;
}

export interface WorkLogResponse {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  userName: string;
  workDate: string;
  hoursWorked: number;
  taskFeature?: string;
  workDescription: string;
  createdAt: string;
  updatedAt: string;
}

// Project Member Types (matching backend ProjectMember entity)
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  workloadPercentage: number;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
  project?: {
    id: number;
    name: string;
    projectCode: string;
    projectStatus: string;
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

// Analytics Types
export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByStatus: Record<string, number>;
  averageProjectDuration: number;
  projectWorkloadDistribution: Array<{
    projectId: number;
    projectName: string;
    totalMembers: number;
    totalWorkload: number;
    averageWorkload: number;
  }>;
}

export interface EmployeeAnalytics {
  totalEmployees: number;
  employeesByRole: Record<string, number>;
  averageWorkloadByRole: Record<string, number>;
  topPerformers: Array<{
    userId: number;
    fullName: string;
    role: string;
    totalHours: number;
    projectCount: number;
  }>;
}

// Validation Types (for workload validation functionality)
export interface ValidationResponse {
  isValid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
  currentWorkload: number;
  requestedWorkload: number;
  totalAfterAssignment: number;
  availableCapacity: number;
  recommendations?: string[];
}

export interface WorkloadResponse {
  userId: number;
  userName: string;
  email: string;
  role: string;
  totalWorkload: number;
  availableCapacity: number;
  activeProjectCount: number;
  isOverloaded: boolean;
  projectAssignments?: Array<{
    projectId: number;
    projectName: string;
    workloadPercentage: number;
    joinedDate: string;
    isActive: boolean;
  }>;
}

// Frontend Display Types (transformed from backend data)
export interface WorkloadDistributionItem {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  totalWorkload: number;
  projectCount: number;
  isOverloaded: boolean;
  availableCapacity: number;
  projects?: Array<{
    id: number;
    name: string;
    workloadPercentage: number;
  }>;
}

export interface WorkloadAnalytics {
  totalUsers: number;
  overloadedUsers: number;
  underutilizedUsers: number;
  fullyUtilizedUsers: number;
  averageWorkload: number;
  capacityUtilization: number;
  workloadDistribution: WorkloadDistributionItem[];
  workloadByRole: Record<string, {
    totalUsers: number;
    averageWorkload: number;
    overloadedCount: number;
  }>;
  systemUtilization: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    availableCapacity: number;
  };
}

// Chart and Visualization Types
export interface WorkloadChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface WorkloadTrendData {
  date: string;
  averageWorkload: number;
  overloadedCount: number;
  totalUsers: number;
}

export interface RoleWorkloadData {
  role: string;
  totalUsers: number;
  averageWorkload: number;
  overloadedCount: number;
  normalCount: number;
}

// Request/Response Types for API calls
export interface AddMemberRequest {
  userId: number;
  workloadPercentage: number;
  joinedDate?: string;
}

export interface UpdateMemberWorkloadRequest {
  workloadPercentage: number;
}

export interface ValidationResponse {
  isValid: boolean;
  currentWorkload: number;
  requestedWorkload: number;
  totalWorkload: number;
  availableCapacity: number;
  message?: string;
  errors?: string[];
}

// Error Types
export interface WorkloadValidationError extends Error {
  code: 'WORKLOAD_EXCEEDED' | 'INVALID_PERCENTAGE' | 'USER_NOT_FOUND' | 'PROJECT_NOT_FOUND';
  currentWorkload: number;
  requestedWorkload: number;
  availableCapacity: number;
}

// Generic pagination response type
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

// Search and filter parameters
export interface WorkloadSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  role?: string;
  isOverloaded?: boolean;
  minWorkload?: number;
  maxWorkload?: number;
  projectId?: number;
  startDate?: string;
  endDate?: string;
}