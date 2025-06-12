import { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  PagedResponse,
  EmployeeSearchParams,
  EmployeeRole,
  ChangePasswordRequest
} from '@/types/api';

class EmployeeService {

  async getEmployees(params?: EmployeeSearchParams): Promise<PagedResponse<Employee>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.name) queryParams.append('name', params.name);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.level) queryParams.append('level', params.level);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.projectId) queryParams.append('projectId', params.projectId.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const url = `${API_CONFIG.ENDPOINTS.EMPLOYEES.LIST}?${queryParams.toString()}`;
      const response = await apiService.get<PagedResponse<Employee>>(url);

      return response.data;
    } catch (error) {
      console.error('Get employees failed:', error);
      throw error;
    }
  }

  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const response = await apiService.get<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Get employee ${id} failed:`, error);
      throw error;
    }
  }

  async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const response = await apiService.post<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.CREATE, employeeData);
      return response.data;
    } catch (error) {
      console.error('Create employee failed:', error);
      throw error;
    }
  }
  async updateEmployee(id: number, employeeData: UpdateEmployeeRequest): Promise<Employee> {
    try {
      const response = await apiService.put<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.UPDATE(id), employeeData);
      return response.data;
    } catch (error) {
      console.error(`Update employee ${id} failed:`, error);
      throw error;
    }
  }
  async deleteEmployee(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.EMPLOYEES.DELETE(id));
    } catch (error) {
      console.error(`Delete employee ${id} failed:`, error);
      throw error;
    }
  }

  async assignProjectToEmployee(employeeId: number, projectId: number): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.EMPLOYEES.ASSIGN_PROJECT(employeeId, projectId));
    } catch (error) {
      console.error(`Assign project ${projectId} to employee ${employeeId} failed:`, error);
      throw error;
    }
  }

  async unassignProjectFromEmployee(employeeId: number, projectId: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.EMPLOYEES.UNASSIGN_PROJECT(employeeId, projectId));
    } catch (error) {
      console.error(`Unassign project ${projectId} from employee ${employeeId} failed:`, error);
      throw error;
    }
  }

  async getEmployeeProjects(employeeId: number): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(API_CONFIG.ENDPOINTS.EMPLOYEES.PROJECTS(employeeId));
      return response.data;
    } catch (error) {
      console.error(`Get employee ${employeeId} projects failed:`, error);
      throw error;
    }
  }

  async changePassword(id: number, passwordData: ChangePasswordRequest): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.EMPLOYEES.CHANGE_PASSWORD(id), passwordData);
    } catch (error) {
      console.error(`Change password for employee ${id} failed:`, error);
      throw error;
    }
  }
  async getEmployeeRoles(): Promise<EmployeeRole[]> {
    try {
      const response = await apiService.get<EmployeeRole[]>(`${API_CONFIG.ENDPOINTS.EMPLOYEES.LIST}/roles`);
      return response.data;
    } catch (error) {
      console.error('Get employee roles failed:', error);
      throw error;
    }
  }

  async assignProjectsToEmployee(employeeId: number, projectIds: number[]): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.EMPLOYEES.ASSIGN_PROJECT(employeeId, 0), { projectIds });
    } catch (error) {
      console.error(`Assign projects to employee ${employeeId} failed:`, error);
      throw error;
    }
  }

  async removeProjectFromEmployee(employeeId: number, projectId: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.EMPLOYEES.UNASSIGN_PROJECT(employeeId, projectId));
    } catch (error) {
      console.error(`Remove project ${projectId} from employee ${employeeId} failed:`, error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();
