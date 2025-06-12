import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Clock,
    Calendar,
    TrendingUp,
    Target,
    FolderOpen,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { WorkLogStats } from '@/types/workLog';

interface WorkLogStatsProps {
    data: WorkLogStats;
    isLoading?: boolean;
    dateRange?: {
        from: Date;
        to: Date;
    };
    showWeeklyBreakdown?: boolean;
    showProjectBreakdown?: boolean;
    className?: string;
}

export const WorkLogStats: React.FC<WorkLogStatsProps> = ({
    data,
    isLoading = false,
    dateRange,
    showWeeklyBreakdown = true,
    showProjectBreakdown = true,
    className,
}) => {
    const formatHours = (hours: number) => {
        return hours.toFixed(1);
    };

    const getProductivityLevel = (averageHours: number) => {
        if (averageHours >= 8) return { level: 'Cao', color: 'bg-green-500', percentage: 100 };
        if (averageHours >= 6) return { level: 'Trung bình', color: 'bg-blue-500', percentage: 75 };
        if (averageHours >= 4) return { level: 'Thấp', color: 'bg-yellow-500', percentage: 50 };
        return { level: 'Rất thấp', color: 'bg-red-500', percentage: 25 };
    };

    const productivity = getProductivityLevel(data.averageHoursPerDay);

    const getTotalWorkDays = () => {
        return data.dailyHours.filter(day => day.hours > 0).length;
    };

    const getMaxHoursInDay = () => {
        return Math.max(...data.dailyHours.map(day => day.hours), 0);
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Hours */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng giờ làm việc</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatHours(data.totalHours)}h</div>
                        <p className="text-xs text-muted-foreground">
                            Từ {data.totalWorkLogs} work log
                        </p>
                    </CardContent>
                </Card>

                {/* Average Hours per Day */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trung bình/ngày</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatHours(data.averageHoursPerDay)}h</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={productivity.color}>
                                {productivity.level}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Days */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ngày làm việc</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTotalWorkDays()}</div>
                        <p className="text-xs text-muted-foreground">
                            Max: {formatHours(getMaxHoursInDay())}h/ngày
                        </p>
                    </CardContent>
                </Card>

                {/* Projects Worked On */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dự án tham gia</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.projectsWorkedOn}</div>
                        <p className="text-xs text-muted-foreground">
                            Dự án khác nhau
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Productivity Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Mức độ năng suất
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Hiệu suất làm việc: {productivity.level}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {formatHours(data.averageHoursPerDay)}/8h mỗi ngày
                            </span>
                        </div>
                        <Progress
                            value={(data.averageHoursPerDay / 8) * 100}
                            className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                            Dựa trên trung bình {formatHours(data.averageHoursPerDay)} giờ/ngày
                            so với mục tiêu 8 giờ/ngày
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Projects */}
            {showProjectBreakdown && data.topProjects.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Dự án chính
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topProjects.slice(0, 5).map((project, index) => {
                                const percentage = (project.totalHours / data.totalHours) * 100;
                                return (
                                    <div key={project.projectId} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`} />
                                                <span className="font-medium text-sm">{project.projectName}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-sm">{formatHours(project.totalHours)}h</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {project.workLogCount} work logs
                                                </div>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                        <div className="text-xs text-muted-foreground">
                                            {percentage.toFixed(1)}% tổng thời gian
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Weekly Breakdown */}
            {showWeeklyBreakdown && data.weeklyStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Thống kê theo tuần
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.weeklyStats.slice(-4).map((week, index) => {
                                const maxHours = Math.max(...data.weeklyStats.map(w => w.totalHours));
                                const percentage = maxHours > 0 ? (week.totalHours / maxHours) * 100 : 0;

                                return (
                                    <div key={week.week} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">
                                                Tuần {week.week}
                                            </span>
                                            <div className="text-right">
                                                <div className="font-medium text-sm">{formatHours(week.totalHours)}h</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {week.workLogCount} work logs
                                                </div>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity */}
            {data.dailyHours.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Hoạt động gần đây
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.dailyHours
                                .filter(day => day.hours > 0)
                                .slice(-7)
                                .map((day) => (
                                    <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className="text-sm">
                                                {format(new Date(day.date), 'dd/MM/yyyy - EEEE', { locale: vi })}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{formatHours(day.hours)}h</div>
                                            <div className="text-xs text-muted-foreground">
                                                {day.workLogCount} work logs
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
