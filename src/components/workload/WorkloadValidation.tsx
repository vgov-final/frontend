import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Calculator,
  TrendingUp,
  Info
} from 'lucide-react';
import { useRealTimeWorkloadValidation } from '@/hooks/useWorkloadValidation';
import { cn } from '@/lib/utils';

interface WorkloadValidationProps {
  userId: number | null;
  projectId?: number;
  initialPercentage?: number;
  onValidationChange?: (isValid: boolean, details: any) => void;
  showUserInfo?: boolean;
  className?: string;
}

export function WorkloadValidation({
  userId,
  projectId,
  initialPercentage = 0,
  onValidationChange,
  showUserInfo = true,
  className
}: WorkloadValidationProps) {
  const [requestedPercentage, setRequestedPercentage] = useState(initialPercentage);
  const [debouncedPercentage, setDebouncedPercentage] = useState(initialPercentage);

  const {
    userWorkload,
    isLoading,
    validateInRealTime,
    currentWorkload,
    availableCapacity,
    isOverloaded
  } = useRealTimeWorkloadValidation(userId);

  // Debounce the percentage input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPercentage(requestedPercentage);
    }, 300);

    return () => clearTimeout(timer);
  }, [requestedPercentage]);

  // Get validation result
  const validationResult = validateInRealTime(debouncedPercentage);

  // Notify parent component of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationResult.isValid, {
        ...validationResult,
        requestedPercentage: debouncedPercentage
      });
    }
  }, [validationResult, debouncedPercentage, onValidationChange]);

  const getStatusIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-destructive bg-destructive/5';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  if (!userId) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <User className="h-8 w-8 mr-2" />
            <span>Select a user to validate workload</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Loading workload data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Workload Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Current Workload Info */}
        {showUserInfo && userWorkload && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Workload</span>
              <Badge 
                variant={isOverloaded ? "destructive" : currentWorkload >= 80 ? "secondary" : "outline"}
              >
                {currentWorkload}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(currentWorkload, 100)} 
              className="h-2"
            />
            {currentWorkload > 100 && (
              <div className="text-xs text-destructive">
                Currently overloaded by {currentWorkload - 100}%
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Available Capacity:</span>
                <span className="ml-2 font-medium">{availableCapacity}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Active Projects:</span>
                <span className="ml-2 font-medium">{userWorkload.projectAssignments?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Workload Input */}
        <div className="space-y-3">
          <Label htmlFor="workload-percentage">Requested Workload Percentage</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="workload-percentage"
              type="number"
              min="0"
              max="100"
              value={requestedPercentage}
              onChange={(e) => setRequestedPercentage(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <div className="flex-1">
              <Progress 
                value={Math.min(requestedPercentage, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Validation Result */}
        {debouncedPercentage > 0 && (
          <Alert className={getStatusColor(validationResult.severity)}>
            <div className="flex items-start space-x-2">
              {getStatusIcon(validationResult.severity)}
              <div className="flex-1">
                <AlertDescription>
                  <div className="font-medium mb-2">{validationResult.message}</div>
                  
                  {/* Calculation Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="ml-2 font-medium">{validationResult.currentWorkload}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested:</span>
                        <span className="ml-2 font-medium">{debouncedPercentage}%</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between font-medium">
                      <span>Total after assignment:</span>
                      <span className={cn(
                        validationResult.totalAfterAssignment > 100 ? "text-destructive" : 
                        validationResult.totalAfterAssignment >= 80 ? "text-yellow-600" : 
                        "text-green-600"
                      )}>
                        {validationResult.totalAfterAssignment}%
                      </span>
                    </div>
                    
                    <Progress 
                      value={Math.min(validationResult.totalAfterAssignment, 100)} 
                      className="h-2"
                    />
                    
                    {validationResult.totalAfterAssignment > 100 && (
                      <div className="text-xs text-destructive">
                        Exceeds capacity by {validationResult.totalAfterAssignment - 100}%
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Recommendations */}
        {debouncedPercentage > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </h4>
            
            <div className="space-y-2 text-sm">
              {validationResult.totalAfterAssignment > 100 ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="font-medium text-destructive mb-1">Assignment Not Recommended</p>
                  <ul className="list-disc list-inside space-y-1 text-destructive/80">
                    <li>Consider reducing the workload percentage to {availableCapacity}% or less</li>
                    <li>Review existing project assignments for potential adjustments</li>
                    <li>Consider extending project timeline or redistributing tasks</li>
                  </ul>
                </div>
              ) : validationResult.totalAfterAssignment >= 90 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800 mb-1">High Workload Warning</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>User will be near maximum capacity</li>
                    <li>Monitor for potential burnout or quality issues</li>
                    <li>Ensure adequate buffer for urgent tasks</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800 mb-1">Assignment Looks Good</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Workload is within acceptable limits</li>
                    <li>User has {100 - validationResult.totalAfterAssignment}% remaining capacity</li>
                    <li>Good balance for productivity and flexibility</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {debouncedPercentage > 0 && availableCapacity < debouncedPercentage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestedPercentage(availableCapacity)}
            >
              Use Max Available ({availableCapacity}%)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestedPercentage(Math.floor(availableCapacity / 2))}
            >
              Use Half Available ({Math.floor(availableCapacity / 2)}%)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}