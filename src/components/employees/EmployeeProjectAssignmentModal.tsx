import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Folder, FolderCheck, FolderX } from 'lucide-react';
import { employeeService, projectService } from '@/services';
import { User, Project, ProjectStatus } from '@/types/api';

interface EmployeeProjectAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    employee: User | null;
}

const EmployeeProjectAssignmentModal: React.FC<EmployeeProjectAssignmentModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    employee
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && employee) {
            fetchProjects();
            fetchAssignedProjects();
            setSelectedProjectIds(new Set());
            setSearchTerm('');
            setError(null);
        }
    }, [open, employee]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProjects({ page: 0, size: 100 });
            setProjects(response.content);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedProjects = async () => {
        if (!employee) return;

        try {
            const assignedList = await employeeService.getEmployeeProjects(employee.id);
            setAssignedProjects(assignedList);
        } catch (error) {
            console.error('Error fetching assigned projects:', error);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isProjectAssigned = (projectId: number) => {
        return assignedProjects.some(proj => proj.id === projectId);
    };

    const handleProjectToggle = (projectId: number, checked: boolean) => {
        const newSelected = new Set(selectedProjectIds);
        if (checked) {
            newSelected.add(projectId);
        } else {
            newSelected.delete(projectId);
        }
        setSelectedProjectIds(newSelected);
    };

    const handleAssignProjects = async () => {
        if (!employee || selectedProjectIds.size === 0) return;

        try {
            setSubmitLoading(true);
            const projectIds = Array.from(selectedProjectIds);
            await employeeService.assignProjectsToEmployee(employee.id, projectIds);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error assigning projects:', error);
            setError('Không thể phân công dự án. Vui lòng thử lại.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRemoveProject = async (projectId: number) => {
        if (!employee) return;

        try {
            await employeeService.removeProjectFromEmployee(employee.id, projectId);
            fetchAssignedProjects(); // Refresh the assigned list
        } catch (error: any) {
            console.error('Error removing project:', error);
            setError('Không thể xóa phân công dự án');
        }
    };

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.InProgress:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case ProjectStatus.Closed:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case ProjectStatus.Open:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case ProjectStatus.Hold:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case ProjectStatus.Presale:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.InProgress: return 'Đang thực hiện';
            case ProjectStatus.Closed: return 'Hoàn thành';
            case ProjectStatus.Open: return 'Mở';
            case ProjectStatus.Hold: return 'Tạm dừng';
            case ProjectStatus.Presale: return 'Presale';
            default: return 'Không xác định';
        }
    };

    if (!employee) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Phân công dự án - {employee.fullName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Currently Assigned Projects */}
                    <div>
                        <Label className="text-base font-medium">Dự án đã tham gia</Label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {assignedProjects.length > 0 ? (
                                assignedProjects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Folder className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{project.projectName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {project.description || 'Không có mô tả'}
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(project.status)}>
                                                {getStatusText(project.status)}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleRemoveProject(project.id)}
                                        >
                                            <FolderX className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    Chưa tham gia dự án nào
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search and Assign New Projects */}
                    <div>
                        <Label className="text-base font-medium">Phân công dự án mới</Label>

                        <div className="mt-2 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm dự án..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-4">Đang tải...</div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {filteredProjects
                                        .filter(project => !isProjectAssigned(project.id))
                                        .map((project) => (
                                            <div key={project.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
                                                <Checkbox
                                                    id={`project-${project.id}`}
                                                    checked={selectedProjectIds.has(project.id)}
                                                    onCheckedChange={(checked) => handleProjectToggle(project.id, checked === true)}
                                                />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <Folder className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{project.projectName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {project.description || 'Không có mô tả'}
                                                        </div>
                                                    </div>
                                                    <Badge className={getStatusColor(project.status)}>
                                                        {getStatusText(project.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}

                                    {filteredProjects.filter(project => !isProjectAssigned(project.id)).length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {searchTerm ? 'Không tìm thấy dự án phù hợp' : 'Tất cả dự án đã được phân công'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitLoading}
                    >
                        Đóng
                    </Button>
                    {selectedProjectIds.size > 0 && (
                        <Button
                            onClick={handleAssignProjects}
                            disabled={submitLoading}
                            className="gap-2"
                        >
                            <FolderCheck className="w-4 h-4" />
                            {submitLoading ? 'Đang phân công...' : `Phân công ${selectedProjectIds.size} dự án`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeProjectAssignmentModal;
