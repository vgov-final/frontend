import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Briefcase
} from 'lucide-react';
import { workloadService } from '@/services/workloadService';

const COLORS = {
  dev: '#3b82f6',
  ba: '#10b981',
  test: '#f59e0b',
  pm: '#ef4444',
  admin: '#8b5cf6',
  overloaded: '#dc2626',
  normal: '#22c55e',
  underutilized: '#6b7280',
  wellUtilized: '#10b981'
};

const ROLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function WorkloadChart() {
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

  if (analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load chart data. Please try again later.
          {analyticsError instanceof Error && ` Error: ${analyticsError.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (analyticsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!backendAnalytics) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No chart data available
      </div>
    );
  }

  // Prepare data for role distribution chart
  const roleData = Object.entries(backendAnalytics.workloadByRole).map(([role, stats]) => ({
    role: role.toUpperCase(),
    totalUsers: stats.totalUsers,
    averageWorkload: stats.averageWorkload,
    overloadedCount: stats.overloadedUsers,
    normalCount: stats.totalUsers - stats.overloadedUsers,
    utilizationRate: (stats.averageWorkload / 100) * 100
  }));

  // Prepare pie chart data for workload status
  const workloadStatusData = [
    {
      name: 'Underutilized (<60%)',
      value: backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload < 60).length,
      color: COLORS.underutilized
    },
    {
      name: 'Well Utilized (60-100%)',
      value: backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload >= 60 && u.totalWorkload <= 100).length,
      color: COLORS.wellUtilized
    },
    {
      name: 'Overloaded (>100%)',
      value: backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload > 100).length,
      color: COLORS.overloaded
    }
  ].filter(item => item.value > 0);

  // Prepare workload distribution ranges
  const workloadRanges = [
    { range: '0-20%', count: 0, color: '#6b7280' },
    { range: '21-40%', count: 0, color: '#8b5cf6' },
    { range: '41-60%', count: 0, color: '#3b82f6' },
    { range: '61-80%', count: 0, color: '#10b981' },
    { range: '81-100%', count: 0, color: '#f59e0b' },
    { range: '100%+', count: 0, color: '#ef4444' }
  ];

  // Count users in each workload range
  backendAnalytics.topWorkloadUsers.forEach(user => {
    const workload = user.totalWorkload;
    if (workload <= 20) workloadRanges[0].count++;
    else if (workload <= 40) workloadRanges[1].count++;
    else if (workload <= 60) workloadRanges[2].count++;
    else if (workload <= 80) workloadRanges[3].count++;
    else if (workload <= 100) workloadRanges[4].count++;
    else workloadRanges[5].count++;
  });

  // Prepare top users data for chart
  const topUsersData = backendAnalytics.topWorkloadUsers
    .sort((a, b) => b.totalWorkload - a.totalWorkload)
    .slice(0, 10)
    .map(user => ({
      name: user.fullName.length > 15 ? `${user.fullName.substring(0, 15)}...` : user.fullName,
      fullName: user.fullName,
      workload: user.totalWorkload,
      projects: user.activeProjectCount,
      role: user.role.toUpperCase(),
      isOverloaded: user.isOverloaded
    }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('Workload') || entry.dataKey.includes('workload') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workload Charts & Visualizations</h2>
        <p className="text-muted-foreground">
          Visual analysis of team workload distribution and trends
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">By Roles</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Overview Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {backendAnalytics.systemUtilization.totalCapacity}%
                      </div>
                      <div className="text-sm text-blue-600">Total Capacity</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {backendAnalytics.systemUtilization.usedCapacity}%
                      </div>
                      <div className="text-sm text-green-600">Used Capacity</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {backendAnalytics.systemUtilization.utilizationPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-yellow-600">Utilization Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Team Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={workloadStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {workloadStatusData.map((entry, index) => (
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

          {/* Key Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {backendAnalytics.topWorkloadUsers.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Users</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {(backendAnalytics.topWorkloadUsers.reduce((sum, u) => sum + u.totalWorkload, 0) / backendAnalytics.topWorkloadUsers.length).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-600">Avg Workload</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    {backendAnalytics.topWorkloadUsers.filter(u => u.isOverloaded).length}
                  </div>
                  <div className="text-sm text-red-600">Overloaded</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Briefcase className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.keys(backendAnalytics.workloadByRole).length}
                  </div>
                  <div className="text-sm text-yellow-600">Active Roles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Role Workload Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Workload by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="averageWorkload" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Role User Count Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Size by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="totalUsers" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Role Details Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleData.map((role, index) => (
                  <div key={role.role} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: ROLE_COLORS[index % ROLE_COLORS.length] }}
                      />
                      <div>
                        <span className="font-medium text-lg">{role.role}</span>
                        {role.overloadedCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {role.overloadedCount} overloaded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-bold text-lg text-foreground">{role.totalUsers}</div>
                        <div>users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-foreground">{role.averageWorkload.toFixed(1)}%</div>
                        <div>avg workload</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-foreground">{role.utilizationRate.toFixed(1)}%</div>
                        <div>utilization</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* Top Users Workload Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Users by Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{data.fullName}</p>
                            <p>Role: {data.role}</p>
                            <p>Workload: {data.workload}%</p>
                            <p>Projects: {data.projects}</p>
                            {data.isOverloaded && (
                              <p className="text-destructive font-medium">⚠️ Overloaded</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="workload"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {/* Workload Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workload Range Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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

          {/* Distribution Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {workloadRanges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: range.color }}
                      />
                      <span className="text-sm font-medium">{range.range}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{range.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {((range.count / backendAnalytics.topWorkloadUsers.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}