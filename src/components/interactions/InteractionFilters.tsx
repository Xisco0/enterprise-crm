'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { INTERACTION_TYPE_CONFIG } from '@/lib/constants';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface InteractionFiltersProps {
  basePath: '/admin/interactions' | '/staff/interactions';
  staffMembers?: Array<{ id: string; name: string; email: string }>;
  isAdmin?: boolean;
}

export function InteractionFilters({
  basePath,
  staffMembers = [],
  isAdmin = false,
}: InteractionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'ALL';
  const performedBy = searchParams.get('performed_by') || 'ALL';

  const [searchInput, setSearchInput] = React.useState(search);

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'ALL' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleReset = () => {
    setSearchInput('');
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    search || (type && type !== 'ALL') || (performedBy && performedBy !== 'ALL')
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search activities (number, subject, notes, entity)..."
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            className="pl-9 pr-3 h-8 text-xs"
          />
        </form>

        {/* Filter Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Activity Type Filter */}
          <select
            value={type}
            onChange={(e) => updateFilters({ type: e.target.value })}
            className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">All Activity Types</option>
            {Object.entries(INTERACTION_TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Staff Filter (Admin View) */}
          {isAdmin && staffMembers.length > 0 && (
            <select
              value={performedBy}
              onChange={(e) => updateFilters({ performed_by: e.target.value })}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              <option value="ALL">All Representatives</option>
              {staffMembers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
