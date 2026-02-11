'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export type SectionStatus = 'complete' | 'incomplete' | 'error' | 'pending';

interface SectionStatusIndicatorProps {
  status: SectionStatus;
  message?: string;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function SectionStatusIndicator({ 
  status, 
  message, 
  className,
  showIcon = true,
  showText = true
}: SectionStatusIndicatorProps) {
  const statusConfig = {
    complete: {
      icon: CheckCircle,
      text: 'Complete',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    incomplete: {
      icon: AlertCircle,
      text: 'Incomplete',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    error: {
      icon: XCircle,
      text: 'Error',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    pending: {
      icon: Clock,
      text: 'Pending',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center space-x-2 px-2 py-1 rounded-md border text-sm",
      config.color,
      config.bgColor,
      config.borderColor,
      className
    )}>
      {showIcon && <Icon className="h-4 w-4" />}
      {showText && (
        <span className="font-medium">
          {message || config.text}
        </span>
      )}
    </div>
  );
}

interface SectionValidationFeedbackProps {
  errors?: string[];
  warnings?: string[];
  className?: string;
}

export function SectionValidationFeedback({ 
  errors = [], 
  warnings = [], 
  className 
}: SectionValidationFeedbackProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center mb-2">
            <XCircle className="h-4 w-4 text-red-600 mr-2" />
            <h4 className="text-sm font-medium text-red-800">
              {errors.length === 1 ? 'Error' : `${errors.length} Errors`}
            </h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <h4 className="text-sm font-medium text-yellow-800">
              {warnings.length === 1 ? 'Warning' : `${warnings.length} Warnings`}
            </h4>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}