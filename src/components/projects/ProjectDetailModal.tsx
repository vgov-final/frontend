import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Folder,
  User,
  Pencil,
  Save,
  X,
  Calendar,
  Mail,
  Code,
  Users,
  Clock,
  Tag,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Import services and types
import { projectService } from '@/services/projectService';
import { workloadValidationService, WorkloadInfo } from '@/services/workloadValidationService';
import { Project, ProjectMember, ProjectStatus, ProjectType } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Inline workload editing state
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [newWorkload, setNewWorkload] = useState<number>(0);
  const [updateReason, setUpdateReason] = useState('');
  const [workloadInfo, setWorkloadInfo] = useState<WorkloadInfo | null>(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    } else {
      // Reset state when modal closes
      setEditingMemberId(null);
    }
  }, [isOpen, projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details and members in parallel
      const [projectData, membersData] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectMembers(projectId)
      ]);

      setProject(projectData);
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Không thể tải thông tin dự án');
      toast.error('Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Closed: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ProjectStatus.InProgress: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ProjectStatus.Open: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ProjectStatus.Hold: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case ProjectStatus.Presale: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getTypeText = (type: ProjectType) => {
    switch (type) {
      case ProjectType.TM: return 'T&M';
      case ProjectType.Package: return 'Package';
      case ProjectType.OSDC: return 'OSDC';
      case ProjectType.Presale: return 'Presale';
      default: return 'Không xác định';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'pm': return 'Project Manager';
      case 'dev': return 'Developer';
      case 'ba': return 'Business Analyst';
      case 'test': return 'Tester';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditClick = async (member: ProjectMember) => {
    setEditingMemberId(member.id);
    setNewWorkload(member.workloadPercentage);
    setUpdateReason('');
    setWorkloadInfo(null);
    setLoadingWorkload(true);
    try {
      const info = await workloadValidationService.getUserWorkloadInfo(member.userId);
      setWorkloadInfo(info);
    } catch (error) {
      toast.error("Failed to load user's workload info.");
    } finally {
      setLoadingWorkload(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
  };

  const handleUpdateWorkload = async (member: ProjectMember) => {
    if (newWorkload <= 0 || newWorkload > 100) {
      toast.error('Workload must be between 0.01 and 100.');
      return;
    }

    setIsUpdating(true);
    try {
      await projectService.updateMemberWorkload(projectId, member.userId, {
        userId: member.userId,
        workloadPercentage: newWorkload,
        reason: updateReason,
      });
      toast.success('Workload updated successfully!');
      setEditingMemberId(null);
      fetchProjectDetails(); // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update workload.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            Chi tiết dự án
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và thành viên của dự án
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Đang tải thông tin dự án...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchProjectDetails} variant="outline">
              Thử lại
            </Button>
          </div>
        ) : project ? (
          <div className="space-y-6">
            {/* Project Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {project.projectName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Mã dự án:</span>
                      <span className="text-sm">{project.projectCode}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Loại:</span>
                      <span className="text-sm">{getTypeText(project.projectType)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">PM:</span>
                      <span className="text-sm text-blue-600">{project.pmEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Trạng thái:</span>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Ngày bắt đầu:</span>
                      <span className="text-sm">{formatDate(project.startDate)}</span>
                    </div>

                    {project.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Ngày kết thúc:</span>
                        <span className="text-sm">{formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {project.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Mô tả:</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {project.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Tạo lúc:</span>
                    <span className="text-xs">{project.createdAt ? formatDate(project.createdAt) : 'N/A'}</span>
                  </div>
                  
                  {project.createdBy && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Tạo bởi:</span>
                      <span className="text-xs text-blue-600">{project.createdBy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Project Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thành viên dự án ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{member.userFullName}</div>
                            <div className="text-xs text-gray-500">{member.userEmail}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {getRoleText(member.userRole)}
                            </div>
                          </div>
                        </div>

                        {editingMemberId === member.id ? (
                          <div className="flex-grow ml-4">
                            <div className="space-y-2">
                              <div>
                                <Input
                                  type="number"
                                  value={newWorkload}
                                  onChange={(e) => setNewWorkload(Number(e.target.value))}
                                  className="h-8"
                                  min="0.01"
                                  max="100"
                                  step="0.01"
                                />
                                {loadingWorkload ? <p className="text-xs text-gray-500 mt-1">Loading capacity...</p> :
                                  workloadInfo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Available: {workloadInfo.availableCapacity.toFixed(2)}%
                                    </p>
                                  )
                                }
                              </div>
                              <Textarea
                                placeholder="Reason for change (optional)"
                                value={updateReason}
                                onChange={(e) => setUpdateReason(e.target.value)}
                                className="h-16 text-xs"
                              />
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleUpdateWorkload(member)} disabled={isUpdating}>
                                  <Save className="h-3 w-3 mr-1" />
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {member.workloadPercentage}%
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                Joined: {formatDate(member.joinedDate)}
                              </div>
                            </div>
                            {user?.role === 'admin' && (
                              <Button size="icon" variant="ghost" onClick={() => handleEditClick(member)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có thành viên nào trong dự án</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                      <div className="text-xs text-gray-500">Thành viên</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {members.reduce((sum, member) => sum + member.workloadPercentage, 0)}%
                      </div>
                      <div className="text-xs text-gray-500">Tổng workload</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(members.reduce((sum, member) => sum + member.workloadPercentage, 0) / members.length)}%
                      </div>
                      <div className="text-xs text-gray-500">Workload TB</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
