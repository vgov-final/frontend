import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Briefcase,
  Eye
} from 'lucide-react';
import { WorkloadDistributionItem } from '@/types/workload';
import { cn } from '@/lib/utils';

interface WorkloadCardProps {
  user: WorkloadDistributionItem;
  onViewDetails?: (userId: number) => void;
  showActions?: boolean;
}

export function WorkloadCard({ user, onViewDetails, showActions = true }: WorkloadCardProps) {
  const getWorkloadStatus = (workload: number) => {
    if (workload > 100) return { status: 'overloaded', color: 'destructive', icon: AlertTriangle };
    if (workload >= 80) return { status: 'high', color: 'warning', icon: Clock };
    if (workload >= 60) return { status: 'normal', color: 'success', icon: CheckCircle };
    return { status: 'low', color: 'secondary', icon: User };
  };

  const { status, color, icon: StatusIcon } = getWorkloadStatus(user.totalWorkload);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'dev': 'bg-blue-100 text-blue-800',
      'ba': 'bg-green-100 text-green-800',
      'test': 'bg-yellow-100 text-yellow-800',
      'pm': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (workload: number) => {
    if (workload > 100) return 'bg-red-500';
    if (workload >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      user.isOverloaded && "border-destructive/50 bg-destructive/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/avatars/${user.userId}.jpg`} alt={user.fullName} />
              <AvatarFallback className="text-sm font-medium">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium leading-none">
                {user.fullName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getRoleColor(user.role)} variant="secondary">
              {user.role.toUpperCase()}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <StatusIcon 
                    className={cn(
                      "h-4 w-4",
                      status === 'overloaded' && "text-destructive",
                      status === 'high' && "text-yellow-500",
                      status === 'normal' && "text-green-500",
                      status === 'low' && "text-muted-foreground"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {status === 'overloaded' && 'Overloaded - Above 100%'}
                    {status === 'high' && 'High workload - 80-100%'}
                    {status === 'normal' && 'Normal workload - 60-80%'}
                    {status === 'low' && 'Low workload - Below 60%'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workload Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Workload</span>
            <span className={cn(
              "font-medium",
              user.totalWorkload > 100 && "text-destructive",
              user.totalWorkload >= 80 && user.totalWorkload <= 100 && "text-yellow-600",
              user.totalWorkload < 80 && "text-green-600"
            )}>
              {user.totalWorkload}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(user.totalWorkload, 100)} 
              className="h-2"
            />
            {user.totalWorkload > 100 && (
              <div 
                className="absolute top-0 left-0 h-2 bg-red-500 rounded-full"
                style={{ width: `${Math.min((user.totalWorkload / 120) * 100, 100)}%` }}
              />
            )}
          </div>
        </div>

        {/* Project Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Projects</span>
          </div>
          <span className="font-medium">{user.projectCount}</span>
        </div>

        {/* Project List */}
        {user.projects && user.projects.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Current Projects:
            </div>
            <div className="space-y-1">
              {user.projects.slice(0, 3).map((project) => (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                >
                  <span className="truncate flex-1 mr-2">
                    {project.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {project.workloadPercentage}%
                  </Badge>
                </div>
              ))}
              {user.projects.length > 3 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{user.projects.length - 3} more projects
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capacity Status */}
        <div className={cn(
          "p-3 rounded-lg text-sm",
          user.isOverloaded 
            ? "bg-destructive/10 text-destructive" 
            : user.totalWorkload >= 80 
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700"
        )}>
          {user.isOverloaded ? (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Overloaded by {user.totalWorkload - 100}%</span>
            </div>
          ) : user.totalWorkload >= 80 ? (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Near capacity ({100 - user.totalWorkload}% available)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Available capacity: {100 - user.totalWorkload}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(user.userId)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}