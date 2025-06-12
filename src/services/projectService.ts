import { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PagedResponse,
  ProjectSearchParams,
  ProjectMember,
  UserProjectHistory
} from '@/types/api';

export interface ProjectMemberRequest {
  userId: number;
  workloadPercentage: number;
}

class ProjectService {

  async getProjects(params?: ProjectSearchParams): Promise<PagedResponse<Project>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.projectType) queryParams.append('projectType', params.projectType);
      if (params?.projectStatus) queryParams.append('projectStatus', params.projectStatus);
      if (params?.startDateFrom) queryParams.append('startDateFrom', params.startDateFrom);
      if (params?.startDateTo) queryParams.append('startDateTo', params.startDateTo);
      if (params?.pmEmail) queryParams.append('pmEmail', params.pmEmail);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const url = `${API_CONFIG.ENDPOINTS.PROJECTS.LIST}?${queryParams.toString()}`;
      const response = await apiService.get<{ items: any[], pagination: any }>(url);

      // Transform backend response to frontend PagedResponse format
      // ApiService already extracts data from StandardResponse, so response.data contains { items: [], pagination: {} }
      const backendData = response.data;
      
      // Map backend response directly to frontend interface (no field name changes needed)
      const mappedProjects: Project[] = backendData.items.map((item: any) => ({
        id: item.id,
        projectCode: item.projectCode,
        projectName: item.projectName,
        pmEmail: item.pmEmail,
        startDate: item.startDate,
        endDate: item.endDate,
        projectType: item.projectType,
        status: item.status,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
        users: item.users
      }));

      return {
        content: mappedProjects,
        page: backendData.pagination.page,
        size: backendData.pagination.size,
        totalElements: backendData.pagination.total,
        totalPages: backendData.pagination.totalPages,
        hasNext: backendData.pagination.page < backendData.pagination.totalPages,
        hasPrevious: backendData.pagination.page > 1,
        isFirst: backendData.pagination.page === 1,
        isLast: backendData.pagination.page === backendData.pagination.totalPages
      };
    } catch (error) {
      console.error('Get projects failed:', error);
      throw error;
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const response = await apiService.get<Project>(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Get project ${id} failed:`, error);
      throw error;
    }
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const response = await apiService.post<Project>(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, projectData);
      return response.data;
    } catch (error) {
      console.error('Create project failed:', error);
      throw error;
    }
  }

  async updateProject(id: number, projectData: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await apiService.put<Project>(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE(id), projectData);
      return response.data;
    } catch (error) {
      console.error(`Update project ${id} failed:`, error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.PROJECTS.DELETE(id));
    } catch (error) {
      console.error(`Delete project ${id} failed:`, error);
      throw error;
    }
  }

  async updateProjectStatus(id: number, status: string): Promise<Project> {
    try {
      const response = await apiService.put<Project>(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE_STATUS(id), { status });
      return response.data;
    } catch (error) {
      console.error(`Update project ${id} status failed:`, error);
      throw error;
    }
  }

  // Project member management methods
  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    try {
      const response = await apiService.get<ProjectMember[]>(API_CONFIG.ENDPOINTS.PROJECTS.MEMBERS(projectId));
      return response.data;
    } catch (error) {
      console.error(`Get project ${projectId} members failed:`, error);
      throw error;
    }
  }

  async addProjectMember(projectId: number, memberData: ProjectMemberRequest): Promise<ProjectMember> {
    try {
      const response = await apiService.post<ProjectMember>(API_CONFIG.ENDPOINTS.PROJECTS.ADD_MEMBER(projectId), memberData);
      return response.data;
    } catch (error) {
      console.error(`Add member to project ${projectId} failed:`, error);
      throw error;
    }
  }

  async updateMemberWorkload(projectId: number, userId: number, memberData: ProjectMemberRequest): Promise<ProjectMember> {
    try {
      const response = await apiService.put<ProjectMember>(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE_MEMBER(projectId, userId), memberData);
      return response.data;
    } catch (error) {
      console.error(`Update member workload for project ${projectId} failed:`, error);
      throw error;
    }
  }

  async removeMemberFromProject(projectId: number, userId: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectId, userId));
    } catch (error) {
      console.error(`Remove member ${userId} from project ${projectId} failed:`, error);
      throw error;
    }
  }

  async getUserProjectHistory(userId: number): Promise<UserProjectHistory[]> {
    try {
      const response = await apiService.get<UserProjectHistory[]>(API_CONFIG.ENDPOINTS.PROJECTS.USER_HISTORY(userId));
      return response.data;
    } catch (error) {
      console.error('Get user project history failed:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
