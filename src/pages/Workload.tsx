import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

// Import workload components
import { WorkloadDashboard } from '@/components/workload/WorkloadDashboard';

// Import workload service
import { workloadService } from '@/services/workloadService';

const WorkloadPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch workload analytics for quick actions
  const { 
    data: backendAnalytics, 
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['workloadAnalytics'],
    queryFn: () => workloadService.getWorkloadAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000
  });

  const handleRefresh = () => {
    refetchAnalytics();
  };

  const handleExportData = () => {
    if (!backendAnalytics) {
      console.warn('No data available for export');
      return;
    }
    
    // Create CSV data from analytics
    const csvData = [
      ['User', 'Email', 'Total Workload (%)', 'Active Projects'],
      ...backendAnalytics.topWorkloadUsers.map(user => [
        user.userName,
        user.email,
        user.totalWorkload.toString(),
        user.projectCount.toString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workload-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Workload</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={analyticsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={!backendAnalytics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}

      {/* System Alerts */}
      {backendAnalytics && backendAnalytics.topWorkloadUsers.some(u => u.totalWorkload > 100) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{backendAnalytics.topWorkloadUsers.filter(u => u.totalWorkload > 100).length} team members</strong> are currently overloaded. 
            Review workload distribution in the Dashboard tab.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      {/* Main Content */}
      <div className="space-y-6">
        <WorkloadDashboard />
      </div>
    </div>
  );
};

export default WorkloadPage;
