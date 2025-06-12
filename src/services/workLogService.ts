import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import type {
  WorkLog,
  CreateWorkLogRequest,
  UpdateWorkLogRequest,
  WorkLogSearchParams,
  WorkLogStats,
  WorkLogCalendarEntry
} from '@/types/workLog';
import type { PagedResponse } from '@/types/api';

class WorkLogService {
  /**
   * Get work logs with pagination and filtering
   */
  async getWorkLogs(params: WorkLogSearchParams = {}): Promise<PagedResponse<WorkLog>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params.search) queryParams.append('search', params.search);
    if (params.projectId) queryParams.append('projectId', params.projectId.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.workDateFrom) queryParams.append('workDateFrom', params.workDateFrom);
    if (params.workDateTo) queryParams.append('workDateTo', params.workDateTo);
    if (params.minHours) queryParams.append('minHours', params.minHours.toString());
    if (params.maxHours) queryParams.append('maxHours', params.maxHours.toString());
    if (params.taskFeature) queryParams.append('taskFeature', params.taskFeature);

    const endpoint = `${API_CONFIG.ENDPOINTS.WORK_LOGS.LIST}?${queryParams.toString()}`;
    const response = await apiService.get<WorkLog[]>(endpoint);
    
    // Convert simple array response to PagedResponse format
    // Since backend doesn't support pagination yet, we'll simulate it
    const data = response.data || [];
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      content: paginatedData,
      page: page,
      size: size,
      totalElements: data.length,
      totalPages: Math.ceil(data.length / size),
      hasNext: page < Math.ceil(data.length / size) - 1,
      hasPrevious: page > 0,
      isFirst: page === 0,
      isLast: page >= Math.ceil(data.length / size) - 1
    };
  }

  /**
   * Get all work logs with role-based filtering
   */
  async getAllWorkLogs(): Promise<WorkLog[]> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.LIST);
    return response.data;
  }

  /**
   * Get work logs for specific user
   */
  async getUserWorkLogs(userId: number, params: WorkLogSearchParams = {}): Promise<PagedResponse<WorkLog>> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_USER(userId));
    const data = response.data || [];
    
    // Apply client-side filtering and pagination
    let filteredData = data;
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(wl =>
        wl.taskFeature?.toLowerCase().includes(searchLower) ||
        wl.workDescription?.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.workDateFrom) {
      filteredData = filteredData.filter(wl => wl.workDate >= params.workDateFrom!);
    }
    
    if (params.workDateTo) {
      filteredData = filteredData.filter(wl => wl.workDate <= params.workDateTo!);
    }
    
    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return params.sortDir === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      content: paginatedData,
      page: page,
      size: size,
      totalElements: filteredData.length,
      totalPages: Math.ceil(filteredData.length / size),
      hasNext: page < Math.ceil(filteredData.length / size) - 1,
      hasPrevious: page > 0,
      isFirst: page === 0,
      isLast: page >= Math.ceil(filteredData.length / size) - 1
    };
  }

  /**
   * Get work logs for specific user (simple array)
   */
  async getWorkLogsByUserId(userId: number): Promise<WorkLog[]> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_USER(userId));
    return response.data;
  }

  /**
   * Get work logs for specific project
   */
  async getProjectWorkLogs(projectId: number, params: WorkLogSearchParams = {}): Promise<PagedResponse<WorkLog>> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_PROJECT(projectId));
    const data = response.data || [];
    
    // Apply client-side filtering and pagination (similar to getUserWorkLogs)
    let filteredData = data;
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(wl =>
        wl.taskFeature?.toLowerCase().includes(searchLower) ||
        wl.workDescription?.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.workDateFrom) {
      filteredData = filteredData.filter(wl => wl.workDate >= params.workDateFrom!);
    }
    
    if (params.workDateTo) {
      filteredData = filteredData.filter(wl => wl.workDate <= params.workDateTo!);
    }
    
    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return params.sortDir === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      content: paginatedData,
      page: page,
      size: size,
      totalElements: filteredData.length,
      totalPages: Math.ceil(filteredData.length / size),
      hasNext: page < Math.ceil(filteredData.length / size) - 1,
      hasPrevious: page > 0,
      isFirst: page === 0,
      isLast: page >= Math.ceil(filteredData.length / size) - 1
    };
  }

  /**
   * Get work logs for specific project (simple array)
   */
  async getWorkLogsByProjectId(projectId: number): Promise<WorkLog[]> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_PROJECT(projectId));
    return response.data;
  }

  /**
   * Get single work log by ID
   */
  async getWorkLog(id: number): Promise<WorkLog> {
    // Backend doesn't have this endpoint, so we'll get all and filter
    // In a real implementation, you'd add GET /api/worklogs/{id} to backend
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.LIST);
    const workLog = response.data.find(wl => wl.id === id);
    if (!workLog) {
      throw new Error(`Work log with ID ${id} not found`);
    }
    return workLog;
  }

  /**
   * Get work log statistics
   */
  async getWorkLogStats(params: WorkLogSearchParams = {}): Promise<WorkLogStats> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.LIST);
    const workLogs = response.data || [];
    
    // Calculate stats from work logs
    const totalHours = workLogs.reduce((sum, wl) => sum + wl.hoursWorked, 0);
    const totalWorkLogs = workLogs.length;
    const averageHoursPerDay = totalWorkLogs > 0 ? totalHours / totalWorkLogs : 0;
    
    // Get unique projects
    const projectsMap = new Map();
    workLogs.forEach(wl => {
      if (!projectsMap.has(wl.projectId)) {
        projectsMap.set(wl.projectId, {
          projectId: wl.projectId,
          projectName: wl.project?.name || `Project ${wl.projectId}`,
          totalHours: 0,
          workLogCount: 0
        });
      }
      const project = projectsMap.get(wl.projectId);
      project.totalHours += wl.hoursWorked;
      project.workLogCount += 1;
    });
    
    const topProjects = Array.from(projectsMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
    
    // Group by date for daily hours
    const dailyMap = new Map();
    workLogs.forEach(wl => {
      if (!dailyMap.has(wl.workDate)) {
        dailyMap.set(wl.workDate, { date: wl.workDate, hours: 0, workLogCount: 0 });
      }
      const daily = dailyMap.get(wl.workDate);
      daily.hours += wl.hoursWorked;
      daily.workLogCount += 1;
    });
    
    const dailyHours = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Group by week for weekly stats
    const weeklyMap = new Map();
    workLogs.forEach(wl => {
      const date = new Date(wl.workDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { week: weekKey, totalHours: 0, workLogCount: 0 });
      }
      const weekly = weeklyMap.get(weekKey);
      weekly.totalHours += wl.hoursWorked;
      weekly.workLogCount += 1;
    });
    
    const weeklyStats = Array.from(weeklyMap.values())
      .sort((a, b) => a.week.localeCompare(b.week));
    
    return {
      totalHours,
      totalWorkLogs,
      averageHoursPerDay,
      projectsWorkedOn: projectsMap.size,
      topProjects,
      dailyHours,
      weeklyStats
    };
  }

  /**
   * Get user work log statistics
   */
  async getUserWorkLogStats(userId: number, params: WorkLogSearchParams = {}): Promise<WorkLogStats> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_USER(userId));
    const workLogs = response.data || [];
    
    // Use same logic as getWorkLogStats but with user-specific data
    const totalHours = workLogs.reduce((sum, wl) => sum + wl.hoursWorked, 0);
    const totalWorkLogs = workLogs.length;
    const averageHoursPerDay = totalWorkLogs > 0 ? totalHours / totalWorkLogs : 0;
    
    const projectsMap = new Map();
    workLogs.forEach(wl => {
      if (!projectsMap.has(wl.projectId)) {
        projectsMap.set(wl.projectId, {
          projectId: wl.projectId,
          projectName: wl.project?.name || `Project ${wl.projectId}`,
          totalHours: 0,
          workLogCount: 0
        });
      }
      const project = projectsMap.get(wl.projectId);
      project.totalHours += wl.hoursWorked;
      project.workLogCount += 1;
    });
    
    const topProjects = Array.from(projectsMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
    
    const dailyMap = new Map();
    workLogs.forEach(wl => {
      if (!dailyMap.has(wl.workDate)) {
        dailyMap.set(wl.workDate, { date: wl.workDate, hours: 0, workLogCount: 0 });
      }
      const daily = dailyMap.get(wl.workDate);
      daily.hours += wl.hoursWorked;
      daily.workLogCount += 1;
    });
    
    const dailyHours = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const weeklyMap = new Map();
    workLogs.forEach(wl => {
      const date = new Date(wl.workDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { week: weekKey, totalHours: 0, workLogCount: 0 });
      }
      const weekly = weeklyMap.get(weekKey);
      weekly.totalHours += wl.hoursWorked;
      weekly.workLogCount += 1;
    });
    
    const weeklyStats = Array.from(weeklyMap.values())
      .sort((a, b) => a.week.localeCompare(b.week));
    
    return {
      totalHours,
      totalWorkLogs,
      averageHoursPerDay,
      projectsWorkedOn: projectsMap.size,
      topProjects,
      dailyHours,
      weeklyStats
    };
  }

  /**
   * Get project work log statistics
   */
  async getProjectWorkLogStats(projectId: number, params: WorkLogSearchParams = {}): Promise<WorkLogStats> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_PROJECT(projectId));
    const workLogs = response.data || [];
    
    // Use same logic as getWorkLogStats but with project-specific data
    const totalHours = workLogs.reduce((sum, wl) => sum + wl.hoursWorked, 0);
    const totalWorkLogs = workLogs.length;
    const averageHoursPerDay = totalWorkLogs > 0 ? totalHours / totalWorkLogs : 0;
    
    // For project stats, we group by user instead of project
    const usersMap = new Map();
    workLogs.forEach(wl => {
      if (!usersMap.has(wl.userId)) {
        usersMap.set(wl.userId, {
          projectId: wl.userId, // Using userId as projectId for consistency with interface
          projectName: wl.user?.name || `User ${wl.userId}`,
          totalHours: 0,
          workLogCount: 0
        });
      }
      const user = usersMap.get(wl.userId);
      user.totalHours += wl.hoursWorked;
      user.workLogCount += 1;
    });
    
    const topProjects = Array.from(usersMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
    
    const dailyMap = new Map();
    workLogs.forEach(wl => {
      if (!dailyMap.has(wl.workDate)) {
        dailyMap.set(wl.workDate, { date: wl.workDate, hours: 0, workLogCount: 0 });
      }
      const daily = dailyMap.get(wl.workDate);
      daily.hours += wl.hoursWorked;
      daily.workLogCount += 1;
    });
    
    const dailyHours = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const weeklyMap = new Map();
    workLogs.forEach(wl => {
      const date = new Date(wl.workDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { week: weekKey, totalHours: 0, workLogCount: 0 });
      }
      const weekly = weeklyMap.get(weekKey);
      weekly.totalHours += wl.hoursWorked;
      weekly.workLogCount += 1;
    });
    
    const weeklyStats = Array.from(weeklyMap.values())
      .sort((a, b) => a.week.localeCompare(b.week));
    
    return {
      totalHours,
      totalWorkLogs,
      averageHoursPerDay,
      projectsWorkedOn: 1, // Only one project
      topProjects,
      dailyHours,
      weeklyStats
    };
  }

  /**
   * Get work log calendar data
   */
  async getWorkLogCalendar(params: WorkLogSearchParams = {}): Promise<WorkLogCalendarEntry[]> {
    const response = await apiService.get<WorkLog[]>(API_CONFIG.ENDPOINTS.WORK_LOGS.LIST);
    let workLogs = response.data || [];
    
    // Apply date filtering
    if (params.workDateFrom) {
      workLogs = workLogs.filter(wl => wl.workDate >= params.workDateFrom!);
    }
    
    if (params.workDateTo) {
      workLogs = workLogs.filter(wl => wl.workDate <= params.workDateTo!);
    }
    
    // Group by date
    const calendarMap = new Map<string, WorkLogCalendarEntry>();
    
    workLogs.forEach(wl => {
      if (!calendarMap.has(wl.workDate)) {
        calendarMap.set(wl.workDate, {
          date: wl.workDate,
          totalHours: 0,
          workLogs: []
        });
      }
      const entry = calendarMap.get(wl.workDate)!;
      entry.totalHours += wl.hoursWorked;
      entry.workLogs.push(wl);
    });
    
    return Array.from(calendarMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Create new work log entry
   */
  async createWorkLog(data: CreateWorkLogRequest): Promise<WorkLog> {
    const response = await apiService.post<WorkLog>(API_CONFIG.ENDPOINTS.WORK_LOGS.CREATE, data);
    return response.data;
  }

  /**
   * Update work log entry
   */
  async updateWorkLog(id: number, data: UpdateWorkLogRequest): Promise<WorkLog> {
    const response = await apiService.put<WorkLog>(API_CONFIG.ENDPOINTS.WORK_LOGS.UPDATE(id), data);
    return response.data;
  }

  /**
   * Delete work log entry
   */
  async deleteWorkLog(id: number): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.WORK_LOGS.DELETE(id));
  }

  /**
   * Check if user can access specific user's work logs
   */
  canAccessUserWorkLogs(userId: number, currentUserEmail: string): boolean {
    // This will be handled by backend authorization
    // Frontend just needs to make the request
    return true;
  }
}

export const workLogService = new WorkLogService();
