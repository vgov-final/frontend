import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { WorkLogSearchParams } from '@/types/workLog';

interface Project {
  id: number;
  name: string;
  projectCode: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface WorkLogSearchProps {
  onSearch: (params: WorkLogSearchParams) => void;
  projects?: Project[];
  users?: User[];
  initialParams?: WorkLogSearchParams;
  isLoading?: boolean;
  showUserFilter?: boolean;
  className?: string;
}

export const WorkLogSearch: React.FC<WorkLogSearchProps> = ({
  onSearch,
  projects = [],
  users = [],
  initialParams = {},
  isLoading = false,
  showUserFilter = true,
  className,
}) => {
  const [params, setParams] = React.useState<WorkLogSearchParams>(initialParams);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [dateFromOpen, setDateFromOpen] = React.useState(false);
  const [dateToOpen, setDateToOpen] = React.useState(false);

  // Check if there are any active filters
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      params.search ||
      params.projectId ||
      params.userId ||
      params.workDateFrom ||
      params.workDateTo ||
      params.minHours ||
      params.maxHours ||
      params.taskFeature
    );
  }, [params]);

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (params.search) count++;
    if (params.projectId) count++;
    if (params.userId) count++;
    if (params.workDateFrom || params.workDateTo) count++;
    if (params.minHours || params.maxHours) count++;
    if (params.taskFeature) count++;
    return count;
  }, [params]);

  const handleParamChange = (key: keyof WorkLogSearchParams, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
  };

  const handleSearch = () => {
    // Reset page to 0 when searching
    const searchParams = { ...params, page: 0 };
    onSearch(searchParams);
  };

  const handleReset = () => {
    const resetParams = { page: 0, size: params.size || 10 };
    setParams(resetParams);
    onSearch(resetParams);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const removeFilter = (filterKey: keyof WorkLogSearchParams) => {
    const newParams = { ...params };
    delete newParams[filterKey];
    setParams(newParams);
    onSearch(newParams);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tìm kiếm Work Log</CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} bộ lọc
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo task, mô tả công việc..."
              value={params.search || ''}
              onChange={(e) => handleParamChange('search', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {params.search && (
              <Badge variant="outline" className="gap-1">
                Tìm kiếm: "{params.search}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('search')}
                />
              </Badge>
            )}
            {params.projectId && (
              <Badge variant="outline" className="gap-1">
                Dự án: {projects.find(p => p.id === params.projectId)?.name || 'N/A'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('projectId')}
                />
              </Badge>
            )}
            {params.userId && showUserFilter && (
              <Badge variant="outline" className="gap-1">
                Người dùng: {users.find(u => u.id === params.userId)?.name || 'N/A'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('userId')}
                />
              </Badge>
            )}
            {(params.workDateFrom || params.workDateTo) && (
              <Badge variant="outline" className="gap-1">
                Ngày: {params.workDateFrom ? formatDateForDisplay(params.workDateFrom) : '...'} - {params.workDateTo ? formatDateForDisplay(params.workDateTo) : '...'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    removeFilter('workDateFrom');
                    removeFilter('workDateTo');
                  }}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Advanced filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Project filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dự án</Label>
                <Select
                  value={params.projectId ? params.projectId.toString() : ''}
                  onValueChange={(value) => 
                    handleParamChange('projectId', value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả dự án" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả dự án</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {project.projectCode}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User filter */}
              {showUserFilter && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Người dùng</Label>
                  <Select
                    value={params.userId ? params.userId.toString() : ''}
                    onValueChange={(value) => 
                      handleParamChange('userId', value ? parseInt(value) : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả người dùng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả người dùng</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Task/Feature filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Task/Feature</Label>
                <Input
                  placeholder="Tìm theo tên task..."
                  value={params.taskFeature || ''}
                  onChange={(e) => handleParamChange('taskFeature', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date from */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Từ ngày</Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !params.workDateFrom && 'text-muted-foreground'
                      )}
                    >
                      {params.workDateFrom ? (
                        formatDateForDisplay(params.workDateFrom)
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={params.workDateFrom ? new Date(params.workDateFrom) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleParamChange('workDateFrom', formatDateForInput(date));
                          setDateFromOpen(false);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date to */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Đến ngày</Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !params.workDateTo && 'text-muted-foreground'
                      )}
                    >
                      {params.workDateTo ? (
                        formatDateForDisplay(params.workDateTo)
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={params.workDateTo ? new Date(params.workDateTo) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleParamChange('workDateTo', formatDateForInput(date));
                          setDateToOpen(false);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Min hours */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Giờ tối thiểu</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="0"
                  value={params.minHours || ''}
                  onChange={(e) => handleParamChange('minHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Max hours */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Giờ tối đa</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="24"
                  value={params.maxHours || ''}
                  onChange={(e) => handleParamChange('maxHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading || !hasActiveFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Đặt lại
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                >
                  Thu gọn
                </Button>
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Filter className="h-4 w-4 mr-2" />
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
