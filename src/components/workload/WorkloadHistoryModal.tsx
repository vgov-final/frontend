import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, AlertTriangle, ArrowRight } from 'lucide-react';

import { projectService } from '@/services/projectService';
import { WorkloadHistory } from '@/types/api';

interface WorkloadHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  projectId: number;
  projectName: string;
  userName: string;
}

export function WorkloadHistoryModal({ isOpen, onClose, userId, projectId, projectName, userName }: WorkloadHistoryModalProps) {
  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workloadHistory', projectId, userId],
    queryFn: () => projectService.getMemberWorkloadHistory(projectId, userId),
    enabled: isOpen,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử thay đổi Workload
          </DialogTitle>
          <DialogDescription>
            Lịch sử thay đổi cho thành viên <strong>{userName}</strong> trong dự án <strong>{projectName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Không thể tải lịch sử thay đổi.
              </AlertDescription>
            </Alert>
          ) : !history || history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Không có lịch sử thay đổi nào được tìm thấy.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người thay đổi</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Lý do</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.changeTimestamp)}</TableCell>
                    <TableCell>{item.changedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.oldWorkloadPercentage}%</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge>{item.newWorkloadPercentage}%</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{item.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}