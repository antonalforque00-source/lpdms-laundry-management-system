import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
    error: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function StatusBadge({ status, className }: { status: OrderStatus, className?: string }) {
  let variant: BadgeProps['variant'] = 'default';
  
  if (status.includes('Delivered') || status === 'Ready for Delivery') variant = 'success';
  else if (status.includes('Pending') || status.includes('Scheduled')) variant = 'warning';
  else if (status.includes('Assigned') || status.includes('Out for') || status.includes('Picked Up') || status === 'Arrived at Facility') variant = 'info';
  else variant = 'default';

  return <Badge variant={variant} className={className}>{status}</Badge>;
}
