import React from 'react';
import Link from 'next/link';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { LeadForm } from '@/components/leads/LeadForm';
import { ArrowLeft } from 'lucide-react';

export default async function AdminNewLeadPage() {
  const staffList = await getAllStaffProfiles();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads Pipeline
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Capture New Lead</h1>
        <p className="text-xs text-slate-500">
          Register an inbound prospect, assign qualification parameters, and route to an account representative.
        </p>
      </div>

      {/* Lead Form */}
      <LeadForm
        basePath="/admin/leads"
        staffMembers={staffList}
        isAdmin={true}
      />
    </div>
  );
}
