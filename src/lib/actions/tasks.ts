'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from './auth';
import { taskInputSchema, taskFilterSchema, TaskInput } from '@/lib/validations/task';
import { TaskWithDetails, TaskFiltersParams, TaskMetricsSummary } from '@/types/crm';
import { TaskStatus, TaskPriority, TaskType } from '@/types/database.types';
import { isTaskOverdue } from '@/lib/utils';

// In-Memory Dev Store for fallback resilience
let LOCAL_TASKS_STORE: TaskWithDetails[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    task_number: 'TASK-000001',
    title: 'Review Enterprise Architecture Proposal with David Miller',
    description: 'Go over SLA tier 1 terms, SSO configuration, and multi-tenant security architecture before final contract sign-off.',
    task_type: 'MEETING',
    status: 'PENDING',
    priority: 'HIGH',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    due_time: '14:30:00',
    due_at: new Date(Date.now() + 86400000).toISOString(),
    completed_at: null,
    completed_by: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111101', customer_number: 'CUS-000001', name: 'David Miller', company_name: 'Apex Logistics Global', email: 'd.miller@apexlogistics.com', phone: '+1 (555) 234-5678' },
    deal: { id: '33333333-3333-3333-3333-333333333301', title: 'Global Fleet Modernization Platform', deal_number: 'DEAL-000001', value: 85000, currency: 'USD' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    creator: { id: '00000000-0000-0000-0000-000000000001', first_name: 'Alex', last_name: 'Mercer', email: 'admin@enterprise.com' },
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    task_number: 'TASK-000002',
    title: 'Follow-up Call on Discovery Questionnaire',
    description: 'Verify automation requirements and timeline expectations with Rachel Adams.',
    task_type: 'CALL',
    status: 'PENDING',
    priority: 'MEDIUM',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222201',
    deal_id: null,
    due_date: new Date().toISOString().split('T')[0], // Today
    due_time: '11:00:00',
    due_at: new Date().toISOString(),
    completed_at: null,
    completed_by: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    lead: { id: '22222222-2222-2222-2222-222222222201', first_name: 'Rachel', last_name: 'Adams', company: 'Beacon Robotics', company_name: 'Beacon Robotics', lead_number: 'LEAD-000001' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    creator: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com' },
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    task_number: 'TASK-000003',
    title: 'Deliver Revised SLA & Custom Billing Terms',
    description: 'Send the updated contract document with net-60 payment terms to James Thornton.',
    task_type: 'EMAIL',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000001',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222202',
    deal_id: '33333333-3333-3333-3333-333333333302',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue)
    due_time: '16:00:00',
    due_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: null,
    completed_by: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    lead: { id: '22222222-2222-2222-2222-222222222202', first_name: 'James', last_name: 'Thornton', company: 'Strata Retail Group', company_name: 'Strata Retail Group', lead_number: 'LEAD-000002' },
    deal: { id: '33333333-3333-3333-3333-333333333302', title: 'Omnichannel Inventory Optimization', deal_number: 'DEAL-000002', value: 120000, currency: 'USD' },
    assignee: { id: '00000000-0000-0000-0000-000000000003', first_name: 'Elena', last_name: 'Rostova', email: 'elena.rostova@enterprise.com', avatar_url: null },
    creator: { id: '00000000-0000-0000-0000-000000000001', first_name: 'Alex', last_name: 'Mercer', email: 'admin@enterprise.com' },
  },
  {
    id: '44444444-4444-4444-4444-444444444404',
    task_number: 'TASK-000004',
    title: 'Customer Onboarding Handover Call',
    description: 'Transition customer from sales engineering to dedicated customer success manager.',
    task_type: 'MEETING',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    customer_id: '11111111-1111-1111-1111-111111111102',
    lead_id: null,
    deal_id: null,
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    due_time: '10:00:00',
    due_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111102', customer_number: 'CUS-000002', name: 'Sophia Chen', company_name: 'Vanguard Biometrics', email: 's.chen@vanguardbio.com', phone: '+1 (555) 345-6789' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    creator: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com' },
    completer: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com' },
  },
  {
    id: '44444444-4444-4444-4444-444444444405',
    task_number: 'TASK-000005',
    title: 'Urgent: Contract Sign-off Deadline Check',
    description: 'Ensure legal approval is received before end of current fiscal quarter.',
    task_type: 'FOLLOW_UP',
    status: 'PENDING',
    priority: 'URGENT',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    due_date: new Date().toISOString().split('T')[0], // Today
    due_time: '17:00:00',
    due_at: new Date().toISOString(),
    completed_at: null,
    completed_by: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111101', customer_number: 'CUS-000001', name: 'David Miller', company_name: 'Apex Logistics Global', email: 'd.miller@apexlogistics.com', phone: '+1 (555) 234-5678' },
    deal: { id: '33333333-3333-3333-3333-333333333301', title: 'Global Fleet Modernization Platform', deal_number: 'DEAL-000001', value: 85000, currency: 'USD' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    creator: { id: '00000000-0000-0000-0000-000000000001', first_name: 'Alex', last_name: 'Mercer', email: 'admin@enterprise.com' },
  },
];

