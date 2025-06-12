import { apiService } from './api';
import { API_CONFIG } from '@/config/api';

export interface MonthlyProjectStatusDto {
  month: string;
  completed: number;
  inProgress: number;
  planned: number;
}

export interface ProjectTimelineAnalyticsResponse {
  monthlyProjectStatus: MonthlyProjectStatusDto[];
  totalProjects?: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

class AnalyticsService {
  
  async getProjectTimelineAnalytics(
    startYear?: number,
    startMonth?: number,
    endYear?: number,
    endMonth?: number
  ): Promise<ProjectTimelineAnalyticsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (startYear) params.append('startYear', startYear.toString());
      if (startMonth) params.append('startMonth', startMonth.toString());
      if (endYear) params.append('endYear', endYear.toString());
      if (endMonth) params.append('endMonth', endMonth.toString());
      
      const url = `${API_CONFIG.ENDPOINTS.ANALYTICS.PROJECT_TIMELINE_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await apiService.get<ProjectTimelineAnalyticsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Get project timeline analytics failed:', error);
      throw error;
    }
  }

  async getProjectAnalytics(): Promise<any> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.PROJECTS);
      return response.data;
    } catch (error) {
      console.error('Get project analytics failed:', error);
      throw error;
    }
  }

  async getEmployeeAnalytics(): Promise<any> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.EMPLOYEES);
      return response.data;
    } catch (error) {
      console.error('Get employee analytics failed:', error);
      throw error;
    }
  }

  async getWorkloadAnalytics(): Promise<any> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.WORKLOAD);
      return response.data;
    } catch (error) {
      console.error('Get workload analytics failed:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
