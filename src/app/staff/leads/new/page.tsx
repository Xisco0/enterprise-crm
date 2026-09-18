import React from 'react';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { LeadForm } from '@/components/leads/LeadForm';
import { ArrowLeft } from 'lucide-react';

export default async function StaffNewLeadPage() {
  const profile = await getCurrentProfile();
  const userId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link
          href="/staff/leads"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Leads
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Capture New Prospect</h1>
        <p className="text-xs text-slate-500">
          Register a prospect into your territory and begin qualification.
        </p>
      </div>

      {/* Lead Form */}
      <LeadForm
        basePath="/staff/leads"
        currentUserId={userId}
        isAdmin={false}
      />
    </div>
  );
}
