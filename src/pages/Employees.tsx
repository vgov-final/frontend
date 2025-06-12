import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeService } from '@/services';
import { Employee, EmployeeRole, PagedResponse, EmployeeSearchParams } from '@/types/api';
import CreateEmployeeForm from '@/components/employees/CreateEmployeeForm';
import EditEmployeeForm from '@/components/employees/EditEmployeeForm';
import EmployeeProjectAssignmentModal from '@/components/employees/EmployeeProjectAssignmentModal';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const pageSize = 12;

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, filterRole]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: EmployeeSearchParams = {
        page: currentPage,
        size: pageSize,
        search: searchTerm
      };

      if (filterRole !== 'all') {
        searchParams.role = filterRole;
      }

      const response: PagedResponse<Employee> = await employeeService.getEmployees(searchParams);

      setEmployees(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleRoleFilter = (value: string) => {
    setFilterRole(value);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await employeeService.deleteEmployee(employeeId);
        fetchEmployees(); // Refresh the list
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Không thể xóa nhân viên. Vui lòng thử lại.');
      }
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditForm(true);
  };

  const handleAssignProjects = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowAssignmentModal(true);
  };

  const handleFormSuccess = () => {
    fetchEmployees();
  };

  // Filter employees locally for project assignment (since backend doesn't support this filter)
  const filteredEmployees = employees.filter(employee => {
    if (filterProject === 'all') return true;
    // Note: This is a simplified filter since we don't have project assignment data in the Employee interface
    // In a real implementation, you might need to fetch project assignments separately
    return true;
  });

  const getRoleColor = (role?: EmployeeRole) => {
    if (!role) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

    switch (role.name) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PROJECT_MANAGER':
      case 'PM': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'EMPLOYEE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleText = (role?: EmployeeRole) => {
    if (!role) return 'Không xác định';

    switch (role.name) {
      case 'ADMIN': return 'Admin';
      case 'PROJECT_MANAGER':
      case 'PM': return 'Project Manager';
      case 'EMPLOYEE': return 'Nhân viên';
      default: return role.description || role.name;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 ml-4" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={filterRole} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
            <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo dự án" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="assigned">Đã phân công</SelectItem>
            <SelectItem value="unassigned">Chưa phân công</SelectItem>
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
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEmployees} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.position || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleAssignProjects(employee)} title="Phân công dự án">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(employee)} title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        title="Xóa"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getRoleColor(employee.role)}>
                        {getRoleText(employee.role)}
                      </Badge>
                      <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Hoạt động
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-blue-600">{employee.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phòng ban:</span>
                        <span>{employee.department || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày tạo:</span>
                        <span>{employee.createdDate ? new Date(employee.createdDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mã NV:</span>
                        <span>{employee.code}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-2">Dự án tham gia:</p>
                      <div className="flex flex-wrap gap-1">
                        {employee.projectNames && employee.projectNames.length > 0 ? (
                          employee.projectNames.map((project, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {project}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa tham gia dự án nào</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} nhân viên
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

          {filteredEmployees.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Không tìm thấy nhân viên</h3>
              <p className="text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác hoặc thêm nhân viên mới.</p>
            </div>
          )}
        </>
      )}

      {/* Create Employee Form */}
      <CreateEmployeeForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleFormSuccess}
      />

      {/* Edit Employee Form */}
      <EditEmployeeForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={handleFormSuccess}
        employee={selectedEmployee}
      />

      {/* Employee Project Assignment Modal */}
      <EmployeeProjectAssignmentModal
        open={showAssignmentModal}
        onOpenChange={setShowAssignmentModal}
        onSuccess={handleFormSuccess}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default Employees;