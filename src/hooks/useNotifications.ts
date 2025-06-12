import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { NotificationParams } from '@/types/notification';
import { toast } from 'sonner';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// Hook for fetching notifications list
export const useNotifications = (params: NotificationParams) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getNotifications(params),
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
};

// Hook for fetching unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000,
  });
};

// Hook for marking notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Đã đánh dấu thông báo là đã đọc');
    },
    onError: () => {
      toast.error('Không thể đánh dấu thông báo');
    }
  });
};

// Hook for marking all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    },
    onError: () => {
      toast.error('Không thể đánh dấu tất cả thông báo');
    }
  });
};

// Hook for deleting notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Đã xóa thông báo');
    },
    onError: () => {
      toast.error('Không thể xóa thông báo');
    }
  });
};

// Hook for optimistic updates when marking as read
export const useOptimisticMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onMutate: async (id: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old: any) => {
        if (!old) return old;
        
        // Update notification lists
        if (old.content) {
          return {
            ...old,
            content: old.content.map((notification: any) =>
              notification.id === id ? { ...notification, isRead: true } : notification
            )
          };
        }
        
        return old;
      });
      
      // Update unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), (old: number = 0) => 
        Math.max(0, old - 1)
      );
      
      return { previousData };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Không thể đánh dấu thông báo');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};