import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { workloadService } from '@/services/workloadService';
import { ValidationResponse, WorkloadResponse } from '@/types/workload';
import { toast } from 'sonner';

export interface UseWorkloadValidationOptions {
  onValidationSuccess?: (result: ValidationResponse) => void;
  onValidationError?: (error: Error) => void;
  showToast?: boolean;
}

export interface WorkloadValidationState {
  isValidating: boolean;
  validationResult: ValidationResponse | null;
  error: Error | null;
}

export function useWorkloadValidation(options: UseWorkloadValidationOptions = {}) {
  const { onValidationSuccess, onValidationError, showToast = true } = options;
  
  const [validationState, setValidationState] = useState<WorkloadValidationState>({
    isValidating: false,
    validationResult: null,
    error: null
  });

  // Mutation for workload validation
  const validationMutation = useMutation({
    mutationFn: async ({ userId, projectId, percentage }: {
      userId: number;
      projectId: number;
      percentage: number;
    }) => {
      return await workloadService.validateWorkload(userId, projectId, percentage);
    },
    onMutate: () => {
      setValidationState(prev => ({
        ...prev,
        isValidating: true,
        error: null
      }));
    },
    onSuccess: (result) => {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        validationResult: result,
        error: null
      }));

      if (showToast) {
        if (result.isValid) {
          toast.success('Workload validation passed');
        } else {
          toast.error(result.message || 'Workload validation failed');
        }
      }

      onValidationSuccess?.(result);
    },
    onError: (error: Error) => {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        error
      }));

      if (showToast) {
        toast.error(`Validation failed: ${error.message}`);
      }

      onValidationError?.(error);
    }
  });

  // Function to validate workload
  const validateWorkload = useCallback(
    (userId: number, projectId: number, percentage: number) => {
      if (percentage < 0 || percentage > 100) {
        const error = new Error('Workload percentage must be between 0 and 100');
        setValidationState(prev => ({
          ...prev,
          error,
          validationResult: null
        }));
        
        if (showToast) {
          toast.error(error.message);
        }
        
        onValidationError?.(error);
        return;
      }

      validationMutation.mutate({ userId, projectId, percentage });
    },
    [validationMutation, showToast, onValidationError]
  );

  // Function to clear validation state
  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      validationResult: null,
      error: null
    });
  }, []);

  // Function to check if workload is valid
  const isWorkloadValid = useCallback((currentWorkload: number, additionalWorkload: number): boolean => {
    return (currentWorkload + additionalWorkload) <= 100;
  }, []);

  // Function to calculate available capacity
  const getAvailableCapacity = useCallback((currentWorkload: number): number => {
    return Math.max(0, 100 - currentWorkload);
  }, []);

  // Function to get validation message
  const getValidationMessage = useCallback((
    currentWorkload: number, 
    requestedWorkload: number
  ): { isValid: boolean; message: string; severity: 'success' | 'warning' | 'error' } => {
    const totalWorkload = currentWorkload + requestedWorkload;
    
    if (totalWorkload <= 80) {
      return {
        isValid: true,
        message: `Good workload distribution (${totalWorkload}%)`,
        severity: 'success'
      };
    } else if (totalWorkload <= 100) {
      return {
        isValid: true,
        message: `High workload but acceptable (${totalWorkload}%)`,
        severity: 'warning'
      };
    } else {
      return {
        isValid: false,
        message: `Workload exceeds 100% (${totalWorkload}%)`,
        severity: 'error'
      };
    }
  }, []);

  return {
    // State
    ...validationState,
    
    // Actions
    validateWorkload,
    clearValidation,
    
    // Utilities
    isWorkloadValid,
    getAvailableCapacity,
    getValidationMessage,
    
    // Mutation state
    isLoading: validationMutation.isPending,
    isError: validationMutation.isError,
    isSuccess: validationMutation.isSuccess
  };
}

// Hook for getting user workload data
export function useUserWorkload(userId: number | null, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['userWorkload', userId],
    queryFn: () => workloadService.getUserWorkload(userId!),
    enabled: !!userId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

// Hook for real-time workload validation during form input
export function useRealTimeWorkloadValidation(userId: number | null) {
  const { data: userWorkload, isLoading } = useUserWorkload(userId);
  
  const validateInRealTime = useCallback((requestedPercentage: number) => {
    if (!userWorkload || isLoading) {
      return {
        isValid: true,
        message: 'Loading workload data...',
        severity: 'warning' as const
      };
    }

    const currentWorkload = userWorkload.totalWorkload;
    return {
      isValid: isWorkloadValid(currentWorkload, requestedPercentage),
      message: getValidationMessage(currentWorkload, requestedPercentage).message,
      severity: getValidationMessage(currentWorkload, requestedPercentage).severity,
      currentWorkload,
      availableCapacity: getAvailableCapacity(currentWorkload),
      totalAfterAssignment: currentWorkload + requestedPercentage
    };
  }, [userWorkload, isLoading]);

  const { isWorkloadValid, getValidationMessage, getAvailableCapacity } = useWorkloadValidation();

  return {
    userWorkload,
    isLoading,
    validateInRealTime,
    currentWorkload: userWorkload?.totalWorkload || 0,
    availableCapacity: userWorkload ? getAvailableCapacity(userWorkload.totalWorkload) : 100,
    isOverloaded: userWorkload?.isOverloaded || false
  };
}