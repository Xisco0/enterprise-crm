import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  iconColor?: 'slate' | 'brand' | 'emerald' | 'amber' | 'rose' | 'purple' | 'sky';
  badgeStyle?: 'trend' | 'pill' | 'warning';
  className?: string;
}

const iconColorMap = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-blue-50 text-blue-700 border-blue-200',
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function StatCard({
  title,
  value,
  subtitle,
  change,
  trend,
  icon: Icon,
  iconColor = 'sky',
  badgeStyle = 'trend',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-sky-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-sans">
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105',
              iconColorMap[iconColor]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-sans transition-colors',
              badgeStyle === 'warning'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : badgeStyle === 'pill'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2'
                : trend === 'up'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            )}
          >
            {badgeStyle === 'trend' && trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {badgeStyle === 'trend' && trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {badgeStyle === 'trend' && trend === 'neutral' && <Minus className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-600 font-sans font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

