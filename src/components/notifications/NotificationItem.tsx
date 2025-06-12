import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  Bell,
  Folder,
  Users,
  AlertTriangle,
  Clock,
  Settings,
  UserPlus,
  UserMinus,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Notification, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    PROJECT_ASSIGNED: Folder,
    PROJECT_UPDATED: Folder,
    PROJECT_COMPLETED: Folder,
    WORKLOAD_EXCEEDED: AlertTriangle,
    WORK_LOG_REMINDER: Clock,
    SYSTEM_NOTIFICATION: Settings,
    USER_ASSIGNED: UserPlus,
    USER_REMOVED: UserMinus,
    DEADLINE_APPROACHING: Calendar,
  };
  
  return iconMap[type] || Bell;
};

const getNotificationColor = (type: NotificationType) => {
  const colorMap = {
    PROJECT_ASSIGNED: 'text-blue-500',
    PROJECT_UPDATED: 'text-green-500',
    PROJECT_COMPLETED: 'text-emerald-500',
    WORKLOAD_EXCEEDED: 'text-red-500',
    WORK_LOG_REMINDER: 'text-orange-500',
    SYSTEM_NOTIFICATION: 'text-gray-500',
    USER_ASSIGNED: 'text-blue-500',
    USER_REMOVED: 'text-red-500',
    DEADLINE_APPROACHING: 'text-yellow-500',
  };
  
  return colorMap[type] || 'text-gray-500';
};

const getNotificationTypeLabel = (type: NotificationType) => {
  const labelMap = {
    PROJECT_ASSIGNED: 'Dự án được giao',
    PROJECT_UPDATED: 'Dự án cập nhật',
    PROJECT_COMPLETED: 'Dự án hoàn thành',
    WORKLOAD_EXCEEDED: 'Khối lượng vượt quá',
    WORK_LOG_REMINDER: 'Nhắc nhở work log',
    SYSTEM_NOTIFICATION: 'Thông báo hệ thống',
    USER_ASSIGNED: 'Người dùng được giao',
    USER_REMOVED: 'Người dùng bị xóa',
    DEADLINE_APPROACHING: 'Sắp đến hạn',
  };
  
  return labelMap[type] || 'Thông báo';
};

const renderNotificationMessage = (notification: Notification) => {
  const { title, message, relatedUserName, relatedProjectName, relatedProjectId } = notification;

  if (relatedUserName && relatedProjectName && relatedProjectId) {
    return (
      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
        <strong>{relatedUserName}</strong> {message}{' '}
        <Link to={`/projects/${relatedProjectId}`} className="font-semibold text-blue-600 hover:underline">
          {relatedProjectName}
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      <h4 className={`text-sm font-medium mb-1 ${!notification.isRead ? 'font-semibold' : ''}`}>
        {title}
      </h4>
      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
        {message}
      </p>
    </>
  );
};

export const NotificationItem: React.FC<NotificationItemProps> = React.memo(({
  notification,
  onMarkAsRead,
  onDelete,
  onClick
}) => {
  const Icon = getNotificationIcon(notification.notificationType);
  const iconColor = getNotificationColor(notification.notificationType);
  const typeLabel = getNotificationTypeLabel(notification.notificationType);
  
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
        !notification.isRead ? 'bg-blue-50/50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
            </Badge>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          
          {renderNotificationMessage(notification)}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: vi
              })}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="h-6 px-2 text-xs"
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
