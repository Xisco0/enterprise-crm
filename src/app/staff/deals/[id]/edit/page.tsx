import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDealById } from '@/lib/actions/deals';
import { DealForm } from '@/components/deals/DealForm';
import { getCurrentProfile } from '@/lib/actions/auth';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffEditDealPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const deal = await getDealById(id);

  if (!deal) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/staff/deals/${deal.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Sales Opportunity</h1>
          <p className="text-xs text-slate-500">
            Update opportunity details, contract value, or pipeline stage.
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <DealForm
        initialData={deal}
        currentUserId={currentUserId}
        basePath="/staff/deals"
      />
    </div>
  );
}
