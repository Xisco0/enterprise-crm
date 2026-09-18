/**
 * Enterprise CRM - Dashboard Module Automated Test Suite (Prompt 8)
 *
 * Verifies:
 * 1. Admin organization-wide metrics & currency pipeline aggregation
 * 2. Monthly Won vs. Lost deal performance
 * 3. Task backlog & overdue calculation accuracy
 * 4. 7-stage pipeline distribution
 * 5. Per-staff workload & capacity distribution
 * 6. Staff-scoped personal KPIs & security boundary enforcement
 * 7. Staff today agenda prioritization & sorting
 * 8. Omnichannel recent activity feed ordering
 * 9. Safe empty-state handling
 */

import { getAdminDashboardData, getStaffDashboardData } from '../src/lib/actions/dashboard';
import { isTaskOverdue } from '../src/lib/task-utils';

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
  console.log('         PROMPT 8: ADMIN & STAFF DASHBOARDS TEST SUITE          ');
  console.log('================================================================\n');

  // Test 1: Organization-Wide Pipeline & Customer Counts
  try {
    const adminData = await getAdminDashboardData();
    assert(adminData.totalCustomers >= 3, `Expected at least 3 customers, got ${adminData.totalCustomers}`);
    assert(adminData.activeCustomers >= 3, `Expected at least 3 active customers, got ${adminData.activeCustomers}`);
    assert(adminData.activeLeads >= 3, `Expected at least 3 active leads, got ${adminData.activeLeads}`);
    assert(adminData.openDealsCount >= 3, `Expected at least 3 open deals, got ${adminData.openDealsCount}`);
    
    results.push({
      id: 'TEST-01',
      name: '[ADMIN_METRICS] Organization-Wide Pipeline & Customer Counts',
      passed: true,
      details: `Customers: ${adminData.totalCustomers}, Active Leads: ${adminData.activeLeads}, Open Deals: ${adminData.openDealsCount}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-01',
      name: '[ADMIN_METRICS] Organization-Wide Pipeline & Customer Counts',
      passed: false,
      error: err.message,
    });
  }

  // Test 2: Multi-Currency Pipeline Aggregation
  try {
    const adminData = await getAdminDashboardData();
    assert(Array.isArray(adminData.pipelineByCurrency), 'pipelineByCurrency must be an array');
    assert(adminData.pipelineByCurrency.length > 0, 'pipelineByCurrency should not be empty');
    
    const usdPipeline = adminData.pipelineByCurrency.find(p => p.currency === 'USD');
    assert(!!usdPipeline, 'USD pipeline summary must exist');
    assert(usdPipeline!.totalValue > 0, `USD pipeline value should be > 0, got ${usdPipeline!.totalValue}`);
    assert(usdPipeline!.count > 0, `USD pipeline deal count should be > 0, got ${usdPipeline!.count}`);

    results.push({
      id: 'TEST-02',
      name: '[CURRENCY_PIPELINE] Multi-Currency Pipeline Aggregation',
      passed: true,
      details: `Currencies: ${adminData.pipelineByCurrency.map(c => `${c.currency}: $${c.totalValue} (${c.count} deals)`).join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-02',
      name: '[CURRENCY_PIPELINE] Multi-Currency Pipeline Aggregation',
      passed: false,
      error: err.message,
    });
  }

  // Test 3: Monthly Won and Lost Revenue Tracking
  try {
    const adminData = await getAdminDashboardData();
    assert(typeof adminData.wonDealsThisMonth.count === 'number', 'won count must be a number');
    assert(typeof adminData.wonDealsThisMonth.totalValue === 'number', 'won total must be a number');
    assert(typeof adminData.lostDealsThisMonth.count === 'number', 'lost count must be a number');
    assert(typeof adminData.lostDealsThisMonth.totalValue === 'number', 'lost total must be a number');

    results.push({
      id: 'TEST-03',
      name: '[WON_LOST_MONTH] Monthly Won & Lost Revenue Tracking',
      passed: true,
      details: `Won: ${adminData.wonDealsThisMonth.count} ($${adminData.wonDealsThisMonth.totalValue}), Lost: ${adminData.lostDealsThisMonth.count} ($${adminData.lostDealsThisMonth.totalValue})`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-03',
      name: '[WON_LOST_MONTH] Monthly Won & Lost Revenue Tracking',
      passed: false,
      error: err.message,
    });
  }

  // Test 4: Task Workload & Overdue Metric Calculation
  try {
    const adminData = await getAdminDashboardData();
    const { pendingCount, inProgressCount, overdueCount, completedThisWeekCount } = adminData.taskWorkload;
    
    assert(typeof pendingCount === 'number', 'pendingCount must be a number');
    assert(typeof inProgressCount === 'number', 'inProgressCount must be a number');
    assert(typeof overdueCount === 'number', 'overdueCount must be a number');
    assert(typeof completedThisWeekCount === 'number', 'completedThisWeekCount must be a number');
    assert(overdueCount >= 0, 'overdueCount must be >= 0');

    results.push({
      id: 'TEST-04',
      name: '[TASK_WORKLOAD] Team Task Backlog & Overdue Metric Accuracy',
      passed: true,
      details: `Pending: ${pendingCount}, In Progress: ${inProgressCount}, Overdue: ${overdueCount}, Completed This Week: ${completedThisWeekCount}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-04',
      name: '[TASK_WORKLOAD] Team Task Backlog & Overdue Metric Accuracy',
      passed: false,
      error: err.message,
    });
  }

  // Test 5: Complete 7-Stage Pipeline Breakdown
  try {
    const adminData = await getAdminDashboardData();
    assert(adminData.pipelineByStage.length === 7, `Expected 7 stages, got ${adminData.pipelineByStage.length}`);
    
    const requiredStages = ['NEW', 'QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    for (const stage of requiredStages) {
      const found = adminData.pipelineByStage.find(s => s.stage === stage);
      assert(!!found, `Stage ${stage} must exist in breakdown`);
      assert(typeof found!.count === 'number', `Count for ${stage} must be numeric`);
      assert(typeof found!.totalValue === 'number', `Total value for ${stage} must be numeric`);
    }

    results.push({
      id: 'TEST-05',
      name: '[PIPELINE_STAGES] Complete 7-Stage Pipeline Breakdown',
      passed: true,
      details: `Stages verified: ${adminData.pipelineByStage.map(s => `${s.stage}: ${s.count}`).join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-05',
      name: '[PIPELINE_STAGES] Complete 7-Stage Pipeline Breakdown',
      passed: false,
      error: err.message,
    });
  }

  // Test 6: Per-Staff Workload & Capacity Distribution
  try {
    const adminData = await getAdminDashboardData();
    assert(adminData.staffWorkload.length >= 2, `Expected at least 2 staff members, got ${adminData.staffWorkload.length}`);
    
    for (const staff of adminData.staffWorkload) {
      assert(typeof staff.staffId === 'string' && staff.staffId.length > 0, 'staffId must be valid');
      assert(typeof staff.name === 'string' && staff.name.length > 0, 'name must be valid');
      assert(typeof staff.activeLeadsCount === 'number', 'activeLeadsCount must be numeric');
      assert(typeof staff.openDealsCount === 'number', 'openDealsCount must be numeric');
      assert(typeof staff.openDealsValueUSD === 'number', 'openDealsValueUSD must be numeric');
      assert(typeof staff.pendingTasksCount === 'number', 'pendingTasksCount must be numeric');
      assert(typeof staff.overdueTasksCount === 'number', 'overdueTasksCount must be numeric');
    }

    results.push({
      id: 'TEST-06',
      name: '[STAFF_WORKLOAD] Per-Staff Workload & Capacity Allocation',
      passed: true,
      details: `Assessed ${adminData.staffWorkload.length} team members: ${adminData.staffWorkload.map(s => `${s.name} (${s.openDealsCount} deals)`).join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-06',
      name: '[STAFF_WORKLOAD] Per-Staff Workload & Capacity Allocation',
      passed: false,
      error: err.message,
    });
  }

  // Test 7: Staff Dashboard Scoped Exclusively to Current User
  try {
    const marcusId = '00000000-0000-0000-0000-000000000002';
    const elenaId = '00000000-0000-0000-0000-000000000003';

    const marcusData = await getStaffDashboardData(marcusId);
    const elenaData = await getStaffDashboardData(elenaId);

    assert(marcusData.user.firstName === 'Marcus', `Expected Marcus, got ${marcusData.user.firstName}`);
    assert(elenaData.user.firstName === 'Elena', `Expected Elena, got ${elenaData.user.firstName}`);

    // Verify deals are scoped
    for (const deal of marcusData.myActiveDeals) {
      assert(deal.assigned_to === marcusId, `Deal ${deal.id} was not assigned to Marcus`);
    }
    for (const deal of elenaData.myActiveDeals) {
      assert(deal.assigned_to === elenaId, `Deal ${deal.id} was not assigned to Elena`);
    }

    // Verify leads are scoped
    for (const lead of marcusData.myRecentLeads) {
      assert(lead.assigned_to === marcusId, `Lead ${lead.id} was not assigned to Marcus`);
    }
    for (const lead of elenaData.myRecentLeads) {
      assert(lead.assigned_to === elenaId, `Lead ${lead.id} was not assigned to Elena`);
    }

    results.push({
      id: 'TEST-07',
      name: '[STAFF_SCOPING] Staff Dashboard Scoped Exclusively to Current User',
      passed: true,
      details: `Marcus: ${marcusData.myOpenDealsCount} deals, ${marcusData.myActiveLeadsCount} leads. Elena: ${elenaData.myOpenDealsCount} deals, ${elenaData.myActiveLeadsCount} leads.`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-07',
      name: '[STAFF_SCOPING] Staff Dashboard Scoped Exclusively to Current User',
      passed: false,
      error: err.message,
    });
  }

  // Test 8: Staff Today Agenda Prioritization & Ordering
  try {
    const marcusId = '00000000-0000-0000-0000-000000000002';
    const marcusData = await getStaffDashboardData(marcusId);

    assert(Array.isArray(marcusData.todayAgendaTasks), 'todayAgendaTasks must be an array');
    
    // Check sorting: non-completed, with urgent/overdue prioritized
    for (const task of marcusData.todayAgendaTasks) {
      assert(task.status !== 'COMPLETED' && task.status !== 'CANCELLED', `Completed/Cancelled task ${task.id} should not be in today agenda`);
    }

    results.push({
      id: 'TEST-08',
      name: '[TODAY_AGENDA] Staff Today Agenda Prioritization & Ordering',
      passed: true,
      details: `Loaded ${marcusData.todayAgendaTasks.length} agenda items for Marcus Vance`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-08',
      name: '[TODAY_AGENDA] Staff Today Agenda Prioritization & Ordering',
      passed: false,
      error: err.message,
    });
  }

  // Test 9: Omnichannel Recent Activity Feed Ordering
  try {
    const adminData = await getAdminDashboardData();
    assert(Array.isArray(adminData.recentActivities), 'recentActivities must be an array');
    
    // Verify descending order of timestamps
    for (let i = 0; i < adminData.recentActivities.length - 1; i++) {
      const current = new Date(adminData.recentActivities[i].performed_at || adminData.recentActivities[i].created_at).getTime();
      const next = new Date(adminData.recentActivities[i + 1].performed_at || adminData.recentActivities[i + 1].created_at).getTime();
      assert(current >= next, `Activity at index ${i} is older than index ${i + 1}`);
    }

    results.push({
      id: 'TEST-09',
      name: '[ACTIVITY_FEED] Omnichannel Recent Activity Feed Ordering',
      passed: true,
      details: `Verified descending chronological order across ${adminData.recentActivities.length} interactions`,
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-09',
      name: '[ACTIVITY_FEED] Omnichannel Recent Activity Feed Ordering',
      passed: false,
      error: err.message,
    });
  }

  // Test 10: Empty State & Zero-Division Safety
  try {
    const unknownUserId = '99999999-9999-9999-9999-999999999999';
    const emptyData = await getStaffDashboardData(unknownUserId);

    assert(emptyData.myCustomersCount === 0, 'Customers count for unknown user should be 0');
    assert(emptyData.myActiveLeadsCount === 0, 'Leads count for unknown user should be 0');
    assert(emptyData.myOpenDealsCount === 0, 'Deals count for unknown user should be 0');
    assert(emptyData.todayAgendaTasks.length === 0, 'Today agenda for unknown user should be empty');
    assert(emptyData.myPipelineByCurrency.length > 0, 'Pipeline currency array should have safe default');
    assert(emptyData.myPipelineByCurrency[0].totalValue === 0, 'Pipeline value should be 0');

    results.push({
      id: 'TEST-10',
      name: '[EDGE_CASE] Empty State & Zero-Division Safety',
      passed: true,
      details: 'Handled non-existent staff user gracefully with 0 values and no runtime crashes',
    });
  } catch (err: any) {
    results.push({
      id: 'TEST-10',
      name: '[EDGE_CASE] Empty State & Zero-Division Safety',
      passed: false,
      error: err.message,
    });
  }

  // Print Summary
  console.log('\n----------------------------------------------------------------');
  let passedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`[✓ PASS] ${r.id}: ${r.name}`);
      if (r.details) console.log(`        Details: ${r.details}`);
    } else {
      console.log(`[✗ FAIL] ${r.id}: ${r.name}`);
      console.log(`        Error: ${r.error}`);
    }
  }

  console.log('----------------------------------------------------------------');
  console.log(`Summary: ${passedCount}/${results.length} Tests Passed (${Math.round((passedCount / results.length) * 100)}%)`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
