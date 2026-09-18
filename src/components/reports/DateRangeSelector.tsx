'use client';

import React, { useState } from 'react';
import { DateRangePreset } from '@/lib/utils/date-range';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Filter, ArrowRight } from 'lucide-react';

interface DateRangeSelectorProps {
  currentPreset: DateRangePreset;
  currentFrom?: string;
  currentTo?: string;
  currentStaffId?: string;
  staffList?: Array<{ id: string; name: string; email: string }>;
  showStaffFilter?: boolean;
  onFilterChange: (params: { preset: DateRangePreset; from?: string; to?: string; staffId?: string }) => void;
  periodLabel: string;
}

const PRESET_OPTIONS: Array<{ key: DateRangePreset; label: string }> = [
  { key: 'TODAY', label: 'Today' },
  { key: 'YESTERDAY', label: 'Yesterday' },
  { key: 'THIS_WEEK', label: 'This Week' },
  { key: 'LAST_WEEK', label: 'Last Week' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'LAST_MONTH', label: 'Last Month' },
  { key: 'THIS_QUARTER', label: 'This Quarter' },
  { key: 'THIS_YEAR', label: 'This Year' },
  { key: 'CUSTOM', label: 'Custom Range' },
];

export function DateRangeSelector({
  currentPreset,
  currentFrom,
  currentTo,
  currentStaffId = 'ALL',
  staffList = [],
  showStaffFilter = false,
  onFilterChange,
  periodLabel,
}: DateRangeSelectorProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(currentPreset === 'CUSTOM');
  const [customFrom, setCustomFrom] = useState(currentFrom || '');
  const [customTo, setCustomTo] = useState(currentTo || '');
  const [selectedStaff, setSelectedStaff] = useState(currentStaffId);

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'CUSTOM') {
      setIsCustomOpen(true);
    } else {
      setIsCustomOpen(false);
      onFilterChange({
        preset,
        staffId: selectedStaff,
      });
    }
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      onFilterChange({
        preset: 'CUSTOM',
        from: customFrom,
        to: customTo,
        staffId: selectedStaff,
      });
    }
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value;
    setSelectedStaff(staffId);
    onFilterChange({
      preset: currentPreset,
      from: currentFrom,
      to: currentTo,
      staffId,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Preset Button Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_OPTIONS.map((opt) => {
            const isSelected = currentPreset === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handlePresetSelect(opt.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Staff Filter (Admin-only) */}
        {showStaffFilter && staffList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-400" /> Staff:
            </span>
            <select
              value={selectedStaff}
              onChange={handleStaffChange}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Team Members</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Custom Range Expansion & Current Interval Pill */}
      <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* Active Period Label */}
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="h-4 w-4 text-brand-600" />
          <span>Active Period:</span>
          <Badge variant="outline" className="bg-slate-50 text-slate-900 border-slate-300 font-mono font-semibold text-[11px]">
            {periodLabel}
          </Badge>
        </div>

        {/* Custom Range Inputs */}
        {isCustomOpen && (
          <form onSubmit={handleCustomApply} className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">From:</span>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                required
                className="h-7 text-xs w-36 px-2"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">To:</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                required
                className="h-7 text-xs w-36 px-2"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-7 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              Apply <ArrowRight className="w-3 h-3 ml-1 inline" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
