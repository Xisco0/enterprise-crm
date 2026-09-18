import React from 'react';
import { getStaffDashboardData } from '@/lib/actions/dashboard';
import { StaffDashboardView } from '@/components/dashboard/StaffDashboardView';

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const dashboardData = await getStaffDashboardData();

  return <StaffDashboardView data={dashboardData} />;
}
