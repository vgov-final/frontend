import { apiService } from './api';
import { API_CONFIG } from '@/config/api';

// Backend API Response Types (matching actual backend DTOs)
export interface BackendWorkloadAnalytics {
  // Project analytics
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
  activeProjects: number;
  completedProjects: number;
  
  // Employee analytics
  totalEmployees: number;
  employeesByRole: Record<string, number>;
  activeEmployees: number;
  averageWorkload: number;
  
  // Workload analytics
  workloadByRole: Record<string, number>;
  topWorkloadUsers: Array<{
    userId: number;
    userName: string;
    email: string;
    totalWorkload: number;
    projectCount: number;
  }>;
  systemWorkloadUtilization: number;
  
  // Additional data
  projectMilestones: any[];
  workLogTrends: any[];
  recentActivities: any[];
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

export interface WorkLogSummary {
  workDate: string;
  totalHours: number;
  entryCount: number;
  projectId: number;
  projectName: string;
}

class WorkloadService {

  /**
   * Get comprehensive workload analytics (Admin only)
   * Uses backend endpoint: /api/analytics/workload
   */
  async getWorkloadAnalytics(): Promise<BackendWorkloadAnalytics> {
    try {
      const response = await apiService.get<BackendWorkloadAnalytics>(
        API_CONFIG.ENDPOINTS.ANALYTICS.WORKLOAD
      );
      return response.data;
    } catch (error) {
      console.error('Get workload analytics failed:', error);
      throw error;
    }
  }

  /**
   * Get individual user workload information (Admin only)
   * Uses backend endpoint: /api/users/{id}/workload
   */
  async getUserWorkload(userId: number): Promise<BackendUserWorkload> {
    try {
      const response = await apiService.get<BackendUserWorkload>(
        API_CONFIG.ENDPOINTS.USERS.WORKLOAD(userId)
      );
      return response.data;
    } catch (error) {
      console.error(`Get user ${userId} workload failed:`, error);
      throw error;
    }
  }

  /**
   * Get project analytics data
   * Uses backend endpoint: /api/analytics/projects
   */
  async getProjectAnalytics(): Promise<any> {
    try {
      const response = await apiService.get(
        API_CONFIG.ENDPOINTS.ANALYTICS.PROJECTS
      );
      return response.data;
    } catch (error) {
      console.error('Get project analytics failed:', error);
      throw error;
    }
  }

  /**
   * Get employee analytics data
   * Uses backend endpoint: /api/analytics/employees
   */
  async getEmployeeAnalytics(): Promise<any> {
    try {
      const response = await apiService.get(
        API_CONFIG.ENDPOINTS.ANALYTICS.EMPLOYEES
      );
      return response.data;
    } catch (error) {
      console.error('Get employee analytics failed:', error);
      throw error;
    }
  }

  /**
   * Get project timeline data
   * Uses backend endpoint: /api/analytics/timeline/{projectId}
   */
  async getProjectTimeline(projectId: number): Promise<any> {
    try {
      const response = await apiService.get(
        API_CONFIG.ENDPOINTS.ANALYTICS.PROJECT_TIMELINE(projectId)
      );
      return response.data;
    } catch (error) {
      console.error(`Get project ${projectId} timeline failed:`, error);
      throw error;
    }
  }

  /**
   * Get work log data for a user
   * Uses backend endpoint: /api/work-logs/user/{userId}
   */
  async getUserWorkLogs(userId: number, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `${API_CONFIG.ENDPOINTS.WORK_LOGS.BY_USER(userId)}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error(`Get user ${userId} work logs failed:`, error);
      throw error;
    }
  }

  /**
   * Get work log data for a project
   * Uses backend endpoint: /api/work-logs/project/{projectId}
   */
  async getProjectWorkLogs(projectId: number, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `${API_CONFIG.ENDPOINTS.WORK_LOGS.BY_PROJECT(projectId)}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error(`Get project ${projectId} work logs failed:`, error);
      throw error;
    }
  }

  /**
   * Create work log entry
   * Uses backend endpoint: /api/work-logs
   */
  async createWorkLog(workLogData: {
    projectId: number;
    workDate: string;
    hoursWorked: number;
    taskFeature?: string;
    workDescription: string;
  }): Promise<any> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.WORK_LOGS.CREATE,
        workLogData
      );
      return response.data;
    } catch (error) {
      console.error('Create work log failed:', error);
      throw error;
    }
  }

  /**
   * Update work log entry
   * Uses backend endpoint: /api/work-logs/{id}
   */
  async updateWorkLog(workLogId: number, workLogData: {
    hoursWorked: number;
    taskFeature?: string;
    workDescription: string;
  }): Promise<any> {
    try {
      const response = await apiService.put(
        API_CONFIG.ENDPOINTS.WORK_LOGS.UPDATE(workLogId),
        workLogData
      );
      return response.data;
    } catch (error) {
      console.error(`Update work log ${workLogId} failed:`, error);
      throw error;
    }
  }

  /**
   * Delete work log entry
   * Uses backend endpoint: /api/work-logs/{id}
   */
  async deleteWorkLog(workLogId: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.WORK_LOGS.DELETE(workLogId));
    } catch (error) {
      console.error(`Delete work log ${workLogId} failed:`, error);
      throw error;
    }
  }

  /**
   * Validate workload assignment for a user on a project
   * This is a client-side validation that checks if adding workload would exceed capacity
   */
  async validateWorkload(userId: number, projectId: number, percentage: number): Promise<{
    isValid: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
    currentWorkload: number;
    requestedWorkload: number;
    totalAfterAssignment: number;
    availableCapacity: number;
  }> {
    try {
      // Get current user workload
      const userWorkload = await this.getUserWorkload(userId);
      
      const totalAfterAssignment = userWorkload.totalWorkload + percentage;
      const availableCapacity = userWorkload.availableCapacity;
      
      let isValid = true;
      let message = '';
      let severity: 'success' | 'warning' | 'error' = 'success';
      
      if (totalAfterAssignment > 100) {
        isValid = false;
        message = `Vượt quá cho phép. Hiện tại có ${userWorkload.totalWorkload}% workload, thêm ${percentage}% sẽ thành ${totalAfterAssignment}% (${totalAfterAssignment - 100}% vượt ngưỡng).`;
        severity = 'error';
      } else if (totalAfterAssignment >= 90) {
        message = `Workload cao. Tổng sẽ là ${totalAfterAssignment}%.`;
        severity = 'warning';
      } else {
        message = `Assignment is valid. User will have ${totalAfterAssignment}% workload with ${100 - totalAfterAssignment}% remaining capacity.`;
        severity = 'success';
      }
      
      return {
        isValid,
        message,
        severity,
        currentWorkload: userWorkload.totalWorkload,
        requestedWorkload: percentage,
        totalAfterAssignment,
        availableCapacity
      };
    } catch (error) {
      console.error(`Validate workload for user ${userId} failed:`, error);
      return {
        isValid: false,
        message: 'Unable to validate workload. Please try again.',
        severity: 'error',
        currentWorkload: 0,
        requestedWorkload: percentage,
        totalAfterAssignment: percentage,
        availableCapacity: 0
      };
    }
  }
}

export const workloadService = new WorkloadService();
