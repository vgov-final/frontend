import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { 
  User, 
  ProfileUpdateRequest, 
  PasswordChangeRequest 
} from '@/types/user';

class ProfileService {
  /**
   * Get current user's profile information
   */
  async getCurrentProfile(): Promise<User> {
    const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.PROFILE.GET);
    return response.data;
  }

  /**
   * Update profile information
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    const response = await apiService.put<User>(API_CONFIG.ENDPOINTS.PROFILE.GET, data);
    return response.data;
  }


  /**
   * Change own password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await apiService.put(API_CONFIG.ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
  }
}

export const profileService = new ProfileService();
