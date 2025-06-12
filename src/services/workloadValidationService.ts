import { workloadService } from './workloadService';
import { BackendUserWorkload } from '@/types/workload';

export interface WorkloadValidationResult {
  isValid: boolean;
  currentWorkload: number;
  newWorkload: number;
  availableCapacity: number;
  errorMessage?: string;
}

export interface WorkloadInfo {
  userId: number;
  userName: string;
  currentWorkload: number;
  availableCapacity: number;
  activeProjectCount: number;
  isOverloaded: boolean;
}

class WorkloadValidationService {
  /**
   * Get comprehensive workload information for a user
   */
  async getUserWorkloadInfo(userId: number): Promise<WorkloadInfo> {
    try {
      const workloadData: BackendUserWorkload = await workloadService.getUserWorkload(userId);
      
      return {
        userId: workloadData.userId,
        userName: workloadData.userName,
        currentWorkload: workloadData.totalWorkload,
        availableCapacity: Math.max(0, 100 - workloadData.totalWorkload),
        activeProjectCount: workloadData.activeProjectCount,
        isOverloaded: workloadData.isOverloaded
      };
    } catch (error) {
      console.error('Failed to get user workload info:', error);
      throw new Error('Unable to retrieve user workload information');
    }
  }

  /**
   * Validate if adding a new workload allocation is allowed
   */
  async validateWorkloadAddition(
    userId: number, 
    newWorkloadPercentage: number
  ): Promise<WorkloadValidationResult> {
    try {
      const workloadInfo = await this.getUserWorkloadInfo(userId);
      const newTotalWorkload = workloadInfo.currentWorkload + newWorkloadPercentage;
      
      const isValid = newTotalWorkload <= 100;
      
      return {
        isValid,
        currentWorkload: workloadInfo.currentWorkload,
        newWorkload: newTotalWorkload,
        availableCapacity: workloadInfo.availableCapacity,
        errorMessage: isValid 
          ? undefined 
          : `Adding ${newWorkloadPercentage}% would exceed 100% capacity. Current: ${workloadInfo.currentWorkload}%, Available: ${workloadInfo.availableCapacity}%`
      };
    } catch (error) {
      console.error('Workload validation failed:', error);
      return {
        isValid: false,
        currentWorkload: 0,
        newWorkload: newWorkloadPercentage,
        availableCapacity: 0,
        errorMessage: 'Unable to validate workload. Please try again.'
      };
    }
  }

  /**
   * Validate if updating an existing workload allocation is allowed
   */
  async validateWorkloadUpdate(
    userId: number,
    currentProjectWorkload: number,
    newWorkloadPercentage: number
  ): Promise<WorkloadValidationResult> {
    try {
      const workloadInfo = await this.getUserWorkloadInfo(userId);
      
      // Calculate workload excluding the current project assignment
      const workloadWithoutCurrentProject = workloadInfo.currentWorkload - currentProjectWorkload;
      const newTotalWorkload = workloadWithoutCurrentProject + newWorkloadPercentage;
      
      const isValid = newTotalWorkload <= 100;
      
      return {
        isValid,
        currentWorkload: workloadInfo.currentWorkload,
        newWorkload: newTotalWorkload,
        availableCapacity: 100 - workloadWithoutCurrentProject,
        errorMessage: isValid 
          ? undefined 
          : `Updating to ${newWorkloadPercentage}% would exceed 100% capacity. Current total: ${workloadInfo.currentWorkload}%, Available after removing current assignment: ${100 - workloadWithoutCurrentProject}%`
      };
    } catch (error) {
      console.error('Workload update validation failed:', error);
      return {
        isValid: false,
        currentWorkload: 0,
        newWorkload: newWorkloadPercentage,
        availableCapacity: 0,
        errorMessage: 'Unable to validate workload update. Please try again.'
      };
    }
  }

  /**
   * Get formatted workload display text
   */
  getWorkloadDisplayText(workloadInfo: WorkloadInfo): string {
    const status = workloadInfo.isOverloaded ? 'Overloaded' : 'Available';
    return `${workloadInfo.currentWorkload}% used (${workloadInfo.availableCapacity}% available) - ${status}`;
  }

  /**
   * Check if user is approaching workload limit (>80%)
   */
  isApproachingLimit(currentWorkload: number): boolean {
    return currentWorkload > 80;
  }

  /**
   * Get workload status color for UI
   */
  getWorkloadStatusColor(currentWorkload: number): 'success' | 'warning' | 'error' {
    if (currentWorkload <= 70) return 'success';
    if (currentWorkload <= 90) return 'warning';
    return 'error';
  }

  /**
   * Validate workload percentage input
   */
  validateWorkloadPercentage(percentage: number): { isValid: boolean; message?: string } {
    if (percentage < 0) {
      return { isValid: false, message: 'Workload percentage cannot be negative' };
    }
    if (percentage > 100) {
      return { isValid: false, message: 'Workload percentage cannot exceed 100%' };
    }
    return { isValid: true };
  }

  /**
   * Get workload recommendations based on current state
   */
  getWorkloadRecommendations(workloadInfo: WorkloadInfo): string[] {
    const recommendations: string[] = [];
    
    if (workloadInfo.isOverloaded) {
      recommendations.push('Consider redistributing tasks to reduce overload');
      recommendations.push('Review project priorities and deadlines');
      recommendations.push('Consider extending project timelines');
    } else if (workloadInfo.currentWorkload > 90) {
      recommendations.push('User is near maximum capacity');
      recommendations.push('Monitor for potential burnout');
      recommendations.push('Avoid additional assignments');
    } else if (workloadInfo.currentWorkload < 60) {
      recommendations.push('User has significant available capacity');
      recommendations.push('Consider additional project assignments');
      recommendations.push('Good candidate for urgent tasks');
    } else {
      recommendations.push('User has optimal workload balance');
      recommendations.push('Can handle small additional tasks');
    }
    
    return recommendations;
  }
}

export const workloadValidationService = new WorkloadValidationService();