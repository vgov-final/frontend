
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardProjectStats } from '@/types/api';
import { toast } from 'sonner';

interface DashboardData {
  projectStats: DashboardProjectStats;
  workLogStats: any;
  recentProjects: any[];
  recentWorkLogs: any[];
  unreadNotificationCount: number;
}

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getEmployeeDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard');
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error || 'Không thể tải dữ liệu dashboard'}</p>
        </div>
      </div>
    );
  }

  const { projectStats, workLogStats, recentProjects, recentWorkLogs } = dashboardData;

  // Calculate upcoming deadlines from recent projects
  const upcomingDeadlines = recentProjects.filter(project => {
    if (!project.endDate) return false;
    const endDate = new Date(project.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  // Map project status to Vietnamese
  const getStatusInVietnamese = (status: string) => {
    const statusMap: Record<string, string> = {
      'InProgress': 'Đang thực hiện',
      'Closed': 'Hoàn thành',
      'Hold': 'Tạm dừng',
      'Planning': 'Lập kế hoạch',
      'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Map project type to Vietnamese
  const getTypeInVietnamese = (type: string) => {
    const typeMap: Record<string, string> = {
      'Web': 'Web',
      'Mobile': 'Mobile',
      'Desktop': 'Desktop',
      'API': 'API'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dự án của tôi</h1>
        <div className="text-sm text-muted-foreground">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự án đang làm</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">dự án active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giờ làm tháng này</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workLogStats.totalHoursThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">giờ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline gần</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">trong 7 ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Dự án hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <div key={project.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{project.projectName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Bắt đầu: {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      <span>Kết thúc: {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      <span>Loại: {getTypeInVietnamese(project.projectType)}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>PM: {project.pmEmail}</span>
                    </div>
                  </div>
                  <Badge variant={project.status === 'Closed' ? 'default' : 'secondary'}>
                    {getStatusInVietnamese(project.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Không có dự án nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Work Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Work Log gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkLogs.length > 0 ? (
              recentWorkLogs.map((workLog, index) => (
                <div key={workLog.id || index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{workLog.taskFeature || 'Công việc'}</p>
                    <p className="text-sm text-muted-foreground">
                      Dự án: {workLog.projectName} | Ngày: {workLog.workDate ? new Date(workLog.workDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {workLog.workDescription}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {workLog.hoursWorked}h
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Không có work log nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
