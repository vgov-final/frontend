import { API_CONFIG, HTTP_STATUS } from '@/config/api';
import { ApiResponse, ApiError } from '@/types/api';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const result = await response.json();

    if (!response.ok) {
      // Handle error responses
      if (result && result.error) {
        throw {
          code: response.status,
          message: result.error.message || result.message || response.statusText,
          error: result.error.code,
          errors: result.error.details ? [result.error.details] : undefined
        } as ApiError;
      }
      
      throw {
        code: response.status,
        message: result.message || response.statusText,
      } as ApiError;
    }

    // Backend returns StandardResponse<T> format: { success, data, message, error }
    // Convert to frontend ApiResponse format: { code, message, data, error }
    if (result && typeof result === 'object' && 'success' in result) {
      if (!result.success) {
        throw {
          code: response.status,
          message: result.error?.message || result.message || 'Request failed',
          error: result.error?.code,
          errors: result.error?.details ? [result.error.details] : undefined
        } as ApiError;
      }
      
      return {
        code: response.status,
        message: result.message || 'Success',
        data: result.data
      };
    }
    
    // Fallback for direct data responses (like auth login)
    return {
      code: response.status,
      message: 'Success',
      data: result
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw {
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();
