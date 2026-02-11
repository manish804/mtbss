"use client";

import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const leaveSchema = z.object({
  leaveType: z.enum(['CASUAL', 'PAID', 'COMP_OFF']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(1, 'Reason is required'),
  isHalfDay: z.boolean().default(false),
  isPaidLeave: z.boolean().default(true),
  confirmLeave: z.enum(['YES', 'NO', 'DONT_KNOW']).default('DONT_KNOW')
});

type LeaveForm = z.infer<typeof leaveSchema>;
type LeaveType = LeaveForm["leaveType"];
type ConfirmLeave = LeaveForm["confirmLeave"];

interface LeaveFormProps {
  employeeId: string;
  onSuccess: () => void;
}

export const LeaveFormComponent = memo(function LeaveFormComponent({
  employeeId,
  onSuccess,
}: LeaveFormProps) {
  const { toast } = useToast();
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors, isSubmitting }
  } = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { 
      isHalfDay: false, 
      isPaidLeave: true, 
      confirmLeave: 'DONT_KNOW' 
    }
  });

  const isHalfDay = watch('isHalfDay');
  const startDate = watch('startDate');

  const isLeaveType = (value: string): value is LeaveType => {
    return value === "CASUAL" || value === "PAID" || value === "COMP_OFF";
  };

  const isConfirmLeave = (value: string): value is ConfirmLeave => {
    return value === "YES" || value === "NO" || value === "DONT_KNOW";
  };

  const onSubmit = useCallback(async (data: LeaveForm) => {
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, employeeId })
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully!",
          variant: "default"
        });
        onSuccess();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit leave request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit leave request',
        variant: "destructive"
      });
    }
  }, [employeeId, onSuccess, toast]);

  const handleHalfDayChange = useCallback((checked: boolean) => {
    setValue('isHalfDay', checked);
    if (checked && startDate) {
      setValue('endDate', startDate);
    }
  }, [setValue, startDate]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Leave Type */}
      <div className="space-y-2">
        <Label>Leave Type</Label>
        <Select
          onValueChange={(value) => {
            if (isLeaveType(value)) {
              setValue("leaveType", value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASUAL">Casual Leave</SelectItem>
            <SelectItem value="PAID">Paid Leave</SelectItem>
            <SelectItem value="COMP_OFF">Comp Off</SelectItem>
          </SelectContent>
        </Select>
        {errors.leaveType && (
          <p className="text-red-500 text-sm">{errors.leaveType.message}</p>
        )}
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            disabled={isHalfDay}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          {...register('reason')}
          placeholder="Enter reason for leave"
          rows={3}
        />
        {errors.reason && (
          <p className="text-red-500 text-sm">{errors.reason.message}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isHalfDay"
            onCheckedChange={handleHalfDayChange}
          />
          <Label htmlFor="isHalfDay">Half Day</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPaidLeave"
            defaultChecked
            onCheckedChange={(checked) => setValue('isPaidLeave', !!checked)}
          />
          <Label htmlFor="isPaidLeave">Paid Leave</Label>
        </div>
      </div>

      {/* Confirmation */}
      <div className="space-y-2">
        <Label>Confirm Leave</Label>
        <Select 
          onValueChange={(value) => {
            if (isConfirmLeave(value)) {
              setValue("confirmLeave", value);
            }
          }}
          defaultValue="DONT_KNOW"
        >
          <SelectTrigger>
            <SelectValue placeholder="Confirm your leave" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YES">Yes, I confirm</SelectItem>
            <SelectItem value="NO">No, I don&apos;t confirm</SelectItem>
            <SelectItem value="DONT_KNOW">Not sure yet</SelectItem>
          </SelectContent>
        </Select>
        {errors.confirmLeave && (
          <p className="text-red-500 text-sm">{errors.confirmLeave.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
      </Button>
    </form>
  );
});
