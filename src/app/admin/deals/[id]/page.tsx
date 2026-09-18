import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDealById } from '@/lib/actions/deals';
import { getInteractionsForEntity } from '@/lib/actions/interactions';
import { getTasksForEntity } from '@/lib/actions/tasks';
import { DealDetailsView } from '@/components/deals/DealDetailsView';
import { getCurrentProfile } from '@/lib/actions/auth';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminDealDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000001';

  const [deal, interactions, tasks] = await Promise.all([
    getDealById(id),
    getInteractionsForEntity({ dealId: id }),
    getTasksForEntity({ dealId: id }),
  ]);

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/deals"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deals List</span>
        </Link>
      </div>

      {/* Details View */}
      <DealDetailsView
        deal={deal}
        basePath="/admin/deals"
        customerBasePath="/admin/customers"
        leadBasePath="/admin/leads"
        currentUserId={currentUserId}
        currentUserRole="ADMIN"
        initialInteractions={interactions}
        initialTasks={tasks}
      />
    </div>
  );
}
