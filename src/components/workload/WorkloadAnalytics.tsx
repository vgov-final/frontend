import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { workloadService } from '@/services/workloadService';
import { WorkloadAnalytics as WorkloadAnalyticsType, WorkloadDistributionItem } from '@/types/workload';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function WorkloadAnalytics() {
  // Fetch workload analytics from backend
  const { 
    data: backendAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useQuery({
    queryKey: ['workloadAnalytics'],
    queryFn: () => workloadService.getWorkloadAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000
  });

  // Transform backend data to frontend format
  const analytics: WorkloadAnalyticsType | undefined = React.useMemo(() => {
    if (!backendAnalytics) return undefined;

    const totalUsers = backendAnalytics.topWorkloadUsers.length;
    const overloadedUsers = backendAnalytics.topWorkloadUsers.filter(u => u.isOverloaded).length;
    const averageWorkload = backendAnalytics.topWorkloadUsers.reduce((sum, u) => sum + u.totalWorkload, 0) / totalUsers;
    
    const underutilizedUsers = backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload < 60).length;
    const fullyUtilizedUsers = backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload >= 60 && u.totalWorkload <= 100).length;

    const workloadDistribution: WorkloadDistributionItem[] = backendAnalytics.topWorkloadUsers.map(user => ({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      totalWorkload: user.totalWorkload,
      projectCount: user.activeProjectCount,
      isOverloaded: user.isOverloaded,
      availableCapacity: 100 - user.totalWorkload
    }));

    const workloadByRole: Record<string, { totalUsers: number; averageWorkload: number; overloadedCount: number; }> = {};
    Object.entries(backendAnalytics.workloadByRole).forEach(([role, stats]) => {
      workloadByRole[role] = {
        totalUsers: stats.totalUsers,
        averageWorkload: stats.averageWorkload,
        overloadedCount: stats.overloadedUsers
      };
    });

    return {
      totalUsers,
      overloadedUsers,
      underutilizedUsers,
      fullyUtilizedUsers,
      averageWorkload,
      capacityUtilization: backendAnalytics.systemUtilization.utilizationPercentage,
      workloadDistribution,
      workloadByRole,
      systemUtilization: backendAnalytics.systemUtilization
    };
  }, [backendAnalytics]);

  if (analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again later.
          {analyticsError instanceof Error && ` Error: ${analyticsError.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  // Prepare data for capacity utilization chart
  const capacityData = [
    {
      name: 'Underutilized',
      value: analytics.underutilizedUsers,
      percentage: ((analytics.underutilizedUsers / analytics.totalUsers) * 100).toFixed(1),
      color: '#6b7280'
    },
    {
      name: 'Well Utilized',
      value: analytics.fullyUtilizedUsers,
      percentage: ((analytics.fullyUtilizedUsers / analytics.totalUsers) * 100).toFixed(1),
      color: '#10b981'
    },
    {
      name: 'Overloaded',
      value: analytics.overloadedUsers,
      percentage: ((analytics.overloadedUsers / analytics.totalUsers) * 100).toFixed(1),
      color: '#ef4444'
    }
  ];

  // Prepare workload distribution data for bar chart
  const workloadRanges = [
    { range: '0-20%', count: 0, color: '#6b7280' },
    { range: '21-40%', count: 0, color: '#8b5cf6' },
    { range: '41-60%', count: 0, color: '#3b82f6' },
    { range: '61-80%', count: 0, color: '#10b981' },
    { range: '81-100%', count: 0, color: '#f59e0b' },
    { range: '100%+', count: 0, color: '#ef4444' }
  ];

  // Count users in each workload range
  analytics.workloadDistribution.forEach(user => {
    const workload = user.totalWorkload;
    if (workload <= 20) workloadRanges[0].count++;
    else if (workload <= 40) workloadRanges[1].count++;
    else if (workload <= 60) workloadRanges[2].count++;
    else if (workload <= 80) workloadRanges[3].count++;
    else if (workload <= 100) workloadRanges[4].count++;
    else workloadRanges[5].count++;
  });

  // Get top overloaded users
  const overloadedUsers = analytics.workloadDistribution
    .filter(user => user.isOverloaded)
    .sort((a, b) => b.totalWorkload - a.totalWorkload)
    .slice(0, 5);

  // Calculate key metrics
  const utilizationRate = analytics.capacityUtilization;
  const overloadRate = ((analytics.overloadedUsers / analytics.totalUsers) * 100).toFixed(1);

  // Prepare role workload data for chart
  const roleWorkloadData = Object.entries(analytics.workloadByRole).map(([role, stats]) => ({
    role: role.toUpperCase(),
    averageWorkload: stats.averageWorkload,
    totalUsers: stats.totalUsers,
    overloadedCount: stats.overloadedCount
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Detailed Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive workload analysis and insights
        </p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Team Size</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg Workload</p>
                <p className="text-2xl font-bold">{analytics.averageWorkload.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Overload Rate</p>
                <p className="text-2xl font-bold">{overloadRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">System Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Utilization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Capacity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.systemUtilization.totalCapacity}%
              </div>
              <div className="text-sm text-blue-600">Total Capacity</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.systemUtilization.usedCapacity}%
              </div>
              <div className="text-sm text-green-600">Used Capacity</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.systemUtilization.utilizationPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-yellow-600">Utilization Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {analytics.systemUtilization.availableCapacity}%
              </div>
              <div className="text-sm text-gray-600">Available Capacity</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Utilization</span>
              <span className="text-sm font-bold">{analytics.capacityUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationRate} className="h-3" />
            
            <div className="grid gap-3 md:grid-cols-3">
              {capacityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Workload Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Workload by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleWorkloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}${name === 'averageWorkload' ? '%' : ''}`,
                  name === 'averageWorkload' ? 'Avg Workload' : 
                  name === 'totalUsers' ? 'Total Users' : 'Overloaded'
                ]}
              />
              <Bar dataKey="averageWorkload" fill="#3b82f6" name="averageWorkload" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Workload Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workloadRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Overloaded Users */}
      {overloadedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Most Overloaded Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overloadedUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">
                      {user.totalWorkload}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.projectCount} projects
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.overloadedUsers > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Critical: Address Overloaded Users</p>
                  <p className="text-sm text-red-700">
                    {analytics.overloadedUsers} team members are working above 100% capacity. 
                    Immediate action required: redistribute workload, extend deadlines, or hire additional resources.
                  </p>
                </div>
              </div>
            )}

            {analytics.underutilizedUsers > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Opportunity: Optimize Capacity</p>
                  <p className="text-sm text-blue-700">
                    {analytics.underutilizedUsers} team members have available capacity ({((analytics.underutilizedUsers / analytics.totalUsers) * 100).toFixed(1)}% of team). 
                    Consider assigning additional tasks, cross-training, or strategic projects.
                  </p>
                </div>
              </div>
            )}

            {analytics.averageWorkload < 70 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellent: Well-Balanced Workload</p>
                  <p className="text-sm text-green-700">
                    Team workload is optimally balanced with {(100 - analytics.averageWorkload).toFixed(1)}% average capacity remaining. 
                    Perfect position for taking on new projects or handling urgent requests.
                  </p>
                </div>
              </div>
            )}

            {analytics.systemUtilization.utilizationPercentage > 90 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Warning: High System Utilization</p>
                  <p className="text-sm text-yellow-700">
                    System utilization is at {analytics.systemUtilization.utilizationPercentage.toFixed(1)}%. 
                    Consider planning for additional resources or workload reduction to maintain quality.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}