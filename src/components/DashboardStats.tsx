
import React, { useState, useEffect } from 'react';
import { Users, Folder, Check, BarChart } from 'lucide-react';
import { dashboardService } from '@/services';
import { DashboardProjectStats, DashboardUserStats } from '@/types/api';

const DashboardStats = () => {
  const [projectStats, setProjectStats] = useState<DashboardProjectStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<DashboardUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [projectData, employeeData] = await Promise.all([
          dashboardService.getProjectStats(),
          dashboardService.getEmployeeStats()
        ]);
        setProjectStats(projectData);
        setEmployeeStats(employeeData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative bg-card pt-5 px-4 pb-5 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border animate-pulse"
          >
            <div className="absolute rounded-md p-3 bg-gray-300 w-12 h-12"></div>
            <div className="ml-16 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !projectStats || !employeeStats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-8 text-red-600">
          {error || 'Failed to load statistics'}
        </div>
      </div>
    );
  }

  const statsData = [
    {
      name: 'Tổng dự án',
      value: projectStats.totalProjects.toString(),
      icon: Folder,
      color: 'bg-blue-500',
    },
    {
      name: 'Nhân sự',
      value: employeeStats.totalUsers.toString(),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Dự án hoàn thành',
      value: projectStats.completedProjects.toString(),
      icon: Check,
      color: 'bg-purple-500',
    },
    {
      name: 'Hiệu suất',
      value: `${Math.round(projectStats.projectCompletionRate)}%`,
      icon: BarChart,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="relative bg-card pt-5 px-4 pb-5 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border transform hover:scale-105 transition-transform duration-200"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-muted-foreground truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-card-foreground">{stat.value}</p>
            </dd>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
