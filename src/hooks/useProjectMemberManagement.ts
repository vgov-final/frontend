import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { workloadService } from '@/services/workloadService';
import { ProjectMember, ValidationResponse } from '@/types/workload';
import { toast } from 'sonner';

export interface AddMemberWithValidationParams {
  projectId: number;
  userId: number;
  workloadPercentage: number;
  skipValidation?: boolean;
}

export interface UpdateMemberWorkloadParams {
  projectId: number;
  memberId: number;
  workloadPercentage: number;
  skipValidation?: boolean;
}

export function useProjectMemberManagement(projectId: number) {
  const queryClient = useQueryClient();

  // Query for project members
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Mutation to add member with workload validation
  const addMemberWithWorkloadValidation = useMutation({
    mutationFn: async (params: AddMemberWithValidationParams) => {
      const { projectId, userId, workloadPercentage, skipValidation = false } = params;

      // Validate workload first unless skipped
      if (!skipValidation) {
        const validation = await workloadService.validateWorkload(
          userId, 
          projectId, 
          workloadPercentage
        );

        if (!validation.isValid) {
          throw new Error(validation.message || 'Workload validation failed');
        }
      }

      // Add member to project
      return await projectService.addProjectMember(projectId, {
        userId,
        workloadAllocation: workloadPercentage
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      queryClient.invalidateQueries({ queryKey: ['userWorkload', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['workloadAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['workloadDistribution'] });

      toast.success('Team member added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add team member: ${error.message}`);
    }
  });

  // Mutation to update member workload with validation
  const updateMemberWorkload = useMutation({
    mutationFn: async (params: UpdateMemberWorkloadParams) => {
      const { projectId, memberId, workloadPercentage, skipValidation = false } = params;

      // Get current member info to find userId
      const currentMember = members?.find(m => m.id === memberId);
      if (!currentMember) {
        throw new Error('Member not found');
      }

      // Validate workload first unless skipped
      if (!skipValidation) {
        // Calculate current workload excluding this project
        const currentWorkloadExcludingProject = await workloadService.getUserWorkload(currentMember.userId);
        const otherProjectsWorkload = currentWorkloadExcludingProject.projectAssignments
          .filter(assignment => assignment.projectId !== projectId && assignment.isActive)
          .reduce((sum, assignment) => sum + assignment.workloadPercentage, 0);

        const validation = await workloadService.validateWorkload(
          currentMember.userId,
          projectId,
          workloadPercentage
        );

        // Adjust validation to account for replacing existing assignment
        const adjustedTotalWorkload = otherProjectsWorkload + workloadPercentage;
        if (adjustedTotalWorkload > 100) {
          throw new Error(`Vượt quá 100% (${adjustedTotalWorkload}%)`);
        }
      }

      // Update member workload
      return await workloadService.updateUserWorkload(
        currentMember.userId,
        projectId,
        workloadPercentage
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      queryClient.invalidateQueries({ queryKey: ['userWorkload'] });
      queryClient.invalidateQueries({ queryKey: ['workloadAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['workloadDistribution'] });

      toast.success('Member workload updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workload: ${error.message}`);
    }
  });

  // Mutation to remove member from project
  const removeMember = useMutation({
    mutationFn: async (memberId: number) => {
      return await projectService.removeMemberFromProject(projectId, memberId);
    },
    onSuccess: (data, memberId) => {
      // Find the removed member to get userId for cache invalidation
      const removedMember = members?.find(m => m.id === memberId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      if (removedMember) {
        queryClient.invalidateQueries({ queryKey: ['userWorkload', removedMember.userId] });
      }
      queryClient.invalidateQueries({ queryKey: ['workloadAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['workloadDistribution'] });

      toast.success('Team member removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    }
  });

  // Function to validate workload before assignment
  const validateMemberWorkload = async (userId: number, workloadPercentage: number): Promise<ValidationResponse> => {
    return await workloadService.validateWorkload(userId, projectId, workloadPercentage);
  };

  // Function to get member's current workload
  const getMemberWorkload = async (userId: number) => {
    return await workloadService.getUserWorkload(userId);
  };

  // Function to check if user is already a member
  const isUserAlreadyMember = (userId: number): boolean => {
    return members?.some(member => member.userId === userId && member.isActive) || false;
  };

  // Function to get total project workload
  const getTotalProjectWorkload = (): number => {
    return members?.reduce((total, member) => {
      return member.isActive ? total + member.workloadPercentage : total;
    }, 0) || 0;
  };

  // Function to get project capacity utilization
  const getProjectCapacityUtilization = (): {
    totalWorkload: number;
    memberCount: number;
    averageWorkload: number;
    overloadedMembers: number;
  } => {
    if (!members) {
      return {
        totalWorkload: 0,
        memberCount: 0,
        averageWorkload: 0,
        overloadedMembers: 0
      };
    }

    const activeMembers = members.filter(m => m.isActive);
    const totalWorkload = getTotalProjectWorkload();
    const memberCount = activeMembers.length;
    const averageWorkload = memberCount > 0 ? totalWorkload / memberCount : 0;
    
    // Count members who might be overloaded (this would need additional workload data)
    const overloadedMembers = 0; // This would require fetching each member's total workload

    return {
      totalWorkload,
      memberCount,
      averageWorkload,
      overloadedMembers
    };
  };

  return {
    // Data
    members,
    membersLoading,
    membersError,

    // Mutations
    addMemberWithWorkloadValidation,
    updateMemberWorkload,
    removeMember,

    // Utilities
    validateMemberWorkload,
    getMemberWorkload,
    isUserAlreadyMember,
    getTotalProjectWorkload,
    getProjectCapacityUtilization,

    // Loading states
    isAddingMember: addMemberWithWorkloadValidation.isPending,
    isUpdatingWorkload: updateMemberWorkload.isPending,
    isRemovingMember: removeMember.isPending,

    // Error states
    addMemberError: addMemberWithWorkloadValidation.error,
    updateWorkloadError: updateMemberWorkload.error,
    removeMemberError: removeMember.error
  };
}

// Hook for managing multiple projects' members
export function useMultiProjectMemberManagement(projectIds: number[]) {
  const queryClient = useQueryClient();

  // Query for all projects' members
  const projectMembersQueries = useQuery({
    queryKey: ['multiProjectMembers', projectIds],
    queryFn: async () => {
      const results = await Promise.all(
        projectIds.map(async (projectId) => {
          const members = await projectService.getProjectMembers(projectId);
          return { projectId, members };
        })
      );
      return results;
    },
    enabled: projectIds.length > 0,
    staleTime: 5 * 60 * 1000
  });

  // Function to get user's workload across all specified projects
  const getUserWorkloadAcrossProjects = (userId: number): {
    totalWorkload: number;
    projectAssignments: Array<{ projectId: number; workloadPercentage: number }>;
  } => {
    if (!projectMembersQueries.data) {
      return { totalWorkload: 0, projectAssignments: [] };
    }

    const assignments: Array<{ projectId: number; workloadPercentage: number }> = [];
    let totalWorkload = 0;

    projectMembersQueries.data.forEach(({ projectId, members }) => {
      const member = members.find(m => m.userId === userId && m.isActive);
      if (member) {
        assignments.push({
          projectId,
          workloadPercentage: member.workloadPercentage
        });
        totalWorkload += member.workloadPercentage;
      }
    });

    return { totalWorkload, projectAssignments: assignments };
  };

  // Function to find users who are members of multiple projects
  const getMultiProjectUsers = (): Array<{
    userId: number;
    projectCount: number;
    totalWorkload: number;
    projects: Array<{ projectId: number; workloadPercentage: number }>;
  }> => {
    if (!projectMembersQueries.data) return [];

    const userMap = new Map<number, {
      userId: number;
      projectCount: number;
      totalWorkload: number;
      projects: Array<{ projectId: number; workloadPercentage: number }>;
    }>();

    projectMembersQueries.data.forEach(({ projectId, members }) => {
      members.filter(m => m.isActive).forEach(member => {
        const existing = userMap.get(member.userId);
        if (existing) {
          existing.projectCount++;
          existing.totalWorkload += member.workloadPercentage;
          existing.projects.push({ projectId, workloadPercentage: member.workloadPercentage });
        } else {
          userMap.set(member.userId, {
            userId: member.userId,
            projectCount: 1,
            totalWorkload: member.workloadPercentage,
            projects: [{ projectId, workloadPercentage: member.workloadPercentage }]
          });
        }
      });
    });

    return Array.from(userMap.values()).filter(user => user.projectCount > 1);
  };

  return {
    // Data
    projectMembersData: projectMembersQueries.data,
    isLoading: projectMembersQueries.isLoading,
    error: projectMembersQueries.error,

    // Utilities
    getUserWorkloadAcrossProjects,
    getMultiProjectUsers,

    // Refresh function
    refetch: projectMembersQueries.refetch
  };
}