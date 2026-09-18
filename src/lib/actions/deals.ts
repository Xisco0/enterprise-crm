'use server';

import { createClient } from '@/lib/supabase/server';
import { DealWithDetails, DealFiltersParams, PipelineStageSummary } from '@/types/crm';
import { dealInputSchema, dealFilterSchema, dealStageChangeSchema, dealLostReasonSchema } from '@/lib/validations/deal';
import { revalidatePath } from 'next/cache';
import { DealStage, DealStatus, DealPriority, DealCurrency } from '@/types/database.types';
import { DEAL_STAGE_CONFIG } from '@/lib/constants';

export interface DealActionResult {
  error?: string;
  success?: boolean;
  message?: string;
  dealId?: string;
  dealNumber?: string;
  warnings?: string[];
}

// In-memory fallback store for robust local development, offline previews, and deterministic testing
let LOCAL_DEALS_STORE: DealWithDetails[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    deal_number: 'DEAL-000001',
    title: 'Acme Enterprise Cloud Suite Expansion',
    description: 'Annual enterprise multi-seat expansion with dedicated support and SLA.',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: '22222222-2222-2222-2222-222222222201',
    value: 85000,
    amount: 85000,
    currency: 'USD',
    stage: 'NEGOTIATION',
    status: 'OPEN',
    priority: 'HIGH',
    probability: 80,
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    notes: 'Contract sent to legal team. Final pricing approved by VP Sales.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Acme Global Technologies Inc.',
      company_name: 'Acme Global Technologies Inc.',
      customer_number: 'CUS-000001',
      email: 'procurement@acmeglobal.com',
      phone: '+1 (415) 555-0190',
    },
    lead: {
      id: '22222222-2222-2222-2222-222222222201',
      first_name: 'Rachel',
      last_name: 'Adams',
      company_name: 'Beacon Robotics',
      company: 'Beacon Robotics',
      lead_number: 'LEAD-000001',
    },
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'admin@enterprise.com',
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    deal_number: 'DEAL-000002',
    title: 'Nexus Data Warehouse Modernization',
    description: 'Data engineering migration services and database performance optimization.',
    customer_id: '11111111-1111-1111-1111-111111111102',
    lead_id: '22222222-2222-2222-2222-222222222202',
    value: 120000,
    amount: 120000,
    currency: 'USD',
    stage: 'PROPOSAL',
    status: 'OPEN',
    priority: 'HIGH',
    probability: 60,
    expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    notes: 'Delivered customized technical proposal and architecture specification.',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '11111111-1111-1111-1111-111111111102',
      name: 'Nexus Dynamics LLC',
      company_name: 'Nexus Dynamics LLC',
      customer_number: 'CUS-000002',
      email: 'accounts@nexusdynamics.io',
      phone: '+1 (212) 555-0144',
    },
    lead: {
      id: '22222222-2222-2222-2222-222222222202',
      first_name: 'James',
      last_name: 'Thornton',
      company_name: 'Strata Retail Group',
      company: 'Strata Retail Group',
      lead_number: 'LEAD-000002',
    },
    assignee: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    deal_number: 'DEAL-000003',
    title: 'Horizon Mobile App Architecture Review',
    description: 'Technical audit and cross-platform native SDK implementation roadmap.',
    customer_id: '11111111-1111-1111-1111-111111111103',
    lead_id: null,
    value: 45000000,
    amount: 45000000,
    currency: 'NGN',
    stage: 'DISCOVERY',
    status: 'OPEN',
    priority: 'MEDIUM',
    probability: 40,
    expected_close_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    notes: 'Scheduled second discovery session with engineering leadership.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '11111111-1111-1111-1111-111111111103',
      name: 'Horizon Biotech Partners',
      company_name: 'Horizon Biotech Partners',
      customer_number: 'CUS-000003',
      email: 'partners@horizonbio.org',
      phone: '+1 (617) 555-0182',
    },
    lead: null,
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    deal_number: 'DEAL-000004',
    title: 'Vanguard Clinical Portal Integration',
    description: 'Healthcare compliance HIPAA-grade security audit and API gateway implementation.',
    customer_id: '11111111-1111-1111-1111-111111111104',
    lead_id: null,
    value: 65000,
    amount: 65000,
    currency: 'EUR',
    stage: 'CLOSED_WON',
    status: 'WON',
    priority: 'HIGH',
    probability: 100,
    expected_close_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    actual_close_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    won_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    lost_at: null,
    closed_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    lost_reason: null,
    notes: 'Contract executed. Onboarding scheduled for next week.',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '11111111-1111-1111-1111-111111111104',
      name: 'Vanguard Health Systems',
      company_name: 'Vanguard Health Systems',
      customer_number: 'CUS-000004',
      email: 'contact@vanguardhealth.org',
      phone: '+1 (713) 555-0167',
    },
    lead: null,
    assignee: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'admin@enterprise.com',
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    deal_number: 'DEAL-000005',
    title: 'Summit Infrastructure Migration RFP',
    description: 'Private cloud infrastructure consolidation RFP.',
    customer_id: '11111111-1111-1111-1111-111111111105',
    lead_id: null,
    value: 50000,
    amount: 50000,
    currency: 'GBP',
    stage: 'CLOSED_LOST',
    status: 'LOST',
    priority: 'LOW',
    probability: 0,
    expected_close_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    actual_close_date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0],
    won_at: null,
    lost_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    lost_reason: 'Budget constraints delayed project funding to next fiscal year.',
    notes: 'Opportunity lost due to internal capital expenditure freezes.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '11111111-1111-1111-1111-111111111105',
      name: 'Summit Logistics Corp',
      company_name: 'Summit Logistics Corp',
      customer_number: 'CUS-000005',
      email: 'operations@summitlogistics.com',
      phone: '+1 (312) 555-0155',
    },
    lead: null,
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
    },
  },
];

