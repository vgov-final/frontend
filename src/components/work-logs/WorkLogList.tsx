import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Grid3X3,
  List,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { WorkLogCard } from './WorkLogCard';
import type { WorkLog, WorkLogSearchParams } from '@/types/workLog';
import type { PagedResponse } from '@/types/api';

interface WorkLogListProps {
  data?: PagedResponse<WorkLog>;
  isLoading?: boolean;
  error?: Error | null;
  searchParams: WorkLogSearchParams;
  onParamsChange: (params: WorkLogSearchParams) => void;
  onEdit?: (workLog: WorkLog) => void;
  onDelete?: (workLog: WorkLog) => void;
  onView?: (workLog: WorkLog) => void;
  onRefresh?: () => void;
  showUserInfo?: boolean;
  showProjectInfo?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  deletingIds?: number[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export const WorkLogList: React.FC<WorkLogListProps> = React.memo(({
  data,
  isLoading = false,
  error,
  searchParams,
  onParamsChange,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  showUserInfo = true,
  showProjectInfo = true,
  viewMode = 'grid',
  onViewModeChange,
  deletingIds = [],
  canEdit = true,
  canDelete = true,
}) => {
  const currentPage = searchParams.page || 0;
  const pageSize = searchParams.size || 10;

  const handlePageChange = (newPage: number) => {
    onParamsChange({ ...searchParams, page: newPage });
  };

  const handlePageSizeChange = (newSize: string) => {
    onParamsChange({ ...searchParams, size: parseInt(newSize), page: 0 });
  };

  const handleSortChange = (newSort: string) => {
    const [sortBy, sortDir] = newSort.split(':');
    onParamsChange({ 
      ...searchParams, 
      sortBy, 
      sortDir: sortDir as 'asc' | 'desc',
      page: 0 
    });
  };

  const getSortValue = () => {
    return `${searchParams.sortBy || 'workDate'}:${searchParams.sortDir || 'desc'}`;
  };

  const getTotalHours = () => {
    if (!data?.content) return 0;
    return data.content.reduce((total, workLog) => total + workLog.hoursWorked, 0);
  };

  const getAverageHours = () => {
    if (!data?.content || data.content.length === 0) return 0;
    return getTotalHours() / data.content.length;
  };

  // Loading skeleton
  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Có lỗi xảy ra khi tải dữ liệu work log: {error.message}
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Thử lại
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data?.content || data.content.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Work Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Không có work log nào</h3>
            <p className="text-muted-foreground mb-4">
              {searchParams.search || searchParams.projectId || searchParams.userId
                ? 'Không tìm thấy work log nào phù hợp với bộ lọc hiện tại.'
                : 'Chưa có work log nào được tạo. Hãy tạo work log đầu tiên của bạn!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Work Logs
            </CardTitle>
            <Badge variant="secondary">
              {data.totalElements} kết quả
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Summary stats */}
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground mr-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Tổng: {getTotalHours().toFixed(1)}h</span>
              </div>
              <div className="flex items-center gap-1">
                <span>TB: {getAverageHours().toFixed(1)}h</span>
              </div>
            </div>

            {/* View mode toggle */}
            {onViewModeChange && (
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Sort options */}
            <Select value={getSortValue()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workDate:desc">Ngày mới nhất</SelectItem>
                <SelectItem value="workDate:asc">Ngày cũ nhất</SelectItem>
                <SelectItem value="hoursWorked:desc">Giờ cao nhất</SelectItem>
                <SelectItem value="hoursWorked:asc">Giờ thấp nhất</SelectItem>
                <SelectItem value="taskFeature:asc">Task A-Z</SelectItem>
                <SelectItem value="taskFeature:desc">Task Z-A</SelectItem>
                <SelectItem value="createdAt:desc">Tạo mới nhất</SelectItem>
                <SelectItem value="createdAt:asc">Tạo cũ nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Work log grid/list */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {data.content.map((workLog) => (
            <WorkLogCard
              key={workLog.id}
              workLog={workLog}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              showUserInfo={showUserInfo}
              showProjectInfo={showProjectInfo}
              isDeleting={deletingIds.includes(workLog.id)}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>

        {/* Loading overlay for refresh */}
        {isLoading && data && (
          <div className="mt-4">
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Hiển thị
              </span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                trong tổng số {data.totalElements} kết quả
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum;
                  if (data.totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > data.totalPages - 4) {
                    pageNum = data.totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= data.totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.totalPages - 1)}
                disabled={currentPage >= data.totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
