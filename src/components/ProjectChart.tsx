
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService, analyticsService } from '@/services';
import { DashboardProjectStats, ProjectStatsResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { MonthlyProjectStatusDto, ProjectTimelineAnalyticsResponse } from '@/services/analyticsService';

const ProjectChart = () => {
  const [projectStats, setProjectStats] = useState<DashboardProjectStats | null>(null);
  const [projectStatsResponse, setProjectStatsResponse] = useState<ProjectStatsResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ProjectTimelineAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date range state - separate month and year
  const [startMonth, setStartMonth] = useState<number>(0);
  const [startYear, setStartYear] = useState<number>(0);
  const [endMonth, setEndMonth] = useState<number>(0);
  const [endYear, setEndYear] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  // Initialize default date range (past 12 months)
  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    setStartMonth(startDate.getMonth() + 1);
    setStartYear(startDate.getFullYear());
    setEndMonth(endDate.getMonth() + 1);
    setEndYear(endDate.getFullYear());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [projectData, statsResponse] = await Promise.all([
          dashboardService.getProjectStats(),
          dashboardService.getProjectStatsResponse()
        ]);
        setProjectStats(projectData);
        setProjectStatsResponse(statsResponse);
      } catch (err) {
        console.error('Error fetching project chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch analytics data based on date range
  useEffect(() => {
    if (!startMonth || !startYear || !endMonth || !endYear) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const analytics = await analyticsService.getProjectTimelineAnalytics(
          startYear,
          startMonth,
          endYear,
          endMonth
        );
        setAnalyticsData(analytics);
        
        // Transform backend data to chart format
        const chartData = analytics.monthlyProjectStatus.map((monthData: MonthlyProjectStatusDto) => ({
          month: `T${monthData.month.split('-')[1]}/${monthData.month.split('-')[0].slice(-2)}`,
          completed: monthData.completed,
          inProgress: monthData.inProgress,
          planned: monthData.planned,
          onHold: 0 // Backend doesn't provide hold count in monthly status, set to 0
        }));
        
        console.log('Analytics chart data:', chartData); // Debug log
        setChartData(chartData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [startMonth, startYear, endMonth, endYear]);

  // Generate options for selectors
  const monthOptions = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Include years from 2023 to 2025 to match the seed data range
    for (let i = 2025; i >= 2023; i--) {
      years.push({ value: i, label: `Năm ${i}` });
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !projectStats || !projectStatsResponse) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-red-600">
              {error || 'Failed to load chart data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: 'Hoàn thành', value: projectStats.completedProjects, color: '#10B981' },
    { name: 'Đang thực hiện', value: projectStats.activeProjects, color: '#3B82F6' },
    { name: 'Kế hoạch', value: projectStats.plannedProjects, color: '#F59E0B' },
    { name: 'Tạm dừng', value: projectStats.onHoldProjects, color: '#F97316' },
    { name: 'Hủy bỏ', value: projectStats.cancelledProjects, color: '#EF4444' },
  ].filter(item => item.value > 0); // Only show categories with data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Tiến độ dự án theo tháng
          </CardTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Từ tháng</label>
              <Select value={startMonth.toString()} onValueChange={(value) => setStartMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Năm</label>
              <Select value={startYear.toString()} onValueChange={(value) => setStartYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Đến tháng</label>
              <Select value={endMonth.toString()} onValueChange={(value) => setEndMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Năm</label>
              <Select value={endYear.toString()} onValueChange={(value) => setEndYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => `Tháng: ${value}`}
                formatter={(value, name) => {
                  let displayName = '';
                  const nameStr = String(name);
                  switch(nameStr) {
                    case 'completed':
                      displayName = 'Hoàn thành';
                      break;
                    case 'inProgress':
                      displayName = 'Đang thực hiện';
                      break;
                    case 'planned':
                      displayName = 'Kế hoạch';
                      break;
                    case 'onHold':
                      displayName = 'Tạm dừng';
                      break;
                    default:
                      displayName = nameStr;
                  }
                  return [value, displayName];
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name="Hoàn thành" />
              <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="Đang thực hiện" />
              <Bar dataKey="planned" stackId="a" fill="#F59E0B" name="Kế hoạch" />
              <Bar dataKey="onHold" stackId="a" fill="#F97316" name="Tạm dừng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trạng thái dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectChart;
