import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectService } from '@/services';
import { Project, UpdateProjectRequest, ProjectStatus, ProjectType } from '@/types/api';

interface EditProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    project: Project | null;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({
    open,
    onOpenChange,
    onSuccess,
    project
}) => {
    const [formData, setFormData] = useState<UpdateProjectRequest>({
        projectCode: '',
        projectName: '',
        pmEmail: '',
        description: '',
        startDate: '',
        endDate: '',
        status: ProjectStatus.Open,
        projectType: ProjectType.TM,
        budget: 0
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (open && project) {
            setFormData({
                projectCode: project.projectCode,
                projectName: project.projectName,
                pmEmail: project.pmEmail,
                description: project.description || '',
                startDate: project.startDate || '',
                endDate: project.endDate || '',
                status: project.status,
                projectType: project.projectType,
                budget: 0
            });
            setErrors({});
        }
    }, [open, project]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.projectCode?.trim()) {
            newErrors.projectCode = 'Mã dự án là bắt buộc';
        }

        if (!formData.projectName?.trim()) {
            newErrors.projectName = 'Tên dự án là bắt buộc';
        }

        if (!formData.pmEmail?.trim()) {
            newErrors.pmEmail = 'Email PM là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.pmEmail)) {
            newErrors.pmEmail = 'Email không hợp lệ';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'Mô tả dự án là bắt buộc';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'Ngày kết thúc là bắt buộc';
        }

        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (startDate >= endDate) {
                newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
            }
        }

        if (formData.budget < 0) {
            newErrors.budget = 'Ngân sách không thể âm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!project || !validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await projectService.updateProject(project.id, formData);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error updating project:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: 'Đã xảy ra lỗi khi cập nhật dự án' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof UpdateProjectRequest, value: string | number | ProjectStatus | ProjectType) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dự án</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectCode">Mã dự án *</Label>
                            <Input
                                id="projectCode"
                                value={formData.projectCode}
                                onChange={(e) => handleInputChange('projectCode', e.target.value)}
                                placeholder="Nhập mã dự án"
                            />
                            {errors.projectCode && <p className="text-sm text-red-600">{errors.projectCode}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pmEmail">Email PM *</Label>
                            <Input
                                id="pmEmail"
                                type="email"
                                value={formData.pmEmail}
                                onChange={(e) => handleInputChange('pmEmail', e.target.value)}
                                placeholder="Nhập email PM"
                            />
                            {errors.pmEmail && <p className="text-sm text-red-600">{errors.pmEmail}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="projectName">Tên dự án *</Label>
                        <Input
                            id="projectName"
                            value={formData.projectName}
                            onChange={(e) => handleInputChange('projectName', e.target.value)}
                            placeholder="Nhập tên dự án"
                        />
                        {errors.projectName && <p className="text-sm text-red-600">{errors.projectName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Nhập mô tả dự án"
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                            />
                            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Ngày kết thúc *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                            />
                            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value as ProjectStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ProjectStatus.Open}>Mở</SelectItem>
                                    <SelectItem value={ProjectStatus.InProgress}>Đang thực hiện</SelectItem>
                                    <SelectItem value={ProjectStatus.Closed}>Hoàn thành</SelectItem>
                                    <SelectItem value={ProjectStatus.Hold}>Tạm dừng</SelectItem>
                                    <SelectItem value={ProjectStatus.Presale}>Presale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectType">Loại dự án</Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(value) => handleInputChange('projectType', value as ProjectType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại dự án" />
                                </SelectTrigger>                <SelectContent>
                                    <SelectItem value={ProjectType.TM}>T&M</SelectItem>
                                    <SelectItem value={ProjectType.Package}>Package</SelectItem>
                                    <SelectItem value={ProjectType.OSDC}>OSDC</SelectItem>
                                    <SelectItem value={ProjectType.Presale}>Presale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget">Ngân sách (VNĐ)</Label>
                        <Input
                            id="budget"
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.budget}
                            onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                            placeholder="Nhập ngân sách"
                        />
                        {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
                    </div>

                    {errors.submit && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {errors.submit}
                        </div>
                    )}
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProjectForm;
