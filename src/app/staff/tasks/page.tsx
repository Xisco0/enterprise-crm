import React from 'react';
import { getTasks, getTaskMetrics } from '@/lib/actions/tasks';
import { getCurrentProfile } from '@/lib/actions/auth';
import { TasksView } from '@/components/tasks/TasksView';

export default async function StaffTasksPage() {
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const [tasks, metrics] = await Promise.all([
    getTasks(undefined, 'ASSIGNED', currentUserId),
    getTaskMetrics('ASSIGNED', currentUserId),
  ]);

  return (
    <TasksView
      initialTasks={tasks}
      initialMetrics={metrics}
      currentUserId={currentUserId}
      currentUserRole="STAFF"
      title="My Tasks & Follow-ups"
      description="Your personal action items, upcoming client calls, meetings, and contract deliverables."
      customerBasePath="/staff/customers"
      leadBasePath="/staff/leads"
      dealBasePath="/staff/deals"
    />
  );
}