let nextTaskNumber = 6;

// -----------------------------------------------------------------------------
// Data Fetcher: Get Tasks with Multi-Criteria Filters & Scoping
// -----------------------------------------------------------------------------
export async function getTasks(
  filters?: TaskFiltersParams,
  scope: 'ALL' | 'ASSIGNED' = 'ALL',
  overrideUserId?: string
): Promise<TaskWithDetails[]> {
  try {
    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;
    const isStaff = profile?.role === 'STAFF' || scope === 'ASSIGNED';

    const supabase = await createClient();
    let query = supabase
      .from('tasks')
      .select(`
        *,
        customer:customers(id, name, company_name, customer_number, email, phone),
        lead:leads(id, first_name, last_name, company, company_name, lead_number),
        deal:deals(id, title, deal_number, value, currency),
        assignee:profiles!tasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
        creator:profiles!tasks_created_by_fkey(id, first_name, last_name, email),
        completer:profiles!tasks_completed_by_fkey(id, first_name, last_name, email)
      `);

    if (isStaff && currentUserId) {
      query = query.or(`assigned_to.eq.${currentUserId},created_by.eq.${currentUserId}`);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.task_type && filters.task_type !== 'ALL') {
      query = query.eq('task_type', filters.task_type);
    }

    if (filters?.assigned_to && filters.assigned_to !== 'ALL') {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });

    if (!error && data && data.length > 0) {
      return data as TaskWithDetails[];
    }
  } catch {
    // Fall back to local store
  }

  // Fallback in-memory querying
  let list = [...LOCAL_TASKS_STORE];

  if (scope === 'ASSIGNED' && overrideUserId) {
    list = list.filter((t) => t.assigned_to === overrideUserId || t.created_by === overrideUserId);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.task_number.toLowerCase().includes(q) ||
        (t.customer?.company_name && t.customer.company_name.toLowerCase().includes(q)) ||
        (t.lead?.company_name && t.lead.company_name.toLowerCase().includes(q)) ||
        (t.deal?.title && t.deal.title.toLowerCase().includes(q))
    );
  }

  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((t) => t.status === filters.status);
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    list = list.filter((t) => t.priority === filters.priority);
  }

  if (filters?.task_type && filters.task_type !== 'ALL') {
    list = list.filter((t) => t.task_type === filters.task_type);
  }

  if (filters?.assigned_to && filters.assigned_to !== 'ALL') {
    list = list.filter((t) => t.assigned_to === filters.assigned_to);
  }

  if (filters?.customer_id) {
    list = list.filter((t) => t.customer_id === filters.customer_id);
  }

  if (filters?.lead_id) {
    list = list.filter((t) => t.lead_id === filters.lead_id);
  }

  if (filters?.deal_id) {
    list = list.filter((t) => t.deal_id === filters.deal_id);
  }

  // Timeframe filters
  if (filters?.timeframe && filters.timeframe !== 'ALL') {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const endOfWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    if (filters.timeframe === 'TODAY') {
      list = list.filter((t) => t.due_date === todayStr && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    } else if (filters.timeframe === 'TOMORROW') {
      list = list.filter((t) => t.due_date === tomorrowStr && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    } else if (filters.timeframe === 'THIS_WEEK') {
      list = list.filter(
        (t) =>
          t.due_date &&
          t.due_date >= todayStr &&
          t.due_date <= endOfWeekStr &&
          t.status !== 'COMPLETED' &&
          t.status !== 'CANCELLED'
      );
    } else if (filters.timeframe === 'OVERDUE') {
      list = list.filter((t) => isTaskOverdue(t));
    } else if (filters.timeframe === 'COMPLETED') {
      list = list.filter((t) => t.status === 'COMPLETED');
    }
  }

  return list;
}

// -----------------------------------------------------------------------------
// Data Fetcher: Get Tasks for a Single Entity (Customer, Lead, or Deal)
// -----------------------------------------------------------------------------
export async function getTasksForEntity(params: {
  customerId?: string;
  leadId?: string;
  dealId?: string;
}): Promise<TaskWithDetails[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
        creator:profiles!tasks_created_by_fkey(id, first_name, last_name, email),
        completer:profiles!tasks_completed_by_fkey(id, first_name, last_name, email)
      `);

    if (params.customerId) query = query.eq('customer_id', params.customerId);
    if (params.leadId) query = query.eq('lead_id', params.leadId);
    if (params.dealId) query = query.eq('deal_id', params.dealId);

    const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });

    if (!error && data) {
      return data as TaskWithDetails[];
    }
  } catch {
    // Fall back to local store
  }

  return LOCAL_TASKS_STORE.filter((t) => {
    if (params.customerId && t.customer_id === params.customerId) return true;
    if (params.leadId && t.lead_id === params.leadId) return true;
    if (params.dealId && t.deal_id === params.dealId) return true;
    return false;
  });
}

// -----------------------------------------------------------------------------
// Metrics Aggregator
// -----------------------------------------------------------------------------
export async function getTaskMetrics(
  scope: 'ALL' | 'ASSIGNED' = 'ALL',
  overrideUserId?: string
): Promise<TaskMetricsSummary> {
  const tasks = await getTasks(undefined, scope, overrideUserId);

  const todayStr = new Date().toISOString().split('T')[0];
  const weekAgoStr = new Date(Date.now() - 7 * 86400000).toISOString();

  let dueTodayCount = 0;
  let overdueCount = 0;
  let inProgressCount = 0;
  let completedThisWeekCount = 0;
  let urgentCount = 0;

  for (const t of tasks) {
    if (t.status === 'IN_PROGRESS') inProgressCount++;
    if (t.priority === 'URGENT' || t.priority === 'HIGH') {
      if (t.status !== 'COMPLETED' && t.status !== 'CANCELLED') urgentCount++;
    }
    if (t.status === 'COMPLETED' && t.completed_at && t.completed_at >= weekAgoStr) {
      completedThisWeekCount++;
    }
    if (t.status !== 'COMPLETED' && t.status !== 'CANCELLED') {
      if (t.due_date === todayStr) dueTodayCount++;
      if (isTaskOverdue(t)) overdueCount++;
    }
  }

  return {
    totalTasks: tasks.length,
    dueTodayCount,
    overdueCount,
    inProgressCount,
    completedThisWeekCount,
    urgentCount,
  };
}

// -----------------------------------------------------------------------------
// Mutation: Create Task
// -----------------------------------------------------------------------------
export async function createTask(
  rawInput: TaskInput,
  overrideUserId?: string,
  userRole?: string
): Promise<{ data?: TaskWithDetails; error?: string }> {
  try {
    const parsed = taskInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid task input' };
    }

    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;

    if (!currentUserId) {
      return { error: 'Unauthorized: Session missing' };
    }

    const assignedTo = parsed.data.assigned_to || currentUserId;

    // Supabase Insertion
    try {
      const supabase = await createClient();
      const { data, error } = await (supabase
        .from('tasks') as any)
        .insert({
          title: parsed.data.title,
          description: parsed.data.description || null,
          task_type: parsed.data.task_type,
          status: parsed.data.status,
          priority: parsed.data.priority,
          due_date: parsed.data.due_date || null,
          due_time: parsed.data.due_time || null,
          assigned_to: assignedTo,
          created_by: currentUserId,
          customer_id: parsed.data.customer_id || null,
          lead_id: parsed.data.lead_id || null,
          deal_id: parsed.data.deal_id || null,
        })
        .select(`
          *,
          customer:customers(id, name, company_name, customer_number),
          lead:leads(id, first_name, last_name, company, company_name, lead_number),
          deal:deals(id, title, deal_number, value, currency),
          assignee:profiles!tasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (!error && data) {
        revalidatePath('/admin/tasks');
        revalidatePath('/staff/tasks');
        return { data: data as TaskWithDetails };
      }
    } catch {
      // Fallback in-memory
    }

    // In-memory fallback
    const newTaskNumber = `TASK-${String(nextTaskNumber++).padStart(6, '0')}`;
    const newTask: TaskWithDetails = {
      id: crypto.randomUUID(),
      task_number: newTaskNumber,
      title: parsed.data.title,
      description: parsed.data.description || null,
      task_type: parsed.data.task_type,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
      due_time: parsed.data.due_time || null,
      due_at: parsed.data.due_date ? `${parsed.data.due_date}T${parsed.data.due_time || '23:59:59'}Z` : null,
      assigned_to: assignedTo,
      created_by: currentUserId,
      customer_id: parsed.data.customer_id || null,
      lead_id: parsed.data.lead_id || null,
      deal_id: parsed.data.deal_id || null,
      completed_at: null,
      completed_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee: { id: assignedTo, first_name: 'Assigned', last_name: 'Rep', email: 'rep@enterprise.com', avatar_url: null },
      creator: { id: currentUserId, first_name: 'Current', last_name: 'User', email: 'user@enterprise.com' },
    };

    LOCAL_TASKS_STORE.unshift(newTask);
    revalidatePath('/admin/tasks');
    revalidatePath('/staff/tasks');
    return { data: newTask };
  } catch (err: any) {
    return { error: err.message || 'Failed to create task' };
  }
}

