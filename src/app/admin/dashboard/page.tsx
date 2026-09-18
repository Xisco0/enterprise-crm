import React from 'react';
import { getAdminDashboardData } from '@/lib/actions/dashboard';
import { AdminDashboardView } from '@/components/dashboard/AdminDashboardView';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const dashboardData = await getAdminDashboardData();

  return <AdminDashboardView data={dashboardData} />;
}
