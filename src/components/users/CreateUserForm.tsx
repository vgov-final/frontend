import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/userService';
import { CreateUserRequest, UserRole } from '@/types/api';

interface CreateUserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
    open,
    onOpenChange,
    onSuccess
}) => {
    const [formData, setFormData] = useState<CreateUserRequest>({
        employeeCode: '',
        fullName: '',
        email: '',
        password: '',
        role: 'dev'
    });
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (open) {
            fetchRoles();
            resetForm();
        }
    }, [open]);

    const fetchRoles = async () => {
        try {
            const roleList = await userService.getUserRoles();
            setRoles(roleList);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            employeeCode: '',
            fullName: '',
            email: '',
            password: '',
            role: 'dev'
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.employeeCode.trim()) {
            newErrors.employeeCode = 'Mã nhân viên là bắt buộc';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Tên nhân viên là bắt buộc';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.role) {
            newErrors.role = 'Vai trò là bắt buộc';
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
            await userService.createUser(formData);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error creating user:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: 'Đã xảy ra lỗi khi tạo người dùng' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateUserRequest, value: string | number) => {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm người dùng mới</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeCode">Mã nhân viên *</Label>
                            <Input
                                id="employeeCode"
                                value={formData.employeeCode}
                                onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                                placeholder="Nhập mã nhân viên"
                            />
                            {errors.employeeCode && <p className="text-sm text-red-600">{errors.employeeCode}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Tên nhân viên *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Nhập tên nhân viên"
                            />
                            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                        </div>
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

                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Nhập mật khẩu"
                        />
                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Giới tính</Label>
                            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value as 'male' | 'female' | 'other')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Ngày sinh</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={formData.birthDate || ''}
                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Vai trò *</Label>
                        <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as 'admin' | 'pm' | 'dev' | 'ba' | 'test')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
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
                        {loading ? 'Đang tạo...' : 'Tạo người dùng'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserForm;
