import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import type { User, CreateUserRequest, UpdateUserRequest, UserSearchParams, PagedResponse } from '@/types/api';

// Query Keys
export const USER_QUERY_KEYS = {
    all: ['users'] as const,
    lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
    list: (params: UserSearchParams) => [...USER_QUERY_KEYS.lists(), params] as const,
    details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...USER_QUERY_KEYS.details(), id] as const,
    profile: () => [...USER_QUERY_KEYS.all, 'profile'] as const,
};

// Cache time constants
const CACHE_TIME = {
    USERS: 5 * 60 * 1000, // 5 minutes
    PROFILE: 2 * 60 * 1000, // 2 minutes
};

/**
 * Hook to fetch users with pagination and filtering
 */
export const useUsers = (params: UserSearchParams = {}) => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.list(params),
        queryFn: () => userService.getUsers(params),
        staleTime: CACHE_TIME.USERS,
    });
};

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (id: number) => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.detail(id),
        queryFn: () => userService.getUserById(id),
        staleTime: CACHE_TIME.USERS,
        enabled: !!id,
    });
};

/**
 * Hook to fetch user roles
 */
export const useUserRoles = () => {
    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, 'roles'] as const,
        queryFn: () => userService.getUserRoles(),
        staleTime: CACHE_TIME.USERS,
    });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userService.createUser(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Người dùng đã được tạo thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo người dùng. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
            userService.updateUser(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Người dùng đã được cập nhật thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật người dùng. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => userService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            toast({
                title: 'Thành công',
                description: 'Người dùng đã được xóa thành công.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa người dùng. Vui lòng thử lại.',
                variant: 'destructive',
            });
        },
    });
};
