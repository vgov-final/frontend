import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  CheckCircle,
  XCircle,
  User,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

// Import services and types
import { projectService } from '@/services/projectService';
import { workloadValidationService, WorkloadInfo } from '@/services/workloadValidationService';
import { userService } from '@/services/userService';
import { ProjectMember, UserWorkload } from '@/types/api';

interface ProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  mode: 'add' | 'edit';
  selectedMember?: ProjectMember;
  onSuccess: () => void;
}

const ProjectMemberModal: React.FC<ProjectMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  mode,
  selectedMember,
  onSuccess
}) => {
  // Form state
  const [userId, setUserId] = useState<number>(selectedMember?.userId || 0);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(
    selectedMember?.workloadPercentage || 100
  );
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  // Workload validation state
  const [workloadInfo, setWorkloadInfo] = useState<WorkloadInfo | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  // Fetch project members
  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    try {
      const membersList = await projectService.getProjectMembers(projectId);
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && selectedMember) {
        setUserId(selectedMember.userId);
        setWorkloadPercentage(selectedMember.workloadPercentage);
      } else {
        setUserId(0);
        setWorkloadPercentage(100);
      }
    }
  }, [isOpen, mode, selectedMember]);

  // Fetch user workload information when userId changes
  useEffect(() => {
    if (userId && userId > 0) {
      fetchUserWorkload();
    } else {
      setWorkloadInfo(null);
      setValidationError('');
    }
  }, [userId]);

  // Validate workload when percentage changes
  useEffect(() => {
    if (userId && workloadPercentage && workloadInfo) {
      validateWorkload();
    }
  }, [workloadPercentage, workloadInfo, userId]);

  const fetchUserWorkload = async () => {
    try {
      setLoadingWorkload(true);
      const workloadInfoData = await workloadValidationService.getUserWorkloadInfo(userId);
      setWorkloadInfo(workloadInfoData);
    } catch (error) {
      console.error('Error fetching user workload:', error);
      setWorkloadInfo(null);
    } finally {
      setLoadingWorkload(false);
    }
  };

  const validateWorkload = async () => {
    if (!workloadInfo || !workloadPercentage) {
      setValidationError('');
      return;
    }

    try {
      if (mode === 'edit' && selectedMember) {
        // For edit mode, exclude current project workload from validation
        const isValid = await workloadValidationService.validateWorkloadUpdate(
          userId,
          selectedMember.workloadPercentage,
          workloadPercentage
        );
        if (!isValid.isValid) {
          setValidationError(isValid.errorMessage || 'Workload validation failed');
        } else {
          setValidationError('');
        }
      } else {
        // For add mode, validate new workload addition
        const isValid = await workloadValidationService.validateWorkloadAddition(
          userId,
          workloadPercentage
        );
        if (!isValid.isValid) {
          setValidationError(isValid.errorMessage || 'Workload validation failed');
        } else {
          setValidationError('');
        }
      }
    } catch (error) {
      setValidationError('Error validating workload');
    }
  };

  const handleSubmit = async () => {
    if (!userId || workloadPercentage <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (workloadPercentage < 0.01 || workloadPercentage > 100) {
      toast.error('Workload percentage must be between 0.01 and 100');
      return;
    }

    // Check for validation errors
    if (validationError) {
      toast.error('Please fix workload validation errors before submitting');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'add') {
        await projectService.addProjectMember(projectId, {
          userId,
          workloadPercentage
        });
        toast.success('Member added successfully');
      } else if (mode === 'edit' && selectedMember) {
        await projectService.updateMemberWorkload(projectId, selectedMember.userId, {
          userId: selectedMember.userId,
          workloadPercentage
        });
        toast.success('Member workload updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      // Handle backend workload validation errors
      if (error instanceof Error && error.message.includes('workload')) {
        toast.error(`Workload Error: ${error.message}`);
      } else {
        toast.error(error instanceof Error ? error.message : 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      await projectService.removeMemberFromProject(projectId, selectedMember.userId);
      toast.success('Member removed successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = userId && workloadPercentage > 0 && !validationError && !loadingWorkload;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {mode === 'add' ? 'Add Member' : 'Edit Member'} - {projectName}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Add a new member to this project with workload validation'
              : 'Update member workload assignment with validation'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="userId" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User ID
            </Label>
            <Input
              id="userId"
              type="number"
              placeholder="Enter user ID"
              value={userId || ''}
              onChange={(e) => setUserId(Number(e.target.value))}
              disabled={mode === 'edit'}
            />
            {mode === 'edit' && selectedMember && (
              <div className="text-sm text-muted-foreground">
                Current user: {selectedMember.userFullName || 'Unknown'} ({selectedMember.userEmail || 'No email'})
              </div>
            )}
          </div>

          {/* Workload Allocation */}
          <div className="space-y-2">
            <Label htmlFor="workload" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Workload Allocation (%)
            </Label>
            <Input
              id="workload"
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              placeholder="Enter workload percentage (0.01-100)"
              value={workloadPercentage || ''}
              onChange={(e) => setWorkloadPercentage(Number(e.target.value))}
              className={validationError ? 'border-red-500' : ''}
            />
            
            {/* User Workload Information */}
            {userId && userId > 0 && (
              <div className="mt-3 space-y-2">
                {loadingWorkload ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground bg-muted/50 rounded-md">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading workload information...
                  </div>
                ) : workloadInfo ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">User Workload Status:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Current Workload:</span>
                        <span className={`font-medium ${
                          workloadValidationService.getWorkloadStatusColor(workloadInfo.currentWorkload) === 'success' ? 'text-green-600' :
                          workloadValidationService.getWorkloadStatusColor(workloadInfo.currentWorkload) === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {workloadInfo.currentWorkload.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Capacity:</span>
                        <span className="font-medium text-green-600">
                          {workloadInfo.availableCapacity.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Projects:</span>
                        <span className="font-medium">{workloadInfo.activeProjectCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${workloadInfo.isOverloaded ? 'text-red-600' : 'text-green-600'}`}>
                          {workloadInfo.isOverloaded ? 'Overloaded' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Unable to load workload information
                  </div>
                )}
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="leading-relaxed">{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Workload Warning */}
            {workloadInfo && workloadPercentage && !validationError &&
             workloadValidationService.isApproachingLimit(
               mode === 'edit' && selectedMember
                 ? workloadInfo.currentWorkload - selectedMember.workloadPercentage + workloadPercentage
                 : workloadInfo.currentWorkload + workloadPercentage
             ) && (
              <Alert className="mt-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="leading-relaxed">
                  Warning: This allocation will bring the user close to their workload limit.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Current Project Members */}
          {members && members.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Current Project Members ({members.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>
                        {member.userFullName || `User ${member.userId}`}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {member.workloadPercentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && (
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Remove Member
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {mode === 'add' ? 'Add Member' : 'Update Member'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMemberModal;