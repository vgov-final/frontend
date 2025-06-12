import { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PagedResponse,
  UserSearchParams,
  UserRole,
  ChangePasswordRequest,
  UserWorkload,
  ProjectManagerWithWorkload
} from '@/types/api';

class UserService {

  async getUsers(params?: UserSearchParams): Promise<PagedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.fullName) queryParams.append('fullName', params.fullName);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.projectId) queryParams.append('projectId', params.projectId.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const url = `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams.toString()}`;
      const response = await apiService.get<{ items: User[], pagination: any }>(url);

      // Transform backend response to frontend PagedResponse format
      // ApiService already extracts data from StandardResponse, so response.data contains { items: [], pagination: {} }
      const backendData = response.data;
      return {
        content: backendData.items,
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
      console.error('Get users failed:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} failed:`, error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiService.post<User>(API_CONFIG.ENDPOINTS.USERS.CREATE, userData);
      return response.data;
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiService.put<User>(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), userData);
      return response.data;
    } catch (error) {
      console.error(`Update user ${id} failed:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));
    } catch (error) {
      console.error(`Delete user ${id} failed:`, error);
      throw error;
    }
  }

  async changeRole(id: number, role: 'admin' | 'pm' | 'dev' | 'ba' | 'test'): Promise<User> {
    try {
      const response = await apiService.put<User>(API_CONFIG.ENDPOINTS.USERS.CHANGE_ROLE(id), { role });
      return response.data;
    } catch (error) {
      console.error(`Change role for user ${id} failed:`, error);
      throw error;
    }
  }

  async toggleActivation(id: number, isActive: boolean): Promise<User> {
    try {
      const response = await apiService.put<User>(API_CONFIG.ENDPOINTS.USERS.ACTIVATE(id), { isActive });
      return response.data;
    } catch (error) {
      console.error(`Toggle activation for user ${id} failed:`, error);
      throw error;
    }
  }

  async getUserWorkload(id: number): Promise<UserWorkload> {
    try {
      const response = await apiService.get<UserWorkload>(
        API_CONFIG.ENDPOINTS.USERS.WORKLOAD(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} workload failed:`, error);
      throw error;
    }
  }

  async getUserRoles(): Promise<UserRole[]> {
    try {
      const response = await apiService.get<UserRole[]>(API_CONFIG.ENDPOINTS.USERS.ROLES);
      return response.data;
    } catch (error) {
      console.error('Get user roles failed:', error);
      throw error;
    }
  }

  async getProjectManagers(): Promise<ProjectManagerWithWorkload[]> {
    try {
      const response = await apiService.get<ProjectManagerWithWorkload[]>('/api/users/pms');
      return response.data;
    } catch (error) {
      console.error('Get project managers failed:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
