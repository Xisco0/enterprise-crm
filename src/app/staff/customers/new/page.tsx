import React from 'react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { getCurrentProfile } from '@/lib/actions/auth';
import { Profile } from '@/types/crm';

export default async function StaffNewCustomerPage() {
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const staffList: Profile[] = profile
    ? [profile]
    : [
        {
          id: currentUserId,
          user_id: currentUserId,
          first_name: 'Marcus',
          last_name: 'Vance',
          email: 'marcus.vance@enterprise.com',
          role: 'STAFF',
          status: 'ACTIVE',
          department: 'Enterprise Sales',
          job_title: 'Senior Account Executive',
          phone: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Add Customer to My Portfolio</h1>
        <p className="text-xs text-slate-500">
          Create a new client relationship record assigned directly to your sales account.
        </p>
      </div>

      <CustomerForm
        staffList={staffList}
        basePath="/staff/customers"
        isStaffPortal={true}
        currentUserId={currentUserId}
      />
    </div>
  );
}
