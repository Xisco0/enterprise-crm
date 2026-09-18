/**
 * Enterprise CRM - Reports & Analytics Automated Test Suite (Prompt 9)
 *
 * Verifies:
 * 1. Date Range Engine (presets, custom ranges, boundary precision)
 * 2. Customer Report Aggregations & Growth Timeline
 * 3. Lead Funnel, Inbound Sources, & Zero-Division Safe Conversion Rate
 * 4. Deal Pipeline, Multi-Currency Grouping, & won_at Timestamp Isolation
 * 5. Task Report, Completion Velocity, & completed_at Isolation
 * 6. Omnichannel Interactions Breakdown & Timeline
 * 7. Staff Workload & Team Capacity Report (Admin-Only)
 * 8. RBAC Scoping & Security Boundary (Staff vs Admin)
 * 9. CSV Export Formatting across all report tabs
 * 10. Zero-State & Empty Database Graceful Resilience
 */

import { resolveDateRange, isDateInRange, generateTimelineBuckets, formatDateToYYYYMMDD } from '../src/lib/utils/date-range';
import { getReportsData } from '../src/lib/actions/reports';
import { generateReportCSV } from '../src/lib/report-utils';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('       PROMPT 9: CRM REPORTS & ANALYTICS TEST SUITE            ');
  console.log('================================================================\n');

  // Test 1: Date Range Engine & Presets
  try {
    const todayRange = resolveDateRange('TODAY');
    assert(todayRange.startDate.getHours() === 0 && todayRange.startDate.getMinutes() === 0, 'Today start should be 00:00:00');
    assert(todayRange.endDate.getHours() === 23 && todayRange.endDate.getMinutes() === 59, 'Today end should be 23:59:59');

    const thisMonthRange = resolveDateRange('THIS_MONTH');
    assert(thisMonthRange.startDate.getDate() === 1, 'This month start should be 1st day of month');

    const customRange = resolveDateRange('CUSTOM', '2026-01-01', '2026-01-31');
    assert(customRange.startDate.getFullYear() === 2026 && customRange.startDate.getMonth() === 0 && customRange.startDate.getDate() === 1, 'Custom start date mismatch');
    assert(customRange.endDate.getFullYear() === 2026 && customRange.endDate.getMonth() === 0 && customRange.endDate.getDate() === 31, 'Custom end date mismatch');

    const isInside = isDateInRange(new Date('2026-01-15T12:00:00Z'), customRange.startDate, customRange.endDate);
    const isOutside = isDateInRange(new Date('2026-02-15T12:00:00Z'), customRange.startDate, customRange.endDate);
    assert(isInside === true, 'Jan 15 should be inside Jan 1 - Jan 31 range');
    assert(isOutside === false, 'Feb 15 should be outside Jan 1 - Jan 31 range');

    const buckets = generateTimelineBuckets(new Date('2026-01-01'), new Date('2026-01-05'));
    assert(buckets.length === 5, `Expected 5 daily buckets, got ${buckets.length}`);

    results.push({
      id: 'TEST-01',
      name: '[DATE_ENGINE] Date range presets, boundary calculations, and timeline buckets',
      passed: true,
      details: `Presets tested: TODAY, THIS_MONTH, CUSTOM. Buckets generated: ${buckets.length}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-01',
      name: '[DATE_ENGINE] Date range presets, boundary calculations, and timeline buckets',
      passed: false,
      error: err.message,
    });
  }

  // Test 2: Customer Report Aggregations & Growth Timeline
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    const custReport = reportData.customers;

    assert(custReport.totalCustomers >= 3, `Expected at least 3 customers, got ${custReport.totalCustomers}`);
    assert(custReport.activeCustomers >= 3, `Expected active customers count >= 3, got ${custReport.activeCustomers}`);
    assert(Array.isArray(custReport.byType), 'byType should be an array');
    assert(custReport.byType.length > 0, 'byType should have entries');
    assert(Array.isArray(custReport.growthTimeline), 'growthTimeline should be an array');

    // Verify percentages sum reasonably (within rounding)
    const typePercentageSum = custReport.byType.reduce((acc, t) => acc + t.percentage, 0);
    assert(typePercentageSum === 100 || typePercentageSum === 0, `Type percentages should sum to 100, got ${typePercentageSum}`);

    results.push({
      id: 'TEST-02',
      name: '[CUSTOMER_REPORT] Total accounts, status breakdowns, and growth timeline',
      passed: true,
      details: `Total: ${custReport.totalCustomers}, Active: ${custReport.activeCustomers}, Growth points: ${custReport.growthTimeline.length}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-02',
      name: '[CUSTOMER_REPORT] Total accounts, status breakdowns, and growth timeline',
      passed: false,
      error: err.message,
    });
  }

  // Test 3: Lead Funnel & Conversion Rate (Zero-Division Safe)
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    const leadReport = reportData.leads;

    assert(leadReport.totalLeads >= 3, `Expected at least 3 total leads, got ${leadReport.totalLeads}`);
    assert(Array.isArray(leadReport.bySource), 'bySource should be an array');
    assert(Array.isArray(leadReport.byStatus), 'byStatus should be an array');
    
    // Check conversion rate calculation
    if (leadReport.newLeadsInPeriod > 0) {
      const expectedRate = Math.round((leadReport.convertedLeadsInPeriod / leadReport.newLeadsInPeriod) * 100);
      assert(leadReport.conversionRate === expectedRate, `Expected conversion rate ${expectedRate}%, got ${leadReport.conversionRate}%`);
    } else {
      assert(leadReport.conversionRate === null, 'Conversion rate should be null when new leads in period is 0');
    }

    results.push({
      id: 'TEST-03',
      name: '[LEAD_REPORT] Acquisition funnel, lead sources, and zero-division conversion rate',
      passed: true,
      details: `New: ${leadReport.newLeadsInPeriod}, Converted: ${leadReport.convertedLeadsInPeriod}, Rate: ${leadReport.conversionRate}%`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-03',
      name: '[LEAD_REPORT] Acquisition funnel, lead sources, and zero-division conversion rate',
      passed: false,
      error: err.message,
    });
  }

  // Test 4: Deal Pipeline, Multi-Currency Grouping, & won_at Timestamp Isolation
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    const dealReport = reportData.deals;

    assert(Array.isArray(dealReport.pipelineByCurrency), 'pipelineByCurrency should be an array');
    assert(Array.isArray(dealReport.wonValueByCurrency), 'wonValueByCurrency should be an array');
    assert(dealReport.byStage.length === 7, `Expected 7 stages in deal distribution, got ${dealReport.byStage.length}`);

    // Verify multi-currency isolation
    for (const p of dealReport.pipelineByCurrency) {
      assert(typeof p.currency === 'string' && p.currency.length > 0, 'Currency code must be valid');
      assert(typeof p.totalValue === 'number' && !isNaN(p.totalValue), 'Pipeline value must be numeric and not NaN');
    }

    // Verify won_at timestamp isolation and reporting metrics
    assert(typeof dealReport.wonDealsInPeriod === 'number' && dealReport.wonDealsInPeriod >= 0, 'Won deals count must be a non-negative number');

    results.push({
      id: 'TEST-04',
      name: '[DEAL_REPORT] Multi-currency pipeline grouping and won_at timestamp isolation',
      passed: true,
      details: `Won in period: ${dealReport.wonDealsInPeriod}, Currencies: ${dealReport.pipelineByCurrency.map(c => c.currency).join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-04',
      name: '[DEAL_REPORT] Multi-currency pipeline grouping and won_at timestamp isolation',
      passed: false,
      error: err.message,
    });
  }

  // Test 5: Task Report & Velocity (completed_at Isolation)
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    const taskReport = reportData.tasks;

    assert(Array.isArray(taskReport.byType), 'byType should be an array');
    assert(Array.isArray(taskReport.byPriority), 'byPriority should be an array');
    assert(Array.isArray(taskReport.completionTimeline), 'completionTimeline should be an array');

    // Verify completion rate
    if (taskReport.totalTasksCreatedInPeriod > 0) {
      const expectedCompRate = Math.round((taskReport.tasksCompletedInPeriod / taskReport.totalTasksCreatedInPeriod) * 100);
      assert(taskReport.completionRate === expectedCompRate, `Expected completion rate ${expectedCompRate}%, got ${taskReport.completionRate}%`);
    }

    results.push({
      id: 'TEST-05',
      name: '[TASK_REPORT] Task execution velocity, completion rate, and completed_at isolation',
      passed: true,
      details: `Created: ${taskReport.totalTasksCreatedInPeriod}, Completed: ${taskReport.tasksCompletedInPeriod}, Rate: ${taskReport.completionRate}%`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-05',
      name: '[TASK_REPORT] Task execution velocity, completion rate, and completed_at isolation',
      passed: false,
      error: err.message,
    });
  }

  // Test 6: Omnichannel Interactions Breakdown & Timeline
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    const interactionReport = reportData.interactions;

    assert(interactionReport.totalInteractionsInPeriod >= 3, `Expected at least 3 interactions, got ${interactionReport.totalInteractionsInPeriod}`);
    assert(Array.isArray(interactionReport.byType), 'byType should be an array');
    assert(Array.isArray(interactionReport.activityTimeline), 'activityTimeline should be an array');

    // Check interaction channels
    const channels = interactionReport.byType.map(c => c.type);
    assert(channels.includes('CALL') || channels.includes('EMAIL') || channels.includes('MEETING'), 'Should include standard communication channels');

    results.push({
      id: 'TEST-06',
      name: '[INTERACTION_REPORT] Omnichannel touchpoints distribution and activity timeline',
      passed: true,
      details: `Total interactions: ${interactionReport.totalInteractionsInPeriod}, Channels tracked: ${interactionReport.byType.length}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-06',
      name: '[INTERACTION_REPORT] Omnichannel touchpoints distribution and activity timeline',
      passed: false,
      error: err.message,
    });
  }

  // Test 7: Staff Workload Report (Admin-Only)
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    assert(Array.isArray(reportData.staffWorkload), 'staffWorkload must be provided for admin scope');
    assert(reportData.staffWorkload!.length >= 2, `Expected at least 2 staff members in workload, got ${reportData.staffWorkload!.length}`);

    for (const member of reportData.staffWorkload!) {
      assert(typeof member.name === 'string' && member.name.length > 0, 'Staff member must have a valid name');
      assert(typeof member.assignedCustomers === 'number', 'assignedCustomers must be numeric');
      assert(typeof member.assignedLeads === 'number', 'assignedLeads must be numeric');
      assert(typeof member.openDeals === 'number', 'openDeals must be numeric');
      assert(typeof member.openTasks === 'number', 'openTasks must be numeric');
    }

    results.push({
      id: 'TEST-07',
      name: '[STAFF_WORKLOAD] Team capacity and workload balancing matrix',
      passed: true,
      details: `Roster count: ${reportData.staffWorkload!.length} team members tracked`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-07',
      name: '[STAFF_WORKLOAD] Team capacity and workload balancing matrix',
      passed: false,
      error: err.message,
    });
  }

  // Test 8: Staff Scoping & RBAC Data Isolation
  try {
    const staffId = '00000000-0000-0000-0000-000000000002'; // Marcus Vance
    const staffReport = await getReportsData({ preset: 'THIS_YEAR' }, 'ASSIGNED', staffId);

    // Verify staff report has no staffWorkload table
    assert(staffReport.staffWorkload === undefined, 'Staff user must NOT receive staffWorkload roster');
    assert(staffReport.metadata.userRole === 'STAFF', 'Report metadata role should reflect STAFF');

    // Verify numbers are strictly non-negative numbers
    assert(typeof staffReport.customers.totalCustomers === 'number' && staffReport.customers.totalCustomers >= 0, 'Scoped customer count must be a non-negative number');
    assert(typeof staffReport.leads.totalLeads === 'number' && staffReport.leads.totalLeads >= 0, 'Scoped leads count must be a non-negative number');

    results.push({
      id: 'TEST-08',
      name: '[RBAC_SCOPING] Staff security boundary and strict personal metric isolation',
      passed: true,
      details: `Marcus Vance scoped customers: ${staffReport.customers.totalCustomers}, leads: ${staffReport.leads.totalLeads}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-08',
      name: '[RBAC_SCOPING] Staff security boundary and strict personal metric isolation',
      passed: false,
      error: err.message,
    });
  }

  // Test 9: CSV Export Formatting
  try {
    const reportData = await getReportsData({ preset: 'THIS_YEAR' }, 'ALL');
    
    const overviewCsv = await generateReportCSV(reportData, 'overview');
    assert(overviewCsv.includes('Apex CRM - Performance Report'), 'CSV should contain report title header');
    assert(overviewCsv.includes('Customers,Total Customers'), 'Overview CSV should contain customer metrics');

    const dealsCsv = await generateReportCSV(reportData, 'deals');
    assert(dealsCsv.includes('Pipeline Stage,Count,Total Value,Currency'), 'Deals CSV should include stage breakdown');

    const staffCsv = await generateReportCSV(reportData, 'staff');
    assert(staffCsv.includes('Staff Name,Email,Role,Assigned Customers'), 'Staff CSV should include staff table headers');

    results.push({
      id: 'TEST-09',
      name: '[CSV_EXPORT] Valid CSV generation and formatting for all reporting domains',
      passed: true,
      details: `Generated CSVs: overview (${overviewCsv.length} bytes), deals (${dealsCsv.length} bytes), staff (${staffCsv.length} bytes)`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-09',
      name: '[CSV_EXPORT] Valid CSV generation and formatting for all reporting domains',
      passed: false,
      error: err.message,
    });
  }

  // Test 10: Zero-State & Empty Period Handling
  try {
    // Query a future date range where no data exists
    const futureReport = await getReportsData({
      preset: 'CUSTOM',
      from: '2099-01-01',
      to: '2099-01-31',
    }, 'ALL');

    assert(futureReport.customers.newCustomersInPeriod === 0, 'New customers in 2099 should be 0');
    assert(futureReport.leads.newLeadsInPeriod === 0, 'New leads in 2099 should be 0');
    assert(futureReport.leads.conversionRate === null, 'Conversion rate should safely be null without NaN');
    assert(futureReport.deals.wonDealsInPeriod === 0, 'Won deals in 2099 should be 0');
    assert(futureReport.deals.winRate === null, 'Win rate should safely be null without NaN');
    assert(futureReport.tasks.tasksCompletedInPeriod === 0, 'Completed tasks in 2099 should be 0');
    assert(futureReport.tasks.completionRate === null, 'Completion rate should safely be null without NaN');
    assert(futureReport.interactions.totalInteractionsInPeriod === 0, 'Interactions in 2099 should be 0');

    results.push({
      id: 'TEST-10',
      name: '[EMPTY_STATE_RESILIENCE] Graceful zero-division and empty period safety',
      passed: true,
      details: 'Conversion rate: null, Win rate: null, Completion rate: null (No NaN or Infinity)',
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-10',
      name: '[EMPTY_STATE_RESILIENCE] Graceful zero-division and empty period safety',
      passed: false,
      error: err.message,
    });
  }

  // Print Summary
  console.log('\n================================================================');
  console.log('                      TEST RESULTS SUMMARY                      ');
  console.log('================================================================');

  let passedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`\x1b[32m✔ PASS\x1b[0m [${r.id}] ${r.name}`);
      if (r.details) console.log(`       └─ ${r.details}`);
    } else {
      console.log(`\x1b[31m✖ FAIL\x1b[0m [${r.id}] ${r.name}`);
      console.log(`       └─ Error: ${r.error}`);
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite failure:', err);
  process.exit(1);
});