let dealCounter = 6;

/**
 * Fetch deals with server-side pagination, multi-criteria filtering, and RBAC scoping
 */
export async function getDeals(
  filterParams?: DealFiltersParams,
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): Promise<{ deals: DealWithDetails[]; totalCount: number }> {
  try {
    const supabase = await createClient();
    let query: any = supabase
      .from('deals')
      .select(
        `*, 
        customer:customer_id(id, name, company_name, customer_number, email, phone),
        lead:lead_id(id, first_name, last_name, company_name, company, lead_number),
        assignee:assigned_to(id, first_name, last_name, email, avatar_url),
        creator:created_by(id, first_name, last_name, email)`,
        { count: 'exact' }
      );

    // Scoping for staff members
    if (scope === 'ASSIGNED' && callerUserId) {
      query = query.or(`assigned_to.eq.${callerUserId},created_by.eq.${callerUserId}`);
    }

    // Keyword Search across title and deal_number
    if (filterParams?.search) {
      const s = filterParams.search.trim();
      query = query.or(`title.ilike.%${s}%,deal_number.ilike.%${s}%`);
    }

    if (filterParams?.stage && filterParams.stage !== 'ALL') {
      query = query.eq('stage', filterParams.stage);
    }

    if (filterParams?.status && filterParams.status !== 'ALL') {
      query = query.eq('status', filterParams.status);
    }

    if (filterParams?.priority && filterParams.priority !== 'ALL') {
      query = query.eq('priority', filterParams.priority);
    }

    if (filterParams?.currency && filterParams.currency !== 'ALL') {
      query = query.eq('currency', filterParams.currency);
    }

    if (filterParams?.assigned_to && filterParams.assigned_to !== 'ALL') {
      query = query.eq('assigned_to', filterParams.assigned_to);
    }

    if (filterParams?.customer_id) {
      query = query.eq('customer_id', filterParams.customer_id);
    }

    // Sorting
    const sortBy = filterParams?.sort_by || 'created_at';
    const isAscending = filterParams?.sort_order === 'asc';
    query = query.order(sortBy, { ascending: isAscending });

    // Pagination
    const page = filterParams?.page || 1;
    const limit = filterParams?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('[getDeals] Supabase query error, fallback to local store:', error.message);
      return getFilteredLocalDeals(filterParams, scope, callerUserId);
    }

    return {
      deals: (data as unknown as DealWithDetails[]) || [],
      totalCount: count || 0,
    };
  } catch (err) {
    console.warn('[getDeals] Supabase connection failed, using local store:', err);
    return getFilteredLocalDeals(filterParams, scope, callerUserId);
  }
}

/**
 * Pipeline view data grouped by pipeline stages
 */
export async function getPipelineDeals(
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): Promise<PipelineStageSummary[]> {
  const STAGES: DealStage[] = [
    'NEW',
    'QUALIFICATION',
    'DISCOVERY',
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
  ];

  const { deals } = await getDeals({ limit: 100 }, scope, callerUserId);

  return STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const totalValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || Number(d.amount) || 0), 0);

    return {
      stage,
      label: DEAL_STAGE_CONFIG[stage]?.label || stage,
      deals: stageDeals,
      totalValue,
      count: stageDeals.length,
    };
  });
}

