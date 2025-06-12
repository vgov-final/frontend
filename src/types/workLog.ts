export interface WorkLog {
  id: number;
  userId: number;
  projectId: number;
  workDate: string;
  hoursWorked: number;
  taskFeature: string;
  workDescription: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    code: string;
  };
  project?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateWorkLogRequest {
  projectId: number;
  workDate: string;
  hoursWorked: number;
  taskFeature: string;
  workDescription: string;
}

export interface UpdateWorkLogRequest {
  projectId?: number;
  workDate?: string;
  hoursWorked?: number;
  taskFeature?: string;
  workDescription?: string;
}

export interface WorkLogSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  projectId?: number;
  userId?: number;
  workDateFrom?: string;
  workDateTo?: string;
  minHours?: number;
  maxHours?: number;
  taskFeature?: string;
}

export interface WorkLogStats {
  totalHours: number;
  totalWorkLogs: number;
  averageHoursPerDay: number;
  projectsWorkedOn: number;
  topProjects: Array<{
    projectId: number;
    projectName: string;
    totalHours: number;
    workLogCount: number;
  }>;
  dailyHours: Array<{
    date: string;
    hours: number;
    workLogCount: number;
  }>;
  weeklyStats: Array<{
    week: string;
    totalHours: number;
    workLogCount: number;
  }>;
}

export interface WorkLogCalendarEntry {
  date: string;
  totalHours: number;
  workLogs: WorkLog[];
}
