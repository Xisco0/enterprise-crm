import React from 'react';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/actions/customers';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Profile } from '@/types/crm';

export default async function AdminEditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, staff] = await Promise.all([
    getCustomerById(params.id),
    getAllStaffProfiles(),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Edit Customer — {customer.customer_number}
        </h1>
        <p className="text-xs text-slate-500">
          Update organization information, account classification, or assigned sales representative.
        </p>
      </div>

      <CustomerForm
        initialData={customer}
        staffList={staff as unknown as Profile[]}
        basePath="/admin/customers"
        isStaffPortal={false}
      />
    </div>
  );
}
