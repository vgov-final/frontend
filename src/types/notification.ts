export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedProjectId?: number;
  relatedProjectName?: string;
  relatedUserId?: number;
  relatedUserName?: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'PROJECT_ASSIGNED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_COMPLETED'
  | 'WORKLOAD_EXCEEDED'
  | 'WORK_LOG_REMINDER'
  | 'SYSTEM_NOTIFICATION'
  | 'USER_ASSIGNED'
  | 'USER_REMOVED'
  | 'DEADLINE_APPROACHING';

export type NotificationTypeFilter = NotificationType | 'all';

export interface NotificationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  isRead?: boolean;
  notificationType?: NotificationTypeFilter;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}