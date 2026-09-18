import React from 'react';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/actions/customers';
import { getCurrentProfile } from '@/lib/actions/auth';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Profile } from '@/types/crm';

export default async function StaffEditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, profile] = await Promise.all([
    getCustomerById(params.id),
    getCurrentProfile(),
  ]);

  if (!customer) {
    notFound();
  }

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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Edit Customer — {customer.customer_number}
        </h1>
        <p className="text-xs text-slate-500">
          Update organization information or primary contact details.
        </p>
      </div>

      <CustomerForm
        initialData={customer}
        staffList={staffList}
        basePath="/staff/customers"
        isStaffPortal={true}
        currentUserId={currentUserId}
      />
    </div>
  );
}
