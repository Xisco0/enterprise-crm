import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 
    | 'default' 
    | 'secondary' 
    | 'success' 
    | 'warning' 
    | 'destructive' 
    | 'outline' 
    | 'info' 
    | 'purple' 
    | 'teal';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-900 text-white border-slate-900',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
    destructive: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold font-sans tracking-tight transition-colors select-none shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

