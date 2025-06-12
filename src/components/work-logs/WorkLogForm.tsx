import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateWorkLogRequest, UpdateWorkLogRequest, WorkLog } from '@/types/workLog';

// Validation schema
const workLogSchema = z.object({
  projectId: z.number().min(1, 'Vui lòng chọn dự án'),
  workDate: z.string().min(1, 'Vui lòng chọn ngày làm việc'),
  hoursWorked: z.number({
    required_error: 'Vui lòng nhập số giờ làm việc',
    invalid_type_error: 'Số giờ phải là một số hợp lệ'
  })
    .min(0.1, 'Số giờ phải lớn hơn 0')
    .max(24, 'Số giờ không được vượt quá 24'),
  taskFeature: z.string().min(1, 'Vui lòng nhập tên task/feature'),
  workDescription: z.string().min(10, 'Mô tả công việc phải có ít nhất 10 ký tự'),
});

type FormData = z.infer<typeof workLogSchema>;

interface Project {
  id: number;
  name: string;
  projectCode: string;
}

interface WorkLogFormProps {
  initialData?: WorkLog;
  projects: Project[];
  onSubmit: (data: CreateWorkLogRequest | UpdateWorkLogRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  initialData,
  projects,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(workLogSchema),
    mode: 'onSubmit', // Only validate on submit, not while typing
    defaultValues: {
      projectId: initialData?.projectId || 0,
      workDate: initialData?.workDate || new Date().toISOString().split('T')[0],
      hoursWorked: initialData?.hoursWorked || 8,
      taskFeature: initialData?.taskFeature || '',
      workDescription: initialData?.workDescription || '',
    },
  });

  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        form.reset();
      }
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Form submission error:', error);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Tạo Work Log mới' : 'Chỉnh sửa Work Log'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Điền thông tin chi tiết về công việc đã thực hiện'
            : 'Cập nhật thông tin work log của bạn'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Dự án <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ''}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {project.projectCode}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Work Date */}
              <FormField
                control={form.control}
                name="workDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Ngày làm việc <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              formatDateForDisplay(field.value)
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(formatDateForInput(date));
                              setCalendarOpen(false);
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Chọn ngày bạn thực hiện công việc này
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hours Worked */}
              <FormField
                control={form.control}
                name="hoursWorked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Số giờ làm việc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.1"
                        max="24"
                        placeholder="8"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseFloat(value) || '');
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Số giờ bạn đã làm việc (tối đa 24 giờ)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Task/Feature */}
            <FormField
              control={form.control}
              name="taskFeature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Task/Feature <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Phát triển tính năng đăng nhập"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên task hoặc feature bạn đã làm việc
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Description */}
            <FormField
              control={form.control}
              name="workDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Mô tả công việc <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết những gì bạn đã làm..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết về công việc đã thực hiện (tối thiểu 10 ký tự)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Tạo Work Log' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
