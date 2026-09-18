import React from 'react';
import Link from 'next/link';
import { getPipelineDeals } from '@/lib/actions/deals';
import { PipelineView } from '@/components/deals/PipelineView';
import { DealFilters } from '@/components/deals/DealFilters';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';
import { getCurrentProfile } from '@/lib/actions/auth';

export default async function AdminDealsPipelinePage() {
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000001';

  const pipelineData = await getPipelineDeals('ALL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales Pipeline Board</h1>
          <p className="text-xs text-slate-500">
            Visual opportunity pipeline across 7 distinct qualification and closing stages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/deals">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <List className="h-3.5 w-3.5 mr-1.5" /> Table View
            </Button>
          </Link>
          <Link href="/admin/deals/new">
            <Button size="sm" className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <DealFilters basePath="/admin/deals" showPipelineToggle={true} currentView="pipeline" />

      {/* Pipeline Board */}
      <PipelineView
        pipelineData={pipelineData}
        basePath="/admin/deals"
        currentUserId={currentUserId}
      />
    </div>
  );
}