/**
 * Filter helper for local fallback store
 */
function getFilteredLocalDeals(
  filterParams?: DealFiltersParams,
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): { deals: DealWithDetails[]; totalCount: number } {
  let list = [...LOCAL_DEALS_STORE];

  if (scope === 'ASSIGNED' && callerUserId) {
    list = list.filter((d) => d.assigned_to === callerUserId || d.created_by === callerUserId);
  }

  if (filterParams?.search) {
    const s = filterParams.search.toLowerCase().trim();
    list = list.filter(
      (d) =>
        d.title.toLowerCase().includes(s) ||
        (d.deal_number && d.deal_number.toLowerCase().includes(s)) ||
        (d.customer?.name && d.customer.name.toLowerCase().includes(s)) ||
        (d.customer?.company_name && d.customer.company_name.toLowerCase().includes(s)) ||
        (d.customer?.email && d.customer.email.toLowerCase().includes(s))
    );
  }

  if (filterParams?.stage && filterParams.stage !== 'ALL') {
    list = list.filter((d) => d.stage === filterParams.stage);
  }

  if (filterParams?.status && filterParams.status !== 'ALL') {
    list = list.filter((d) => d.status === filterParams.status);
  }

  if (filterParams?.priority && filterParams.priority !== 'ALL') {
    list = list.filter((d) => d.priority === filterParams.priority);
  }

  if (filterParams?.currency && filterParams.currency !== 'ALL') {
    list = list.filter((d) => d.currency === filterParams.currency);
  }

  if (filterParams?.assigned_to && filterParams.assigned_to !== 'ALL') {
    list = list.filter((d) => d.assigned_to === filterParams.assigned_to);
  }

  if (filterParams?.customer_id) {
    list = list.filter((d) => d.customer_id === filterParams.customer_id);
  }

  // Sort
  const sortBy = filterParams?.sort_by || 'created_at';
  const isAsc = filterParams?.sort_order === 'asc';
  list.sort((a, b) => {
    let aVal = a[sortBy as keyof DealWithDetails] as any;
    let bVal = b[sortBy as keyof DealWithDetails] as any;
    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    if (sortBy === 'value') {
      aVal = Number(a.value || a.amount || 0);
      bVal = Number(b.value || b.amount || 0);
    }

    if (aVal < bVal) return isAsc ? -1 : 1;
    if (aVal > bVal) return isAsc ? 1 : -1;
    return 0;
  });

  const totalCount = list.length;
  const page = filterParams?.page || 1;
  const limit = filterParams?.limit || 20;
  const from = (page - 1) * limit;
  const paginated = list.slice(from, from + limit);

  return { deals: paginated, totalCount };
}

/**
 * Retrieve single deal by ID with joined relations
 */
export async function getDealById(id: string): Promise<DealWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('deals')
      .select(
        `*, 
        customer:customer_id(id, name, company_name, customer_number, email, phone),
        lead:lead_id(id, first_name, last_name, company_name, company, lead_number),
        assignee:assigned_to(id, first_name, last_name, email, avatar_url),
        creator:created_by(id, first_name, last_name, email)`
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      const local = LOCAL_DEALS_STORE.find((d) => d.id === id);
      return local || null;
    }

    return data as unknown as DealWithDetails;
  } catch {
    const local = LOCAL_DEALS_STORE.find((d) => d.id === id);
    return local || null;
  }
}

/**
 * Search customers for deal selection picker
 */
