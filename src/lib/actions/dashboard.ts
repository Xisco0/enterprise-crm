'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  AdminDashboardData, 
  StaffDashboardData, 
  CurrencyPipelineSummary, 
  StaffWorkloadSummary,
  DealWithDetails,
  TaskWithDetails,
  LeadWithAssignee,
  InteractionWithPerformer,
  DealStage,
  UserRole
} from '@/types/crm';
import { getCustomers } from '@/lib/actions/customers';
import { getLeads } from '@/lib/actions/leads';
import { getDeals } from '@/lib/actions/deals';
import { getInteractions } from '@/lib/actions/interactions';
import { getTasks } from '@/lib/actions/tasks';
import { isTaskOverdue } from '@/lib/task-utils';
import { getAllStaffProfiles } from '@/lib/actions/staff';

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
 * Get organization-wide aggregated metrics, pipeline status, staff workload,
 * urgent tasks, and recent omnichannel interactions for Admin Dashboard.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // Fetch real data across all entities
  let customers: any[] = [];
  let leads: any[] = [];
  let deals: any[] = [];
  let tasks: any[] = [];
  let interactions: any[] = [];
  let profiles: any[] = [];

  try {
    const supabase = await createClient();
    
    // Try fetching in parallel from Supabase
    const [
      customersRes,
      leadsRes,
      dealsRes,
      tasksRes,
      interactionsRes,
      profilesRes
    ] = await Promise.all([
      supabase.from('customers').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)'),
      supabase.from('leads').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)'),
      supabase.from('deals').select('*, customer:customer_id(id, name, company_name, customer_number), lead:lead_id(id, first_name, last_name, company), assignee:assigned_to(id, first_name, last_name, email, avatar_url)'),
      supabase.from('tasks').select('*, customer:customer_id(id, name, company_name, customer_number), lead:lead_id(id, first_name, last_name, company), deal:deal_id(id, title), assignee:assigned_to(id, first_name, last_name, email)'),
      supabase.from('interactions').select('*, performer:performed_by(id, first_name, last_name, email, avatar_url), customer:customer_id(id, name, company_name), lead:lead_id(id, first_name, last_name, company), deal:deal_id(id, title)').order('performed_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('*')
    ]);

    if (!customersRes.error && customersRes.data && customersRes.data.length > 0) customers = customersRes.data;
    if (!leadsRes.error && leadsRes.data && leadsRes.data.length > 0) leads = leadsRes.data;
    if (!dealsRes.error && dealsRes.data && dealsRes.data.length > 0) deals = dealsRes.data;
    if (!tasksRes.error && tasksRes.data && tasksRes.data.length > 0) tasks = tasksRes.data;
    if (!interactionsRes.error && interactionsRes.data && interactionsRes.data.length > 0) interactions = interactionsRes.data;
    if (!profilesRes.error && profilesRes.data && profilesRes.data.length > 0) profiles = profilesRes.data;
  } catch {
    // Continue with local stores fallback
  }

  // Fallback to local stores if Supabase returned empty/offline
  if (customers.length === 0) {
    const res = await getCustomers(undefined, 'ALL');
    customers = res.customers || [];
  }
  if (leads.length === 0) {
    const res = await getLeads(undefined, 'ALL');
    leads = res.leads || [];
  }
  if (deals.length === 0) {
    const res = await getDeals(undefined, 'ALL');
    deals = res.deals || [];
  }
  if (tasks.length === 0) {
    const res = await getTasks(undefined, 'ALL');
    tasks = Array.isArray(res) ? res : [];
  }
  if (interactions.length === 0) {
    const res = await getInteractions(undefined, 'ALL');
    interactions = res.interactions || [];
  }
  if (profiles.length === 0) {
    profiles = await getAllStaffProfiles();
  }

  // 1. Customer metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;

  // 2. Active Leads metrics (not Converted or Lost)
  const activeLeads = leads.filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST').length;

  // 3. Open Deals & Pipeline value by currency
  const openDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.status !== 'WON' && d.status !== 'LOST');
  const openDealsCount = openDeals.length;

  const currencyMap = new Map<string, { totalValue: number; count: number }>();
  for (const deal of openDeals) {
    const curr = deal.currency || 'USD';
    const amount = Number(deal.amount ?? deal.value) || 0;
    const existing = currencyMap.get(curr) || { totalValue: 0, count: 0 };
    existing.totalValue += amount;
    existing.count += 1;
    currencyMap.set(curr, existing);
  }

  const pipelineByCurrency: CurrencyPipelineSummary[] = Array.from(currencyMap.entries()).map(([currency, data]) => ({
    currency,
    totalValue: data.totalValue,
    count: data.count,
  }));

  if (pipelineByCurrency.length === 0) {
    pipelineByCurrency.push({ currency: 'USD', totalValue: 0, count: 0 });
  }

  // 4. Won & Lost Deals this Month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let wonCount = 0;
  let wonTotal = 0;
  let lostCount = 0;
  let lostTotal = 0;

  for (const deal of deals) {
    const amount = Number(deal.amount ?? deal.value) || 0;
    const dealTime = new Date(deal.won_at || deal.actual_close_date || deal.closed_at || deal.updated_at || deal.created_at).getTime();

    if (deal.stage === 'CLOSED_WON' || deal.status === 'WON') {
      if (dealTime >= startOfMonth) {
        wonCount += 1;
        wonTotal += amount;
      }
    } else if (deal.stage === 'CLOSED_LOST' || deal.status === 'LOST') {
      if (dealTime >= startOfMonth) {
        lostCount += 1;
        lostTotal += amount;
      }
    }
  }

  // 5. Task Workload
  let pendingCount = 0;
  let inProgressCount = 0;
  let overdueCount = 0;
  let completedThisWeekCount = 0;

  const oneWeekAgo = Date.now() - 7 * 86400000;

  for (const task of tasks) {
    if (task.status === 'PENDING') pendingCount += 1;
    if (task.status === 'IN_PROGRESS') inProgressCount += 1;
    if (isTaskOverdue(task)) overdueCount += 1;
    if (task.status === 'COMPLETED' && task.completed_at) {
      const completedTime = new Date(task.completed_at).getTime();
      if (completedTime >= oneWeekAgo) completedThisWeekCount += 1;
    }
  }

  // 6. Pipeline breakdown by stage
  const pipelineByStage = ALL_DEAL_STAGES.map((stage) => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const totalValue = stageDeals.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
    return {
      stage,
      count: stageDeals.length,
      totalValue,
      currency: stageDeals[0]?.currency || 'USD',
    };
  });

  // 7. Staff Workload Summary
  const staffWorkload: StaffWorkloadSummary[] = profiles.map((p) => {
    const pUserId = p.user_id || p.id;
    const staffLeads = leads.filter(l => l.assigned_to === pUserId && l.status !== 'CONVERTED' && l.status !== 'LOST');
    const staffOpenDeals = deals.filter(d => d.assigned_to === pUserId && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
    const staffOpenVal = staffOpenDeals.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
    const staffPendingTasks = tasks.filter(t => t.assigned_to === pUserId && (t.status === 'PENDING' || t.status === 'IN_PROGRESS'));
    const staffOverdueTasks = tasks.filter(t => t.assigned_to === pUserId && isTaskOverdue(t));

    return {
      staffId: pUserId,
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
      email: p.email,
      avatarUrl: p.avatar_url || null,
      role: p.role || 'STAFF',
      activeLeadsCount: staffLeads.length,
      openDealsCount: staffOpenDeals.length,
      openDealsValueUSD: staffOpenVal,
      pendingTasksCount: staffPendingTasks.length,
      overdueTasksCount: staffOverdueTasks.length,
    };
  });

  // 8. Urgent tasks (pending/in-progress + urgent/high priority)
  const urgentTasks = tasks
    .filter(t => (t.status === 'PENDING' || t.status === 'IN_PROGRESS') && (t.priority === 'URGENT' || t.priority === 'HIGH' || isTaskOverdue(t)))
    .slice(0, 5) as TaskWithDetails[];

  // 9. Recent deals (open, sorted by created_at desc)
  const recentDeals = openDeals
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) as DealWithDetails[];

  // 10. Recent activities
  const recentActivities = interactions
    .sort((a, b) => new Date(b.performed_at || b.created_at).getTime() - new Date(a.performed_at || a.created_at).getTime())
    .slice(0, 8) as InteractionWithPerformer[];

  return {
    totalCustomers,
    activeCustomers,
    activeLeads,
    openDealsCount,
    pipelineByCurrency,
    wonDealsThisMonth: { count: wonCount, totalValue: wonTotal, currency: 'USD' },
    lostDealsThisMonth: { count: lostCount, totalValue: lostTotal, currency: 'USD' },
    taskWorkload: {
      pendingCount,
      inProgressCount,
      overdueCount,
      completedThisWeekCount,
    },
    pipelineByStage,
    staffWorkload,
    recentActivities,
    recentDeals,
    urgentTasks,
  };
}

