import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { WorkLogForm } from '@/components/work-logs/WorkLogForm';
import { useCreateWorkLog } from '@/hooks/api/useWorkLogs';
import { useProjects } from '@/hooks/api/useProjects';
import type { CreateWorkLogRequest } from '@/types/workLog';

export const WorkLogCreate: React.FC = () => {
    const navigate = useNavigate();
    const createMutation = useCreateWorkLog();

    const {
        data: projectsData,
        isLoading: isLoadingProjects
    } = useProjects({ size: 1000 }); // Get all projects for form

    const handleSubmit = async (data: CreateWorkLogRequest) => {
        try {
            await createMutation.mutateAsync(data);
            navigate('/work-logs');
        } catch (error) {
            // Error is handled by the mutation hook with toast
            console.error('Failed to create work log:', error);
            throw error; // Re-throw to keep form in error state
        }
    };

    const handleCancel = () => {
        navigate('/work-logs');
    };

    const projects = projectsData?.content || [];

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Tạo Work Log mới</h1>
                    <p className="text-muted-foreground">
                        Ghi lại công việc bạn đã thực hiện
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="flex justify-center">
                <WorkLogForm
                    projects={projects}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createMutation.isPending || isLoadingProjects}
                    mode="create"
                />
            </div>
        </div>
    );
};
