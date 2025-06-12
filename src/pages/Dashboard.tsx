import React, { useState, useEffect } from 'react';
import DashboardStats from '../components/DashboardStats';
import ProjectChart from '../components/ProjectChart';
import { projectService, userService, workloadService } from '@/services';
import { Project, ProjectStatus, User } from '@/types/api';
import { BackendWorkloadAnalytics } from '@/services/workloadService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<User[]>([]);
  const [workloadAnalytics, setWorkloadAnalytics] = useState<BackendWorkloadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent projects, active users, and workload analytics
        const [projectsResponse, usersResponse, analytics] = await Promise.all([
          projectService.getProjects({ page: 0, size: 4, sortBy: 'createdDate', sortDir: 'desc' }),
          userService.getUsers({ page: 0, size: 6, search: '' }),
          workloadService.getWorkloadAnalytics().catch(err => {
            console.warn('Workload analytics not available:', err);
            return null;
          })
        ]);

        setRecentProjects(projectsResponse.content);
        setActiveEmployees(usersResponse.content);
        setWorkloadAnalytics(analytics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.InProgress: return 'Đang thực hiện';
      case ProjectStatus.Closed: return 'Hoàn thành';
      case ProjectStatus.Open: return 'Mở';
      case ProjectStatus.Hold: return 'Tạm dừng';
      case ProjectStatus.Presale: return 'Presale';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Closed: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ProjectStatus.InProgress: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ProjectStatus.Open: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ProjectStatus.Hold: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case ProjectStatus.Presale: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateOverdueDays = (project: Project) => {
    if (!project.endDate || project.status === ProjectStatus.Closed) {
      return null;
    }
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    
    if (endDate < today) {
      const diffTime = today.getTime() - endDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="text-sm text-muted-foreground">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      <DashboardStats />

      <ProjectChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow border">
          <div className="p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">Dự án gần đây</h3>
            <div className="flow-root">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : (
                <ul className="-my-5 divide-y divide-border">
                  {recentProjects.map((project, index) => {
                    const overdueDays = calculateOverdueDays(project);
                    return (
                      <li key={project.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground truncate">{project.projectName}</p>
                            <p className="text-sm text-muted-foreground">{project.pmEmail}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <span>Bắt đầu: {formatDate(project.startDate)}</span>
                                {project.endDate && (
                                  <span>• Kết thúc: {formatDate(project.endDate)}</span>
                                )}
                              </div>
                              {overdueDays && (
                                <div className="mt-1 text-red-600 font-medium">
                                  Trễ {overdueDays} ngày
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enhanced Personnel Activity Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Nhân sự hoạt động</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">Không thể tải thông tin nhân sự</div>
              ) : (
                <div className="space-y-4">
                  {/* System Overview */}
                  {workloadAnalytics && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{workloadAnalytics.totalEmployees}</div>
                        <div className="text-xs text-muted-foreground">Tổng nhân sự</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {workloadAnalytics.systemWorkloadUtilization?.toFixed(1) || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Tải công việc</div>
                      </div>
                    </div>
                  )}

                  {/* Top Workload Users */}
                  {workloadAnalytics?.topWorkloadUsers && workloadAnalytics.topWorkloadUsers.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Nhân sự bận nhất</h4>
                      {workloadAnalytics.topWorkloadUsers.slice(0, 4).map((user) => {
                        const workloadPercentage = user.totalWorkload || 0;
                        const isOverloaded = workloadPercentage > 100;
                        const isHighWorkload = workloadPercentage >= 80;
                        
                        return (
                          <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-card-foreground truncate">
                                  {user.userName}
                                </p>
                                {isOverloaded && (
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                )}
                                {!isOverloaded && isHighWorkload && (
                                  <TrendingUp className="h-3 w-3 text-yellow-500" />
                                )}
                                {!isHighWorkload && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {user.projectCount} dự án
                                </p>
                                <Badge
                                  variant={isOverloaded ? "destructive" : isHighWorkload ? "secondary" : "default"}
                                  className="text-xs"
                                >
                                  {workloadPercentage.toFixed(0)}%
                                </Badge>
                              </div>
                              <Progress 
                                value={Math.min(workloadPercentage, 100)} 
                                className="h-1.5 mt-1"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Fallback to basic employee list if analytics not available
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Nhân sự gần đây</h4>
                      {activeEmployees.slice(0, 4).map((employee, index) => (
                        <div key={employee.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {employee.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground">
                              {employee.fullName}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {employee.role || 'N/A'}
                              </p>
                              <div className={`w-2 h-2 rounded-full ${
                                index % 3 === 0 ? 'bg-green-400' :
                                index % 3 === 1 ? 'bg-yellow-400' : 'bg-blue-400'
                              }`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Role Distribution */}
                  {workloadAnalytics?.employeesByRole && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Phân bổ theo vai trò</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(workloadAnalytics.employeesByRole).map(([role, count]) => (
                          <div key={role} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-xs capitalize">{role}</span>
                            <Badge variant="outline" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
