import { CompleteReportData, ReportTab } from '@/types/reports';

/**
 * Generate formatted CSV export string for a specific report tab
 */
export function generateReportCSV(reportData: CompleteReportData, tab: ReportTab): string {
  const { metadata } = reportData;
  const header = `Apex CRM - Performance Report: ${tab.toUpperCase()}\nPeriod: ${metadata.label} (${metadata.startDateStr} to ${metadata.endDateStr})\nGenerated: ${metadata.generatedAt}\n\n`;

  switch (tab) {
    case 'customers': {
      let csv = header + 'Metric,Value\n';
      csv += `Total Customers,${reportData.customers.totalCustomers}\n`;
      csv += `New Customers in Period,${reportData.customers.newCustomersInPeriod}\n`;
      csv += `Active Customers,${reportData.customers.activeCustomers}\n`;
      csv += `Inactive Customers,${reportData.customers.inactiveCustomers}\n`;
      csv += `Churned Customers,${reportData.customers.churnedCustomers}\n\n`;

      csv += 'Customer Status,Count,Percentage\n';
      for (const item of reportData.customers.byStatus) {
        csv += `"${item.label}",${item.count},${item.percentage}%\n`;
      }
      return csv;
    }

    case 'leads': {
      let csv = header + 'Metric,Value\n';
      csv += `Total Leads,${reportData.leads.totalLeads}\n`;
      csv += `New Leads in Period,${reportData.leads.newLeadsInPeriod}\n`;
      csv += `Qualified Leads,${reportData.leads.qualifiedLeads}\n`;
      csv += `Converted Leads in Period,${reportData.leads.convertedLeadsInPeriod}\n`;
      csv += `Conversion Rate,${reportData.leads.conversionRate !== null ? reportData.leads.conversionRate + '%' : 'N/A'}\n\n`;

      csv += 'Lead Source,Count,Percentage\n';
      for (const item of reportData.leads.bySource) {
        csv += `"${item.label}",${item.count},${item.percentage}%\n`;
      }
      return csv;
    }

    case 'deals': {
      let csv = header + 'Metric,Value\n';
      csv += `Deals Created in Period,${reportData.deals.totalDealsCreatedInPeriod}\n`;
      csv += `Open Deals,${reportData.deals.openDealsCount}\n`;
      csv += `Won Deals in Period,${reportData.deals.wonDealsInPeriod}\n`;
      csv += `Lost Deals in Period,${reportData.deals.lostDealsInPeriod}\n`;
      csv += `Win Rate,${reportData.deals.winRate !== null ? reportData.deals.winRate + '%' : 'N/A'}\n\n`;

      csv += 'Pipeline Stage,Count,Total Value,Currency\n';
      for (const item of reportData.deals.byStage) {
        csv += `"${item.label}",${item.count},${item.totalValue},${item.currency}\n`;
      }
      return csv;
    }

    case 'tasks': {
      let csv = header + 'Metric,Value\n';
      csv += `Tasks Created in Period,${reportData.tasks.totalTasksCreatedInPeriod}\n`;
      csv += `Tasks Completed in Period,${reportData.tasks.tasksCompletedInPeriod}\n`;
      csv += `Pending Tasks,${reportData.tasks.pendingCount}\n`;
      csv += `Overdue Tasks,${reportData.tasks.overdueCount}\n\n`;

      csv += 'Task Type,Count\n';
      for (const item of reportData.tasks.byType) {
        csv += `"${item.label}",${item.count}\n`;
      }
      return csv;
    }

    case 'interactions': {
      let csv = header + 'Metric,Value\n';
      csv += `Total Interactions in Period,${reportData.interactions.totalInteractionsInPeriod}\n`;
      csv += `Average Duration (Minutes),${reportData.interactions.averageDurationMinutes || 'N/A'}\n\n`;

      csv += 'Interaction Type,Count,Percentage\n';
      for (const item of reportData.interactions.byType) {
        csv += `"${item.label}",${item.count},${item.percentage}%\n`;
      }
      return csv;
    }

    case 'staff': {
      if (!reportData.staffWorkload) return header + 'Staff workload not available.\n';
      let csv = header + 'Staff Name,Email,Role,Assigned Customers,Assigned Leads,Open Deals,Open Deals Value (NGN),Open Tasks,Completed Tasks,Interactions\n';
      for (const s of reportData.staffWorkload) {
        csv += `"${s.name}","${s.email}","${s.role}",${s.assignedCustomers},${s.assignedLeads},${s.openDeals},${s.openDealsValueUSD},${s.openTasks},${s.completedTasksInPeriod},${s.interactionsInPeriod}\n`;
      }
      return csv;
    }

    case 'overview':
    default: {
      let csv = header + 'Section,Metric,Value\n';
      csv += `Customers,Total Customers,${reportData.customers.totalCustomers}\n`;
      csv += `Customers,New in Period,${reportData.customers.newCustomersInPeriod}\n`;
      csv += `Leads,Active Leads,${reportData.leads.totalLeads}\n`;
      csv += `Leads,Conversion Rate,${reportData.leads.conversionRate !== null ? reportData.leads.conversionRate + '%' : 'N/A'}\n`;
      csv += `Deals,Open Deals,${reportData.deals.openDealsCount}\n`;
      csv += `Deals,Won in Period,${reportData.deals.wonDealsInPeriod}\n`;
      csv += `Tasks,Completed in Period,${reportData.tasks.tasksCompletedInPeriod}\n`;
      csv += `Tasks,Overdue Tasks,${reportData.tasks.overdueCount}\n`;
      csv += `Interactions,Total in Period,${reportData.interactions.totalInteractionsInPeriod}\n`;
      return csv;
    }
  }
}
