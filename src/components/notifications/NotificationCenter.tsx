import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Settings } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotificationList } from './NotificationList';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationParams } from '@/types/notification';
import { toast } from 'sonner';

interface NotificationCenterProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = '',
  onNotificationClick,
  onSettingsClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Query for unread count (for badge)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  // Query for notifications list
  const {
    data: notificationsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', 'list', page],
    queryFn: () => notificationService.getNotifications({
      page,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    } as NotificationParams),
    enabled: isOpen, // Only fetch when popover is open
    refetchInterval: isOpen ? 30000 : false, // Poll only when open
    staleTime: 25000,
  });

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã đánh dấu thông báo là đã đọc');
    },
    onError: () => {
      toast.error('Không thể đánh dấu thông báo');
    }
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    },
    onError: () => {
      toast.error('Không thể đánh dấu tất cả thông báo');
    }
  });

  // Mutation for deleting notification
  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã xóa thông báo');
    },
    onError: () => {
      toast.error('Không thể xóa thông báo');
    }
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Call external handler if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Close popover
    setIsOpen(false);
  };

  const notifications = notificationsData?.content || [];
  const hasMore = notificationsData ? page < notificationsData.totalPages : false;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 ${className}`}
          aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Thông báo</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="p-1 h-auto"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="p-4 text-center text-sm text-destructive">
              Không thể tải thông báo. Vui lòng thử lại.
            </div>
          )}

          {/* Notifications list */}
          {!error && (
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDelete}
              onNotificationClick={handleNotificationClick}
            />
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if needed
                    // This would typically use router navigation
                  }}
                >
                  Xem tất cả thông báo
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};