import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { NotificationList } from '@/components/notifications/NotificationList';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationParams, NotificationTypeFilter } from '@/types/notification';
import { toast } from 'sonner';
import { 
  Bell, 
  Search, 
  Filter, 
  X, 
  CheckCheck, 
  Settings,
  RefreshCw
} from 'lucide-react';

export const Notifications: React.FC = () => {
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
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', 'page', queryParams],
    queryFn: () => notificationService.getNotifications(queryParams),
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000,
  });

  // Query for unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
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

  const handleRefresh = () => {
    refetch();
    toast.success('Đã làm mới thông báo');
  };

  const notifications = notificationsData?.content || [];
  const hasMore = notificationsData ? page < notificationsData.totalPages : false;
  const totalCount = notificationsData?.totalElements || 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Thông báo</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý và theo dõi các thông báo của bạn
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng thông báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chưa đọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unreadCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã đọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalCount - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
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
              <SelectTrigger className="w-full lg:w-64">
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
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full lg:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="p-6 pb-0">
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
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {error ? (
                <div className="text-center py-12 text-destructive">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không thể tải thông báo. Vui lòng thử lại.</p>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Thử lại
                  </Button>
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
                  className="border-0"
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;