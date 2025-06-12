import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, BarChart3, Eye } from 'lucide-react';
import { WorkLogSearch } from '@/components/work-logs/WorkLogSearch';
import { WorkLogList } from '@/components/work-logs/WorkLogList';
import { WorkLogCalendar } from '@/components/work-logs/WorkLogCalendar';
import { WorkLogStats } from '@/components/work-logs/WorkLogStats';
import {
  useWorkLogs,
  useDeleteWorkLog,
  useWorkLogStats,
  useWorkLogCalendar
} from '@/hooks/api/useWorkLogs';
import { useProjects } from '@/hooks/api/useProjects';
import { useUsers } from '@/hooks/api/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkLog, WorkLogSearchParams } from '@/types/workLog';

export const WorkLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('list');
  const [searchParams, setSearchParams] = React.useState<WorkLogSearchParams>({
    page: 0,
    size: 12,
    sortBy: 'workDate',
    sortDir: 'desc',
  });
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [deletingIds, setDeletingIds] = React.useState<number[]>([]);
  const [calendarDate, setCalendarDate] = React.useState(new Date());

  // API hooks
  const {
    data: workLogsData,
    isLoading: isLoadingWorkLogs,
    error: workLogsError,
    refetch: refetchWorkLogs
  } = useWorkLogs(searchParams);

  const {
    data: projectsData,
    isLoading: isLoadingProjects
  } = useProjects({ size: 1000 });

  const {
    data: usersData,
    isLoading: isLoadingUsers
  } = useUsers({ size: 1000 });

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useWorkLogStats(searchParams);

  const {
    data: calendarData,
    isLoading: isLoadingCalendar
  } = useWorkLogCalendar({
    workDateFrom: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).toISOString().split('T')[0],
    workDateTo: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).toISOString().split('T')[0],
    ...searchParams
  });

  const deleteMutation = useDeleteWorkLog();

  // Permission checks
  const canViewAllUsers = user?.role === 'admin' || user?.role === 'pm';
  const canCreateWorkLog = user?.role === 'pm' || user?.role === 'dev' || user?.role === 'ba' || user?.role === 'test';
  const canManageWorkLogs = user?.role === 'admin' || user?.role === 'pm';

  // Event handlers
  const handleSearch = (params: WorkLogSearchParams) => {
    setSearchParams(params);
  };

  const handleEdit = (workLog: WorkLog) => {
    navigate(`/work-logs/edit/${workLog.id}`);
  };

  const handleView = (workLog: WorkLog) => {
    navigate(`/work-logs/${workLog.id}`);
  };

  const handleDelete = async (workLog: WorkLog) => {
    try {
      setDeletingIds(prev => [...prev, workLog.id]);
      await deleteMutation.mutateAsync(workLog.id);
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== workLog.id));
    }
  };

  const handleCreateNew = () => {
    navigate('/work-logs/create');
  };

  const handleRefresh = () => {
    refetchWorkLogs();
  };

  const handleCalendarDateChange = (date: Date) => {
    setCalendarDate(date);
  };

  const handleWorkLogClick = (workLog: WorkLog) => {
    navigate(`/work-logs/${workLog.id}`);
  };
  // Prepare data for components
  const projects = React.useMemo(() => {
    if (!projectsData?.content) return [];
    return projectsData.content.map(project => ({
      id: project.id,
      name: project.projectName,
      projectCode: project.projectCode,
    }));
  }, [projectsData]);

  const users = React.useMemo(() => {
    if (!usersData?.content) return [];
    return usersData.content.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }, [usersData]);

  // Filter data based on user role
  const availableProjects = React.useMemo(() => {
    if (!user || !projects.length) return projects;
    return projects; // For now, show all projects - implement filtering based on user assignments
  }, [projects, user]);

  const getTotalStats = () => {
    if (!workLogsData?.content) return { total: 0, hours: 0, projects: 0 };

    const total = workLogsData.totalElements;
    const hours = workLogsData.content.reduce((sum, wl) => sum + wl.hoursWorked, 0);
    const projectIds = new Set(workLogsData.content.map(wl => wl.projectId));

    return { total, hours, projects: projectIds.size };
  };

  const stats = getTotalStats();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Work Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi thời gian làm việc
          </p>
        </div>

        {canCreateWorkLog && (
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo Work Log
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Work Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số work log
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Giờ</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Tổng thời gian làm việc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự Án</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">
              Dự án đang tham gia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search component */}
      <WorkLogSearch
        onSearch={handleSearch}
        projects={availableProjects}
        users={canViewAllUsers ? users : []}
        initialParams={searchParams}
        isLoading={isLoadingWorkLogs}
        showUserFilter={canViewAllUsers}
      />

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Lịch
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <WorkLogList
            data={workLogsData}
            isLoading={isLoadingWorkLogs}
            error={workLogsError}
            searchParams={searchParams}
            onParamsChange={setSearchParams}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onRefresh={handleRefresh}
            showUserInfo={canViewAllUsers}
            showProjectInfo={true}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            deletingIds={deletingIds}
            canEdit={true}
            canDelete={canManageWorkLogs || (user && workLogsData?.content.some(wl => wl.userId === parseInt(user.id)))}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <WorkLogCalendar
            data={calendarData || []}
            isLoading={isLoadingCalendar}
            currentDate={calendarDate}
            onDateChange={handleCalendarDateChange}
            onWorkLogClick={handleWorkLogClick}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {statsData && (
            <WorkLogStats
              data={statsData}
              isLoading={isLoadingStats}
              showWeeklyBreakdown={true}
              showProjectBreakdown={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
