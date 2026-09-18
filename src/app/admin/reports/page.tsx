import React from 'react';
import { getReportsData } from '@/lib/actions/reports';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { ReportsView } from '@/components/reports/ReportsView';
import { DateRangePreset } from '@/lib/utils/date-range';
import { ReportFilterParams, ReportTab } from '@/types/reports';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    preset?: string;
    from?: string;
    to?: string;
    staff_id?: string;
    tab?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: ReportFilterParams = {
    preset: (params.preset as DateRangePreset) || 'THIS_MONTH',
    from: params.from,
    to: params.to,
    staff_id: params.staff_id || 'ALL',
    tab: (params.tab as ReportTab) || 'overview',
  };

  const [reportData, rawStaffList] = await Promise.all([
    getReportsData(filters, 'ALL'),
    getAllStaffProfiles(),
  ]);

  const staffList = rawStaffList.map((s: any) => ({
    id: s.user_id || s.id,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
    email: s.email,
  }));

  return <ReportsView initialData={reportData} staffList={staffList} />;
}
