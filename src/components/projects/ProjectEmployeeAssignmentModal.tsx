import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Users, UserCheck, UserX, AlertTriangle, Info } from 'lucide-react';
import { userService, projectService } from '@/services';
import { workloadValidationService, WorkloadInfo } from '@/services/workloadValidationService';
import { User, Project } from '@/types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectEmployeeAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    project: Project | null;
}

const ProjectEmployeeAssignmentModal: React.FC<ProjectEmployeeAssignmentModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    project
}) => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [assignedEmployees, setAssignedEmployees] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
    const [workloadPercentages, setWorkloadPercentages] = useState<Map<number, number>>(new Map());
    const [workloadInfos, setWorkloadInfos] = useState<Map<number, WorkloadInfo>>(new Map());
    const [validationErrors, setValidationErrors] = useState<Map<number, string>>(new Map());
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && project) {
            fetchEmployees();
            fetchAssignedEmployees();
            setSelectedEmployeeIds(new Set());
            setWorkloadPercentages(new Map());
            setWorkloadInfos(new Map());
            setValidationErrors(new Map());
            setSearchTerm('');
            setError(null);
        }
    }, [open, project]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers({ page: 0, size: 1000 }); // Fetch more users
            const filtered = response.content.filter(user => user.role !== 'admin');
            setEmployees(filtered);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedEmployees = async () => {
        if (!project) return;

        try {
            const assignedList = await projectService.getProjectMembers(project.id);
            console.log('Raw project members response:', assignedList);
            
            // Transform ProjectMember[] to User[] using the flat structure from backend
            const users = assignedList
                .filter(member => member.userFullName && member.userEmail)
                .map(member => ({
                    id: member.userId,
                    employeeCode: '', // Not provided in ProjectMemberResponseDto
                    fullName: member.userFullName,
                    email: member.userEmail,
                    role: member.userRole as 'admin' | 'pm' | 'dev' | 'ba' | 'test',
                    isActive: member.isActive,
                    createdAt: member.createdAt,
                    updatedAt: member.updatedAt,
                    createdBy: member.createdBy,
                    updatedBy: undefined
                }));
            
            console.log('Transformed users:', users);
            setAssignedEmployees(users);
        } catch (error) {
            console.error('Error fetching assigned employees:', error);
            setError('Không thể tải danh sách nhân viên đã phân công');
        }
    };

    const filteredEmployees = employees
        .filter(employee => employee.role !== 'admin')
        .filter(employee =>
            employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const isEmployeeAssigned = (employeeId: number) => {
        return assignedEmployees.some(emp => emp.id === employeeId);
    };

    const handleEmployeeToggle = async (employeeId: number, checked: boolean) => {
        const newSelected = new Set(selectedEmployeeIds);
        if (checked) {
            newSelected.add(employeeId);
            // Set default workload and fetch user workload info
            const newWorkloadPercentages = new Map(workloadPercentages);
            newWorkloadPercentages.set(employeeId, 20); // Default 20%
            setWorkloadPercentages(newWorkloadPercentages);
            
            // Fetch and validate workload
            await fetchUserWorkloadInfo(employeeId);
            await validateWorkload(employeeId, 20);
        } else {
            newSelected.delete(employeeId);
            // Clear workload data for unselected employee
            const newWorkloadPercentages = new Map(workloadPercentages);
            const newWorkloadInfos = new Map(workloadInfos);
            const newValidationErrors = new Map(validationErrors);
            newWorkloadPercentages.delete(employeeId);
            newWorkloadInfos.delete(employeeId);
            newValidationErrors.delete(employeeId);
            setWorkloadPercentages(newWorkloadPercentages);
            setWorkloadInfos(newWorkloadInfos);
            setValidationErrors(newValidationErrors);
        }
        setSelectedEmployeeIds(newSelected);
    };

    const fetchUserWorkloadInfo = async (userId: number) => {
        try {
            const workloadInfo = await workloadValidationService.getUserWorkloadInfo(userId);
            const newWorkloadInfos = new Map(workloadInfos);
            newWorkloadInfos.set(userId, workloadInfo);
            setWorkloadInfos(newWorkloadInfos);
        } catch (error) {
            console.error('Error fetching user workload info:', error);
        }
    };

    const handleWorkloadChange = async (employeeId: number, workload: number) => {
        const newWorkloadPercentages = new Map(workloadPercentages);
        newWorkloadPercentages.set(employeeId, workload);
        setWorkloadPercentages(newWorkloadPercentages);
        
        await validateWorkload(employeeId, workload);
    };

    const validateWorkload = async (employeeId: number, workload: number) => {
        try {
            const validation = await workloadValidationService.validateWorkloadAddition(employeeId, workload);
            const newValidationErrors = new Map(validationErrors);
            
            if (!validation.isValid) {
                newValidationErrors.set(employeeId, validation.errorMessage || 'Invalid workload');
            } else {
                newValidationErrors.delete(employeeId);
            }
            
            setValidationErrors(newValidationErrors);
        } catch (error) {
            console.error('Error validating workload:', error);
            const newValidationErrors = new Map(validationErrors);
            newValidationErrors.set(employeeId, 'Unable to validate workload');
            setValidationErrors(newValidationErrors);
        }
    };

    const handleAssignEmployees = async () => {
        if (!project || selectedEmployeeIds.size === 0) return;

        // Check for validation errors
        const hasErrors = Array.from(selectedEmployeeIds).some(id => validationErrors.has(id));
        if (hasErrors) {
            setError('Please fix workload validation errors before proceeding.');
            return;
        }

        try {
            setSubmitLoading(true);
            const employeeIds = Array.from(selectedEmployeeIds);
            
            // Add each selected employee as a project member with specified workload
            for (const userId of employeeIds) {
                const workload = workloadPercentages.get(userId) || 20;
                await projectService.addProjectMember(project.id, {
                    userId,
                    workloadPercentage: workload
                });
            }
            
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error assigning employees:', error);
            
            // Check if it's a workload exceeded error from backend
            if (error.response?.data?.error === 'WORKLOAD_EXCEEDED') {
                setError(`Workload validation failed: ${error.response.data.message}`);
            } else {
                setError('Unable to assign employees. Please try again.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRemoveEmployee = async (employeeId: number) => {
        if (!project) return;

        try {
            await projectService.removeMemberFromProject(project.id, employeeId);
            fetchAssignedEmployees(); // Refresh the assigned list
        } catch (error: any) {
            console.error('Error removing employee:', error);
            setError('Không thể xóa phân công nhân viên');
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Phân công nhân viên - {project.projectName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Currently Assigned Employees */}
                    <div>
                        <Label className="text-base font-medium">Nhân viên đã phân công</Label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {assignedEmployees.length > 0 ? (
                                assignedEmployees
                                    .filter(employee => employee && employee.fullName)
                                    .map((employee) => (
                                        <div key={employee.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-medium">
                                                        {employee.fullName?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{employee.fullName || 'Unknown'}</div>
                                                    <div className="text-sm text-muted-foreground">{employee.email || 'No email'}</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleRemoveEmployee(employee.id)}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    Chưa có nhân viên nào được phân công
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search and Assign New Employees */}
                    <div>
                        <Label className="text-base font-medium">Phân công thêm nhân viên</Label>

                        <div className="mt-2 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm nhân viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-4">Đang tải...</div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto space-y-3">
                                    {filteredEmployees
                                        .filter(employee => employee && employee.fullName && !isEmployeeAssigned(employee.id))
                                        .map((employee) => {
                                            const isSelected = selectedEmployeeIds.has(employee.id);
                                            const workloadInfo = workloadInfos.get(employee.id);
                                            const currentWorkload = workloadPercentages.get(employee.id) || 20;
                                            const validationError = validationErrors.get(employee.id);
                                            
                                            return (
                                                <div key={employee.id} className="border rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`employee-${employee.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked === true)}
                                                        />
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-sm font-medium">
                                                                    {employee.fullName?.charAt(0) || '?'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{employee.fullName || 'Unknown'}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {employee.email || 'No email'} • {employee.role || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <Badge variant="secondary">
                                                                {employee.role || 'N/A'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Workload Information and Input */}
                                                    {isSelected && (
                                                        <div className="ml-6 space-y-2">
                                                            {/* Current Workload Info */}
                                                            {workloadInfo && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Info className="w-4 h-4 text-blue-500" />
                                                                    <span className={`${workloadInfo.isOverloaded ? 'text-red-600' : 'text-green-600'}`}>
                                                                        Current: {workloadInfo.currentWorkload}% | Available: {workloadInfo.availableCapacity}% | Projects: {workloadInfo.activeProjectCount}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Workload Input */}
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor={`workload-${employee.id}`} className="text-sm font-medium min-w-[80px]">
                                                                    Workload:
                                                                </Label>
                                                                <Input
                                                                    id={`workload-${employee.id}`}
                                                                    type="number"
                                                                    min="0.01"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={currentWorkload}
                                                                    onChange={(e) => handleWorkloadChange(employee.id, parseFloat(e.target.value) || 0)}
                                                                    className="w-20"
                                                                />
                                                                <span className="text-sm text-muted-foreground">%</span>
                                                            </div>

                                                            {/* Validation Error */}
                                                            {validationError && (
                                                                <Alert variant="destructive" className="py-2">
                                                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                                    <AlertDescription className="text-sm leading-relaxed">
                                                                        {validationError}
                                                                    </AlertDescription>
                                                                </Alert>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                    {filteredEmployees.filter(employee => employee && employee.fullName && !isEmployeeAssigned(employee.id)).length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {searchTerm ? 'Không tìm thấy nhân viên phù hợp' : 'Tất cả nhân viên đã được phân công'}
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
                    {selectedEmployeeIds.size > 0 && (
                        <Button
                            onClick={handleAssignEmployees}
                            disabled={submitLoading}
                            className="gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            {submitLoading ? 'Đang phân công...' : `Phân công ${selectedEmployeeIds.size} nhân viên`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectEmployeeAssignmentModal;
