import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workLogService } from '@/services/workLogService';
import { useToast } from '@/hooks/use-toast';
import type { 
  WorkLog, 
  CreateWorkLogRequest, 
  UpdateWorkLogRequest, 
  WorkLogSearchParams,
  WorkLogStats,
  WorkLogCalendarEntry
} from '@/types/workLog';
import type { PagedResponse } from '@/types/api';

// Query Keys
export const WORK_LOG_QUERY_KEYS = {
  all: ['workLogs'] as const,
  lists: () => [...WORK_LOG_QUERY_KEYS.all, 'list'] as const,
  list: (params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.lists(), params] as const,
  details: () => [...WORK_LOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...WORK_LOG_QUERY_KEYS.details(), id] as const,
  stats: () => [...WORK_LOG_QUERY_KEYS.all, 'stats'] as const,
  userStats: (userId: number, params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.stats(), 'user', userId, params] as const,
  projectStats: (projectId: number, params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.stats(), 'project', projectId, params] as const,
  calendar: (params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.all, 'calendar', params] as const,
  userWorkLogs: (userId: number, params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.all, 'user', userId, params] as const,
  projectWorkLogs: (projectId: number, params: WorkLogSearchParams) => [...WORK_LOG_QUERY_KEYS.all, 'project', projectId, params] as const,
};

// Cache time constants
const CACHE_TIME = {
  WORK_LOGS: 2 * 60 * 1000, // 2 minutes
  STATS: 5 * 60 * 1000, // 5 minutes
  CALENDAR: 5 * 60 * 1000, // 5 minutes
};

/**
 * Hook to fetch work logs with pagination and filtering
 */
export const useWorkLogs = (params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.list(params),
    queryFn: () => workLogService.getWorkLogs(params),
    staleTime: CACHE_TIME.WORK_LOGS,
  });
};

/**
 * Hook to fetch work logs for a specific user
 */
export const useUserWorkLogs = (userId: number, params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.userWorkLogs(userId, params),
    queryFn: () => workLogService.getUserWorkLogs(userId, params),
    staleTime: CACHE_TIME.WORK_LOGS,
    enabled: !!userId,
  });
};

/**
 * Hook to fetch work logs for a specific project
 */
export const useProjectWorkLogs = (projectId: number, params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.projectWorkLogs(projectId, params),
    queryFn: () => workLogService.getProjectWorkLogs(projectId, params),
    staleTime: CACHE_TIME.WORK_LOGS,
    enabled: !!projectId,
  });
};

/**
 * Hook to fetch a single work log by ID
 */
export const useWorkLog = (id: number) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.detail(id),
    queryFn: () => workLogService.getWorkLog(id),
    staleTime: CACHE_TIME.WORK_LOGS,
    enabled: !!id,
  });
};

/**
 * Hook to fetch work log statistics
 */
export const useWorkLogStats = (params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.stats(),
    queryFn: () => workLogService.getWorkLogStats(params),
    staleTime: CACHE_TIME.STATS,
  });
};

/**
 * Hook to fetch user work log statistics
 */
export const useUserWorkLogStats = (userId: number, params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.userStats(userId, params),
    queryFn: () => workLogService.getUserWorkLogStats(userId, params),
    staleTime: CACHE_TIME.STATS,
    enabled: !!userId,
  });
};

/**
 * Hook to fetch project work log statistics
 */
export const useProjectWorkLogStats = (projectId: number, params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.projectStats(projectId, params),
    queryFn: () => workLogService.getProjectWorkLogStats(projectId, params),
    staleTime: CACHE_TIME.STATS,
    enabled: !!projectId,
  });
};

/**
 * Hook to fetch work log calendar data
 */
export const useWorkLogCalendar = (params: WorkLogSearchParams = {}) => {
  return useQuery({
    queryKey: WORK_LOG_QUERY_KEYS.calendar(params),
    queryFn: () => workLogService.getWorkLogCalendar(params),
    staleTime: CACHE_TIME.CALENDAR,
  });
};

