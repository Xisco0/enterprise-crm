'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from './auth';
import { 
  ReportFilterParams, 
  CompleteReportData, 
  CustomerReportData, 
  LeadReportData, 
  DealReportData, 
  TaskReportData, 
  InteractionReportData,
  StaffWorkloadReportItem,
  ReportTab
} from '@/types/reports';
import { 
  CustomerType, 
  CustomerStatus, 
  LeadType, 
  LeadStatus, 
  LeadSource, 
  LeadPriority, 
  DealStage, 
  DealStatus, 
  TaskType, 
  TaskPriority, 
  TaskStatus, 
  InteractionType, 
  UserRole 
} from '@/types/database.types';
import { 
  resolveDateRange, 
  isDateInRange, 
  generateTimelineBuckets, 
  formatDateToYYYYMMDD 
} from '@/lib/utils/date-range';
import { getCustomers } from '@/lib/actions/customers';
import { getLeads } from '@/lib/actions/leads';
import { getDeals } from '@/lib/actions/deals';
import { getInteractions } from '@/lib/actions/interactions';
import { getTasks } from '@/lib/actions/tasks';
import { isTaskOverdue } from '@/lib/task-utils';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { 
  CUSTOMER_STATUS_CONFIG, 
  LEAD_STATUS_CONFIG, 
  LEAD_SOURCE_CONFIG, 
  LEAD_PRIORITY_CONFIG,
  DEAL_STAGE_CONFIG, 
  TASK_TYPE_CONFIG, 
  TASK_PRIORITY_CONFIG, 
  INTERACTION_TYPE_CONFIG 
} from '@/lib/constants';

