import { API_CONFIG } from '@/config/api';
import { apiService } from './api';

export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  url: string;
}

class FileService {
  /**
   * Upload file to MinIO
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Use fetch directly for file upload to handle FormData properly
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.UPLOAD}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Get file from MinIO (download)
   */
  async getFile(filename: string): Promise<Blob> {
    // Use fetch directly for blob response
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.GET(filename)}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return await response.blob();
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(filename: string): Promise<boolean> {
    const response = await apiService.delete<{ message: string }>(
      API_CONFIG.ENDPOINTS.FILES.DELETE(filename)
    );
    return !!response.data;
  }

  /**
   * Get file URL
   */
  async getFileUrl(filename: string): Promise<string> {
    const response = await apiService.get<{ url: string }>(
      API_CONFIG.ENDPOINTS.FILES.URL(filename)
    );
    return response.data.url;
  }
}

export const fileService = new FileService();
