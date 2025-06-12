import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeService } from '@/services';
import { Employee, UpdateEmployeeRequest, EmployeeRole } from '@/types/api';

interface EditEmployeeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    employee: Employee | null;
}

const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({
    open,
    onOpenChange,
    onSuccess,
    employee
}) => {
    const [formData, setFormData] = useState<UpdateEmployeeRequest>({
        name: '',
        email: '',
        position: '',
        department: '',
        roleId: 0
    });
    const [roles, setRoles] = useState<EmployeeRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (open && employee) {
            fetchRoles();
            setFormData({
                name: employee.name,
                email: employee.email,
                position: employee.position || '',
                department: employee.department || '',
                roleId: employee.role?.id || 0
            });
            setErrors({});
        }
    }, [open, employee]);

    const fetchRoles = async () => {
        try {
            const roleList = await employeeService.getEmployeeRoles();
            setRoles(roleList);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên nhân viên là bắt buộc';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Chức vụ là bắt buộc';
        }

        if (!formData.department.trim()) {
            newErrors.department = 'Phòng ban là bắt buộc';
        }

        if (formData.roleId === 0) {
            newErrors.roleId = 'Vai trò là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee || !validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await employeeService.updateEmployee(employee.id, formData);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error updating employee:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: 'Đã xảy ra lỗi khi cập nhật nhân viên' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof UpdateEmployeeRequest, value: string | number) => {
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

    if (!employee) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Mã nhân viên</Label>
                        <Input
                            id="code"
                            value={employee.code}
                            disabled
                            className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">Mã nhân viên không thể thay đổi</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Tên nhân viên *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Nhập tên nhân viên"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Nhập email"
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position">Chức vụ *</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => handleInputChange('position', e.target.value)}
                                placeholder="Nhập chức vụ"
                            />
                            {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Phòng ban *</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                placeholder="Nhập phòng ban"
                            />
                            {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Vai trò *</Label>
                        <Select value={formData.roleId.toString()} onValueChange={(value) => handleInputChange('roleId', parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.description || role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.roleId && <p className="text-sm text-red-600">{errors.roleId}</p>}
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

export default EditEmployeeForm;
