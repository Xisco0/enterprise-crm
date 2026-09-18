import React from 'react';
import { getTasks, getTaskMetrics } from '@/lib/actions/tasks';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { getCurrentProfile } from '@/lib/actions/auth';
import { TasksView } from '@/components/tasks/TasksView';

export default async function AdminTasksPage() {
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000001';

  const [tasks, metrics, staffList] = await Promise.all([
    getTasks(undefined, 'ALL', currentUserId),
    getTaskMetrics('ALL', currentUserId),
    getAllStaffProfiles(),
  ]);

  return (
    <TasksView
      initialTasks={tasks}
      initialMetrics={metrics}
      currentUserId={currentUserId}
      currentUserRole="ADMIN"
      staffList={staffList}
      title="Task & Follow-up Operations"
      description="Organization-wide actionable follow-up queue, customer meetings, and milestone tracking."
      customerBasePath="/admin/customers"
      leadBasePath="/admin/leads"
      dealBasePath="/admin/deals"
    />
  );
}