const ALL_DEAL_STAGES: DealStage[] = [
  'NEW',
  'QUALIFICATION',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

/**
 * Fetch and compute complete report data based on date range and role scoping
 */
export async function getReportsData(
  filters: ReportFilterParams = {},
  overrideScope?: 'ALL' | 'ASSIGNED',
  overrideUserId?: string
): Promise<CompleteReportData> {
  const profile = await getCurrentProfile();
  const callerRole = profile?.role || (overrideScope === 'ALL' ? 'ADMIN' : 'STAFF');
  const callerUserId = overrideUserId || profile?.user_id || '00000000-0000-0000-0000-000000000001';

  // Enforce server-side RBAC scoping
  const isStaff = callerRole === 'STAFF';
  const effectiveScope: 'ALL' | 'ASSIGNED' = isStaff ? 'ASSIGNED' : (overrideScope || 'ALL');
  const targetStaffFilter = isStaff ? callerUserId : (filters.staff_id && filters.staff_id !== 'ALL' ? filters.staff_id : undefined);

  // 1. Resolve date boundaries and timeline buckets
  const dateRange = resolveDateRange(filters.preset || 'THIS_MONTH', filters.from, filters.to);
  const { startDate, endDate, startDateStr, endDateStr, label, preset, grouping } = dateRange;
  const timelineBuckets = generateTimelineBuckets(startDate, endDate, grouping);

  // 2. Fetch raw data from Supabase with fallback to local stores
  let rawCustomers: any[] = [];
  let rawLeads: any[] = [];
  let rawDeals: any[] = [];
  let rawTasks: any[] = [];
  let rawInteractions: any[] = [];
  let rawProfiles: any[] = [];

  try {
    const supabase = await createClient();
    const [custRes, leadRes, dealRes, taskRes, intRes, profRes] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('interactions').select('*'),
      supabase.from('profiles').select('*')
    ]);

    if (!custRes.error && custRes.data && custRes.data.length > 0) rawCustomers = custRes.data;
    if (!leadRes.error && leadRes.data && leadRes.data.length > 0) rawLeads = leadRes.data;
    if (!dealRes.error && dealRes.data && dealRes.data.length > 0) rawDeals = dealRes.data;
    if (!taskRes.error && taskRes.data && taskRes.data.length > 0) rawTasks = taskRes.data;
    if (!intRes.error && intRes.data && intRes.data.length > 0) rawInteractions = intRes.data;
    if (!profRes.error && profRes.data && profRes.data.length > 0) rawProfiles = profRes.data;
  } catch {
    // Fallback to in-memory stores
  }

  // Fallback to local store data
  if (rawCustomers.length === 0) rawCustomers = (await getCustomers(undefined, 'ALL')).customers;
  if (rawLeads.length === 0) rawLeads = (await getLeads(undefined, 'ALL')).leads;
  if (rawDeals.length === 0) rawDeals = (await getDeals(undefined, 'ALL')).deals;
  if (rawTasks.length === 0) rawTasks = await getTasks(undefined, 'ALL');
  if (rawInteractions.length === 0) rawInteractions = (await getInteractions(undefined, 'ALL')).interactions;
  if (rawProfiles.length === 0) rawProfiles = await getAllStaffProfiles();

  // Apply staff scoping if staff user or specific staff filter selected
  let customers = [...rawCustomers];
  let leads = [...rawLeads];
  let deals = [...rawDeals];
  let tasks = [...rawTasks];
  let interactions = [...rawInteractions];

  if (targetStaffFilter) {
    customers = customers.filter(c => c.assigned_to === targetStaffFilter || c.created_by === targetStaffFilter);
    leads = leads.filter(l => l.assigned_to === targetStaffFilter || l.created_by === targetStaffFilter);
    deals = deals.filter(d => d.assigned_to === targetStaffFilter || d.created_by === targetStaffFilter);
    tasks = tasks.filter(t => t.assigned_to === targetStaffFilter || t.created_by === targetStaffFilter);
    interactions = interactions.filter(i => i.performed_by === targetStaffFilter);
  }

  // ---------------------------------------------------------------------------
  // REPORT 1: CUSTOMERS
  // ---------------------------------------------------------------------------
  const totalCustomers = customers.length;
  const newCustomersInPeriod = customers.filter(c => isDateInRange(c.created_at, startDate, endDate)).length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const inactiveCustomers = customers.filter(c => c.status === 'INACTIVE' || c.status === 'ARCHIVED').length;
  const churnedCustomers = customers.filter(c => c.status === 'CHURNED').length;

  const customerTypeMap: Record<CustomerType, number> = { BUSINESS: 0, INDIVIDUAL: 0 };
  for (const c of customers) {
    const t = (c.customer_type || 'BUSINESS') as CustomerType;
    if (customerTypeMap[t] !== undefined) customerTypeMap[t]++;
  }
  const byCustomerType = (['BUSINESS', 'INDIVIDUAL'] as CustomerType[]).map(type => ({
    type,
    label: type === 'BUSINESS' ? 'Corporate / Enterprise' : 'Individual / Private',
    count: customerTypeMap[type],
    percentage: totalCustomers > 0 ? Math.round((customerTypeMap[type] / totalCustomers) * 100) : 0,
  }));

  const customerStatusMap: Record<string, number> = {};
  for (const c of customers) {
    const s = c.status || 'ACTIVE';
    customerStatusMap[s] = (customerStatusMap[s] || 0) + 1;
  }
  const byCustomerStatus = Object.keys(CUSTOMER_STATUS_CONFIG).map(s => {
    const count = customerStatusMap[s] || 0;
    return {
      status: s as CustomerStatus,
      label: CUSTOMER_STATUS_CONFIG[s as CustomerStatus]?.label || s,
      count,
      percentage: totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0,
    };
  });

  // Customer Growth Timeline
  let runningTotal = customers.filter(c => new Date(c.created_at).getTime() < startDate.getTime()).length;
  const customerGrowthTimeline = timelineBuckets.map(bucket => {
    const addedInBucket = customers.filter(c => {
      const t = new Date(c.created_at).getTime();
      return t >= bucket.start && t <= bucket.end;
    }).length;
    runningTotal += addedInBucket;
    return {
      date: bucket.key,
      label: bucket.label,
      newCustomers: addedInBucket,
      cumulative: runningTotal,
    };
  });

  const customerReport: CustomerReportData = {
    totalCustomers,
    newCustomersInPeriod,
    activeCustomers,
    inactiveCustomers,
    churnedCustomers,
    byType: byCustomerType,
    byStatus: byCustomerStatus,
    growthTimeline: customerGrowthTimeline,
  };

  // ---------------------------------------------------------------------------
  // REPORT 2: LEADS & CONVERSION
  // ---------------------------------------------------------------------------
  const totalLeads = leads.length;
  const newLeadsInPeriod = leads.filter(l => isDateInRange(l.created_at, startDate, endDate)).length;
  const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED').length;
  const convertedLeadsInPeriod = leads.filter(l => 
    l.status === 'CONVERTED' && isDateInRange(l.converted_at || l.updated_at, startDate, endDate)
  ).length;
  const lostLeadsInPeriod = leads.filter(l => 
    l.status === 'LOST' && isDateInRange(l.updated_at, startDate, endDate)
  ).length;

  const totalConvertedAllTime = leads.filter(l => l.status === 'CONVERTED').length;
  const conversionRate = newLeadsInPeriod > 0
    ? Math.round((convertedLeadsInPeriod / newLeadsInPeriod) * 100)
    : (convertedLeadsInPeriod > 0 && totalLeads > 0 
        ? Math.round((convertedLeadsInPeriod / totalLeads) * 100)
        : null);

  const leadStatusMap: Record<string, number> = {};
  for (const l of leads) {
    const s = l.status || 'NEW';
    leadStatusMap[s] = (leadStatusMap[s] || 0) + 1;
  }
  const byLeadStatus = Object.keys(LEAD_STATUS_CONFIG).map(s => {
    const count = leadStatusMap[s] || 0;
    return {
      status: s as LeadStatus,
      label: LEAD_STATUS_CONFIG[s as LeadStatus]?.label || s,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    };
  });

  const leadSourceMap: Record<string, number> = {};
  for (const l of leads) {
    const src = l.source || 'OTHER';
    leadSourceMap[src] = (leadSourceMap[src] || 0) + 1;
  }
  const byLeadSource = Object.keys(LEAD_SOURCE_CONFIG).map(src => {
    const count = leadSourceMap[src] || 0;
    return {
      source: src as LeadSource,
      label: LEAD_SOURCE_CONFIG[src as LeadSource]?.label || src,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    };
  }).filter(item => item.count > 0);

  const leadPriorityMap: Record<string, number> = {};
  for (const l of leads) {
    const p = l.priority || 'MEDIUM';
    leadPriorityMap[p] = (leadPriorityMap[p] || 0) + 1;
  }
  const byLeadPriority = Object.keys(LEAD_PRIORITY_CONFIG).map(p => {
    const count = leadPriorityMap[p] || 0;
    return {
      priority: p as LeadPriority,
      label: LEAD_PRIORITY_CONFIG[p as LeadPriority]?.label || p,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    };
  });

  // Conversion Timeline
  const conversionTimeline = timelineBuckets.map(bucket => {
    const newInBucket = leads.filter(l => {
      const t = new Date(l.created_at).getTime();
      return t >= bucket.start && t <= bucket.end;
    }).length;
    const convertedInBucket = leads.filter(l => {
      if (l.status !== 'CONVERTED') return false;
      const t = new Date(l.converted_at || l.updated_at).getTime();
      return t >= bucket.start && t <= bucket.end;
    }).length;

    return {
      date: bucket.key,
      label: bucket.label,
      newLeads: newInBucket,
      convertedLeads: convertedInBucket,
    };
  });

  const leadReport: LeadReportData = {
    totalLeads,
    newLeadsInPeriod,
    qualifiedLeads,
    convertedLeadsInPeriod,
    lostLeadsInPeriod,
    conversionRate,
    byStatus: byLeadStatus,
    bySource: byLeadSource,
    byPriority: byLeadPriority,
    conversionTimeline,
  };

  // ---------------------------------------------------------------------------
  // REPORT 3: DEALS & REVENUE PIPELINE
  // ---------------------------------------------------------------------------
  const totalDealsCreatedInPeriod = deals.filter(d => isDateInRange(d.created_at, startDate, endDate)).length;
  const openDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.status !== 'WON' && d.status !== 'LOST');
  const openDealsCount = openDeals.length;

  const wonDeals = deals.filter(d => 
    (d.stage === 'CLOSED_WON' || d.status === 'WON') && 
    isDateInRange(d.won_at || d.actual_close_date || d.closed_at || d.updated_at, startDate, endDate)
  );
  const wonDealsCount = wonDeals.length;

  const lostDeals = deals.filter(d => 
    (d.stage === 'CLOSED_LOST' || d.status === 'LOST') && 
    isDateInRange(d.lost_at || d.closed_at || d.updated_at, startDate, endDate)
  );
  const lostDealsCount = lostDeals.length;

  const winRate = (wonDealsCount + lostDealsCount) > 0 
    ? Math.round((wonDealsCount / (wonDealsCount + lostDealsCount)) * 1000) / 10 
    : null;

  // Pipeline by currency
  const openCurrencyMap = new Map<string, { totalValue: number; count: number }>();
  for (const deal of openDeals) {
    const curr = deal.currency || 'USD';
    const amount = Number(deal.amount ?? deal.value) || 0;
    const existing = openCurrencyMap.get(curr) || { totalValue: 0, count: 0 };
    existing.totalValue += amount;
    existing.count += 1;
    openCurrencyMap.set(curr, existing);
  }
  const pipelineByCurrency = Array.from(openCurrencyMap.entries()).map(([currency, data]) => ({
    currency,
    totalValue: data.totalValue,
    count: data.count,
  }));
  if (pipelineByCurrency.length === 0) {
    pipelineByCurrency.push({ currency: 'USD', totalValue: 0, count: 0 });
  }

  // Won value by currency
  const wonCurrencyMap = new Map<string, { totalValue: number; count: number }>();
  for (const deal of wonDeals) {
    const curr = deal.currency || 'USD';
    const amount = Number(deal.amount ?? deal.value) || 0;
    const existing = wonCurrencyMap.get(curr) || { totalValue: 0, count: 0 };
    existing.totalValue += amount;
    existing.count += 1;
    wonCurrencyMap.set(curr, existing);
  }
  const wonValueByCurrency = Array.from(wonCurrencyMap.entries()).map(([currency, data]) => ({
    currency,
    totalValue: data.totalValue,
    count: data.count,
    averageValue: data.count > 0 ? Math.round(data.totalValue / data.count) : 0,
  }));
  if (wonValueByCurrency.length === 0) {
    wonValueByCurrency.push({ currency: 'USD', totalValue: 0, count: 0, averageValue: 0 });
  }

  // Lost value by currency
  const lostCurrencyMap = new Map<string, { totalValue: number; count: number }>();
  for (const deal of lostDeals) {
    const curr = deal.currency || 'USD';
    const amount = Number(deal.amount ?? deal.value) || 0;
    const existing = lostCurrencyMap.get(curr) || { totalValue: 0, count: 0 };
    existing.totalValue += amount;
    existing.count += 1;
    lostCurrencyMap.set(curr, existing);
  }
  const lostValueByCurrency = Array.from(lostCurrencyMap.entries()).map(([currency, data]) => ({
    currency,
    totalValue: data.totalValue,
    count: data.count,
  }));
  if (lostValueByCurrency.length === 0) {
    lostValueByCurrency.push({ currency: 'USD', totalValue: 0, count: 0 });
  }

  // Stage distribution
  const byStage = ALL_DEAL_STAGES.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const totalVal = stageDeals.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
    return {
      stage,
      label: DEAL_STAGE_CONFIG[stage]?.label || stage,
      count: stageDeals.length,
      totalValue: totalVal,
      currency: stageDeals[0]?.currency || 'USD',
    };
  });

  // Lost reasons distribution
  const lostReasonMap: Record<string, number> = {};
  for (const deal of lostDeals) {
    const reason = deal.lost_reason || 'Unspecified / No Feedback';
    lostReasonMap[reason] = (lostReasonMap[reason] || 0) + 1;
  }
  const lostReasons = Object.entries(lostReasonMap).map(([reason, count]) => ({
    reason,
    count,
    percentage: lostDealsCount > 0 ? Math.round((count / lostDealsCount) * 100) : 0,
  }));

  // Won Deals Timeline
  const wonDealsTimeline = timelineBuckets.map(bucket => {
    const wonInBucket = wonDeals.filter(d => {
      const t = new Date(d.won_at || d.actual_close_date || d.closed_at || d.updated_at).getTime();
      return t >= bucket.start && t <= bucket.end;
    });
    const val = wonInBucket.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
    return {
      date: bucket.key,
      label: bucket.label,
      count: wonInBucket.length,
      totalValue: val,
      currency: wonInBucket[0]?.currency || 'USD',
    };
  });

  const dealReport: DealReportData = {
    totalDealsCreatedInPeriod,
    openDealsCount,
    wonDealsInPeriod: wonDealsCount,
    lostDealsInPeriod: lostDealsCount,
    winRate,
    pipelineByCurrency,
    wonValueByCurrency,
    lostValueByCurrency,
    byStage,
    lostReasons,
    wonDealsTimeline,
  };

  // ---------------------------------------------------------------------------
  // REPORT 4: TASKS & FOLLOW-UPS
  // ---------------------------------------------------------------------------
  const totalTasksCreatedInPeriod = tasks.filter(t => isDateInRange(t.created_at, startDate, endDate)).length;
  const tasksCompletedInPeriod = tasks.filter(t => 
    t.status === 'COMPLETED' && isDateInRange(t.completed_at || t.updated_at, startDate, endDate)
  ).length;
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueCount = tasks.filter(t => isTaskOverdue(t)).length;
  const cancelledCount = tasks.filter(t => t.status === 'CANCELLED').length;

  const completionRate = totalTasksCreatedInPeriod > 0
    ? Math.round((tasksCompletedInPeriod / totalTasksCreatedInPeriod) * 1000) / 10
    : null;

  const taskTypeMap: Record<string, number> = {};
  for (const t of tasks) {
    const tp = t.task_type || 'FOLLOW_UP';
    taskTypeMap[tp] = (taskTypeMap[tp] || 0) + 1;
  }
  const byTaskType = Object.keys(TASK_TYPE_CONFIG).map(tp => ({
    type: tp as TaskType,
    label: TASK_TYPE_CONFIG[tp as TaskType]?.label || tp,
    count: taskTypeMap[tp] || 0,
  }));

  const taskPriorityMap: Record<string, number> = {};
  for (const t of tasks) {
    const p = t.priority || 'MEDIUM';
    taskPriorityMap[p] = (taskPriorityMap[p] || 0) + 1;
  }
  const byTaskPriority = Object.keys(TASK_PRIORITY_CONFIG).map(p => ({
    priority: p as TaskPriority,
    label: TASK_PRIORITY_CONFIG[p as TaskPriority]?.label || p,
    count: taskPriorityMap[p] || 0,
  }));

  const taskTimeline = timelineBuckets.map(bucket => {
    const createdInBucket = tasks.filter(t => {
      const time = new Date(t.created_at).getTime();
      return time >= bucket.start && time <= bucket.end;
    }).length;
    const completedInBucket = tasks.filter(t => {
      if (t.status !== 'COMPLETED') return false;
      const time = new Date(t.completed_at || t.updated_at).getTime();
      return time >= bucket.start && time <= bucket.end;
    }).length;

    return {
      date: bucket.key,
      label: bucket.label,
      created: createdInBucket,
      completed: completedInBucket,
    };
  });

  const taskReport: TaskReportData = {
    totalTasksCreatedInPeriod,
    tasksCompletedInPeriod,
    pendingCount,
    inProgressCount,
    overdueCount,
    cancelledCount,
    completionRate,
    byType: byTaskType,
    byPriority: byTaskPriority,
    completionTimeline: taskTimeline,
  };

  // ---------------------------------------------------------------------------
  // REPORT 5: INTERACTIONS & COMMUNICATIONS
  // ---------------------------------------------------------------------------
  const interactionsInPeriod = interactions.filter(i => 
    isDateInRange(i.performed_at || i.interaction_at || i.created_at, startDate, endDate)
  );
  const totalInteractionsInPeriod = interactionsInPeriod.length;

  const interactionTypeMap: Record<string, number> = {};
  let totalMinutes = 0;
  let durationCount = 0;

  for (const i of interactionsInPeriod) {
    const tp = i.type || 'NOTE';
    interactionTypeMap[tp] = (interactionTypeMap[tp] || 0) + 1;
    if (i.duration_minutes && typeof i.duration_minutes === 'number') {
      totalMinutes += i.duration_minutes;
      durationCount++;
    }
  }

  const byInteractionType = Object.keys(INTERACTION_TYPE_CONFIG).map(tp => {
    const count = interactionTypeMap[tp] || 0;
    return {
      type: tp as InteractionType,
      label: INTERACTION_TYPE_CONFIG[tp as InteractionType]?.label || tp,
      count,
      percentage: totalInteractionsInPeriod > 0 ? Math.round((count / totalInteractionsInPeriod) * 100) : 0,
    };
  });

  const interactionTimeline = timelineBuckets.map(bucket => {
    const inBucket = interactions.filter(i => {
      const t = new Date(i.performed_at || i.interaction_at || i.created_at).getTime();
      return t >= bucket.start && t <= bucket.end;
    });

    const calls = inBucket.filter(i => i.type === 'CALL').length;
    const emails = inBucket.filter(i => i.type === 'EMAIL').length;
    const meetings = inBucket.filter(i => i.type === 'MEETING').length;
    const notes = inBucket.filter(i => i.type === 'NOTE').length;
    const other = inBucket.length - calls - emails - meetings - notes;

    return {
      date: bucket.key,
      label: bucket.label,
      calls,
      emails,
      meetings,
      notes,
      other,
      total: inBucket.length,
    };
  });

  const interactionReport: InteractionReportData = {
    totalInteractionsInPeriod,
    byType: byInteractionType,
    activityTimeline: interactionTimeline,
    averageDurationMinutes: durationCount > 0 ? Math.round(totalMinutes / durationCount) : null,
  };

  // ---------------------------------------------------------------------------
  // REPORT 6: STAFF WORKLOAD (ADMIN ONLY)
  // ---------------------------------------------------------------------------
  let staffWorkload: StaffWorkloadReportItem[] | undefined = undefined;

  if (!isStaff) {
    staffWorkload = rawProfiles.map(p => {
      const pUserId = p.user_id || p.id;
      const assignedCustomers = rawCustomers.filter(c => c.assigned_to === pUserId).length;
      const assignedLeads = rawLeads.filter(l => l.assigned_to === pUserId && l.status !== 'CONVERTED' && l.status !== 'LOST').length;
      const staffDeals = rawDeals.filter(d => d.assigned_to === pUserId && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
      const openDealsValueUSD = staffDeals.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
      const openTasks = rawTasks.filter(t => t.assigned_to === pUserId && (t.status === 'PENDING' || t.status === 'IN_PROGRESS')).length;
      const completedTasksInPeriod = rawTasks.filter(t => 
        t.assigned_to === pUserId && 
        t.status === 'COMPLETED' && 
        isDateInRange(t.completed_at || t.updated_at, startDate, endDate)
      ).length;
      const interactionsInPeriod = rawInteractions.filter(i => 
        i.performed_by === pUserId && 
        isDateInRange(i.performed_at || i.interaction_at || i.created_at, startDate, endDate)
      ).length;

      return {
        staffId: pUserId,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
        email: p.email,
        role: p.role || 'STAFF',
        assignedCustomers,
        assignedLeads,
        openDeals: staffDeals.length,
        openDealsValueUSD,
        openTasks,
        completedTasksInPeriod,
        interactionsInPeriod,
      };
    });
  }

  return {
    metadata: {
      startDateStr,
      endDateStr,
      label,
      preset,
      selectedStaffId: targetStaffFilter || 'ALL',
      userRole: callerRole,
      generatedAt: new Date().toISOString(),
    },
    customers: customerReport,
    leads: leadReport,
    deals: dealReport,
    tasks: taskReport,
    interactions: interactionReport,
    staffWorkload,
  };
}