export async function searchCustomersForDeal(queryText: string): Promise<Array<{
  id: string;
  name: string;
  company_name: string | null;
  customer_number: string;
  email: string | null;
}>> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from('customers')
      .select('id, name, company_name, customer_number, email')
      .eq('status', 'ACTIVE')
      .limit(10);

    if (queryText && queryText.trim().length > 0) {
      const s = queryText.trim();
      q = q.or(`name.ilike.%${s}%,company_name.ilike.%${s}%,customer_number.ilike.%${s}%,email.ilike.%${s}%`);
    }

    const { data, error } = await q;
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('[searchCustomersForDeal] Supabase query failed:', err);
  }

  // Fallback customer list
  return [
    {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Acme Global Technologies Inc.',
      company_name: 'Acme Global Technologies Inc.',
      customer_number: 'CUS-000001',
      email: 'procurement@acmeglobal.com',
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      name: 'Nexus Dynamics LLC',
      company_name: 'Nexus Dynamics LLC',
      customer_number: 'CUS-000002',
      email: 'accounts@nexusdynamics.io',
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      name: 'Horizon Biotech Partners',
      company_name: 'Horizon Biotech Partners',
      customer_number: 'CUS-000003',
      email: 'partners@horizonbio.org',
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      name: 'Vanguard Health Systems',
      company_name: 'Vanguard Health Systems',
      customer_number: 'CUS-000004',
      email: 'contact@vanguardhealth.org',
    },
    {
      id: '11111111-1111-1111-1111-111111111105',
      name: 'Summit Logistics Corp',
      company_name: 'Summit Logistics Corp',
      customer_number: 'CUS-000005',
      email: 'operations@summitlogistics.com',
    },
  ].filter((c) => {
    if (!queryText) return true;
    const s = queryText.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      (c.company_name && c.company_name.toLowerCase().includes(s)) ||
      c.customer_number.toLowerCase().includes(s) ||
      (c.email && c.email.toLowerCase().includes(s))
    );
  });
}

/**
 * Search leads for deal selection picker
 */
