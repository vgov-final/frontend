import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, FolderOpen } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { WorkLogCalendarEntry, WorkLog } from '@/types/workLog';

interface WorkLogCalendarProps {
    data: WorkLogCalendarEntry[];
    isLoading?: boolean;
    currentDate?: Date;
    onDateChange?: (date: Date) => void;
    onWorkLogClick?: (workLog: WorkLog) => void;
    onDateClick?: (date: string, workLogs: WorkLog[]) => void;
    className?: string;
}

export const WorkLogCalendar: React.FC<WorkLogCalendarProps> = ({
    data = [],
    isLoading = false,
    currentDate = new Date(),
    onDateChange,
    onWorkLogClick,
    onDateClick,
    className,
}) => {
    const [selectedDate, setSelectedDate] = React.useState<Date>(currentDate);

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a map for quick lookup
    const workLogsByDate = React.useMemo(() => {
        const map = new Map<string, WorkLogCalendarEntry>();
        data.forEach(entry => {
            map.set(entry.date, entry);
        });
        return map;
    }, [data]);

    const handlePrevMonth = () => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
        setSelectedDate(newDate);
        onDateChange?.(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        setSelectedDate(newDate);
        onDateChange?.(newDate);
    };

    const handleDateClick = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const entry = workLogsByDate.get(dateString);
        if (entry && onDateClick) {
            onDateClick(dateString, entry.workLogs);
        }
    };

    const getTotalHoursForMonth = () => {
        return data.reduce((total, entry) => total + entry.totalHours, 0);
    };

    const getWorkDaysInMonth = () => {
        return data.filter(entry => entry.totalHours > 0).length;
    };

    const getAverageHoursPerDay = () => {
        const workDays = getWorkDaysInMonth();
        return workDays > 0 ? getTotalHoursForMonth() / workDays : 0;
    };

    const getHoursColorClass = (hours: number) => {
        if (hours === 0) return 'bg-gray-100 text-gray-400';
        if (hours < 4) return 'bg-red-100 text-red-700';
        if (hours < 6) return 'bg-yellow-100 text-yellow-700';
        if (hours < 8) return 'bg-blue-100 text-blue-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Work Log Calendar
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                            ‹
                        </Button>
                        <div className="text-lg font-semibold min-w-[120px] text-center">
                            {format(selectedDate, 'MMMM yyyy', { locale: vi })}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleNextMonth}>
                            ›
                        </Button>
                    </div>
                </div>

                {/* Monthly summary */}
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Tổng: <strong>{getTotalHoursForMonth().toFixed(1)}h</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Ngày làm việc: <strong>{getWorkDaysInMonth()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>TB/ngày: <strong>{getAverageHoursPerDay().toFixed(1)}h</strong></span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Calendar grid */}
                <div className="space-y-4">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-sm font-medium text-muted-foreground text-center">
                        <div>CN</div>
                        <div>T2</div>
                        <div>T3</div>
                        <div>T4</div>
                        <div>T5</div>
                        <div>T6</div>
                        <div>T7</div>
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before month start */}
                        {Array.from({ length: monthStart.getDay() }, (_, i) => (
                            <div key={`empty-${i}`} className="h-16" />
                        ))}

                        {/* Month days */}
                        {monthDays.map((date) => {
                            const dateString = format(date, 'yyyy-MM-dd');
                            const entry = workLogsByDate.get(dateString);
                            const hasWorkLogs = entry && entry.totalHours > 0;
                            const isCurrentDay = isToday(date);

                            return (
                                <div
                                    key={dateString}
                                    className={cn(
                                        'h-16 border rounded-lg p-1 cursor-pointer transition-colors hover:bg-gray-50',
                                        isCurrentDay && 'ring-2 ring-primary ring-offset-1',
                                        hasWorkLogs && 'hover:bg-blue-50'
                                    )}
                                    onClick={() => handleDateClick(date)}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="text-sm font-medium">
                                            {format(date, 'd')}
                                        </div>

                                        {hasWorkLogs && entry && (
                                            <div className="flex-1 flex flex-col justify-center items-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        'text-xs px-1 py-0 h-auto',
                                                        getHoursColorClass(entry.totalHours)
                                                    )}
                                                >
                                                    {entry.totalHours}h
                                                </Badge>
                                                {entry.workLogs.length > 1 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {entry.workLogs.length} logs
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-xs">
                        <span className="font-medium">Giờ làm việc:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gray-100"></div>
                            <span>0h</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-100"></div>
                            <span>&lt;4h</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-100"></div>
                            <span>4-6h</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-blue-100"></div>
                            <span>6-8h</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-100"></div>
                            <span>8h+</span>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center py-4 text-muted-foreground">
                            Đang tải dữ liệu calendar...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
