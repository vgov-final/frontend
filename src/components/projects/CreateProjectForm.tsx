import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectService, userService } from '@/services';
import { CreateProjectRequest, ProjectStatus, ProjectType, ProjectManagerWithWorkload } from '@/types/api';

interface CreateProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
    open,
    onOpenChange,
    onSuccess
}) => {
    const [projectManagers, setProjectManagers] = useState<ProjectManagerWithWorkload[]>([]);
    const [loadingPMs, setLoadingPMs] = useState(false);
    
    useEffect(() => {
        const fetchProjectManagers = async () => {
            try {
                setLoadingPMs(true);
                const data = await userService.getProjectManagers();
                setProjectManagers(data);
            } catch (error) {
                console.error("Failed to load project managers:", error);
            } finally {
                setLoadingPMs(false);
            }
        };
        
        fetchProjectManagers();
    }, []);
    
    const [formData, setFormData] = useState<CreateProjectRequest>({
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
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); const resetForm = () => {
        setFormData({
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
        setErrors({});
    }; const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.projectCode.trim()) {
            newErrors.projectCode = 'Mã dự án là bắt buộc';
        }

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Tên dự án là bắt buộc';
        }

        if (!formData.pmEmail.trim()) {
            newErrors.pmEmail = 'Email quản lý dự án là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.pmEmail)) {
            newErrors.pmEmail = 'Email không hợp lệ';
        }

        if (!formData.description.trim()) {
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

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await projectService.createProject(formData);
            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error: any) {
            console.error('Error creating project:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: 'Đã xảy ra lỗi khi tạo dự án' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateProjectRequest, value: string | number | ProjectStatus | ProjectType) => {
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

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo dự án mới</DialogTitle>
                </DialogHeader>                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Label htmlFor="pmEmail">Project Manager *</Label>
                        <Select
                            value={formData.pmEmail}
                            onValueChange={(value) => handleInputChange('pmEmail', value)}
                            disabled={loadingPMs}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue 
                                    placeholder={loadingPMs ? "Đang tải danh sách PM..." : "Chọn Project Manager"}
                                    className="truncate"
                                >
                                    {formData.pmEmail && projectManagers.find(pm => pm.email === formData.pmEmail) && (
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {projectManagers.find(pm => pm.email === formData.pmEmail)?.fullName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formData.pmEmail}
                                            </span>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {projectManagers.map((pm) => (
                                    <SelectItem 
                                        key={pm.id} 
                                        value={pm.email}
                                        className="flex flex-col items-start py-2"
                                    >
                                        <div className="flex flex-col">
                                            <div className="font-medium">{pm.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{pm.email}</div>
                                            <div className="flex items-center mt-1">
                                                <span className="text-xs mr-2">
                                                    {pm.activeProjectCount} dự án
                                                </span>
                                                <div className="flex items-center">
                                                    <span 
                                                        className={`inline-block h-2 w-2 rounded-full mr-1 ${
                                                            pm.totalWorkload > 75 ? 'bg-red-500' : 'bg-green-500'
                                                        }`}
                                                    ></span>
                                                    <span 
                                                        className={`text-xs ${
                                                            pm.totalWorkload > 75 ? 'text-red-500' : 'text-green-500'
                                                        }`}
                                                    >
                                                        {pm.totalWorkload}% workload
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                                {projectManagers.length === 0 && !loadingPMs && (
                                    <div className="py-2 text-center text-sm text-gray-500">
                                        Không tìm thấy Project Manager nào
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.pmEmail && <p className="text-sm text-red-600">{errors.pmEmail}</p>}
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
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang tạo...' : 'Tạo dự án'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProjectForm;
