import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3
} from 'lucide-react';

// Import workload components
import { WorkloadDashboard } from '@/components/workload/WorkloadDashboard';
import { WorkloadChart } from '@/components/workload/WorkloadChart';
import { WorkloadAnalytics } from '@/components/workload/WorkloadAnalytics';
import { WorkloadValidation } from '@/components/workload/WorkloadValidation';

// Import workload service
import { workloadService } from '@/services/workloadService';

const WorkloadPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <p className="text-muted-foreground">
            Chỉ số khôi lượng công việc của nhân viên
          </p>
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users, projects, or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Charts
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab - Main workload overview */}
        <TabsContent value="dashboard" className="space-y-6">
          <WorkloadDashboard />
        </TabsContent>

        {/* Analytics Tab - Detailed analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <WorkloadAnalytics />
        </TabsContent>

        {/* Validation Tab - Workload validation tools */}
        <TabsContent value="validation" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardContent className="pt-6">
                <WorkloadValidation userId={1} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab - Visual representations */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardContent className="pt-6">
                <WorkloadChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkloadPage;
