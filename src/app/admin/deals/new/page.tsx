import React from 'react';
import Link from 'next/link';
import { DealForm } from '@/components/deals/DealForm';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { getCurrentProfile } from '@/lib/actions/auth';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    customer_id?: string;
    customer_name?: string;
    lead_id?: string;
  }>;
}

export default async function AdminNewDealPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000001';

  const staffList = await getAllStaffProfiles();
  const formattedStaff = staffList.map((s) => ({
    id: s.id,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
    email: s.email,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/deals"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Sales Opportunity</h1>
          <p className="text-xs text-slate-500">
            Register a new prospective revenue deal and link it to an active customer account.
          </p>
        </div>
      </div>

      {/* Form */}
      <DealForm
        currentUserId={currentUserId}
        basePath="/admin/deals"
        staffMembers={formattedStaff}
        preselectedCustomerId={params.customer_id}
        preselectedCustomerName={params.customer_name}
        preselectedLeadId={params.lead_id}
      />
    </div>
  );
}
