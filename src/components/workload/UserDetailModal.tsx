import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  FileText,
} from 'lucide-react';

// Services
import { userService } from '@/services/userService';
import { workloadService } from '@/services/workloadService';
import { projectService } from '@/services/projectService';

// Types
interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

interface UserDetails {
  id: number;
  fullName: string;
  email: string;
  employeeCode: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserWorkloadDetails {
  userId: number;
  userName: string;
  email: string;
  role: string;
  totalWorkload: number;
  availableCapacity: number;
  activeProjectCount: number;
  isOverloaded: boolean;
}

interface ProjectAssignment {
  projectId: number;
  projectName: string;
  workloadPercentage: number;
  role: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  // Fetch user basic information
  const {
    data: userDetails,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: isOpen && !!userId,
  });

  // Fetch user workload information
  const {
    data: workloadDetails,
    isLoading: workloadLoading,
    error: workloadError,
  } = useQuery({
    queryKey: ['userWorkload', userId],
    queryFn: () => userService.getUserWorkload(userId),
    enabled: isOpen && !!userId,
  });

  // Fetch user work logs for the last 30 days
  const {
    data: workLogs,
    isLoading: workLogsLoading,
    error: workLogsError,
  } = useQuery({
    queryKey: ['userWorkLogs', userId],
    queryFn: () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return workloadService.getUserWorkLogs(userId, startDate, endDate);
    },
    enabled: isOpen && !!userId,
  });

  // Mock project assignments (since we don't have a direct API for this)
  // In a real implementation, you would fetch this from the backend
  const mockProjectAssignments: ProjectAssignment[] = [
    {
      projectId: 1,
      projectName: "Hệ thống quản lý dự án",
      workloadPercentage: 40,
      role: "Developer",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      status: "ACTIVE"
    },
    {
      projectId: 2,
      projectName: "Ứng dụng di động",
      workloadPercentage: 30,
      role: "Lead Developer",
      startDate: "2024-02-01",
      endDate: "2024-08-30",
      status: "ACTIVE"
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'pm': 'bg-purple-100 text-purple-800',
      'dev': 'bg-blue-100 text-blue-800',
      'ba': 'bg-green-100 text-green-800',
      'test': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      'admin': 'Quản trị viên',
      'pm': 'Quản lý dự án',
      'dev': 'Lập trình viên',
      'ba': 'Phân tích nghiệp vụ',
      'test': 'Kiểm thử viên'
    };
    return labels[role.toLowerCase() as keyof typeof labels] || role;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'ON_HOLD': 'bg-yellow-100 text-yellow-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateWorkLogStats = (logs: any[]) => {
    if (!logs || logs.length === 0) {
      return {
        totalHours: 0,
        totalDays: 0,
        averageHoursPerDay: 0,
        mostActiveProject: 'N/A'
      };
    }

    const totalHours = logs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
    const uniqueDays = new Set(logs.map(log => log.workDate)).size;
    const averageHoursPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;

    // Find most active project
    const projectHours = logs.reduce((acc, log) => {
      const projectName = log.projectName || 'Unknown';
      acc[projectName] = (acc[projectName] || 0) + (log.hoursWorked || 0);
      return acc;
    }, {} as Record<string, number>);

    const mostActiveProject = Object.entries(projectHours).length > 0
      ? Object.entries(projectHours).sort(([,a], [,b]) => b - a)[0][0]
      : 'N/A';

    return {
      totalHours,
      totalDays: uniqueDays,
      averageHoursPerDay,
      mostActiveProject
    };
  };

  if (userError || workloadError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải thông tin người dùng. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi Tiết Thành Viên</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và khối lượng công việc của thành viên
          </DialogDescription>
        </DialogHeader>

        {userLoading || workloadLoading ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/avatars/${userId}.jpg`} alt={userDetails?.fullName} />
                    <AvatarFallback className="text-lg font-medium">
                      {userDetails ? getInitials(userDetails.fullName) : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold">{userDetails?.fullName}</h3>
                      <Badge className={getRoleColor(userDetails?.role || '')} variant="secondary">
                        {getRoleLabel(userDetails?.role || '')}
                      </Badge>
                      <Badge variant={userDetails?.isActive ? "default" : "secondary"}>
                        {userDetails?.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {userDetails?.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {userDetails?.employeeCode}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="workload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="workload">Khối Lượng Công Việc</TabsTrigger>
                <TabsTrigger value="projects">Dự Án</TabsTrigger>
                <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
                <TabsTrigger value="info">Thông Tin</TabsTrigger>
              </TabsList>

              {/* Workload Tab */}
              <TabsContent value="workload" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng Khối Lượng</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        (workloadDetails?.totalWorkload || 0) > 100 ? 'text-destructive' : 
                        (workloadDetails?.totalWorkload || 0) >= 80 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {workloadDetails?.totalWorkload || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(workloadDetails?.totalWorkload || 0) > 100 ? 'Quá tải' : 
                         (workloadDetails?.totalWorkload || 0) >= 80 ? 'Gần đạt giới hạn' : 'Bình thường'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Workload Còn Lại</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {workloadDetails?.availableCapacity || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Có thể phân công thêm</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Dự Án Đang Thực Hiện</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {workloadDetails?.activeProjectCount || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Dự án hoạt động</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Trạng Thái</CardTitle>
                      {workloadDetails?.isOverloaded ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className={`text-lg font-semibold ${
                        workloadDetails?.isOverloaded ? 'text-destructive' : 'text-green-600'
                      }`}>
                        {workloadDetails?.isOverloaded ? 'Quá Tải' : 'Bình Thường'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {workloadDetails?.isOverloaded ? 'Cần điều chỉnh' : 'Có thể nhận thêm việc'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Workload Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Khối Lượng Công Việc
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Workload</span>
                        <span className="font-medium">{workloadDetails?.totalWorkload || 0}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={Math.min(workloadDetails?.totalWorkload || 0, 100)} 
                          className="h-3"
                        />
                        {(workloadDetails?.totalWorkload || 0) > 100 && (
                          <div 
                            className="absolute top-0 left-0 h-3 bg-red-500 rounded-full"
                            style={{ width: `${Math.min(((workloadDetails?.totalWorkload || 0) / 120) * 100, 100)}%` }}
                          />
                        )}
                      </div>
                    </div>

                    {workloadDetails?.isOverloaded && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Thành viên này đang bị quá tải {(Number(workloadDetails?.totalWorkload || 0) - 100).toFixed(1)}%. 
                          Hãy cân nhắc điều chỉnh phân công công việc.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Phân Công Dự Án</CardTitle>
                    <CardDescription>
                      Danh sách các dự án đang được phân công
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockProjectAssignments.map((assignment) => (
                        <div key={assignment.projectId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{assignment.projectName}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(assignment.status)} variant="secondary">
                                {assignment.status}
                              </Badge>
                              <Badge variant="outline">
                                {assignment.workloadPercentage}%
                              </Badge>
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Vai trò: {assignment.role}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Bắt đầu: {formatDate(assignment.startDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Kết thúc: {assignment.endDate ? formatDate(assignment.endDate) : 'Chưa xác định'}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Khối lượng công việc</span>
                              <span className="font-medium">{assignment.workloadPercentage}%</span>
                            </div>
                            <Progress value={assignment.workloadPercentage} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Work Logs Tab */}
              <TabsContent value="worklogs" className="space-y-6">
                {workLogsLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Work Log Stats */}
                    {workLogs && (
                      <div className="grid gap-4 md:grid-cols-4">
                        {(() => {
                          const stats = calculateWorkLogStats(workLogs);
                          return (
                            <>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Tổng Giờ (30 ngày)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{stats.totalHours}h</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Số Ngày Làm Việc</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{stats.totalDays}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Trung Bình/Ngày</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{stats.averageHoursPerDay.toFixed(1)}h</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Dự Án Chính</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-sm font-medium truncate" title={stats.mostActiveProject}>
                                    {stats.mostActiveProject}
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Recent Work Logs */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Work Logs Gần Đây (30 ngày)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {workLogsError ? (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Không thể tải work logs. Vui lòng thử lại sau.
                            </AlertDescription>
                          </Alert>
                        ) : !workLogs || workLogs.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Không có work logs trong 30 ngày qua</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {workLogs.slice(0, 10).map((log: any, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">{log.projectName || 'Unknown Project'}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {log.hoursWorked}h
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-1">
                                  {formatDate(log.workDate)}
                                </div>
                                {log.workDescription && (
                                  <div className="text-sm">{log.workDescription}</div>
                                )}
                                {log.taskFeature && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {log.taskFeature}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* User Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Cá Nhân</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                        <div className="text-base">{userDetails?.fullName}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="text-base">{userDetails?.email}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Mã nhân viên</label>
                        <div className="text-base">{userDetails?.employeeCode}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Vai trò</label>
                        <div className="text-base">
                          <Badge className={getRoleColor(userDetails?.role || '')} variant="secondary">
                            {getRoleLabel(userDetails?.role || '')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                        <div className="text-base">
                          <Badge variant={userDetails?.isActive ? "default" : "secondary"}>
                            {userDetails?.isActive ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                        <div className="text-base">
                          {userDetails?.createdAt ? formatDate(userDetails.createdAt) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
