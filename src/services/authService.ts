import { apiService } from './api';
import { API_CONFIG } from '@/config/api';
import { LoginRequest, LoginResponse, RefreshTokenRequest } from '@/types/api';

class AuthService {

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data) {
        // Store tokens - backend returns { token, type, user }
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: response.data.user.role,
        }));
      }

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('No user email available for refresh');
    }

    try {
      const response = await apiService.post<{ token: string; type: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { email: currentUser.email } as RefreshTokenRequest
      );

      if (response.data) {
        localStorage.setItem('accessToken', response.data.token);
      }

      return response.data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }


  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): { id: string; email: string; fullName: string; role: 'admin' | 'pm' | 'dev' | 'ba' | 'test' } | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  private mapBackendRoleToFrontend(backendRole: string): 'admin' | 'pm' | 'dev' | 'ba' | 'test' {
    switch (backendRole.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
      case 'PROJECT_MANAGER':
        return 'pm';
      case 'DEVELOPER':
        return 'dev';
      case 'BUSINESS_ANALYST':
        return 'ba';
      case 'TESTER':
        return 'test';
      default:
        return 'dev';
    }
  }
}

export const authService = new AuthService();
