import React from 'react';
import { getReportsData } from '@/lib/actions/reports';
import { ReportsView } from '@/components/reports/ReportsView';
import { DateRangePreset } from '@/lib/utils/date-range';
import { ReportFilterParams, ReportTab } from '@/types/reports';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    preset?: string;
    from?: string;
    to?: string;
    tab?: string;
  }>;
}

export default async function StaffReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: ReportFilterParams = {
    preset: (params.preset as DateRangePreset) || 'THIS_MONTH',
    from: params.from,
    to: params.to,
    tab: (params.tab as ReportTab) || 'overview',
  };

  // Staff scope: 'ASSIGNED' enforces personal records only
  const reportData = await getReportsData(filters, 'ASSIGNED');

  return <ReportsView initialData={reportData} />;
}
