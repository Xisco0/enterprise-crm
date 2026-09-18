import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeadById } from '@/lib/actions/leads';
import { getCurrentProfile } from '@/lib/actions/auth';
import { LeadForm } from '@/components/leads/LeadForm';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffEditLeadPage({ params }: PageProps) {
  const { id } = await params;
  const [lead, profile] = await Promise.all([
    getLeadById(id),
    getCurrentProfile(),
  ]);

  if (!lead) {
    notFound();
  }

  const userId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link
          href={`/staff/leads/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Lead Details
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Edit Lead: {lead.first_name} {lead.last_name}
        </h1>
        <p className="text-xs text-slate-500">
          Update contact details, qualification notes, and pipeline metrics.
        </p>
      </div>

      {/* Form */}
      <LeadForm
        lead={lead}
        basePath="/staff/leads"
        currentUserId={userId}
        isAdmin={false}
      />
    </div>
  );
}
