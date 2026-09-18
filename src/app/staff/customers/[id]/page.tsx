import React from 'react';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/actions/customers';
import { getInteractionsForEntity } from '@/lib/actions/interactions';
import { getTasksForEntity } from '@/lib/actions/tasks';
import { getCurrentProfile } from '@/lib/actions/auth';
import { CustomerDetailsView } from '@/components/customers/CustomerDetailsView';

export default async function StaffCustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const [customer, interactions, tasks] = await Promise.all([
    getCustomerById(resolvedParams.id),
    getInteractionsForEntity({ customerId: resolvedParams.id }),
    getTasksForEntity({ customerId: resolvedParams.id }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetailsView
      customer={customer}
      basePath="/staff/customers"
      canManageStatus={false}
      initialInteractions={interactions}
      initialTasks={tasks}
      currentUserId={currentUserId}
      currentUserRole="STAFF"
    />
  );
}
