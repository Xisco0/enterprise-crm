import React from 'react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { Profile } from '@/types/crm';

export default async function AdminNewCustomerPage() {
  const staff = await getAllStaffProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Add New Customer Account</h1>
        <p className="text-xs text-slate-500">
          Create a new business or individual customer record in the CRM directory.
        </p>
      </div>

      <CustomerForm
        staffList={staff as unknown as Profile[]}
        basePath="/admin/customers"
        isStaffPortal={false}
      />
    </div>
  );
}