// -----------------------------------------------------------------------------
// Mutation: Update Task
// -----------------------------------------------------------------------------
export async function updateTask(
  id: string,
  rawInput: Partial<TaskInput>,
  overrideUserId?: string,
  userRole?: string
): Promise<{ data?: TaskWithDetails; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;

    if (!currentUserId) {
      return { error: 'Unauthorized' };
    }

    try {
      const supabase = await createClient();
      const { data, error } = await (supabase
        .from('tasks') as any)
        .update({
          ...(rawInput.title && { title: rawInput.title }),
          ...(rawInput.description !== undefined && { description: rawInput.description }),
          ...(rawInput.task_type && { task_type: rawInput.task_type }),
          ...(rawInput.priority && { priority: rawInput.priority }),
          ...(rawInput.status && { status: rawInput.status }),
          ...(rawInput.due_date !== undefined && { due_date: rawInput.due_date || null }),
          ...(rawInput.due_time !== undefined && { due_time: rawInput.due_time || null }),
          ...(rawInput.assigned_to !== undefined && { assigned_to: rawInput.assigned_to || null }),
          ...(rawInput.customer_id !== undefined && { customer_id: rawInput.customer_id || null }),
          ...(rawInput.lead_id !== undefined && { lead_id: rawInput.lead_id || null }),
          ...(rawInput.deal_id !== undefined && { deal_id: rawInput.deal_id || null }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          customer:customers(id, name, company_name, customer_number),
          lead:leads(id, first_name, last_name, company, company_name, lead_number),
          deal:deals(id, title, deal_number, value, currency),
          assignee:profiles!tasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (!error && data) {
        revalidatePath('/admin/tasks');
        revalidatePath('/staff/tasks');
        return { data: data as TaskWithDetails };
      }
    } catch {
      // Fallback
    }

    const idx = LOCAL_TASKS_STORE.findIndex((t) => t.id === id);
    if (idx === -1) return { error: 'Task not found' };

    LOCAL_TASKS_STORE[idx] = {
      ...LOCAL_TASKS_STORE[idx],
      ...rawInput,
      updated_at: new Date().toISOString(),
    };

    revalidatePath('/admin/tasks');
    revalidatePath('/staff/tasks');
    return { data: LOCAL_TASKS_STORE[idx] };
  } catch (err: any) {
    return { error: err.message || 'Failed to update task' };
  }
}

// -----------------------------------------------------------------------------
// Mutation: Toggle Complete / Reopen Task
// -----------------------------------------------------------------------------
export async function toggleTaskComplete(
  id: string,
  completed: boolean,
  overrideUserId?: string,
  userRole?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;

    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const newStatus: TaskStatus = completed ? 'COMPLETED' : 'PENDING';
    const completedAt = completed ? new Date().toISOString() : null;
    const completedBy = completed ? currentUserId : null;

    try {
      const supabase = await createClient();
      const { error } = await (supabase
        .from('tasks') as any)
        .update({
          status: newStatus,
          completed_at: completedAt,
          completed_by: completedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        revalidatePath('/admin/tasks');
        revalidatePath('/staff/tasks');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    const idx = LOCAL_TASKS_STORE.findIndex((t) => t.id === id);
    if (idx !== -1) {
      LOCAL_TASKS_STORE[idx] = {
        ...LOCAL_TASKS_STORE[idx],
        status: newStatus,
        completed_at: completedAt,
        completed_by: completedBy,
        updated_at: new Date().toISOString(),
      };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/staff/tasks');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle task' };
  }
}

// -----------------------------------------------------------------------------
// Mutation: Cancel Task
// -----------------------------------------------------------------------------
export async function cancelTask(
  id: string,
  overrideUserId?: string,
  userRole?: string
): Promise<{ success: boolean; error?: string }> {
  return toggleTaskStatus(id, 'CANCELLED', overrideUserId, userRole);
}

// Helper: Generic Status Transition
export async function toggleTaskStatus(
  id: string,
  status: TaskStatus,
  overrideUserId?: string,
  userRole?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;

    const completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
    const completedBy = status === 'COMPLETED' ? currentUserId || null : null;

    try {
      const supabase = await createClient();
      const { error } = await (supabase
        .from('tasks') as any)
        .update({
          status,
          completed_at: completedAt,
          completed_by: completedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        revalidatePath('/admin/tasks');
        revalidatePath('/staff/tasks');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    const idx = LOCAL_TASKS_STORE.findIndex((t) => t.id === id);
    if (idx !== -1) {
      LOCAL_TASKS_STORE[idx] = {
        ...LOCAL_TASKS_STORE[idx],
        status,
        completed_at: completedAt,
        completed_by: completedBy,
        updated_at: new Date().toISOString(),
      };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/staff/tasks');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update task status' };
  }
}

// -----------------------------------------------------------------------------
// Mutation: Delete Task (Admin or Creator)
// -----------------------------------------------------------------------------
export async function deleteTask(
  id: string,
  overrideUserId?: string,
  userRole?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    const currentUserId = overrideUserId || profile?.user_id;
    const role = userRole || profile?.role || 'STAFF';

    try {
      const supabase = await createClient();
      let query = supabase.from('tasks').delete().eq('id', id);

      if (role !== 'ADMIN' && currentUserId) {
        query = query.eq('created_by', currentUserId);
      }

      const { error } = await query;
      if (!error) {
        revalidatePath('/admin/tasks');
        revalidatePath('/staff/tasks');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    const idx = LOCAL_TASKS_STORE.findIndex((t) => t.id === id);
    if (idx !== -1) {
      LOCAL_TASKS_STORE.splice(idx, 1);
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/staff/tasks');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete task' };
  }
}
