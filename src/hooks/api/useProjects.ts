import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';
import type { Project, CreateProjectRequest, UpdateProjectRequest, ProjectSearchParams, PagedResponse } from '@/types/api';

// Query Keys
export const PROJECT_QUERY_KEYS = {
    all: ['projects'] as const,
    lists: () => [...PROJECT_QUERY_KEYS.all, 'list'] as const,
    list: (params: ProjectSearchParams) => [...PROJECT_QUERY_KEYS.lists(), params] as const,
    details: () => [...PROJECT_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...PROJECT_QUERY_KEYS.details(), id] as const,
    stats: () => [...PROJECT_QUERY_KEYS.all, 'stats'] as const,
};

// Cache time constants
const CACHE_TIME = {
    PROJECTS: 5 * 60 * 1000, // 5 minutes
    STATS: 10 * 60 * 1000, // 10 minutes
};

/**
 * Hook to fetch projects with pagination and filtering
 */
export const useProjects = (params: ProjectSearchParams = {}) => {
    return useQuery({
        queryKey: PROJECT_QUERY_KEYS.list(params),
        queryFn: () => projectService.getProjects(params),
        staleTime: CACHE_TIME.PROJECTS,
    });
};

/**
 * Hook to fetch a single project by ID
 */
export const useProject = (id: number) => {
    return useQuery({
        queryKey: PROJECT_QUERY_KEYS.detail(id),
        queryFn: () => projectService.getProjectById(id),
        staleTime: CACHE_TIME.PROJECTS,
        enabled: !!id,
    });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreateProjectRequest) => projectService.createProject(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Dự án đã được tạo thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo dự án. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) =>
            projectService.updateProject(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Dự án đã được cập nhật thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật dự án. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => projectService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Dự án đã được xóa thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa dự án. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};
