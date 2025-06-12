import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, Clock, User, FolderOpen, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useWorkLog, useDeleteWorkLog } from '@/hooks/api/useWorkLogs';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkLog } from '@/types/workLog';

export const WorkLogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const workLogId = id ? parseInt(id) : 0;
    const { data: workLog, isLoading, error } = useWorkLog(workLogId);
    const deleteMutation = useDeleteWorkLog();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd/MM/yyyy', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const canEdit = (workLog: WorkLog) => {
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'pm') return true;
        return parseInt(user.id) === workLog.userId;
    };

    const canDelete = (workLog: WorkLog) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return parseInt(user.id) === workLog.userId;
    };

    const handleEdit = () => {
        navigate(`/work-logs/edit/${workLogId}`);
    };

    const handleDelete = async () => {
        if (!workLog) return;

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa work log "${workLog.taskFeature}" không? Hành động này không thể hoàn tác.`
        );

        if (confirmed) {
            try {
                await deleteMutation.mutateAsync(workLogId);
                navigate('/work-logs');
            } catch (error) {
                console.error('Failed to delete work log:', error);
            }
        }
    };

    const handleBack = () => {
        navigate('/work-logs');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Không thể tải thông tin work log. {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!workLog) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Không tìm thấy work log.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chi tiết Work Log</h1>
                        <p className="text-muted-foreground">
                            Xem thông tin chi tiết về work log
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit(workLog) && (
                        <Button onClick={handleEdit} size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    )}
                    {canDelete(workLog) && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Work Log Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-xl">{workLog.taskFeature}</CardTitle>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(workLog.workDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <Badge variant="secondary">
                                        {workLog.hoursWorked}h
                                    </Badge>
                                </div>
                                {workLog.user && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>{workLog.user.name}</span>
                                    </div>
                                )}
                                {workLog.project && (
                                    <div className="flex items-center gap-1">
                                        <FolderOpen className="h-4 w-4" />
                                        <span>{workLog.project.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Work Description */}
                    <div>
                        <h3 className="font-semibold mb-3">Mô tả công việc</h3>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {workLog.workDescription}
                            </p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Information */}
                        {workLog.user && (
                            <div>
                                <h4 className="font-semibold mb-3">Thông tin người thực hiện</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tên:</span>
                                        <span className="font-medium">{workLog.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{workLog.user.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mã nhân viên:</span>
                                        <span className="font-medium">{workLog.user.code}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Information */}
                        {workLog.project && (
                            <div>
                                <h4 className="font-semibold mb-3">Thông tin dự án</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tên dự án:</span>
                                        <span className="font-medium">{workLog.project.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mã dự án:</span>
                                        <span className="font-medium">{workLog.project.code}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Work Log Metadata */}
                    <div>
                        <h4 className="font-semibold mb-3">Thông tin hệ thống</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày tạo:</span>
                                <span className="font-medium">{formatDateTime(workLog.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cập nhật cuối:</span>
                                <span className="font-medium">{formatDateTime(workLog.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID Work Log:</span>
                                <span className="font-medium">#{workLog.id}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
