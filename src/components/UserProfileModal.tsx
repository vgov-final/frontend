import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services';
import { User as UserType, PasswordChangeRequest, ProfileUpdateRequest } from '@/types/user';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    birthDate: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (open && user) {
      fetchUserProfile();
    }
  }, [open, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileService.getCurrentProfile();
      setUserProfile(profileData);
      setFormData({
        fullName: profileData.fullName || '',
        gender: profileData.gender || '',
        birthDate: profileData.birthDate || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      setError(null);
      
      const updateRequest: ProfileUpdateRequest = {
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate
      };
      
      await profileService.updateProfile(updateRequest);
      
      // Refresh the profile data
      await fetchUserProfile();
      
      alert('Cập nhật thông tin thành công');
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const changePasswordRequest: PasswordChangeRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      };
      
      await profileService.changePassword(changePasswordRequest);
      
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Đổi mật khẩu thành công');
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Different editable fields based on user role
  const getEditableFields = () => {
    if (!user) return [];

    // Only admin can edit user information (except password)
    if (user.role === 'admin') {
      return ['fullName', 'gender', 'birthDate'];
    }
    
    // Non-admin users cannot edit profile information
    // They can only change password
    return [];
  };

  const editableFields = getEditableFields();
  
  const fieldLabels: Record<string, string> = {
    fullName: 'Họ và tên',
    gender: 'Giới tính',
    birthDate: 'Ngày sinh'
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Extract date part only
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'pm':
        return 'Quản lý dự án';
      case 'employee':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      default:
        return gender;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thông tin cá nhân</DialogTitle>
          <DialogDescription>
            Xem và chỉnh sửa thông tin cá nhân của bạn.
          </DialogDescription>
        </DialogHeader>

        {loading && !userProfile ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : (
          <div className="space-y-4">
            {!showPasswordForm ? (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Employee Code - always view only */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employeeCode" className="text-right">
                      Mã NV
                    </Label>
                    <Input
                      id="employeeCode"
                      value={userProfile?.employeeCode || ''}
                      className="col-span-3"
                      disabled
                    />
                  </div>

                  {/* Email - always view only */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={userProfile?.email || ''}
                      className="col-span-3"
                      disabled
                    />
                  </div>

                  {/* Role - always view only */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Vai trò
                    </Label>
                    <Input
                      id="role"
                      value={formatRole(userProfile?.role || '')}
                      className="col-span-3"
                      disabled
                    />
                  </div>

                  {/* Full Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fullName" className="text-right">
                      Họ và tên
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="col-span-3"
                      disabled={!editableFields.includes('fullName')}
                    />
                  </div>

                  {/* Gender */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right">
                      Giới tính
                    </Label>
                    {editableFields.includes('gender') ? (
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange('gender', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="gender"
                        value={formatGender(formData.gender)}
                        className="col-span-3"
                        disabled
                      />
                    )}
                  </div>

                  {/* Birth Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthDate" className="text-right">
                      Ngày sinh
                    </Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formatDate(formData.birthDate)}
                      onChange={handleChange}
                      className="col-span-3"
                      disabled={!editableFields.includes('birthDate')}
                    />
                  </div>


                  {/* Status */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Trạng thái
                    </Label>
                    <Input
                      id="status"
                      value={userProfile?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      className="col-span-3"
                      disabled
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                  {user?.role === 'admin' && (
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currentPassword" className="text-right">
                      Mật khẩu hiện tại
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPassword" className="text-right">
                      Mật khẩu mới
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Xác nhận mật khẩu
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