/**
 * Hook to create a new work log
 */
export const useCreateWorkLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateWorkLogRequest) => workLogService.createWorkLog(data),
    onMutate: async (newWorkLog) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: WORK_LOG_QUERY_KEYS.lists() });

      // Snapshot the previous value
      const previousWorkLogs = queryClient.getQueryData(WORK_LOG_QUERY_KEYS.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(
        WORK_LOG_QUERY_KEYS.list({}),
        (old: PagedResponse<WorkLog> | undefined) => {
          if (!old) return old;

          const optimisticWorkLog: WorkLog = {
            id: Date.now(), // Temporary ID
            userId: 0, // Will be set by server
            projectId: newWorkLog.projectId,
            workDate: newWorkLog.workDate,
            hoursWorked: newWorkLog.hoursWorked,
            taskFeature: newWorkLog.taskFeature,
            workDescription: newWorkLog.workDescription,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...old,
            content: [optimisticWorkLog, ...old.content],
            totalElements: old.totalElements + 1,
          };
        }
      );

      return { previousWorkLogs };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousWorkLogs) {
        queryClient.setQueryData(WORK_LOG_QUERY_KEYS.lists(), context.previousWorkLogs);
      }
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo work log. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: 'Work log đã được tạo thành công.',
      });
    },
    onSettled: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to update a work log
 */
export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkLogRequest }) =>
      workLogService.updateWorkLog(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: WORK_LOG_QUERY_KEYS.detail(id) });
      await queryClient.cancelQueries({ queryKey: WORK_LOG_QUERY_KEYS.lists() });

      // Snapshot the previous values
      const previousWorkLog = queryClient.getQueryData(WORK_LOG_QUERY_KEYS.detail(id));
      const previousWorkLogs = queryClient.getQueryData(WORK_LOG_QUERY_KEYS.lists());

      // Optimistically update the work log detail
      queryClient.setQueryData(WORK_LOG_QUERY_KEYS.detail(id), (old: WorkLog | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      // Optimistically update the work logs list
      queryClient.setQueryData(
        WORK_LOG_QUERY_KEYS.list({}),
        (old: PagedResponse<WorkLog> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            content: old.content.map((workLog) =>
              workLog.id === id
                ? { ...workLog, ...data, updatedAt: new Date().toISOString() }
                : workLog
            ),
          };
        }
      );

      return { previousWorkLog, previousWorkLogs };
    },
    onError: (error, { id }, context) => {
      // Rollback to previous values on error
      if (context?.previousWorkLog) {
        queryClient.setQueryData(WORK_LOG_QUERY_KEYS.detail(id), context.previousWorkLog);
      }
      if (context?.previousWorkLogs) {
        queryClient.setQueryData(WORK_LOG_QUERY_KEYS.lists(), context.previousWorkLogs);
      }
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật work log. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: 'Work log đã được cập nhật thành công.',
      });
    },
    onSettled: (data, error, { id }) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to delete a work log
 */
export const useDeleteWorkLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => workLogService.deleteWorkLog(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: WORK_LOG_QUERY_KEYS.lists() });

      // Snapshot the previous value
      const previousWorkLogs = queryClient.getQueryData(WORK_LOG_QUERY_KEYS.lists());

      // Optimistically update to remove the work log
      queryClient.setQueryData(
        WORK_LOG_QUERY_KEYS.list({}),
        (old: PagedResponse<WorkLog> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            content: old.content.filter((workLog) => workLog.id !== id),
            totalElements: old.totalElements - 1,
          };
        }
      );

      return { previousWorkLogs };
    },
    onError: (error, id, context) => {
      // Rollback to previous value on error
      if (context?.previousWorkLogs) {
        queryClient.setQueryData(WORK_LOG_QUERY_KEYS.lists(), context.previousWorkLogs);
      }
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa work log. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Work log đã được xóa thành công.',
      });
    },
    onSettled: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to get work log mutations object
 */
export const useWorkLogMutations = () => {
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
