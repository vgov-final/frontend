import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { WorkLogForm } from '@/components/work-logs/WorkLogForm';
import { useWorkLog, useUpdateWorkLog } from '@/hooks/api/useWorkLogs';
import { useProjects } from '@/hooks/api/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateWorkLogRequest } from '@/types/workLog';

export const WorkLogEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const workLogId = id ? parseInt(id) : 0;
    const { data: workLog, isLoading: isLoadingWorkLog, error } = useWorkLog(workLogId);
    const updateMutation = useUpdateWorkLog();

    const {
        data: projectsData,
        isLoading: isLoadingProjects
    } = useProjects({ size: 1000 }); // Get all projects for form

    const handleSubmit = async (data: UpdateWorkLogRequest) => {
        try {
            await updateMutation.mutateAsync({ id: workLogId, data });
            navigate('/work-logs');
        } catch (error) {
            // Error is handled by the mutation hook with toast
            console.error('Failed to update work log:', error);
            throw error; // Re-throw to keep form in error state
        }
    };

    const handleCancel = () => {
        navigate('/work-logs');
    };

    // Check permissions
    const canEdit = React.useMemo(() => {
        if (!user || !workLog) return false;
        if (user.role === 'admin' || user.role === 'pm') return true;
        return parseInt(user.id) === workLog.userId;
    }, [user, workLog]);

    const projects = projectsData?.content || [];

    // Loading state
    if (isLoadingWorkLog || isLoadingProjects) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa Work Log</h1>
                        <p className="text-muted-foreground">
                            Cập nhật thông tin work log
                        </p>
                    </div>
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

    // Not found state
    if (!workLog) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa Work Log</h1>
                        <p className="text-muted-foreground">
                            Cập nhật thông tin work log
                        </p>
                    </div>
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

    // Permission check
    if (!canEdit) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa Work Log</h1>
                        <p className="text-muted-foreground">
                            Cập nhật thông tin work log
                        </p>
                    </div>
                </div>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Bạn không có quyền chỉnh sửa work log này.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Chỉnh sửa Work Log</h1>
                    <p className="text-muted-foreground">
                        Cập nhật thông tin work log: {workLog.taskFeature}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="flex justify-center">
                <WorkLogForm
                    initialData={workLog}
                    projects={projects}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateMutation.isPending}
                    mode="edit"
                />
            </div>
        </div>
    );
};
