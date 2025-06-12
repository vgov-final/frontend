import React from 'react';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

const NotificationSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton className="h-5 w-5 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const NotificationList: React.FC<NotificationListProps> = React.memo(({
  notifications,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  className = ''
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading && notifications.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Không có thông báo
        </h3>
        <p className="text-sm text-muted-foreground">
          Bạn sẽ nhận được thông báo khi có hoạt động mới
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({unreadCount} chưa đọc)
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      )}

      {/* Notification list */}
      <ScrollArea className="max-h-96">
        <div className="space-y-2 p-2">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onClick={onNotificationClick}
              />
              {index < notifications.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Đang tải...' : 'Tải thêm'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
});
