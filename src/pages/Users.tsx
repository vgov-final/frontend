import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Users as UsersIcon, UserPlus, Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/userService';
import { User, UserRole, PagedResponse, UserSearchParams } from '@/types/api';
import CreateUserForm from '@/components/users/CreateUserForm';
import EditUserForm from '@/components/users/EditUserForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const pageSize = 12;

  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: UserSearchParams = {
        page: currentPage,
        size: pageSize,
        search: searchTerm
      };

      if (filterRole !== 'all') {
        searchParams.role = filterRole;
      }

      if (filterStatus !== 'all') {
        searchParams.isActive = filterStatus === 'active';
      }

      const response: PagedResponse<User> = await userService.getUsers(searchParams);

      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleRoleFilter = (value: string) => {
    setFilterRole(value);
    setCurrentPage(0);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(0);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleActivation = async (userId: number, isActive: boolean) => {
    try {
      await userService.toggleActivation(userId, !isActive);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user activation:', err);
      alert('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại.');
    }
  };

  const handleFormSuccess = () => {
    fetchUsers();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pm': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dev': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ba': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'test': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'pm': return 'Quản lý dự án';
      case 'dev': return 'Lập trình viên';
      case 'ba': return 'Phân tích viên';
      case 'test': return 'Kiểm thử viên';
      default: return role;
    }
  };

  const getWorkloadColor = (workload?: number) => {
    if (!workload) return 'bg-gray-100 text-gray-800';
    if (workload >= 90) return 'bg-red-100 text-red-800';
    if (workload >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Check if current user is PM - hide management buttons for PM users
  const isPM = currentUser?.role === 'pm';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {!isPM && (
          <Button className="bg-blue-600 hover:bg-blue-700 ml-4" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <Select value={filterRole} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="pm">Quản lý dự án</SelectItem>
            <SelectItem value="dev">Lập trình viên</SelectItem>
            <SelectItem value="ba">Phân tích viên</SelectItem>
            <SelectItem value="test">Kiểm thử viên</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(pageSize)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={resolvedTheme === 'dark' ? '/user-white.svg' : '/user-dark.svg'} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.employeeCode}</div>
                      </div>
                    </div>
                    {!isPM && (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleActivation(user.id, user.isActive)}
                          title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {user.isActive ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Chỉnh sửa"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Xóa"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-blue-600">{user.email}</span>
                      </div>
                      {user.gender && (
                        <div className="flex justify-between">
                          <span>Giới tính:</span>
                          <span>{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                        </div>
                      )}
                      {user.birthDate && (
                        <div className="flex justify-between">
                          <span>Ngày sinh:</span>
                          <span>{new Date(user.birthDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Ngày tạo:</span>
                        <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {user.currentWorkload !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Khối lượng công việc:</span>
                          <Badge className={getWorkloadColor(user.currentWorkload)}>
                            {user.currentWorkload}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              user.currentWorkload >= 90 ? 'bg-red-500' :
                              user.currentWorkload >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(user.currentWorkload, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} người dùng
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <span className="text-sm">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Không tìm thấy người dùng</h3>
              <p className="text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác hoặc thêm người dùng mới.</p>
            </div>
          )}
        </>
      )}

      {/* Create User Form */}
      <CreateUserForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleFormSuccess}
      />

      {/* Edit User Form */}
      <EditUserForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={handleFormSuccess}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;