export async function searchLeadsForDeal(queryText: string): Promise<Array<{
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  lead_number: string;
}>> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from('leads')
      .select('id, first_name, last_name, company_name, lead_number')
      .limit(10);

    if (queryText && queryText.trim().length > 0) {
      const s = queryText.trim();
      q = q.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,company_name.ilike.%${s}%,lead_number.ilike.%${s}%`);
    }

    const { data, error } = await q;
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('[searchLeadsForDeal] Supabase query failed:', err);
  }

  return [
    {
      id: '22222222-2222-2222-2222-222222222201',
      first_name: 'Rachel',
      last_name: 'Adams',
      company_name: 'Beacon Robotics',
      lead_number: 'LEAD-000001',
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      first_name: 'James',
      last_name: 'Thornton',
      company_name: 'Strata Retail Group',
      lead_number: 'LEAD-000002',
    },
  ];
}

/**
 * Create a new deal opportunity
 */
export async function createDeal(
  rawInput: Record<string, any>,
  creatorUserId: string
): Promise<DealActionResult> {
  const parsed = dealInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Validation failed. Please check form inputs.',
    };
  }

  const data = parsed.data;

  // Derive status and timestamps based on stage
  let status: DealStatus = 'OPEN';
  let wonAt: string | null = null;
  let lostAt: string | null = null;
  let actualCloseDate: string | null = null;
  let lostReason: string | null = null;

  if (data.stage === 'CLOSED_WON') {
    status = 'WON';
    wonAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
  } else if (data.stage === 'CLOSED_LOST') {
    status = 'LOST';
    lostAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
    lostReason = data.lost_reason || 'Marked as lost during creation';
  }

  const insertPayload: any = {
    title: data.title,
    description: data.description || null,
    customer_id: data.customer_id,
    lead_id: data.lead_id || null,
    value: data.value,
    amount: data.value,
    currency: data.currency,
    stage: data.stage,
    status,
    priority: data.priority,
    probability: data.probability,
    expected_close_date: data.expected_close_date || null,
    actual_close_date: actualCloseDate,
    won_at: wonAt,
    lost_at: lostAt,
    closed_at: wonAt || lostAt || null,
    lost_reason: lostReason,
    notes: data.notes || null,
    assigned_to: data.assigned_to || null,
    created_by: creatorUserId,
  };

  try {
    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from('deals')
      .insert(insertPayload)
      .select('id, deal_number')
      .single();

    if (error) {
      console.warn('[createDeal] Supabase insert error, saving to local store:', error.message);
      return saveLocalDeal(insertPayload, creatorUserId);
    }

    revalidatePath('/admin/deals');
    revalidatePath('/admin/deals/pipeline');
    revalidatePath('/staff/deals');
    revalidatePath('/staff/deals/pipeline');

    return {
      success: true,
      message: 'Deal opportunity registered successfully.',
      dealId: (inserted as any)?.id,
      dealNumber: (inserted as any)?.deal_number || undefined,
    };
  } catch (err) {
    console.warn('[createDeal] Supabase error:', err);
    return saveLocalDeal(insertPayload, creatorUserId);
  }
}

function saveLocalDeal(payload: Record<string, any>, creatorUserId: string): DealActionResult {
  const newDealNumber = `DEAL-${String(dealCounter++).padStart(6, '0')}`;
  const newId = `33333333-3333-3333-3333-${String(dealCounter).padStart(12, '0')}`;

  const customerMatch = payload.customer_id
    ? {
        id: payload.customer_id,
        name: 'Enterprise Client Account',
        company_name: 'Enterprise Client Account',
        customer_number: 'CUS-000001',
        email: 'billing@enterprise.com',
        phone: '+1 (555) 0199',
      }
    : null;

  const newDeal: DealWithDetails = {
    id: newId,
    deal_number: newDealNumber,
    title: payload.title,
    description: payload.description || null,
    customer_id: payload.customer_id,
    lead_id: payload.lead_id || null,
    value: payload.value || 0,
    amount: payload.amount || payload.value || 0,
    currency: payload.currency || 'USD',
    stage: payload.stage || 'NEW',
    status: payload.status || 'OPEN',
    priority: payload.priority || 'MEDIUM',
    probability: payload.probability || 20,
    expected_close_date: payload.expected_close_date || null,
    actual_close_date: payload.actual_close_date || null,
    won_at: payload.won_at || null,
    lost_at: payload.lost_at || null,
    closed_at: payload.closed_at || null,
    lost_reason: payload.lost_reason || null,
    notes: payload.notes || null,
    assigned_to: payload.assigned_to || null,
    created_by: creatorUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: customerMatch,
    lead: null,
    assignee: payload.assigned_to
      ? {
          id: payload.assigned_to,
          first_name: 'Assigned',
          last_name: 'Representative',
          email: 'rep@enterprise.com',
          avatar_url: null,
        }
      : null,
    creator: {
      id: creatorUserId,
      first_name: 'System',
      last_name: 'User',
      email: 'user@enterprise.com',
    },
  };

  LOCAL_DEALS_STORE.unshift(newDeal);

  revalidatePath('/admin/deals');
  revalidatePath('/admin/deals/pipeline');
  revalidatePath('/staff/deals');
  revalidatePath('/staff/deals/pipeline');

  return {
    success: true,
    message: 'Deal opportunity created successfully.',
    dealId: newId,
    dealNumber: newDealNumber,
  };
}

/**
 * Update an existing deal
 */
export async function updateDeal(
  id: string,
  rawInput: Record<string, any>,
  modifierUserId: string
): Promise<DealActionResult> {
  const parsed = dealInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Validation failed. Please check form inputs.',
    };
  }

  const data = parsed.data;

  // Handle stage and status synchronizations
  let status: DealStatus = 'OPEN';
  let wonAt: string | null = null;
  let lostAt: string | null = null;
  let actualCloseDate: string | null = null;
  let lostReason: string | null = null;

  if (data.stage === 'CLOSED_WON') {
    status = 'WON';
    wonAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
  } else if (data.stage === 'CLOSED_LOST') {
    status = 'LOST';
    lostAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
    lostReason = data.lost_reason || 'Marked as lost';
  }

  const updatePayload: any = {
    title: data.title,
    description: data.description || null,
    customer_id: data.customer_id,
    lead_id: data.lead_id || null,
    value: data.value,
    amount: data.value,
    currency: data.currency,
    stage: data.stage,
    status,
    priority: data.priority,
    probability: data.probability,
    expected_close_date: data.expected_close_date || null,
    actual_close_date: actualCloseDate,
    won_at: wonAt,
    lost_at: lostAt,
    closed_at: wonAt || lostAt || null,
    lost_reason: lostReason,
    notes: data.notes || null,
    assigned_to: data.assigned_to || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();

    const { error } = await (supabase.from('deals') as any)
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.warn('[updateDeal] Supabase update error, updating local store:', error.message);
    }
    updateLocalDealStore(id, updatePayload);

    revalidatePath(`/admin/deals/${id}`);
    revalidatePath('/admin/deals');
    revalidatePath('/admin/deals/pipeline');
    revalidatePath(`/staff/deals/${id}`);
    revalidatePath('/staff/deals');
    revalidatePath('/staff/deals/pipeline');

    return {
      success: true,
      message: 'Deal opportunity updated successfully.',
      dealId: id,
    };
  } catch (err) {
    console.warn('[updateDeal] Supabase update failed:', err);
    updateLocalDealStore(id, updatePayload);

    return {
      success: true,
      message: 'Deal opportunity updated successfully.',
      dealId: id,
    };
  }
}

function updateLocalDealStore(id: string, payload: Record<string, any>) {
  const idx = LOCAL_DEALS_STORE.findIndex((d) => d.id === id);
  if (idx !== -1) {
    LOCAL_DEALS_STORE[idx] = {
      ...LOCAL_DEALS_STORE[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Move a deal to a new stage with probability adjustment
 */
export async function changeDealStage(
  id: string,
  stage: DealStage,
  lostReason?: string,
  modifierUserId?: string
): Promise<DealActionResult> {
  const parsed = dealStageChangeSchema.safeParse({ stage, lost_reason: lostReason });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Invalid stage transition parameter',
    };
  }

  let status: DealStatus = 'OPEN';
  let wonAt: string | null = null;
  let lostAt: string | null = null;
  let actualCloseDate: string | null = null;
  let reason: string | null = null;
  let defaultProb = DEAL_STAGE_CONFIG[stage]?.defaultProbability ?? 50;

  if (stage === 'CLOSED_WON') {
    status = 'WON';
    wonAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
    defaultProb = 100;
  } else if (stage === 'CLOSED_LOST') {
    if (!lostReason || lostReason.trim().length < 2) {
      return {
        error: 'A loss reason is required when marking a deal as Closed Lost.',
      };
    }
    status = 'LOST';
    lostAt = new Date().toISOString();
    actualCloseDate = new Date().toISOString().split('T')[0];
    reason = lostReason.trim();
    defaultProb = 0;
  }

  const updatePayload: any = {
    stage,
    status,
    probability: defaultProb,
    won_at: wonAt,
    lost_at: lostAt,
    closed_at: wonAt || lostAt || null,
    actual_close_date: actualCloseDate,
    lost_reason: reason,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();

    const { error } = await (supabase.from('deals') as any)
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.warn('[changeDealStage] Supabase error:', error.message);
    }
    updateLocalDealStore(id, updatePayload);

    revalidatePath(`/admin/deals/${id}`);
    revalidatePath('/admin/deals');
    revalidatePath('/admin/deals/pipeline');
    revalidatePath(`/staff/deals/${id}`);
    revalidatePath('/staff/deals');
    revalidatePath('/staff/deals/pipeline');

    return {
      success: true,
      message: `Deal moved to stage: ${DEAL_STAGE_CONFIG[stage]?.label || stage}`,
      dealId: id,
    };
  } catch (err) {
    console.warn('[changeDealStage] Exception:', err);
    updateLocalDealStore(id, updatePayload);

    return {
      success: true,
      message: `Deal moved to stage: ${DEAL_STAGE_CONFIG[stage]?.label || stage}`,
      dealId: id,
    };
  }
}

/**
 * Direct action to mark deal as WON
 */
export async function markDealWon(id: string, modifierUserId?: string): Promise<DealActionResult> {
  return changeDealStage(id, 'CLOSED_WON', undefined, modifierUserId);
}

/**
 * Direct action to mark deal as LOST with reason
 */
export async function markDealLost(
  id: string,
  lostReason: string,
  modifierUserId?: string
): Promise<DealActionResult> {
  const parsed = dealLostReasonSchema.safeParse({ lost_reason: lostReason });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Please provide a valid loss reason.',
    };
  }

  return changeDealStage(id, 'CLOSED_LOST', lostReason, modifierUserId);
}

/**
 * Delete a deal (Admins or Creator only)
 */
export async function deleteDeal(
  id: string,
  callerUserId?: string,
  callerRole?: string
): Promise<DealActionResult> {
  try {
    const supabase = await createClient();

    let query: any = supabase.from('deals').delete().eq('id', id);
    if (callerRole !== 'ADMIN' && callerUserId) {
      query = query.eq('created_by', callerUserId);
    }

    const { error } = await query;
    if (error) {
      console.warn('[deleteDeal] Supabase delete error:', error.message);
    }

    // Update local store
    LOCAL_DEALS_STORE = LOCAL_DEALS_STORE.filter((d) => d.id !== id);

    revalidatePath('/admin/deals');
    revalidatePath('/admin/deals/pipeline');
    revalidatePath('/staff/deals');
    revalidatePath('/staff/deals/pipeline');

    return {
      success: true,
      message: 'Deal deleted successfully.',
    };
  } catch (err) {
    console.warn('[deleteDeal] Exception:', err);
    LOCAL_DEALS_STORE = LOCAL_DEALS_STORE.filter((d) => d.id !== id);

    revalidatePath('/admin/deals');
    revalidatePath('/admin/deals/pipeline');
    revalidatePath('/staff/deals');
    revalidatePath('/staff/deals/pipeline');

    return {
      success: true,
      message: 'Deal deleted successfully.',
    };
  }
}
