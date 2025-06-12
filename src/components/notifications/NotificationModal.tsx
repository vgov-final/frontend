import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationList } from './NotificationList';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationParams, NotificationTypeFilter } from '@/types/notification';
import { toast } from 'sonner';
import { Search, Filter, X, CheckCheck, Trash2 } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onOpenChange,
  onNotificationClick
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Build query parameters
  const queryParams: NotificationParams = {
    page,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    ...(activeTab !== 'all' && { isRead: activeTab === 'read' }),
    ...(selectedType !== 'all' && { notificationType: selectedType })
  };

  // Query for notifications
  const {
    data: notificationsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', 'modal', queryParams],
    queryFn: () => notificationService.getNotifications(queryParams),
    enabled: open,
    refetchInterval: open ? 30000 : false,
    staleTime: 25000,
  });

  // Query for unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: open,
    refetchInterval: open ? 30000 : false,
    staleTime: 25000,
  });

  // Mutations
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
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'unread' | 'read');
    setPage(1); // Reset page when changing tabs
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset page when searching
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as NotificationTypeFilter);
    setPage(1); // Reset page when changing type
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setActiveTab('all');
    setPage(1);
  };

  const notifications = notificationsData?.content || [];
  const hasMore = notificationsData ? page < notificationsData.totalPages : false;
  const totalCount = notificationsData?.totalElements || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Quản lý thông báo</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} chưa đọc
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thông báo..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Loại thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="PROJECT_ASSIGNED">Giao dự án</SelectItem>
                <SelectItem value="WORKLOAD_EXCEEDED">Vượt khối lượng</SelectItem>
                <SelectItem value="DEADLINE_APPROACHING">Gần hạn</SelectItem>
                <SelectItem value="PROJECT_COMPLETED">Hoàn thành dự án</SelectItem>
                <SelectItem value="SYSTEM_NOTIFICATION">Bảo trì hệ thống</SelectItem>
                <SelectItem value="PROJECT_UPDATED">Cập nhật dự án</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                Tất cả
                {totalCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Chưa đọc
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Đã đọc</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="max-h-[500px] overflow-hidden">
                {error ? (
                  <div className="text-center py-8 text-destructive">
                    Không thể tải thông báo. Vui lòng thử lại.
                  </div>
                ) : (
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};