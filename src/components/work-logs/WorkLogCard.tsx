import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  Calendar, 
  User, 
  FolderOpen, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { WorkLog } from '@/types/workLog';

interface WorkLogCardProps {
  workLog: WorkLog;
  onEdit?: (workLog: WorkLog) => void;
  onDelete?: (workLog: WorkLog) => void;
  onView?: (workLog: WorkLog) => void;
  showUserInfo?: boolean;
  showProjectInfo?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const WorkLogCard: React.FC<WorkLogCardProps> = React.memo(({
  workLog,
  onEdit,
  onDelete,
  onView,
  showUserInfo = true,
  showProjectInfo = true,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: vi });
    } catch {
      return '';
    }
  };

  const getHoursBadgeColor = (hours: number) => {
    if (hours >= 8) return 'default';
    if (hours >= 6) return 'secondary';
    return 'destructive';
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(workLog);
    }
    setShowDeleteDialog(false);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <>
      <Card className="w-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight mb-2 truncate">
                {workLog.taskFeature}
              </h3>
              
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(workLog.workDate)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <Badge variant={getHoursBadgeColor(workLog.hoursWorked)} className="text-xs">
                    {workLog.hoursWorked}h
                  </Badge>
                </div>

                {showUserInfo && workLog.user && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{workLog.user.name}</span>
                  </div>
                )}

                {showProjectInfo && workLog.project && (
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    <span className="truncate">{workLog.project.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(workLog)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(workLog)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Work description */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {truncateText(workLog.workDescription)}
            </p>
            {workLog.workDescription.length > 150 && onView && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs mt-1"
                onClick={() => onView(workLog)}
              >
                Xem thêm
              </Button>
            )}
          </div>

          {/* User info for small cards */}
          {showUserInfo && workLog.user && (
            <div className="flex items-center gap-2 pt-3 border-t">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getUserInitials(workLog.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{workLog.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{workLog.user.email}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(workLog.createdAt)}
              </div>
            </div>
          )}

          {/* Project info for small cards */}
          {showProjectInfo && workLog.project && !showUserInfo && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <span className="text-xs font-medium">{workLog.project.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {workLog.project.code}
              </span>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex justify-between items-center pt-3 border-t text-xs text-muted-foreground">
            <span>Tạo: {formatDate(workLog.createdAt)}</span>
            {workLog.updatedAt !== workLog.createdAt && (
              <span>Cập nhật: {formatDate(workLog.updatedAt)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa work log</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa work log "{workLog.taskFeature}" không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
