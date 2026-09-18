import React from 'react';
import { notFound } from 'next/navigation';
import { getLeadById } from '@/lib/actions/leads';
import { getInteractionsForEntity } from '@/lib/actions/interactions';
import { getTasksForEntity } from '@/lib/actions/tasks';
import { getCurrentProfile } from '@/lib/actions/auth';
import { LeadDetailsView } from '@/components/leads/LeadDetailsView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const [lead, interactions, tasks] = await Promise.all([
    getLeadById(id),
    getInteractionsForEntity({ leadId: id }),
    getTasksForEntity({ leadId: id }),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <LeadDetailsView
      lead={lead}
      basePath="/staff/leads"
      isAdmin={false}
      initialInteractions={interactions}
      initialTasks={tasks}
      currentUserId={currentUserId}
      currentUserRole="STAFF"
    />
  );
}