/**
 * Get staff-scoped personal dashboard metrics, today's actionable agenda,
 * my pipeline, my recent leads, and my activity feed.
 */
export async function getStaffDashboardData(targetUserId?: string): Promise<StaffDashboardData> {
  let currentUserId = targetUserId;
  let currentUserProfile: any = null;

  try {
    const supabase = await createClient();
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        if (profile) currentUserProfile = profile;
      }
    } else {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', currentUserId).single();
      if (profile) currentUserProfile = profile;
    }
  } catch {
    // Continue
  }

  // Fallback user profile if demo or local
  if (!currentUserId) {
    currentUserId = '00000000-0000-0000-0000-000000000002'; // Default Marcus Vance
  }

  if (!currentUserProfile) {
    const allProfiles = await getAllStaffProfiles();
    currentUserProfile = allProfiles.find(p => p.user_id === currentUserId || p.id === currentUserId) || {
      id: currentUserId,
      user_id: currentUserId,
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      role: 'STAFF' as UserRole,
    };
  }

  // Fetch scoped data for this staff user
  let customers: any[] = [];
  let leads: any[] = [];
  let deals: any[] = [];
  let tasks: any[] = [];
  let interactions: any[] = [];

  try {
    const supabase = await createClient();
    const [
      customersRes,
      leadsRes,
      dealsRes,
      tasksRes,
      interactionsRes
    ] = await Promise.all([
      supabase.from('customers').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)').eq('assigned_to', currentUserId),
      supabase.from('leads').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)').eq('assigned_to', currentUserId),
      supabase.from('deals').select('*, customer:customer_id(id, name, company_name, customer_number), lead:lead_id(id, first_name, last_name, company), assignee:assigned_to(id, first_name, last_name, email, avatar_url)').eq('assigned_to', currentUserId),
      supabase.from('tasks').select('*, customer:customer_id(id, name, company_name, customer_number), lead:lead_id(id, first_name, last_name, company), deal:deal_id(id, title), assignee:assigned_to(id, first_name, last_name, email)').eq('assigned_to', currentUserId),
      supabase.from('interactions').select('*, performer:performed_by(id, first_name, last_name, email, avatar_url), customer:customer_id(id, name, company_name), lead:lead_id(id, first_name, last_name, company), deal:deal_id(id, title)').eq('performed_by', currentUserId).order('performed_at', { ascending: false }).limit(10)
    ]);

    if (!customersRes.error && customersRes.data && customersRes.data.length > 0) customers = customersRes.data;
    if (!leadsRes.error && leadsRes.data && leadsRes.data.length > 0) leads = leadsRes.data;
    if (!dealsRes.error && dealsRes.data && dealsRes.data.length > 0) deals = dealsRes.data;
    if (!tasksRes.error && tasksRes.data && tasksRes.data.length > 0) tasks = tasksRes.data;
    if (!interactionsRes.error && interactionsRes.data && interactionsRes.data.length > 0) interactions = interactionsRes.data;
  } catch {
    // Continue
  }

  // Fallback to local stores scoped to currentUserId
  if (customers.length === 0) {
    const res = await getCustomers(undefined, 'ASSIGNED', currentUserId);
    customers = (res.customers || []).filter(c => c.assigned_to === currentUserId);
  }
  if (leads.length === 0) {
    const res = await getLeads(undefined, 'ASSIGNED', currentUserId);
    leads = (res.leads || []).filter(l => l.assigned_to === currentUserId);
  }
  if (deals.length === 0) {
    const res = await getDeals(undefined, 'ASSIGNED', currentUserId);
    deals = (res.deals || []).filter(d => d.assigned_to === currentUserId);
  }
  if (tasks.length === 0) {
    const res = await getTasks(undefined, 'ASSIGNED', currentUserId);
    tasks = (Array.isArray(res) ? res : []).filter(t => t.assigned_to === currentUserId);
  }
  if (interactions.length === 0) {
    const res = await getInteractions(undefined, 'ALL');
    interactions = (res.interactions || []).filter(i => i.performed_by === currentUserId || i.performer?.id === currentUserId);
  }

  // 1. My Customers
  const myCustomersCount = customers.length;

  // 2. My Active Leads (not converted or lost)
  const myActiveLeads = leads.filter(l => l.status !== 'CONVERTED' && l.status !== 'LOST');
  const myActiveLeadsCount = myActiveLeads.length;

  // 3. My Open Deals & Pipeline value by currency
  const myOpenDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.status !== 'WON' && d.status !== 'LOST');
  const myOpenDealsCount = myOpenDeals.length;

  const currencyMap = new Map<string, { totalValue: number; count: number }>();
  for (const deal of myOpenDeals) {
    const curr = deal.currency || 'USD';
    const amount = Number(deal.amount ?? deal.value) || 0;
    const existing = currencyMap.get(curr) || { totalValue: 0, count: 0 };
    existing.totalValue += amount;
    existing.count += 1;
    currencyMap.set(curr, existing);
  }

  const myPipelineByCurrency: CurrencyPipelineSummary[] = Array.from(currencyMap.entries()).map(([currency, data]) => ({
    currency,
    totalValue: data.totalValue,
    count: data.count,
  }));

  if (myPipelineByCurrency.length === 0) {
    myPipelineByCurrency.push({ currency: 'USD', totalValue: 0, count: 0 });
  }

  // 4. Tasks & Today's Agenda
  const todayStr = new Date().toISOString().split('T')[0];
  let todayTasksCount = 0;
  let overdueTasksCount = 0;
  let completedThisWeekCount = 0;

  const oneWeekAgo = Date.now() - 7 * 86400000;

  for (const task of tasks) {
    const isOverdue = isTaskOverdue(task);
    const taskDueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null;

    if (isOverdue) overdueTasksCount += 1;
    if (taskDueDate === todayStr && (task.status === 'PENDING' || task.status === 'IN_PROGRESS')) {
      todayTasksCount += 1;
    }
    if (task.status === 'COMPLETED' && task.completed_at) {
      const completedTime = new Date(task.completed_at).getTime();
      if (completedTime >= oneWeekAgo) completedThisWeekCount += 1;
    }
  }

  // Today Agenda Tasks: Pending or In-Progress tasks due today or overdue, ordered by priority and due date
  const todayAgendaTasks = tasks
    .filter(t => (t.status === 'PENDING' || t.status === 'IN_PROGRESS'))
    .sort((a, b) => {
      // Overdue first
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then URGENT / HIGH priority
      const pOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const aP = pOrder[a.priority] ?? 2;
      const bP = pOrder[b.priority] ?? 2;
      if (aP !== bP) return aP - bP;

      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 6) as TaskWithDetails[];

  // 5. My Pipeline by Stage
  const pipelineByStage = ALL_DEAL_STAGES.map((stage) => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const totalValue = stageDeals.reduce((acc, curr) => acc + (Number(curr.amount ?? curr.value) || 0), 0);
    return {
      stage,
      count: stageDeals.length,
      totalValue,
      currency: stageDeals[0]?.currency || 'USD',
    };
  });

  // 6. My Active Deals list
  const myActiveDeals = myOpenDeals
    .sort((a, b) => (Number(b.amount ?? b.value) || 0) - (Number(a.amount ?? a.value) || 0))
    .slice(0, 5) as DealWithDetails[];

  // 7. My Recent Leads
  const myRecentLeads = myActiveLeads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) as LeadWithAssignee[];

  // 8. My Recent Activities
  const myRecentActivities = interactions
    .sort((a, b) => new Date(b.performed_at || b.created_at).getTime() - new Date(a.performed_at || a.created_at).getTime())
    .slice(0, 6) as InteractionWithPerformer[];

  return {
    user: {
      id: currentUserId,
      firstName: currentUserProfile.first_name || 'Staff',
      lastName: currentUserProfile.last_name || 'Member',
      email: currentUserProfile.email || '',
      role: (currentUserProfile.role as UserRole) || 'STAFF',
    },
    myCustomersCount,
    myActiveLeadsCount,
    myOpenDealsCount,
    myPipelineByCurrency,
    todayTasksCount,
    overdueTasksCount,
    completedThisWeekCount,
    todayAgendaTasks,
    myActiveDeals,
    myRecentLeads,
    myRecentActivities,
    pipelineByStage,
  };
}
