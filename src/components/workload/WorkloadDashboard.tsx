import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { workloadService } from '@/services/workloadService';
import { WorkloadAnalytics, WorkloadDistributionItem } from '@/types/workload';
import { UserDetailModal } from './UserDetailModal';

export function WorkloadDashboard() {
  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch workload analytics from backend
  const { 
    data: backendAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useQuery({
    queryKey: ['workloadAnalytics'],
    queryFn: () => workloadService.getWorkloadAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000 // Refresh every 30 seconds
  });

  // Handle user detail view
  const handleViewUserDetails = (userId: number) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  // Transform backend data to frontend format
  const analytics: WorkloadAnalytics | undefined = React.useMemo(() => {
    if (!backendAnalytics) return undefined;

    const totalUsers = backendAnalytics.topWorkloadUsers?.length || 0;
    const overloadedUsers = backendAnalytics.topWorkloadUsers?.filter(u => u.totalWorkload > 100).length || 0;
    const averageWorkload = totalUsers > 0 
      ? backendAnalytics.topWorkloadUsers.reduce((sum, u) => sum + u.totalWorkload, 0) / totalUsers 
      : 0;
    
    // Calculate utilization categories
    const underutilizedUsers = backendAnalytics.topWorkloadUsers?.filter(u => u.totalWorkload < 60).length || 0;
    const fullyUtilizedUsers = backendAnalytics.topWorkloadUsers?.filter(u => u.totalWorkload >= 60 && u.totalWorkload <= 100).length || 0;

    const workloadDistribution: WorkloadDistributionItem[] = backendAnalytics.topWorkloadUsers?.map(user => ({
      userId: user.userId,
      fullName: user.userName, // Use the correct field name from backend
      email: user.email,
      role: 'unknown', // Default role since not provided by backend
      totalWorkload: user.totalWorkload,
      projectCount: user.projectCount, // Use the correct field name from backend
      isOverloaded: user.totalWorkload > 100, // Calculate based on workload
      availableCapacity: 100 - user.totalWorkload
    })) || [];

    // Transform workloadByRole to match frontend type
    const workloadByRole: Record<string, { totalUsers: number; averageWorkload: number; overloadedCount: number; }> = {};
    if (backendAnalytics.workloadByRole) {
      // Calculate role-based statistics from employee data
      Object.entries(backendAnalytics.workloadByRole).forEach(([role, totalWorkload]) => {
        // Count users in this role from employeesByRole
        const usersInRole = backendAnalytics.employeesByRole?.[role] || 0;
        // Calculate average workload per user in this role
        const averageWorkload = usersInRole > 0 ? totalWorkload / usersInRole : 0;
        // Count overloaded users in this role
        const overloadedCount = backendAnalytics.topWorkloadUsers?.filter(u => 
          u.totalWorkload > 100 && 
          // We can't directly match role since topWorkloadUsers doesn't have role info
          // This is a limitation we'll have to work with
          true 
        ).length || 0;
        
        workloadByRole[role] = {
          totalUsers: usersInRole,
          averageWorkload: averageWorkload,
          overloadedCount: Math.floor(overloadedCount / Object.keys(backendAnalytics.workloadByRole).length) // Distribute evenly as approximation
        };
      });
    }

    // Handle systemUtilization
    const capacityUtilization = backendAnalytics.systemWorkloadUtilization;
    const systemUtilization = {
      totalCapacity: 100,
      usedCapacity: capacityUtilization,
      utilizationPercentage: capacityUtilization,
      availableCapacity: 100 - capacityUtilization
    };

    return {
      totalUsers,
      overloadedUsers,
      underutilizedUsers,
      fullyUtilizedUsers,
      averageWorkload,
      capacityUtilization,
      workloadDistribution,
      workloadByRole,
      systemUtilization
    };
  }, [backendAnalytics]);

  if (analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải dữ liệu khối lượng công việc. Vui lòng thử lại sau.
          {analyticsError instanceof Error && ` Lỗi: ${analyticsError.message}`}
        </AlertDescription>
      </Alert>
    );
  }

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
      'dev': 'bg-blue-100 text-blue-800',
      'ba': 'bg-green-100 text-green-800',
      'test': 'bg-yellow-100 text-yellow-800',
      'pm': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colors[role.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Thành Viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Thành viên đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người Dùng Quá Tải</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {analytics?.overloadedUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Trên 100% năng lực</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Trung Bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.averageWorkload?.toFixed(1) || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Trung bình của nhóm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Toàn Hệ Thống</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.capacityUtilization?.toFixed(1) || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Tỷ lệ sử dụng tổng thể</p>
          </CardContent>
        </Card>
      </div>

      {/* System Utilization Details */}
      {analytics?.systemUtilization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tổng Quan Chỉ Số
            </CardTitle>
            <CardDescription>
              Chỉ số workload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.systemUtilization.totalCapacity}%
                </div>
                <div className="text-sm text-blue-600">Total Workload</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.systemUtilization.usedCapacity}%
                </div>
                <div className="text-sm text-green-600">Workload Hiện Tại</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.systemUtilization.utilizationPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-yellow-600">Hiện Tại</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {analytics.systemUtilization.availableCapacity}%
                </div>
                <div className="text-sm text-gray-600">Sẵn Sàng</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>% Workload</span>
                <span className="font-medium">{analytics.systemUtilization.utilizationPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.systemUtilization.utilizationPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workload by Role */}
      {analytics?.workloadByRole && Object.keys(analytics.workloadByRole).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Phân Bổ Khối Lượng Công Việc Theo Vai Trò
            </CardTitle>
            <CardDescription>
              Khối lượng công việc của nhóm theo các vai trò khác nhau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(analytics.workloadByRole).map(([role, stats]) => (
                <div key={role} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getRoleColor(role)} variant="secondary">
                      {role.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{stats.totalUsers} người</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khối lượng TB</span>
                      <span className="font-medium">{stats.averageWorkload.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.averageWorkload} className="h-2" />
                    {stats.overloadedCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{stats.overloadedCount} quá tải</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overloaded Users Alert */}
      {analytics && analytics.overloadedUsers > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{analytics.overloadedUsers} thành viên</strong> hiện đang bị quá tải (trên 100% năng lực).
            Hãy cân nhắc phân bổ lại khối lượng công việc hoặc điều chỉnh phân công dự án.
          </AlertDescription>
        </Alert>
      )}

      {/* Team Workload Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Khối Lượng Công Việc Thành Viên</h2>
        </div>

        {analyticsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics?.workloadDistribution?.map((user) => (
              <Card key={user.userId} className={`transition-all duration-200 hover:shadow-md ${
                user.isOverloaded ? 'border-destructive/50 bg-destructive/5' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/avatars/${user.userId}.jpg`} alt={user.fullName} />
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-medium leading-none">
                        {user.fullName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Workload Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tổng Khối Lượng</span>
                      <span className={`font-medium ${
                        user.totalWorkload > 100 ? 'text-destructive' :
                        user.totalWorkload >= 80 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {user.totalWorkload}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(user.totalWorkload, 100)} 
                        className="h-2"
                      />
                      {user.totalWorkload > 100 && (
                        <div 
                          className="absolute top-0 left-0 h-2 bg-red-500 rounded-full"
                          style={{ width: `${Math.min((user.totalWorkload / 120) * 100, 100)}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Project Count */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Dự Án Đang Thực Hiện</span>
                    </div>
                    <span className="font-medium">{user.projectCount}</span>
                  </div>

                  {/* Capacity Status */}
                  <div className={`p-3 rounded-lg text-sm ${
                    user.isOverloaded 
                      ? "bg-destructive/10 text-destructive" 
                      : user.totalWorkload >= 80 
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-green-50 text-green-700"
                  }`}>
                    {user.isOverloaded ? (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Quá tải {user.totalWorkload - 100}%</span>
                      </div>
                    ) : user.totalWorkload >= 80 ? (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Gần đạt giới hạn ({user.availableCapacity}% còn trống)</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Workload sẵn sàng: {user.availableCapacity}%</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewUserDetails(user.userId)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem Chi Tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Capacity Optimization Section */}
      {analytics && (analytics.underutilizedUsers > 0 || analytics.fullyUtilizedUsers > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Đánh Giá
            </CardTitle>
            <CardDescription>
              Đánh giá nhanh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.underutilizedUsers}
                </div>
                <div className="text-sm text-blue-600">Chưa Tận Dụng Hết</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Dưới 60% workload
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.fullyUtilizedUsers}
                </div>
                <div className="text-sm text-green-600">Sử Dụng Tốt</div>
                <div className="text-xs text-muted-foreground mt-1">
                  60-100% workload
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.overloadedUsers}
                </div>
                <div className="text-sm text-red-600">Quá Tải</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Trên 100% workload
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}
